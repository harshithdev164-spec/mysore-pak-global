-- ═══════════════════════════════════════════════════════════════════════════
--  BULK PRICE UPDATE — 2026-07-02
--
--  Source: full price list handed over on 2 Jul 2026.
--  Prices are GST-inclusive (5% GST is already baked in).
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
--  Skipped SKUs — present in the price list but no matching product exists
--  in Supabase (create them via /admin/products/new first, then rerun the
--  relevant UPDATE):
--
--    Mysore Pak family: Gold Mysore Pak (₹0 anyway), Melon Seeds Mysore Pak
--
--    Sweets: Anjeer Dry Fruit Roll, Balaji/Besan/Boondi/Ghee Motichoor/Kaju
--    Dry Fruit/Kaju Honey/Kaju Rose Ladoos, Chocolate/Coconut/Doodh/Jaggery
--    Coconut/Jaggery Kaju/Karjur/Mango/Milk/Misty Milk/Moong Dal/Orange/
--    Pineapple/Pista/Vanilla Dry Fruit Burfis, Doodh Peda, Kesar Peda,
--    Milk Cake, Mawa Katli, Ghee Kalakand, Horlicks Burfi/Barfi 1kg,
--    Jhangir (₹0), White Soanpapdi, Kaju Apple/Blueberry Roll/Choco Ball/
--    Cutlet/Katori/Kesar Roll/Pista Roll, Mix Bites, Kajjaya
--
--    Namkeens: Bombay/Dry Fruit/Family/Green/Pepper/Pudina/Special/Standard/
--    Salt Avalakki/Spicy Avalakki/Spl Avalakki/Spl Garlic/Spl Kara Boondi/
--    Udupi/WOM Mixture, Dry Dal Samosa, Dry Fruits Dalmoth, Dry Samosa
--    Ompudi, Special Khara Boondi, Chilli/Chilli Garlic/Mac and Cheese/
--    Mexican Salsa/Mix Masala/Pudina/Salt & Pepper/Tangy Cheese/Tomato
--    Makhana, Cream & Onion Makhana, Chilly Makhana, Gujarathi Papdi,
--    Kabul Channa, Benne Muruku, Puffed Ragi Mixture, Pumkin Murukku,
--    Split Masala Peanut 100g
--
--    Gift boxes: all Abhimanyu / Balarama / Drona / Ekalavya / Dasara Darbar
--    / Jayamarthanda / Dry Fruit gift boxes / Kodubale 100gm pkt /
--    Jaggery Gift Box / Single Pack 15gm / Bajara Khakra
--
--    Drinks/dairy: Aampanna, Butter Milk, Jal Jeera, Rose Milk, Spl Badam
--    Milk, Sweet Lassi, Water Bottle
--
--    Small items: Sweet Boondi, Champakali, Chenna Paise, Jamoon, Kashmiri
--    Kesar Rasmalai, Malai Sandwich, Pataka/Nityotsava Matakagulla, Raj
--    Bhog, Rasgulla, Kajaya
--
--    Chocolates: Almond/Cashew/Chocolate/Pistaciho Bestix, Almond Biscoff,
--    Cashewnut Dark, Dark/Milk Chocolate Almond, Gold Coffee Pecan Nut,
--    Hazelnut Coffee Latte, Key Chain 1pc, Rose Milk Almond, Salted Cashew
--    Nut, Shahi Khajoor Roasted Almond Mix, Trail Mix, Chocolate Coated
--    Almond/Cashews, Paan Dates Chocolate
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
UPDATE products SET base_price = 1300 WHERE name = 'Anjeer Mysore Pak';
UPDATE products SET base_price = 1100 WHERE name = 'Carrot Mysore Pak';
UPDATE products SET base_price = 1200 WHERE name = 'Coffee Mysore Pak';
UPDATE products SET base_price = 1300 WHERE name = 'Chocolate Mysore Pak';
UPDATE products SET base_price = 1100 WHERE name = 'Jaggery Millet Mysore Pak';
UPDATE products SET base_price = 1000 WHERE name = 'Jaggery Mysore Pak';
UPDATE products SET base_price = 1300 WHERE name = 'Kaju Mysore Pak';
UPDATE products SET base_price = 1300 WHERE name = 'Mango Mysore Pak';
UPDATE products SET base_price = 1000 WHERE name = 'Milk Mysore Pak';
UPDATE products SET base_price = 1100 WHERE name = 'Millet Mysore Pak';
UPDATE products SET base_price = 1100 WHERE name = 'Millet Mysorepak'; -- duplicate SKU with typo — same price
UPDATE products SET base_price = 1200 WHERE name = 'Mix Mysore Pak';
UPDATE products SET base_price = 1000 WHERE name = 'Mysore Pedha';
UPDATE products SET base_price = 1200 WHERE name = 'Pa-Ka Sandwich';
UPDATE products SET base_price = 1200 WHERE name = 'Roasted Almond Mysore Pak';
UPDATE products SET base_price = 1000 WHERE name = 'Special Ghee Mysore Pak'; -- displayed as "Spl Mysore Pak"
UPDATE products SET base_price = 600  WHERE name = 'Traditional Mysore Pak';

