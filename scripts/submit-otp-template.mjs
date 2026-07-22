#!/usr/bin/env node
/**
 * Submits the admin_login_otp WhatsApp template to Meta for approval via
 * Graph API. Idempotent — if the template already exists, it prints the
 * status and exits without erroring.
 *
 * Usage:  node scripts/submit-otp-template.mjs
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

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const graph = "https://graph.facebook.com/v20.0";
const TEMPLATE_NAME = "admin_login_otp";

if (!token || !phoneNumberId) {
  console.error("❌ WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing in .env.local");
  process.exit(1);
}

// ── 1. Resolve WABA (WhatsApp Business Account) id ────────────────────────
// Try two field spellings — Meta changed the schema between versions.
console.log("→ Resolving WABA id from phone_number_id...");
async function resolveWaba() {
  for (const fields of ["whatsapp_business_account", "whatsapp_business_account_id"]) {
    const r = await fetch(`${graph}/${phoneNumberId}?fields=${fields}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await r.json();
    if (r.ok) {
      const id = j?.whatsapp_business_account?.id ?? j?.whatsapp_business_account_id;
      if (id) return { id, raw: j };
    }
  }
  return null;
}
const wabaOut = await resolveWaba();
if (!wabaOut) {
  console.error("❌ Could not resolve WABA id from either field spelling.");
  console.error("   Set WHATSAPP_BUSINESS_ACCOUNT_ID directly in .env.local if you know it.");
  console.error("   (Find it: Meta Business Manager → WhatsApp → Business Account settings)");
  if (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
    console.error(`   Using env override: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}`);
  } else {
    process.exit(2);
  }
}
const waba = wabaOut?.id ?? process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
console.log(`  waba_id = ${waba}`);

// ── 2. Check if the template already exists ───────────────────────────────
console.log("→ Checking if template already registered...");
const listRes = await fetch(
  `${graph}/${waba}/message_templates?name=${TEMPLATE_NAME}&limit=5`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const listJson = await listRes.json();
const existing = (listJson?.data ?? []).find((t) => t.name === TEMPLATE_NAME);

if (existing) {
  console.log(`✅ Template "${TEMPLATE_NAME}" already exists`);
  console.log(`   status:   ${existing.status}`);
  console.log(`   category: ${existing.category}`);
  console.log(`   language: ${existing.language}`);
  console.log(`   id:       ${existing.id}`);
  if (existing.status === "APPROVED") {
    console.log("\n✅ Ready to use — nothing more to do.");
  } else if (existing.status === "PENDING") {
    console.log("\n⏳ Awaiting Meta review. Usually 15 min - 2 hrs for auth templates.");
  } else if (existing.status === "REJECTED") {
    console.log(`\n❌ Rejected: ${existing.rejected_reason ?? "unknown"}. Delete + resubmit needed.`);
  }
  process.exit(0);
}

// ── 3. Submit the authentication-category template ────────────────────────
console.log("→ Submitting new authentication template to Meta...");
const payload = {
  name: TEMPLATE_NAME,
  language: "en",
  category: "AUTHENTICATION",
  components: [
    {
      type: "BODY",
      add_security_recommendation: true,
    },
    {
      type: "FOOTER",
      code_expiration_minutes: 5,
    },
    {
      type: "BUTTONS",
      buttons: [
        { type: "OTP", otp_type: "COPY_CODE", text: "Copy code" },
      ],
    },
  ],
};

const createRes = await fetch(`${graph}/${waba}/message_templates`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});
const createJson = await createRes.json();

if (!createRes.ok) {
  console.error(`❌ Submission failed (${createRes.status})`);
  console.error(JSON.stringify(createJson, null, 2));
  process.exit(3);
}

console.log("✅ Template submitted for approval");
console.log(`   id:       ${createJson.id}`);
console.log(`   status:   ${createJson.status ?? "PENDING"}`);
console.log(`   category: ${createJson.category ?? "AUTHENTICATION"}`);
console.log("");
console.log("Meta usually approves authentication templates in 15 min - 2 hrs.");
console.log("Re-run this script to check status.");
