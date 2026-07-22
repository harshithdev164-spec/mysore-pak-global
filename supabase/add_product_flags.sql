-- ═══════════════════════════════════════════════════════════════════════════
--  Product editorial flags — 2026-07-11
--
--  Adds two boolean columns to `products` so the shop can offer merchandising
--  filters that the team controls directly (no algorithmic guessing):
--
--    is_bestseller   — appears under the "Best Sellers" chip
--    is_recommended  — appears under "Our Recommendation" chip
--
--  Customer Fav uses the existing `rating` column (no schema change needed).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_bestseller  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN NOT NULL DEFAULT FALSE;

-- Partial indexes — most products are FALSE, so we only index the small
-- subset flagged as bestseller/recommended for fast filter queries.
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller
  ON products (is_bestseller) WHERE is_bestseller = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_is_recommended
  ON products (is_recommended) WHERE is_recommended = TRUE;

COMMENT ON COLUMN products.is_bestseller  IS
  'Editorial "Best Seller" flag. Toggled from /admin/products/[id].';
COMMENT ON COLUMN products.is_recommended IS
  'Editorial "Our Recommendation" flag. Toggled from /admin/products/[id].';
