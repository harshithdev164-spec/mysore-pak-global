-- ============================================================
-- WhatsApp bot — message log + session state
-- Run this in Supabase SQL Editor.
-- ============================================================

-- Every inbound/outbound WhatsApp message, for the admin conversations view.
CREATE TABLE IF NOT EXISTS wa_messages (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wa_id        TEXT NOT NULL,                      -- the customer's WA id (E.164 no +)
  direction    TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  msg_type     TEXT NOT NULL DEFAULT 'text',       -- text | interactive | template | image | ...
  body         TEXT,                               -- best-effort plain text
  meta_msg_id  TEXT,                               -- Meta's wamid for dedup
  raw          JSONB,                              -- full webhook entry for debugging
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wa_messages_wa_id_idx ON wa_messages (wa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wa_messages_meta_msg_id_idx ON wa_messages (meta_msg_id);

-- Per-customer conversation state for multi-turn flows.
-- intent: short string like 'await_order_number' or 'main_menu'.
CREATE TABLE IF NOT EXISTS wa_sessions (
  wa_id        TEXT PRIMARY KEY,
  intent       TEXT,
  context      JSONB,                              -- arbitrary per-flow scratchpad
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
