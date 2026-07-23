#!/usr/bin/env node
/**
 * Finds orders that are payment_status=paid but never fired their
 * post-payment hooks (no AWB + no confirmation email + optionally no
 * courier). Calls the internal hooks endpoint to re-fire everything
 * (idempotent — safe if a hook already ran once).
 *
 * Use this after fixing a bug that caused hooks to bail silently, so any
 * orders processed during the broken window get repaired.
 *
 * Usage:
 *   node scripts/retry-stuck-hooks.mjs                # dry-run summary
 *   node scripts/retry-stuck-hooks.mjs --apply       # actually fire hooks
 *   node scripts/retry-stuck-hooks.mjs --order 0901  # single order
 */
import fs from "node:fs";
import path from "node:path";

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
const APPLY = args.has("--apply");
const orderIdx = process.argv.indexOf("--order");
const singleOrderNumber = orderIdx > -1 ? process.argv[orderIdx + 1] : null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.worldofmysorepak.com";
const hookSecret = process.env.RECONCILE_HOOK_SECRET;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Find paid orders that clearly missed their hooks (no AWB, no email)
const filter = singleOrderNumber
  ? `order_number=eq.${singleOrderNumber}`
  : `payment_status=eq.paid&awb_code=is.null&created_at=gte.${new Date(Date.now() - 7 * 86400000).toISOString()}`;

console.log(`→ Fetching orders matching: ${filter}`);
const listRes = await fetch(
  `${supabaseUrl}/rest/v1/orders?select=id,order_number,customer_email,customer_phone,payment_status,courier_id,awb_code,confirmation_email_sent_at,notes&${filter}&order=created_at.desc&limit=50`,
  { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
);
if (!listRes.ok) {
  console.error("❌ Fetch failed:", listRes.status, await listRes.text());
  process.exit(2);
}
const orders = await listRes.json();

if (orders.length === 0) {
  console.log("  Nothing to fix — no paid orders missing hooks.");
  process.exit(0);
}

console.log(`  Found ${orders.length} order(s):\n`);
for (const o of orders) {
  const emailFlag = o.confirmation_email_sent_at ? "✓" : "✗";
  const awbFlag = o.awb_code ? `AWB=${o.awb_code}` : "✗ no AWB";
  console.log(`  ${o.order_number}: email=${emailFlag}  ${awbFlag}  courier_id=${o.courier_id}`);
}

if (!APPLY) {
  console.log("\n(dry-run — pass --apply to actually fire the hooks)");
  process.exit(0);
}

if (!hookSecret) {
  console.error("\n❌ RECONCILE_HOOK_SECRET not set in .env.local — can't call the internal endpoint.");
  console.error("   Add it to .env.local AND to Cloudways env, then redeploy.");
  process.exit(3);
}

console.log(`\n→ Firing hooks for ${orders.length} order(s) via ${siteUrl}/api/internal/run-post-payment-hooks...\n`);

let ok = 0;
let failed = 0;
for (const o of orders) {
  process.stdout.write(`  ${o.order_number} ... `);
  try {
    const res = await fetch(`${siteUrl}/api/internal/run-post-payment-hooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": hookSecret,
      },
      body: JSON.stringify({ order_id: o.id }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.log(`✗ ${res.status}: ${j.error ?? "failed"}`);
      failed++;
      continue;
    }
    const r = j.report ?? {};
    console.log(
      `✓ email=${r.email_sent} whatsapp=${r.whatsapp_sent} courier=${r.courier_created}` +
      (r.awb ? ` awb=${r.awb}` : "")
    );
    ok++;
  } catch (err) {
    console.log(`✗ ${err.message}`);
    failed++;
  }
}

console.log(`\nSummary: ${ok} fired, ${failed} failed`);
