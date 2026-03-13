-- ============================================================
-- RLS Policy Migration — run in Supabase SQL Editor
-- Adds missing UPDATE/DELETE policies needed by admin panel
-- ============================================================

-- Allow service-role (admin) to update order status & payment
CREATE POLICY "Service role can update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow service-role (admin) to update products (toggle active, edit)
CREATE POLICY "Service role can update products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow service-role (admin) to delete products
CREATE POLICY "Service role can delete products"
  ON products FOR DELETE
  USING (true);

-- Allow service-role (admin) to insert products
CREATE POLICY "Service role can insert products"
  ON products FOR INSERT
  WITH CHECK (true);

-- Allow service-role (admin) to manage product_weights
CREATE POLICY "Service role can insert product_weights"
  ON product_weights FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update product_weights"
  ON product_weights FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete product_weights"
  ON product_weights FOR DELETE USING (true);

-- Allow service-role (admin) to manage categories
CREATE POLICY "Service role can insert categories"
  ON categories FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update categories"
  ON categories FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete categories"
  ON categories FOR DELETE USING (true);

-- Allow service-role (admin) to update reviews (feature/unfeature)
CREATE POLICY "Service role can update reviews"
  ON reviews FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete reviews"
  ON reviews FOR DELETE USING (true);
