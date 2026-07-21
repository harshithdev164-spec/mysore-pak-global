-- ═══════════════════════════════════════════════════════════════════════════
--  BULK PRICE UPDATE — 2026-07-09
--
--  Second bulk price revision handed over on 9 Jul 2026. Roughly a +10 %
--  pass across the whole catalog vs the 2 Jul list.
--
--  Scope: updates `products.base_price` — the price shown on shop cards and
--  the default weight variant. Weight-variant-specific prices in the
--  `product_weights` table are NOT touched (the source list gave one price
--  per SKU, not per weight variant).
--
--  Safety net: the DO block at the top RAISES EXCEPTION if any target
--  product name is missing from the DB, so the whole transaction rolls
--  back cleanly rather than silently skipping updates.
--
--  Skipped SKUs — same list as the 2 Jul update (products in the price
--  list but no matching row in Supabase). Create them in the admin panel
--  and add UPDATE lines here to include them next time.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Pre-flight: verify every target product name exists ──────────────────
DO $$
DECLARE
  missing_name TEXT;
BEGIN
  FOR missing_name IN
    SELECT n
    FROM unnest(ARRAY[
      -- Mysore Pak family
      'Anjeer Mysore Pak', 'Carrot Mysore Pak', 'Coffee Mysore Pak',
      'Chocolate Mysore Pak', 'Jaggery Millet Mysore Pak', 'Jaggery Mysore Pak',
      'Kaju Mysore Pak', 'Mango Mysore Pak', 'Milk Mysore Pak',
      'Millet Mysore Pak', 'Millet Mysorepak', 'Mix Mysore Pak',
      'Mysore Pedha', 'Pa-Ka Sandwich', 'Roasted Almond Mysore Pak',
      'Special Ghee Mysore Pak', 'Traditional Mysore Pak',
      -- Sweets
      'Badam Halwa', 'Badusha', 'Dry Fruit Barfi', 'Dry Fruit Ladoo',
      'Kaju Barfi', 'Kaju Bites', 'Kesar Bites', 'Mango Delight',
      'Pista Bites', 'Pure Ghee Bombay Halwa', 'Pure Ghee Soan Papdi',
      'Rose Bites', 'Soan Cake',
      -- Namkeens
      'Andhra Muruku', 'Bakarwadi', 'Cajun Hot & Spicy Makana', 'Chakkuli',
      'Channa Dal', 'Cheddar Cheese Makhana', 'Cheese khakhra', 'Chilli Kaju',
      'Fried Channa', 'Fried Green Peas', 'Garlic Mixture', 'Gatiya',
      'Grains And Pulses', 'Jeera khakhra', 'Khara Chips', 'Kodubale',
      'Masala Kaju', 'Masala Khakhra', 'Masala Peanut', 'Methi masala khakhra',
      'Methi Matri', 'Mini Nippattu', 'Mota Sev', 'Mysore Masala Kadlepuri',
      'Mysore Mixture', 'Mysore Spl Avarekalu', 'Palak Chakkuli', 'Pepper Kaju',
      'Pepper Makhana', 'Peri Peri Makhana', 'Plain Khakhra', 'Potato Sticks',
      'Ragi Chakkuli', 'Ribbon Muruku', 'Bendi (Vaccum Fried)', 'Salt Chips',
      'Salt Kaju', 'Salt Makhana', 'Salt Moong Dal', 'Salted Pista', 'Sev',
      'Spicy Moong Dal', 'Spl Om Pudi', 'Thill Murk', 'Tomato Cheese Makhana',
      -- Chocolates
      'Chocolate Bites', 'White Chocolate Raisins', 'Fruit & Nut Milk Chocolate',
      'Hazelnut Dark Chocolate', 'Milk Chocolate', 'Roasted Almond Dark Chocolate',
      'Roasted Kaju Milk Chocolate', 'Choco Dates with Roasted Almond Chocolate',
      'Choco Dipped Biscuit', 'Dipped Chocolate Oreo', 'Rasamalai Chocolate',
      'Roasted Cashew Cappuccino'
    ]) AS t(n)
    WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.name = t.n)
  LOOP
    RAISE EXCEPTION 'Product not found in DB: "%" — aborting transaction so nothing partial gets committed', missing_name;
  END LOOP;
