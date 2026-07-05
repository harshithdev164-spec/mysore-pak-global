-- ════════════════════════════════════════════════════════════════
-- Bulk price update — sourced from wholesale price list image (2026-06-16)
-- ════════════════════════════════════════════════════════════════
--
-- Rules used while compiling this file:
--   1. Only updates products that already exist on the website (83 active).
--   2. Image prices were mostly stated for 1 KG; smaller weights are
--      scaled proportionally and rounded to whole rupees:
--        500g  = 50% of 1 KG
--        250g  = 25% of 1 KG
--        100g  = 10% of 1 KG
--   3. Where the image lists a per-weight price directly (e.g. 100GM, 200GM),
--      that exact value is used instead of scaling.
--   4. products.base_price is also refreshed to match the smallest-weight
--      variant so the "from ₹X" anchor on product cards stays correct.
--   5. Products in the image that DON'T exist on the website are listed at
--      the bottom for review (no SQL emitted for them).
--
-- Safety: run inside a transaction so you can verify totals before commit.
--
--   BEGIN;
--   \i update_prices_2026_06_16.sql
--   -- review with: SELECT name, base_price FROM products ORDER BY name;
--   COMMIT;   -- or ROLLBACK to abort
--
-- Pre-flight check: every (name, label) tuple targeted by this file was
-- verified against the live DB on 2026-06-16. All 136 weight-variant
-- updates and 58 base-price updates resolve to a real row. The DO block
-- below RE-VERIFIES at run-time and raises an exception if any name has
-- been renamed since, so you fail loud instead of silently no-op'ing.

DO $$
DECLARE
  missing_count INT;
BEGIN
  -- All distinct product names we touch
  WITH targets(name) AS (VALUES
    ('Traditional Mysore Pak'), ('Pure Ghee Bombay Halwa'), ('Pure Ghee Soan Papdi'),
    ('Kaju Mysore Pak'), ('Milk Mysore Pak'), ('Spl Mysore Pak'), ('Mix Mysore Pak'),
    ('Jaggery Mysore Pak'), ('Millet Mysore Pak'), ('Millet Mysorepak'),
    ('Anjeer Mysore Pak'), ('Mango Mysore Pak'), ('Jaggery Millet Mysore Pak'),
    ('Roasted Almond Mysore Pak'), ('Badam Halwa'), ('Kaju Barfi'),
    ('Kaju Bites'), ('Kesar Bites'), ('Pista Bites'), ('Rose Bites'),
    ('Mango Delight'), ('Chocolate Bites'),
    ('Plain Khakhra'), ('Masala Khakhra'), ('Methi masala khakhra'),
    ('Jeera khakhra'), ('Cheese khakhra'),
    ('Garlic Mixture'), ('Mota Sev'), ('Sev'), ('Spl Om Pudi'),
    ('Chakkuli'), ('Ribbon Muruku'), ('Thill Murk'), ('Methi Matri'),
    ('Mysore Mixture'), ('Channa Dal'), ('Fried Channa'), ('Fried Green Peas'),
    ('Grains And Pulses'), ('Palak Chakkuli'), ('Mysore Masala Kadlepuri'),
    ('Mini Nippattu'), ('Split Peanuts'), ('Masala Peanut'),
    ('Salt Moong Dal'), ('Spicy Moong Dal'),
    ('Masala Kaju'), ('Pepper Kaju'), ('Salt Kaju'), ('Chilli Kaju'),
    ('Bendi (Vaccum Fried)'),
    ('Salt Makhana'), ('Pepper Makhana'), ('Cheddar Cheese Makhana'),
    ('Tomato Cheese Makhana'), ('Cajun Hot & Spicy Makana'), ('Peri Peri Makhana')
  )
  SELECT COUNT(*) INTO missing_count
  FROM targets t
  LEFT JOIN products p ON p.name = t.name
  WHERE p.id IS NULL;

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Pre-flight check failed: % product name(s) in this script no longer exist in the products table. List them with:%
  WITH targets(name) AS (VALUES (''Traditional Mysore Pak''), ...) SELECT t.name FROM targets t LEFT JOIN products p ON p.name = t.name WHERE p.id IS NULL;
