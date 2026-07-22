-- ═══════════════════════════════════════════════════════════════════════════
--  Seed the first 4 admin users — 2026-07-11
--
--  Idempotent: uses ON CONFLICT DO NOTHING so re-running is safe. If a
--  phone number already exists it stays untouched (edit via /admin/team
--  instead).
--
--  Phones are stored in E.164 without leading +. Update the names once
--  the real people are onboarded.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO admin_users (phone, name, role) VALUES
  ('919538772164', 'Harshith Prasad',    'super_admin'),
  ('919538584355', 'Second Super Admin', 'super_admin'),
  ('916364895014', 'Logistics Team',     'logistics'),
  ('916364895016', 'Finance Team',       'finance')
ON CONFLICT (phone) DO NOTHING;

-- Verify: expect 4 rows.
SELECT phone, name, role, is_active FROM admin_users ORDER BY role, name;
