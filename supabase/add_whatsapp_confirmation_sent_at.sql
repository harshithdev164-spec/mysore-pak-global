-- ═══════════════════════════════════════════════════════════════════════════
--  Order confirmation WhatsApp send tracking — 2026-07-11
--
--  Mirrors confirmation_email_sent_at. Used to dedup the WhatsApp template
--  send between the /api/razorpay/verify code path (fires when the browser
--  stays open after payment) and /api/razorpay/webhook (server-to-server,
--  fires even when the browser closes). Without this column, an order that
--  triggers both paths would spam the customer with two identical
--  "Order confirmed" WhatsApp messages.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS whatsapp_confirmation_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.whatsapp_confirmation_sent_at IS
  'When the "order_confirmed" WhatsApp template was sent. NULL = not yet sent. Toggled by post-payment hooks in verify + webhook.';