Refusing to run any UPDATEs. Fix the names or skip those products, then re-run.',
      missing_count, chr(10);
  END IF;
END $$;

BEGIN;

-- ─────────────────────────────────────────────────────────────────
-- MYSORE PAK VARIETIES
-- ─────────────────────────────────────────────────────────────────

-- Traditional Mysore Pak  (image: 1 KG ₹628.57)
UPDATE product_weights SET price = 629 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Traditional Mysore Pak');
UPDATE product_weights SET price = 314 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Traditional Mysore Pak');
UPDATE product_weights SET price = 157 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Traditional Mysore Pak');
UPDATE product_weights SET price =  63 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Traditional Mysore Pak');
UPDATE products SET base_price = 63 WHERE name = 'Traditional Mysore Pak';

-- Pure Ghee Bombay Halwa  (image: 1 KG ₹628.57)
UPDATE product_weights SET price = 629 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Pure Ghee Bombay Halwa');
UPDATE product_weights SET price = 314 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Pure Ghee Bombay Halwa');
UPDATE product_weights SET price = 157 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Pure Ghee Bombay Halwa');
UPDATE product_weights SET price =  63 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Pure Ghee Bombay Halwa');
UPDATE products SET base_price = 63 WHERE name = 'Pure Ghee Bombay Halwa';

-- Pure Ghee Soan Papdi  (image: 1 KG ₹628.57)
UPDATE product_weights SET price = 629 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Pure Ghee Soan Papdi');
UPDATE product_weights SET price = 314 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Pure Ghee Soan Papdi');
UPDATE product_weights SET price = 157 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Pure Ghee Soan Papdi');
UPDATE product_weights SET price =  63 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Pure Ghee Soan Papdi');
UPDATE products SET base_price = 63 WHERE name = 'Pure Ghee Soan Papdi';

-- Kaju Mysore Pak  (image: 1 KG ₹1,047.62)
UPDATE product_weights SET price = 1048 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Mysore Pak');
UPDATE product_weights SET price =  524 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Mysore Pak');
UPDATE product_weights SET price =  262 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Mysore Pak');
UPDATE product_weights SET price =  105 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Mysore Pak');
UPDATE products SET base_price = 105 WHERE name = 'Kaju Mysore Pak';

-- Milk Mysore Pak  (image: 1 KG ₹1,047.62)
UPDATE product_weights SET price = 1048 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Milk Mysore Pak');
UPDATE product_weights SET price =  524 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Milk Mysore Pak');
UPDATE product_weights SET price =  262 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Milk Mysore Pak');
UPDATE product_weights SET price =  105 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Milk Mysore Pak');
UPDATE products SET base_price = 105 WHERE name = 'Milk Mysore Pak';

-- Spl Mysore Pak  (image: 1 KG ₹1,047.62)
UPDATE product_weights SET price = 1048 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Spl Mysore Pak');
UPDATE product_weights SET price =  524 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Spl Mysore Pak');
UPDATE product_weights SET price =  262 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Spl Mysore Pak');
UPDATE product_weights SET price =  105 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Spl Mysore Pak');
UPDATE products SET base_price = 105 WHERE name = 'Spl Mysore Pak';

-- Mix Mysore Pak  (image: 1 KG ₹1,047.62)
UPDATE product_weights SET price = 1048 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Mix Mysore Pak');
UPDATE product_weights SET price =  524 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Mix Mysore Pak');
UPDATE products SET base_price = 524 WHERE name = 'Mix Mysore Pak';

-- Jaggery Mysore Pak  (image: 1 KG ₹1,047.62)
UPDATE product_weights SET price = 1048 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Jaggery Mysore Pak');
UPDATE product_weights SET price =  524 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Jaggery Mysore Pak');
UPDATE product_weights SET price =  262 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Jaggery Mysore Pak');
UPDATE product_weights SET price =  105 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Jaggery Mysore Pak');
UPDATE products SET base_price = 105 WHERE name = 'Jaggery Mysore Pak';