END $$;

-- ── Mysore Pak family ────────────────────────────────────────────────────
UPDATE products SET base_price = 1430 WHERE name = 'Anjeer Mysore Pak';
UPDATE products SET base_price = 1210 WHERE name = 'Carrot Mysore Pak';
UPDATE products SET base_price = 1320 WHERE name = 'Coffee Mysore Pak';
UPDATE products SET base_price = 1430 WHERE name = 'Chocolate Mysore Pak';
UPDATE products SET base_price = 1210 WHERE name = 'Jaggery Millet Mysore Pak';
UPDATE products SET base_price = 1100 WHERE name = 'Jaggery Mysore Pak';
UPDATE products SET base_price = 1430 WHERE name = 'Kaju Mysore Pak';
UPDATE products SET base_price = 1430 WHERE name = 'Mango Mysore Pak';
UPDATE products SET base_price = 1100 WHERE name = 'Milk Mysore Pak';
UPDATE products SET base_price = 1210 WHERE name = 'Millet Mysore Pak';
UPDATE products SET base_price = 1210 WHERE name = 'Millet Mysorepak'; -- duplicate SKU with typo — same price
UPDATE products SET base_price = 1320 WHERE name = 'Mix Mysore Pak';
UPDATE products SET base_price = 1100 WHERE name = 'Mysore Pedha';
UPDATE products SET base_price = 1320 WHERE name = 'Pa-Ka Sandwich';
UPDATE products SET base_price = 1320 WHERE name = 'Roasted Almond Mysore Pak';
UPDATE products SET base_price = 1100 WHERE name = 'Special Ghee Mysore Pak'; -- displayed as "Spl Mysore Pak"
UPDATE products SET base_price = 660  WHERE name = 'Traditional Mysore Pak';

-- ── Sweets ───────────────────────────────────────────────────────────────
UPDATE products SET base_price = 1540 WHERE name = 'Badam Halwa';
UPDATE products SET base_price = 660  WHERE name = 'Badusha';
UPDATE products SET base_price = 1760 WHERE name = 'Dry Fruit Barfi';
UPDATE products SET base_price = 880  WHERE name = 'Dry Fruit Ladoo';
UPDATE products SET base_price = 1210 WHERE name = 'Kaju Barfi';
UPDATE products SET base_price = 1485 WHERE name = 'Kaju Bites';
UPDATE products SET base_price = 1485 WHERE name = 'Kesar Bites';
UPDATE products SET base_price = 1485 WHERE name = 'Mango Delight';
UPDATE products SET base_price = 1485 WHERE name = 'Pista Bites';
UPDATE products SET base_price = 880  WHERE name = 'Pure Ghee Bombay Halwa';
UPDATE products SET base_price = 880  WHERE name = 'Pure Ghee Soan Papdi';
UPDATE products SET base_price = 1485 WHERE name = 'Rose Bites';
UPDATE products SET base_price = 88   WHERE name = 'Soan Cake';

