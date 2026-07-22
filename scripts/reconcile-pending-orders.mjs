#!/usr/bin/env node
/**
 * Reconciles orders whose payment_status is still "pending" after N minutes
 * against Razorpay's actual state. If Razorpay says they're paid, we mark
 * them paid + fire the post-payment hooks (email, WhatsApp, courier).
 *
 * Usage:
 *   node scripts/reconcile-pending-orders.mjs
 *   node scripts/reconcile-pending-orders.mjs --dry-run
 *   node scripts/reconcile-pending-orders.mjs --minutes-old 30
 *
 * Recommended: run every 5 minutes via cron:
 *   *slash-5 * * * * cd /path/to/app && node scripts/reconcile-pending-orders.mjs
 *
 * This is the safety net for the "customer paid but our system says pending"
 * class of bugs (webhook fails, browser closes, network blip). Even without
 * a cron, running this manually fixes any stuck orders on demand.
 */
import fs from "node:fs";
import path from "node:path";

// ── Load .env.local ────────────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run");
const minutesOldIdx = process.argv.indexOf("--minutes-old");
const minutesOld = minutesOldIdx > -1 ? parseInt(process.argv[minutesOldIdx + 1] ?? "15", 10) : 15;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rzpKeyId = process.env.RAZORPAY_KEY_ID;
const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.worldofmysorepak.com";
const reconcileHookSecret = process.env.RECONCILE_HOOK_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!rzpKeyId || !rzpSecret) {
  console.error("❌ Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  process.exit(1);
}

const rzpAuth = "Basic " + Buffer.from(`${rzpKeyId}:${rzpSecret}`).toString("base64");
const cutoff = new Date(Date.now() - minutesOld * 60_000).toISOString();

console.log(`→ Finding orders payment_status=pending created before ${cutoff}...`);

// ── Fetch stuck orders ────────────────────────────────────────────────────
const listRes = await fetch(
  `${supabaseUrl}/rest/v1/orders?select=id,order_number,notes,total,customer_email,customer_phone,created_at&payment_status=eq.pending&created_at=lt.${cutoff}&order=created_at.desc&limit=100`,
  { headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` } }
);
if (!listRes.ok) {
  console.error("❌ Failed to fetch pending orders:", listRes.status, await listRes.text());
  process.exit(2);
}
const pending = await listRes.json();
console.log(`  Found ${pending.length} pending order(s) older than ${minutesOld} min.`);
if (pending.length === 0) process.exit(0);

// ── For each, extract razorpay_order_id from notes, check Razorpay ────────
let fixed = 0;
let stillPending = 0;
let failed = 0;

for (const o of pending) {
  const notes = o.notes ?? "";
  const rzpOrderMatch = notes.match(/razorpay_order_id:(\w+)/);
  const rzpPaymentMatch = notes.match(/razorpay_payment_id:(\w+)/);

  if (!rzpOrderMatch && !rzpPaymentMatch) {
    console.log(`  ${o.order_number}: no razorpay id in notes — customer likely never reached checkout, skipping`);
    continue;
  }

  const rzpOrderId = rzpOrderMatch?.[1];
  const rzpPaymentId = rzpPaymentMatch?.[1];

  // Query Razorpay for payments on this order
  let paid = false;
  let paymentId = rzpPaymentId ?? "";

  if (rzpOrderId) {
    const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${rzpOrderId}/payments`, {
      headers: { Authorization: rzpAuth },
    });
    if (rzpRes.ok) {
      const rzp = await rzpRes.json();
      const captured = (rzp.items ?? []).find((p) => p.status === "captured");
      if (captured) {
        paid = true;
        paymentId = captured.id;
      }
    } else {
      console.error(`  ${o.order_number}: razorpay lookup failed (${rzpRes.status})`);
      failed++;
      continue;
    }
  } else if (rzpPaymentId) {
    // Fall back to fetching the payment directly
    const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${rzpPaymentId}`, {
      headers: { Authorization: rzpAuth },
    });
    if (rzpRes.ok) {
      const p = await rzpRes.json();
      if (p.status === "captured") { paid = true; paymentId = p.id; }
    }
  }

  if (!paid) {
    console.log(`  ${o.order_number}: still not paid on Razorpay's side`);
    stillPending++;
    continue;
  }

  console.log(`  ✓ ${o.order_number}: Razorpay says PAID (${paymentId}) — updating...`);
  if (isDryRun) { fixed++; continue; }

  // Mark paid in Supabase
  const noteParts = [
    paymentId ? `razorpay_payment_id:${paymentId}` : "",
    rzpOrderId ? `razorpay_order_id:${rzpOrderId}` : "",
    "source:reconcile",
  ].filter(Boolean).join(" | ");

  const updRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${o.id}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      payment_status: "paid",
      status: "confirmed",
      notes: noteParts,
    }),
  });
  if (!updRes.ok) {
    console.error(`    ✗ update failed: ${updRes.status}`);
    failed++;
    continue;
  }

  // Trigger post-payment hooks via HTTP so email/WhatsApp/courier all fire.
  // We hit our own webhook endpoint with a synthesized signature-less
  // payload — but since webhook requires signature, we instead call a
  // dedicated internal endpoint that runs the hooks directly.
  if (reconcileHookSecret) {
    const hookRes = await fetch(`${siteUrl}/api/internal/run-post-payment-hooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": reconcileHookSecret,
      },
      body: JSON.stringify({ order_id: o.id }),
    });
    if (hookRes.ok) {
      console.log(`    ✓ hooks fired`);
    } else {
      console.error(`    ✗ hooks failed: ${hookRes.status} ${await hookRes.text()}`);
    }
  } else {
    console.warn(`    ⚠ RECONCILE_HOOK_SECRET not set — order marked paid but no email/WhatsApp/courier fired.`);
    console.warn(`      Visit /admin/orders/${o.id} and manually "Resend confirmation" + create shipment.`);
  }

  fixed++;
}

console.log("");
console.log(`Summary: ${fixed} fixed, ${stillPending} still pending on Razorpay, ${failed} failed`);
if (isDryRun) console.log("(dry-run — no changes committed)");