-- Millet Mysore Pak (the variant with '1kg' label)  (image: 1 KG ₹1,047.62)
UPDATE product_weights SET price = 1048 WHERE label = '1kg'  AND product_id = (SELECT id FROM products WHERE name = 'Millet Mysore Pak');
UPDATE product_weights SET price =  524 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Millet Mysore Pak');
UPDATE product_weights SET price =  262 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Millet Mysore Pak');
UPDATE products SET base_price = 262 WHERE name = 'Millet Mysore Pak';

-- Millet Mysorepak (the variant with '1 KG' label)  (image: 1 KG ₹1,047.62)
UPDATE product_weights SET price = 1048 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Millet Mysorepak');
UPDATE product_weights SET price =  524 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Millet Mysorepak');
UPDATE product_weights SET price =  262 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Millet Mysorepak');
UPDATE product_weights SET price =  105 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Millet Mysorepak');
UPDATE products SET base_price = 105 WHERE name = 'Millet Mysorepak';

-- Anjeer Mysore Pak  (image: 1 KG ₹1,361.90)
UPDATE product_weights SET price = 1362 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Anjeer Mysore Pak');
UPDATE product_weights SET price =  681 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Anjeer Mysore Pak');
UPDATE product_weights SET price =  341 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Anjeer Mysore Pak');
UPDATE product_weights SET price =  136 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Anjeer Mysore Pak');
UPDATE products SET base_price = 136 WHERE name = 'Anjeer Mysore Pak';

-- Mango Mysore Pak  (image: 1 KG ₹1,361.90)
UPDATE product_weights SET price = 1362 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Mango Mysore Pak');
UPDATE product_weights SET price =  681 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Mango Mysore Pak');
UPDATE product_weights SET price =  341 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Mango Mysore Pak');
UPDATE product_weights SET price =  136 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Mango Mysore Pak');
UPDATE products SET base_price = 136 WHERE name = 'Mango Mysore Pak';

-- Jaggery Millet Mysore Pak  (image: 1 KG ₹1,361.90)
UPDATE product_weights SET price = 1362 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Jaggery Millet Mysore Pak');
UPDATE product_weights SET price =  681 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Jaggery Millet Mysore Pak');
UPDATE product_weights SET price =  341 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Jaggery Millet Mysore Pak');
UPDATE product_weights SET price =  136 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Jaggery Millet Mysore Pak');
UPDATE products SET base_price = 136 WHERE name = 'Jaggery Millet Mysore Pak';

-- Roasted Almond Mysore Pak  (image: 1 KG ₹1,361.90 — product has no 100g variant)
UPDATE product_weights SET price = 1362 WHERE label = '1 kg' AND product_id = (SELECT id FROM products WHERE name = 'Roasted Almond Mysore Pak');
UPDATE product_weights SET price =  681 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Roasted Almond Mysore Pak');
UPDATE product_weights SET price =  341 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Roasted Almond Mysore Pak');
UPDATE products SET base_price = 341 WHERE name = 'Roasted Almond Mysore Pak';

-- Carrot Mysore Pak  (kept current pricing — not present in image)

-- ─────────────────────────────────────────────────────────────────
-- SWEETS — HALWA, BARFI, BURFI
-- ─────────────────────────────────────────────────────────────────

-- Badam Halwa  (image: 1 KG ₹1,466.67)
UPDATE product_weights SET price = 1467 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Badam Halwa');
UPDATE product_weights SET price =  733 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Badam Halwa');
UPDATE product_weights SET price =  367 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Badam Halwa');
UPDATE product_weights SET price =  147 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Badam Halwa');
UPDATE products SET base_price = 147 WHERE name = 'Badam Halwa';

