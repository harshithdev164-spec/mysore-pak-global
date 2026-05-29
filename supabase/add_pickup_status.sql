-- Adds `pickup` as a valid order status.
-- Run this once in the Supabase SQL editor.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',
    'confirmed',
    'pickup',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ));
