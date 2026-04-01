-- ============================================================
-- Stock Management Setup — run in Supabase SQL Editor
-- Ensures stock_quantity column exists and RLS policies are set
-- ============================================================

-- 1. Add stock_quantity column if it doesn't exist
ALTER TABLE product_weights
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;

-- 2. Ensure all existing weights have stock values (not null)
UPDATE product_weights
SET stock_quantity = COALESCE(stock_quantity, 100)
WHERE stock_quantity IS NULL;

-- 3. Service role can update stock
CREATE POLICY IF NOT EXISTS "Service role can update stock"
  ON product_weights FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. Public can read stock
CREATE POLICY IF NOT EXISTS "Public can read product weights stock"
  ON product_weights FOR SELECT
  USING (true);

-- 5. Verify data (run this to check)
SELECT COUNT(*) as total_weights,
       COUNT(CASE WHEN stock_quantity IS NULL THEN 1 END) as null_stock_count,
       COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as in_stock_count
FROM product_weights;

-- Expected output:
-- total_weights | null_stock_count | in_stock_count
-- Should have total_weights > 0 and null_stock_count = 0