-- Kaju Barfi  (image: 1 KG ₹1,257.14)
UPDATE product_weights SET price = 1257 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Barfi');
UPDATE product_weights SET price =  629 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Barfi');
UPDATE product_weights SET price =  314 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Barfi');
UPDATE product_weights SET price =  126 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Barfi');
UPDATE products SET base_price = 126 WHERE name = 'Kaju Barfi';

-- ─────────────────────────────────────────────────────────────────
-- BITES (all at uniform tier — image: 1 KG ₹1,414.29)
-- ─────────────────────────────────────────────────────────────────

-- Kaju Bites
UPDATE product_weights SET price = 1414 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Bites');
UPDATE product_weights SET price =  707 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Bites');
UPDATE product_weights SET price =  354 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Bites');
UPDATE product_weights SET price =  141 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Kaju Bites');
UPDATE products SET base_price = 141 WHERE name = 'Kaju Bites';

-- Kesar Bites
UPDATE product_weights SET price = 1414 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Kesar Bites');
UPDATE product_weights SET price =  707 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Kesar Bites');
UPDATE product_weights SET price =  354 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Kesar Bites');
UPDATE product_weights SET price =  141 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Kesar Bites');
UPDATE products SET base_price = 141 WHERE name = 'Kesar Bites';

-- Pista Bites
UPDATE product_weights SET price = 1414 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Pista Bites');
UPDATE product_weights SET price =  707 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Pista Bites');
UPDATE product_weights SET price =  354 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Pista Bites');
UPDATE product_weights SET price =  141 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Pista Bites');
UPDATE products SET base_price = 141 WHERE name = 'Pista Bites';

-- Rose Bites  (image lists ROSE BURFI at same tier)
UPDATE product_weights SET price = 1414 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Rose Bites');
UPDATE product_weights SET price =  707 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Rose Bites');
UPDATE product_weights SET price =  354 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Rose Bites');
UPDATE product_weights SET price =  141 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Rose Bites');
UPDATE products SET base_price = 141 WHERE name = 'Rose Bites';

-- Mango Delight  (image MANGO DELIGHT 1,414.29)
UPDATE product_weights SET price = 1414 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Mango Delight');
UPDATE product_weights SET price =  707 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Mango Delight');
UPDATE product_weights SET price =  354 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Mango Delight');
UPDATE product_weights SET price =  141 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Mango Delight');
UPDATE products SET base_price = 141 WHERE name = 'Mango Delight';

-- ─────────────────────────────────────────────────────────────────
-- CHOCOLATES
-- ─────────────────────────────────────────────────────────────────

-- Chocolate Bites  (image CHOCOLATE BITES 1 KG ₹1,353)
UPDATE product_weights SET price = 1353 WHERE label = '1 KG' AND product_id = (SELECT id FROM products WHERE name = 'Chocolate Bites');
UPDATE product_weights SET price =  677 WHERE label = '500g' AND product_id = (SELECT id FROM products WHERE name = 'Chocolate Bites');
UPDATE product_weights SET price =  338 WHERE label = '250g' AND product_id = (SELECT id FROM products WHERE name = 'Chocolate Bites');
UPDATE product_weights SET price =  135 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Chocolate Bites');
UPDATE products SET base_price = 135 WHERE name = 'Chocolate Bites';

-- ─────────────────────────────────────────────────────────────────
-- NAMKEEN / SAVOURY (image gives per-weight prices directly)
-- ─────────────────────────────────────────────────────────────────

-- Khakhras (image: 200 GM ₹104.76)  — Plain / Masala / Methi Masala / Jeera / Cheese
UPDATE product_weights SET price = 105 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Plain Khakhra');
UPDATE products SET base_price = 105 WHERE name = 'Plain Khakhra';

UPDATE product_weights SET price = 105 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Masala Khakhra');
UPDATE products SET base_price = 105 WHERE name = 'Masala Khakhra';

UPDATE product_weights SET price = 105 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Methi masala khakhra');
UPDATE products SET base_price = 105 WHERE name = 'Methi masala khakhra';