-- ── Namkeens ─────────────────────────────────────────────────────────────
UPDATE products SET base_price = 77   WHERE name = 'Andhra Muruku';
UPDATE products SET base_price = 77   WHERE name = 'Bakarwadi';
UPDATE products SET base_price = 220  WHERE name = 'Cajun Hot & Spicy Makana'; -- "CAJUN SPICE MAKHANA" / "HOT N SPICY MAKHANA" duplicate at ₹220
UPDATE products SET base_price = 77   WHERE name = 'Chakkuli';
UPDATE products SET base_price = 66   WHERE name = 'Channa Dal';
UPDATE products SET base_price = 220  WHERE name = 'Cheddar Cheese Makhana';
UPDATE products SET base_price = 110  WHERE name = 'Cheese khakhra';
UPDATE products SET base_price = 198  WHERE name = 'Chilli Kaju'; -- "CHILLI KAJU 100GMS BOX" / "CHILLY KAJU D" at ₹198
UPDATE products SET base_price = 66   WHERE name = 'Fried Channa';
UPDATE products SET base_price = 66   WHERE name = 'Fried Green Peas';
UPDATE products SET base_price = 770  WHERE name = 'Garlic Mixture'; -- "GARLIC MIXTURE" at ₹770 (duplicate entries in list)
UPDATE products SET base_price = 77   WHERE name = 'Gatiya';
UPDATE products SET base_price = 66   WHERE name = 'Grains And Pulses'; -- "GRAINS&PULSES MASALA 100GMS"
UPDATE products SET base_price = 110  WHERE name = 'Jeera khakhra';
UPDATE products SET base_price = 88   WHERE name = 'Khara Chips'; -- "KARA CHIPS"
UPDATE products SET base_price = 77   WHERE name = 'Kodubale';
UPDATE products SET base_price = 198  WHERE name = 'Masala Kaju';
UPDATE products SET base_price = 110  WHERE name = 'Masala Khakhra';
UPDATE products SET base_price = 66   WHERE name = 'Masala Peanut';
UPDATE products SET base_price = 110  WHERE name = 'Methi masala khakhra';
UPDATE products SET base_price = 77   WHERE name = 'Methi Matri';
UPDATE products SET base_price = 77   WHERE name = 'Mini Nippattu';
UPDATE products SET base_price = 77   WHERE name = 'Mota Sev';
UPDATE products SET base_price = 55   WHERE name = 'Mysore Masala Kadlepuri';
UPDATE products SET base_price = 770  WHERE name = 'Mysore Mixture';
UPDATE products SET base_price = 1485 WHERE name = 'Mysore Spl Avarekalu';
UPDATE products SET base_price = 66   WHERE name = 'Palak Chakkuli';
UPDATE products SET base_price = 198  WHERE name = 'Pepper Kaju';
UPDATE products SET base_price = 220  WHERE name = 'Pepper Makhana';
UPDATE products SET base_price = 247.5 WHERE name = 'Peri Peri Makhana';
UPDATE products SET base_price = 110  WHERE name = 'Plain Khakhra';
UPDATE products SET base_price = 77   WHERE name = 'Potato Sticks';
UPDATE products SET base_price = 66   WHERE name = 'Ragi Chakkuli'; -- "RAGI CHAKLI (FINGER MILLET)100GM"
UPDATE products SET base_price = 77   WHERE name = 'Ribbon Muruku';
UPDATE products SET base_price = 220  WHERE name = 'Bendi (Vaccum Fried)'; -- "SALT BENDI FRY"
UPDATE products SET base_price = 88   WHERE name = 'Salt Chips';
UPDATE products SET base_price = 198  WHERE name = 'Salt Kaju'; -- "SALT KAJU D ₹198" (list also shows "SALT KAJU ₹220" as duplicate — using ₹198 per the more specific line)
UPDATE products SET base_price = 220  WHERE name = 'Salt Makhana';
UPDATE products SET base_price = 66   WHERE name = 'Salt Moong Dal';
UPDATE products SET base_price = 198  WHERE name = 'Salted Pista'; -- "SALT PISTA D ₹198" (list also has "SALT PISTA ₹220" — using ₹198)
UPDATE products SET base_price = 77   WHERE name = 'Sev';
UPDATE products SET base_price = 66   WHERE name = 'Spicy Moong Dal';
UPDATE products SET base_price = 77   WHERE name = 'Spl Om Pudi';
UPDATE products SET base_price = 77   WHERE name = 'Thill Murk';
UPDATE products SET base_price = 220  WHERE name = 'Tomato Cheese Makhana';

