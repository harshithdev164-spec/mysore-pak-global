-- ═══════════════════════════════════════════════════════════════════════════
--  Franchise leads — 2026-07-11
--
--  Captures submissions from the enquiry form on /franchise. Replaces the
--  previous mailto:-only flow which was unreliable (many users don't have
--  a desktop mail client set up, so hitting Submit did nothing).
--
--  Statuses (business workflow):
--    new        — just came in, no one has looked yet
--    contacted  — team has reached out to the lead
--    converted  — signed / closed as an active franchise
--    rejected   — passed on this lead (bad fit, wrong city, spam)
--
--  RLS:
--    - anon INSERT allowed (so /api/franchise-leads can save without auth)
--    - SELECT / UPDATE blocked at RLS level; admin routes use the service
--      role key which bypasses RLS entirely.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS franchise_leads (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Applicant details (all required from the form)
  name         TEXT          NOT NULL,
  email        TEXT          NOT NULL,
  phone        TEXT          NOT NULL,
  city         TEXT          NOT NULL,
  message      TEXT,

  -- Workflow
  status       TEXT          NOT NULL DEFAULT 'new'
                             CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  admin_notes  TEXT,

  -- Provenance / anti-spam
  source       TEXT          NOT NULL DEFAULT 'franchise-page',
  user_agent   TEXT,
  ip_hash      TEXT,          -- for future rate-limit / spam pattern detection

  -- Timestamps
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_franchise_leads_created_at
  ON franchise_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_franchise_leads_status
  ON franchise_leads (status);

-- Auto-bump updated_at on any UPDATE
CREATE OR REPLACE FUNCTION set_franchise_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS franchise_leads_updated_at ON franchise_leads;
CREATE TRIGGER franchise_leads_updated_at
  BEFORE UPDATE ON franchise_leads
  FOR EACH ROW
  EXECUTE FUNCTION set_franchise_leads_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE franchise_leads ENABLE ROW LEVEL SECURITY;

-- Anon can INSERT so the public form works. Nothing else.
DROP POLICY IF EXISTS "anon can submit franchise lead" ON franchise_leads;
CREATE POLICY "anon can submit franchise lead"
  ON franchise_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE franchise_leads IS
  'Enquiries from /franchise. Admin views/updates via /admin/franchise-leads.';