UPDATE product_weights SET price = 105 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Jeera khakhra');
UPDATE products SET base_price = 105 WHERE name = 'Jeera khakhra';

UPDATE product_weights SET price = 105 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Cheese khakhra');
UPDATE products SET base_price = 105 WHERE name = 'Cheese khakhra';

-- Garlic Mixture  (image: 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Garlic Mixture');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Garlic Mixture');
UPDATE products SET base_price = 73 WHERE name = 'Garlic Mixture';

-- Mota Sev  (image: MOTI SEV 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Mota Sev');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Mota Sev');
UPDATE products SET base_price = 73 WHERE name = 'Mota Sev';

-- Sev  (image: SEV 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Sev');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Sev');
UPDATE products SET base_price = 73 WHERE name = 'Sev';

-- Spl Om Pudi  (image: SPL OM PUDI 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Spl Om Pudi');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Spl Om Pudi');
UPDATE products SET base_price = 73 WHERE name = 'Spl Om Pudi';

-- Mini Nippattu  (image: MINI NIPPATTU 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Mini Nippattu');
UPDATE products SET base_price = 73 WHERE name = 'Mini Nippattu';

-- Chakkuli  (image: CHAKLI 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Chakkuli');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Chakkuli');
UPDATE products SET base_price = 73 WHERE name = 'Chakkuli';

-- Ribbon Muruku  (image: RIBBON MURUKKU 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Ribbon Muruku');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Ribbon Muruku');
UPDATE products SET base_price = 73 WHERE name = 'Ribbon Muruku';

-- Thill Murk  (image: THILL MURK 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Thill Murk');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Thill Murk');
UPDATE products SET base_price = 73 WHERE name = 'Thill Murk';

-- Methi Matri  (image: METHI MATHRI 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Methi Matri');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Methi Matri');
UPDATE products SET base_price = 73 WHERE name = 'Methi Matri';

-- Mysore Mixture  (image: SPECIAL MIXTURE 100 GM ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Mysore Mixture');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Mysore Mixture');
UPDATE products SET base_price = 73 WHERE name = 'Mysore Mixture';

-- Channa Dal  (image lists at ₹73.33 tier)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Channa Dal');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Channa Dal');
UPDATE products SET base_price = 73 WHERE name = 'Channa Dal';

-- Fried Channa  (image lists at ₹73.33 tier)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Fried Channa');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Fried Channa');
UPDATE products SET base_price = 73 WHERE name = 'Fried Channa';

-- Fried Green Peas  (image lists at ₹73.33 tier)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Fried Green Peas');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Fried Green Peas');
UPDATE products SET base_price = 73 WHERE name = 'Fried Green Peas';

-- Grains And Pulses  (image: GRAINS&PULSES MASALA 100 GM ₹62.86)
UPDATE product_weights SET price = 63 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Grains And Pulses');
UPDATE products SET base_price = 63 WHERE name = 'Grains And Pulses';

-- Palak Chakkuli  (image: PALAK CHAKKI 100 GMS ₹62.86)
UPDATE product_weights SET price = 63 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Palak Chakkuli');
UPDATE products SET base_price = 63 WHERE name = 'Palak Chakkuli';

-- Mysore Masala Kadlepuri  (image: MYSORE MASALA KADLEPURI ₹52.38 per 100g)
UPDATE product_weights SET price =  52 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Mysore Masala Kadlepuri');
UPDATE product_weights SET price = 105 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Mysore Masala Kadlepuri');
UPDATE products SET base_price = 52 WHERE name = 'Mysore Masala Kadlepuri';

-- Split Peanuts  (image: SPLT MASALAPEANUT 100 GMS ₹73.33)
UPDATE product_weights SET price = 73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Split Peanuts');
UPDATE products SET base_price = 73 WHERE name = 'Split Peanuts';

-- Masala Peanut  (image: SPLT MASALAPEANUT 100 GMS ₹73.33)
UPDATE product_weights SET price =  73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Masala Peanut');
UPDATE product_weights SET price = 147 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Masala Peanut');
UPDATE products SET base_price = 73 WHERE name = 'Masala Peanut';