-- ── Sweets ───────────────────────────────────────────────────────────────
UPDATE products SET base_price = 1400 WHERE name = 'Badam Halwa';
UPDATE products SET base_price = 600  WHERE name = 'Badusha';
UPDATE products SET base_price = 1600 WHERE name = 'Dry Fruit Barfi';
UPDATE products SET base_price = 800  WHERE name = 'Dry Fruit Ladoo';
UPDATE products SET base_price = 1100 WHERE name = 'Kaju Barfi';
UPDATE products SET base_price = 1350 WHERE name = 'Kaju Bites';
UPDATE products SET base_price = 1350 WHERE name = 'Kesar Bites';
UPDATE products SET base_price = 1350 WHERE name = 'Mango Delight';
UPDATE products SET base_price = 1350 WHERE name = 'Pista Bites';
UPDATE products SET base_price = 800  WHERE name = 'Pure Ghee Bombay Halwa';
UPDATE products SET base_price = 800  WHERE name = 'Pure Ghee Soan Papdi';
UPDATE products SET base_price = 1350 WHERE name = 'Rose Bites';
UPDATE products SET base_price = 80   WHERE name = 'Soan Cake';

-- ── Namkeens ─────────────────────────────────────────────────────────────
UPDATE products SET base_price = 70   WHERE name = 'Andhra Muruku';
UPDATE products SET base_price = 70   WHERE name = 'Bakarwadi';
UPDATE products SET base_price = 200  WHERE name = 'Cajun Hot & Spicy Makana';
UPDATE products SET base_price = 70   WHERE name = 'Chakkuli';
UPDATE products SET base_price = 60   WHERE name = 'Channa Dal';
UPDATE products SET base_price = 200  WHERE name = 'Cheddar Cheese Makhana';
UPDATE products SET base_price = 100  WHERE name = 'Cheese khakhra';
UPDATE products SET base_price = 180  WHERE name = 'Chilli Kaju';
UPDATE products SET base_price = 60   WHERE name = 'Fried Channa';
UPDATE products SET base_price = 60   WHERE name = 'Fried Green Peas';
UPDATE products SET base_price = 700  WHERE name = 'Garlic Mixture'; -- price from "GARLIC MIXTURE - ₹700"
UPDATE products SET base_price = 70   WHERE name = 'Gatiya';
UPDATE products SET base_price = 60   WHERE name = 'Grains And Pulses'; -- "GRAINS&PULSES MASALA 100GMS"
UPDATE products SET base_price = 100  WHERE name = 'Jeera khakhra';
UPDATE products SET base_price = 80   WHERE name = 'Khara Chips'; -- "KARA CHIPS"
UPDATE products SET base_price = 70   WHERE name = 'Kodubale';
UPDATE products SET base_price = 180  WHERE name = 'Masala Kaju';
UPDATE products SET base_price = 100  WHERE name = 'Masala Khakhra';
UPDATE products SET base_price = 60   WHERE name = 'Masala Peanut';
UPDATE products SET base_price = 100  WHERE name = 'Methi masala khakhra';
UPDATE products SET base_price = 70   WHERE name = 'Methi Matri';
UPDATE products SET base_price = 70   WHERE name = 'Mini Nippattu';
UPDATE products SET base_price = 70   WHERE name = 'Mota Sev';
UPDATE products SET base_price = 50   WHERE name = 'Mysore Masala Kadlepuri';
UPDATE products SET base_price = 700  WHERE name = 'Mysore Mixture';
UPDATE products SET base_price = 1350 WHERE name = 'Mysore Spl Avarekalu';
UPDATE products SET base_price = 60   WHERE name = 'Palak Chakkuli';
UPDATE products SET base_price = 180  WHERE name = 'Pepper Kaju';
UPDATE products SET base_price = 200  WHERE name = 'Pepper Makhana';
UPDATE products SET base_price = 225  WHERE name = 'Peri Peri Makhana';
UPDATE products SET base_price = 100  WHERE name = 'Plain Khakhra';
UPDATE products SET base_price = 70   WHERE name = 'Potato Sticks';
UPDATE products SET base_price = 60   WHERE name = 'Ragi Chakkuli'; -- "RAGI CHAKLI (FINGER MILLET)100GM"
UPDATE products SET base_price = 70   WHERE name = 'Ribbon Muruku';
UPDATE products SET base_price = 200  WHERE name = 'Bendi (Vaccum Fried)'; -- "SALT BENDI FRY"
UPDATE products SET base_price = 80   WHERE name = 'Salt Chips';
UPDATE products SET base_price = 180  WHERE name = 'Salt Kaju'; -- "SALT KAJU D ₹180" (list also shows "SALT KAJU ₹200" as duplicate — using ₹180 per the more specific line)
UPDATE products SET base_price = 200  WHERE name = 'Salt Makhana';
UPDATE products SET base_price = 60   WHERE name = 'Salt Moong Dal';
UPDATE products SET base_price = 180  WHERE name = 'Salted Pista'; -- "SALT PISTA D ₹180" (list also has "SALT PISTA ₹200" — using ₹180)
UPDATE products SET base_price = 70   WHERE name = 'Sev';
UPDATE products SET base_price = 60   WHERE name = 'Spicy Moong Dal';
UPDATE products SET base_price = 70   WHERE name = 'Spl Om Pudi';
UPDATE products SET base_price = 70   WHERE name = 'Thill Murk';
UPDATE products SET base_price = 200  WHERE name = 'Tomato Cheese Makhana';

-- ── Chocolates ───────────────────────────────────────────────────────────
UPDATE products SET base_price = 1350 WHERE name = 'Chocolate Bites';
UPDATE products SET base_price = 1500 WHERE name = 'White Chocolate Raisins';
UPDATE products SET base_price = 2000 WHERE name = 'Fruit & Nut Milk Chocolate';
UPDATE products SET base_price = 2000 WHERE name = 'Hazelnut Dark Chocolate';
UPDATE products SET base_price = 1000 WHERE name = 'Milk Chocolate';
UPDATE products SET base_price = 2000 WHERE name = 'Roasted Almond Dark Chocolate';
UPDATE products SET base_price = 2000 WHERE name = 'Roasted Kaju Milk Chocolate';
UPDATE products SET base_price = 200  WHERE name = 'Choco Dates with Roasted Almond Chocolate';
UPDATE products SET base_price = 200  WHERE name = 'Choco Dipped Biscuit';
UPDATE products SET base_price = 150  WHERE name = 'Dipped Chocolate Oreo';
UPDATE products SET base_price = 200  WHERE name = 'Rasamalai Chocolate';
UPDATE products SET base_price = 200  WHERE name = 'Roasted Cashew Cappuccino';

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
