-- ═══════════════════════════════════════════════════════════════════════════
--  Order confirmation email tracking — 2026-07-11
--
--  Records when the ZeptoMail order-confirmation email was sent for each
--  order. Used for:
--    1. Dedup — a repeat webhook or manual re-verify never fires a duplicate
--       "Your order is confirmed" email to the customer.
--    2. Admin observability — the /admin/orders/[id] page shows a green tick
--       + timestamp when the email was sent, and offers a "Resend" button.
--
--  NULL = never sent.  Non-null = sent at that instant.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.confirmation_email_sent_at IS
  'When the ZeptoMail order-confirmation email was sent. NULL = not yet sent. Toggled by /api/razorpay/verify and the admin resend endpoint.';