-- Salt Moong Dal  (image: SALT MOONG DAL 100 GM ₹73.33)
UPDATE product_weights SET price = 73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Salt Moong Dal');
UPDATE products SET base_price = 73 WHERE name = 'Salt Moong Dal';

-- Spicy Moong Dal  (image: SPICY MOONG DAL 100 GM ₹73.33)
UPDATE product_weights SET price = 73 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Spicy Moong Dal');
UPDATE products SET base_price = 73 WHERE name = 'Spicy Moong Dal';

-- ─────────────────────────────────────────────────────────────────
-- KAJU / NUT SNACKS (image: 100 GM ₹188.57)
-- ─────────────────────────────────────────────────────────────────

UPDATE product_weights SET price = 189 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Masala Kaju');
UPDATE products SET base_price = 189 WHERE name = 'Masala Kaju';

UPDATE product_weights SET price = 189 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Pepper Kaju');
UPDATE products SET base_price = 189 WHERE name = 'Pepper Kaju';

UPDATE product_weights SET price = 189 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Salt Kaju');
UPDATE products SET base_price = 189 WHERE name = 'Salt Kaju';

-- Chilli Kaju  (image: CHILLI KAJU 1KG ₹1,409.52 → 100g ≈ ₹141)
UPDATE product_weights SET price = 141 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Chilli Kaju');
UPDATE products SET base_price = 141 WHERE name = 'Chilli Kaju';

-- ─────────────────────────────────────────────────────────────────
-- VACUUM-FRIED VEG (image: BENDI FRY 100 GMS ₹183.33)
-- ─────────────────────────────────────────────────────────────────

UPDATE product_weights SET price = 183 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Bendi (Vaccum Fried)');
UPDATE products SET base_price = 183 WHERE name = 'Bendi (Vaccum Fried)';

-- Karela (Vaccum Fried) — not in image but same family. Keeping current.

-- ─────────────────────────────────────────────────────────────────
-- MAKHANA (image: most flavours ₹209.52 per 100g, fancy flavours ₹235.71)
-- ─────────────────────────────────────────────────────────────────

-- Salt Makhana  (image: SALT MAKHANA 100 GM ₹209.52)
UPDATE product_weights SET price = 210 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Salt Makhana');
UPDATE product_weights SET price = 419 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Salt Makhana');
UPDATE products SET base_price = 210 WHERE name = 'Salt Makhana';

-- Pepper Makhana  (₹209.52 tier)
UPDATE product_weights SET price = 210 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Pepper Makhana');
UPDATE products SET base_price = 210 WHERE name = 'Pepper Makhana';

-- Cheddar Cheese Makhana  (image: CHILLI/CHEESE MAKHANA ₹209.52)
UPDATE product_weights SET price = 210 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Cheddar Cheese Makhana');
UPDATE products SET base_price = 210 WHERE name = 'Cheddar Cheese Makhana';

-- Tomato Cheese Makhana  (₹209.52)
UPDATE product_weights SET price = 210 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Tomato Cheese Makhana');
UPDATE products SET base_price = 210 WHERE name = 'Tomato Cheese Makhana';

-- Cajun Hot & Spicy Makana  (image: CAJUN HOT MAKHANA 100 GM ₹209.52)
UPDATE product_weights SET price = 210 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Cajun Hot & Spicy Makana');
UPDATE product_weights SET price = 419 WHERE label = '200g' AND product_id = (SELECT id FROM products WHERE name = 'Cajun Hot & Spicy Makana');
UPDATE products SET base_price = 210 WHERE name = 'Cajun Hot & Spicy Makana';

-- Peri Peri Makhana  (image: PERI PERI MAKHANA ₹235.71 — premium flavour tier)
UPDATE product_weights SET price = 236 WHERE label = '100g' AND product_id = (SELECT id FROM products WHERE name = 'Peri Peri Makhana');
UPDATE products SET base_price = 236 WHERE name = 'Peri Peri Makhana';