-- ── Chocolates ───────────────────────────────────────────────────────────
UPDATE products SET base_price = 1485 WHERE name = 'Chocolate Bites';
UPDATE products SET base_price = 1650 WHERE name = 'White Chocolate Raisins';
UPDATE products SET base_price = 2200 WHERE name = 'Fruit & Nut Milk Chocolate';
UPDATE products SET base_price = 2200 WHERE name = 'Hazelnut Dark Chocolate';
UPDATE products SET base_price = 1100 WHERE name = 'Milk Chocolate';
UPDATE products SET base_price = 2200 WHERE name = 'Roasted Almond Dark Chocolate';
UPDATE products SET base_price = 2200 WHERE name = 'Roasted Kaju Milk Chocolate';
UPDATE products SET base_price = 220  WHERE name = 'Choco Dates with Roasted Almond Chocolate';
UPDATE products SET base_price = 220  WHERE name = 'Choco Dipped Biscuit';
UPDATE products SET base_price = 165  WHERE name = 'Dipped Chocolate Oreo';
UPDATE products SET base_price = 220  WHERE name = 'Rasamalai Chocolate';
UPDATE products SET base_price = 220  WHERE name = 'Roasted Cashew Cappuccino';

-- ── Verification: dump the updated rows so you can eyeball the diff ──────
SELECT name, base_price
FROM products
WHERE name IN (
  'Anjeer Mysore Pak', 'Carrot Mysore Pak', 'Coffee Mysore Pak',
  'Chocolate Mysore Pak', 'Jaggery Millet Mysore Pak', 'Jaggery Mysore Pak',
  'Kaju Mysore Pak', 'Mango Mysore Pak', 'Milk Mysore Pak',
  'Millet Mysore Pak', 'Millet Mysorepak', 'Mix Mysore Pak',
  'Mysore Pedha', 'Pa-Ka Sandwich', 'Roasted Almond Mysore Pak',
  'Special Ghee Mysore Pak', 'Traditional Mysore Pak',
  'Badam Halwa', 'Badusha', 'Dry Fruit Barfi', 'Dry Fruit Ladoo',
  'Kaju Barfi', 'Kaju Bites', 'Kesar Bites', 'Mango Delight',
  'Pista Bites', 'Pure Ghee Bombay Halwa', 'Pure Ghee Soan Papdi',
  'Rose Bites', 'Soan Cake',
  'Andhra Muruku', 'Bakarwadi', 'Cajun Hot & Spicy Makana', 'Chakkuli',
  'Channa Dal', 'Cheddar Cheese Makhana', 'Cheese khakhra', 'Chilli Kaju',
  'Fried Channa', 'Fried Green Peas', 'Garlic Mixture', 'Gatiya',
  'Grains And Pulses', 'Jeera khakhra', 'Khara Chips', 'Kodubale',
  'Masala Kaju', 'Masala Khakhra', 'Masala Peanut', 'Methi masala khakhra',
  'Methi Matri', 'Mini Nippattu', 'Mota Sev', 'Mysore Masala Kadlepuri',
  'Mysore Mixture', 'Mysore Spl Avarekalu', 'Palak Chakkuli', 'Pepper Kaju',
  'Pepper Makhana', 'Peri Peri Makhana', 'Plain Khakhra', 'Potato Sticks',
  'Ragi Chakkuli', 'Ribbon Muruku', 'Bendi (Vaccum Fried)', 'Salt Chips',
  'Salt Kaju', 'Salt Makhana', 'Salt Moong Dal', 'Salted Pista', 'Sev',
  'Spicy Moong Dal', 'Spl Om Pudi', 'Thill Murk', 'Tomato Cheese Makhana',
  'Chocolate Bites', 'White Chocolate Raisins', 'Fruit & Nut Milk Chocolate',
  'Hazelnut Dark Chocolate', 'Milk Chocolate', 'Roasted Almond Dark Chocolate',
  'Roasted Kaju Milk Chocolate', 'Choco Dates with Roasted Almond Chocolate',
  'Choco Dipped Biscuit', 'Dipped Chocolate Oreo', 'Rasamalai Chocolate',
  'Roasted Cashew Cappuccino'
)
ORDER BY name;

COMMIT;
