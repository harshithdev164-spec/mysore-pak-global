-- DHL Express international shipping migration.
-- Adds country tracking + DHL shipment identifiers, in parallel to delhivery_* columns.
-- Run once in the Supabase SQL editor.

-- 1) Top-level country column for fast filtering on admin (the JSONB shipping_address.country
--    stays as the source of truth; this column is denormalized for indexing).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'IN';
CREATE INDEX IF NOT EXISTS orders_shipping_country_idx ON orders (shipping_country);

-- 2) DHL-specific identifiers (parallel to delhivery_*)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dhl_shipment_id     TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dhl_tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dhl_label_url       TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dhl_invoice_url     TEXT;

-- 3) Backfill existing orders to 'IN' (matches the previous hardcoded behavior).
UPDATE orders SET shipping_country = 'IN' WHERE shipping_country IS NULL;