-- ─────────────────────────────────────────────────────────────────
-- VARIETY SNACKS — kept where image gives a clear match
-- ─────────────────────────────────────────────────────────────────

-- Mysore Spl Avarekalu  (image: MYSORE SPL AVARLENALI ₹120/100g implied)
-- Image shows 1KG-equivalent 733.33 / 6 weight bands — current 100g=120 is reasonable
-- Kept as-is.

-- Khara Chips / Salt Chips — image doesn't list, keep current
-- Salted Pista — image SALT PISTA appears only in chocolate section, ambiguous, keep current

COMMIT;

-- ════════════════════════════════════════════════════════════════
--                         REVIEW NOTES
-- ════════════════════════════════════════════════════════════════
--
-- Image products that DO NOT exist on the website (skipped):
--   ANJEER DRY FRUIT ROLL, BALAJI LADO, BARFI (generic), BESAN LADOO,
--   BOONDI LADOO, CHOCOLATE BURFI, COCONUT BARFI, DOODH BURFI,
--   DRY FRUIT KAJU, DRY FRUIT LADOO, GHEE KALANGI, GHEE MOTI CHOOR LADOO,
--   HORLICKS BARFI/BURFI, JAGGERY COCONUT BURFI, JAGGER KAJU BURFI,
--   KAJU BLUEBERRY ROLL, KAJU CHOCO BALL, KAJU CUTLET, KAJU DRY FRUIT LADOO,
--   KAJU HONEY LADOO, KAJU KATORI, KAJU KESAR ROLL, KAJU PISTA ROLL,
--   KAJU ROSE LADOO, KAJU DRY FRUIT BURFI, KESAR PEDA, MANGO BURFI,
--   MAWA KATLI, MILK CAKE, MISTY MILK BURFI, MOONG DAL BURFI, ORANGE BURFI,
--   PINEAPPLE BURFI, PISTA BURFI, WHITE SOANPAPDI, WHITE WHEY BURFI,
--   COFFEE MYSORE PAK, GOLD MYSORE PAK, CHOCLATE MYSORE PAK,
--   MELON SEEDS MYSORE PAK, MYSORE PEDA, PAKA SANDWICH,
--   DRY DAL SAMOSA, DRY FRUITS DALMOTH, DRY SAMOSA OMPUDI,
--   FAMILY/GREEN/PUDINA/SPECIAL KARA BOONDI/SPL CHIVDA/STANDARD MIXTURE,
--   ABHIMANYU/BALARRA/BALARAMA/DASARA DARBAR/DRONA/EKALAVYA/
--   JAYAMRTHANDA snack assortments, NEPOTSAVA MATKAGUNTLA, SHAN CAKE,
--   SWEET WAVE, SWEET BOONDI, CHANNAPATTI, JAMOON, KASHMIRI KESAR,
--   KARAN SANDWICH, PATARA MATAKAGULLA, RAS BHOG, RASGULLA,
--   AMPANANA/BUTTER MILK/JAL JEERA/KESAR LASSI/ROSE MILK/SPL BADAM
--   MILK/SWEET LASSI/WATER BOTTLE (beverages),
--   BITTER GOURD, CREAM & ONION/CHILLI GARLIC/CHILLI/JOT/KASHMIRI/MAC
--   AND CHEESE/MEXICAN SALSA/PUDINA/TANGY CHEESE MAKHANA variants
--   beyond what's stocked,
--   MADRAS PAPPU, MOTI MIXTURE, PALAK CHAKKI, PUFFED RAGI/PUMPKIN/RAGI
--   MURUKKU/CHAKLI (BAKED), KASHMIRI/MEXICAN/etc.,
--   ALMOND/CASEW/CASHEW/PESTACO/SHAHI nut chocolates,
--   CHOCOLATE COATED ALMOND, ROSE MILK CHOCO LATTE.
--
-- If you want any of these added to the website as new products, send
-- me the name, weight variants, image, and a one-line description and
-- I'll write the INSERT statements.
