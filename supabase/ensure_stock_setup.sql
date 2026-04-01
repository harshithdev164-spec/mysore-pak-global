-- ============================================================
-- Stock Management Setup — run in Supabase SQL Editor
-- Ensures stock_quantity column exists and RLS policies are set
-- ============================================================

-- ============================================================
-- STEP 1: Add stock_quantity column if it doesn't exist
-- ============================================================
ALTER TABLE product_weights
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;

-- ============================================================
-- STEP 2: Ensure all existing weights have stock values
-- ============================================================
UPDATE product_weights
SET stock_quantity = COALESCE(stock_quantity, 100)
WHERE stock_quantity IS NULL;

-- ============================================================
-- STEP 3: Drop existing policies and recreate them
-- (Supabase doesn't support IF NOT EXISTS for policies)
-- ============================================================
DROP POLICY IF EXISTS "Service role can update stock" ON product_weights;
DROP POLICY IF EXISTS "Public can read product weights stock" ON product_weights;
DROP POLICY IF EXISTS "Service role can select orders" ON orders;
DROP POLICY IF EXISTS "Service role can update order items" ON order_items;

-- Create RLS policies
CREATE POLICY "Service role can update stock"
  ON product_weights FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read product weights stock"
  ON product_weights FOR SELECT
  USING (true);

CREATE POLICY "Service role can select orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Service role can update order items"
  ON order_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STEP 4: Verify setup
-- ============================================================
SELECT COUNT(*) as total_weights,
       COUNT(CASE WHEN stock_quantity IS NULL THEN 1 END) as null_stock_count,
       COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as in_stock_count
FROM product_weights;
