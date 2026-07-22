-- ═══════════════════════════════════════════════════════════════════════════
--  Admin users + OTP login — 2026-07-11
--
--  Replaces the single-shared-password auth for /admin/* with per-user
--  WhatsApp OTP login and role-based access control.
--
--  Roles:
--    super_admin — everything, including the Team management panel
--    admin       — everything except Finance & GST and Team
--    finance     — Dashboard, Finance & GST, Invoices, Orders (read-only)
--    logistics   — Dashboard, Orders, Products
--
--  Auth flow:
--    1. User submits phone → we generate a 6-digit code, bcrypt hash it,
--       write to admin_otp_codes with expires_at = now + 5 min.
--    2. Meta WhatsApp Cloud API sends the code via the "admin_login_otp"
--       template (auto-approved on 2026-07-11).
--    3. User enters code → we hash + compare, mark used_at, issue an
--       HMAC-signed session cookie containing {user_id, role, exp}.
--
--  Rate limits enforced in application code:
--    - Max 3 OTPs / phone / 15 minutes
--    - Max 5 verify attempts per OTP
--    - OTP expires 5 minutes after creation
--
--  RLS: both tables blocked from anon SELECT. Server code uses the service
--  role key to bypass RLS for admin ops. Login flow uses service role too
--  (endpoint-level auth, not RLS).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_users (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  -- E.164 without leading + (e.g. "919538772164"). Unique so one phone
  -- maps to exactly one user.
  phone          TEXT          NOT NULL UNIQUE,
  name           TEXT          NOT NULL,
  email          TEXT,
  role           TEXT          NOT NULL
                               CHECK (role IN ('super_admin', 'admin', 'finance', 'logistics')),
  is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_login_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_users_phone     ON admin_users (phone);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users (is_active);

COMMENT ON TABLE admin_users IS
  'People who can log in to /admin. Managed via /admin/team by super_admin.';

CREATE TABLE IF NOT EXISTS admin_otp_codes (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        TEXT          NOT NULL,
  code_hash    TEXT          NOT NULL,  -- bcrypt hash of the 6-digit code
  expires_at   TIMESTAMPTZ   NOT NULL,
  attempts     INT           NOT NULL DEFAULT 0,
  used_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Common lookup: "most recent unexpired OTP for this phone"
CREATE INDEX IF NOT EXISTS idx_admin_otp_phone_created
  ON admin_otp_codes (phone, created_at DESC);

-- Rate-limit lookup: "how many OTPs did we send this phone in the last 15 min"
CREATE INDEX IF NOT EXISTS idx_admin_otp_phone_expires
  ON admin_otp_codes (phone, expires_at);

COMMENT ON TABLE admin_otp_codes IS
  'Ephemeral one-time codes. Housekeeping job could purge rows with expires_at < now() - 24h.';

-- ── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE admin_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_otp_codes ENABLE ROW LEVEL SECURITY;
-- No policies = no anon/authenticated access. Only the service role
-- (used by our API routes) can touch these tables.
