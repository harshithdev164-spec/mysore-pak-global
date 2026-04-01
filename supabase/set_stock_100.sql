-- ============================================================
-- Set stock_quantity = 100 for ALL product weights
-- EXCEPT products with slug or name like 'pak-ka-sandwich'
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Set everything to 100
UPDATE product_weights
SET stock_quantity = 100
WHERE product_id NOT IN (
  SELECT id FROM products
  WHERE slug ILIKE '%pak-ka%sandwich%'
     OR name  ILIKE '%pak-ka%sandwich%'
);

-- Set pak-ka sandwich to 0 (out of stock)
UPDATE product_weights
SET stock_quantity = 0
WHERE product_id IN (
  SELECT id FROM products
  WHERE slug ILIKE '%pak-ka%sandwich%'
     OR name  ILIKE '%pak-ka%sandwich%'
);

-- Verify
SELECT p.name, p.slug, pw.label, pw.stock_quantity
FROM product_weights pw
JOIN products p ON p.id = pw.product_id
ORDER BY p.name, pw.label;
