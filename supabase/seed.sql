-- ============================================================
-- World of Mysore Pak — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- ──────────────────────────────────────────────
-- CATEGORIES
-- ──────────────────────────────────────────────
INSERT INTO categories (name, slug, image, description) VALUES
  ('Mysore Pak',  'mysore-pak',  'https://images.unsplash.com/photo-1666190020777-6210676b2699?w=600&q=80', 'Classic and flavored Mysore Pak made with pure ghee'),
  ('Ghee Sweets', 'ghee-sweets', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80', 'Traditional Indian sweets rich in pure ghee'),
  ('Namkeens',    'namkeens',    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', 'Savory snacks and crunchy delights'),
  ('Chocolates',  'chocolates',  'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80', 'Chocolate fusion treats and bars')
ON CONFLICT (slug) DO NOTHING;

-- ──────────────────────────────────────────────
-- PRODUCTS (with weights inserted separately below)
-- ──────────────────────────────────────────────
WITH cat AS (SELECT id FROM categories WHERE slug = 'mysore-pak' LIMIT 1)
INSERT INTO products (name, slug, description, ingredients, storage, category_id, base_price, badge, rating, review_count, image) VALUES
  ('Traditional Mysore Pak',    'traditional-mysore-pak',    'The original Mysore Pak made with the finest gram flour, pure ghee, and sugar. A melt-in-mouth delicacy with a rich, buttery flavor that has been perfected over generations.', 'Gram flour (Besan), Pure Ghee, Sugar, Cardamom', 'Store in a cool, dry place. Best consumed within 15 days. Refrigerate for extended freshness.', (SELECT id FROM cat), 699,  'Bestseller', 4.9, 342, 'https://images.unsplash.com/photo-1666190020777-6210676b2699?w=600&q=80'),
  ('Special Mysore Pak',        'special-mysore-pak',        'A premium variation of the classic, made with extra ghee for an even more luxurious, softer texture that melts the moment it touches your tongue.', 'Gram flour (Besan), Premium Ghee, Sugar, Cardamom, Saffron', 'Store in a cool, dry place. Best consumed within 15 days.', (SELECT id FROM cat), 799,  'Premium',    4.8, 218, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80'),
  ('Kaju Mysore Pak',           'kaju-mysore-pak',           'Kaju Mysore Pak is a rich variation of the traditional sweet made with cashews and pure ghee, offering a creamy melt-in-mouth texture.', 'Cashews, Gram flour, Pure Ghee, Sugar, Cardamom', 'Store in a cool, dry place. Refrigerate for extended freshness. Best consumed within 12 days.', (SELECT id FROM cat), 899,  NULL,         4.7, 156, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=80'),
  ('Carrot Mysore Pak',         'carrot-mysore-pak',         'A delightful fusion of Gajar Halwa and Mysore Pak. Fresh carrots blended with gram flour and ghee create this unique seasonal treat.', 'Fresh Carrots, Gram flour, Pure Ghee, Sugar, Cardamom, Nuts', 'Refrigerate after opening. Best consumed within 10 days.', (SELECT id FROM cat), 749,  'Seasonal',   4.6,  89, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80'),
  ('Millet Mysore Pak',         'millet-mysore-pak',         'A healthier take on the classic Mysore Pak, made with nutritious millet flour blended with pure ghee for guilt-free indulgence.', 'Millet flour, Pure Ghee, Jaggery, Cardamom', 'Store in a cool, dry place. Best consumed within 15 days.', (SELECT id FROM cat), 849,  'Healthy',    4.5,  67, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80'),
  ('Mango Mysore Pak',          'mango-mysore-pak',          'Summer meets tradition in this Alphonso mango-infused Mysore Pak. A fruity twist on the beloved classic.', 'Alphonso Mango pulp, Gram flour, Pure Ghee, Sugar', 'Refrigerate. Best consumed within 10 days.', (SELECT id FROM cat), 799,  'Seasonal',   4.7, 134, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80'),
  ('Jaggery Mysore Pak',        'jaggery-mysore-pak',        'Sweetened with organic jaggery instead of sugar, this variation offers a deeper, more earthy sweetness with all the ghee richness.', 'Gram flour, Pure Ghee, Organic Jaggery, Cardamom', 'Store in a cool, dry place. Best consumed within 15 days.', (SELECT id FROM cat), 749,  NULL,         4.6,  98, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&q=80'),
  ('Roasted Almond Mysore Pak', 'roasted-almond-mysore-pak', 'Packed with roasted California almonds, this premium Mysore Pak offers a crunchy texture with every bite.', 'Roasted Almonds, Gram flour, Pure Ghee, Sugar, Cardamom', 'Store in a cool, dry place. Best consumed within 12 days.', (SELECT id FROM cat), 949,  NULL,         4.8, 112, 'https://images.unsplash.com/photo-1599599810769-bcde93a92e6f?w=600&q=80'),
  ('Chocolate Mysore Pak',      'chocolate-mysore-pak',      'Belgian chocolate meets Mysore Pak in this modern fusion. Rich cocoa blended with traditional gram flour and ghee.', 'Belgian Chocolate, Gram flour, Pure Ghee, Sugar, Cocoa', 'Refrigerate. Best consumed within 10 days.', (SELECT id FROM cat), 849,  'New',        4.7,  76, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80'),
  ('Coffee Mysore Pak',         'coffee-mysore-pak',         'Infused with authentic Coorg coffee, this Mysore Pak is a caffeine lover''s dream dessert.', 'Coorg Coffee, Gram flour, Pure Ghee, Sugar, Cardamom', 'Store in a cool, dry place. Best consumed within 15 days.', (SELECT id FROM cat), 799,  'New',        4.5,  54, 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80'),
  ('Milk Mysore Pak',           'milk-mysore-pak',           'A softer, milkier version of Mysore Pak made with condensed milk and pure ghee for an ultra-creamy experience.', 'Condensed Milk, Gram flour, Pure Ghee, Sugar, Cardamom', 'Refrigerate. Best consumed within 10 days.', (SELECT id FROM cat), 699,  NULL,         4.6,  88, 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=600&q=80'),
  ('Anjeer Mysore Pak',         'anjeer-mysore-pak',         'Premium Afghani figs blended into Mysore Pak for a unique, chewy-meets-melt texture that is truly one of a kind.', 'Afghani Figs, Gram flour, Pure Ghee, Sugar, Cardamom, Nuts', 'Refrigerate. Best consumed within 10 days.', (SELECT id FROM cat), 999,  'Premium',    4.8,  65, 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80')
ON CONFLICT (slug) DO NOTHING;

-- ──────────────────────────────────────────────
-- PRODUCT WEIGHTS
-- ──────────────────────────────────────────────
INSERT INTO product_weights (product_id, label, weight_grams, price)
SELECT p.id, '250g', 250,  p.base_price          FROM products p WHERE p.slug IN ('traditional-mysore-pak','special-mysore-pak','kaju-mysore-pak','carrot-mysore-pak','millet-mysore-pak','mango-mysore-pak','jaggery-mysore-pak','roasted-almond-mysore-pak','chocolate-mysore-pak','coffee-mysore-pak','milk-mysore-pak','anjeer-mysore-pak');

INSERT INTO product_weights (product_id, label, weight_grams, price)
SELECT p.id, '500g', 500,
  CASE p.slug
    WHEN 'traditional-mysore-pak'    THEN 1199
    WHEN 'special-mysore-pak'        THEN 1399
    WHEN 'kaju-mysore-pak'           THEN 1599
    WHEN 'carrot-mysore-pak'         THEN 1299
    WHEN 'millet-mysore-pak'         THEN 1499
    WHEN 'mango-mysore-pak'          THEN 1399
    WHEN 'jaggery-mysore-pak'        THEN 1299
    WHEN 'roasted-almond-mysore-pak' THEN 1699
    WHEN 'chocolate-mysore-pak'      THEN 1499
    WHEN 'coffee-mysore-pak'         THEN 1399
    WHEN 'milk-mysore-pak'           THEN 1199
    WHEN 'anjeer-mysore-pak'         THEN 1799
  END
FROM products p WHERE p.slug IN ('traditional-mysore-pak','special-mysore-pak','kaju-mysore-pak','carrot-mysore-pak','millet-mysore-pak','mango-mysore-pak','jaggery-mysore-pak','roasted-almond-mysore-pak','chocolate-mysore-pak','coffee-mysore-pak','milk-mysore-pak','anjeer-mysore-pak');

INSERT INTO product_weights (product_id, label, weight_grams, price)
SELECT p.id, '1kg', 1000,
  CASE p.slug
    WHEN 'traditional-mysore-pak'    THEN 2199
    WHEN 'special-mysore-pak'        THEN 2599
    WHEN 'kaju-mysore-pak'           THEN 2999
    WHEN 'carrot-mysore-pak'         THEN 2399
    WHEN 'millet-mysore-pak'         THEN 2799
    WHEN 'mango-mysore-pak'          THEN 2599
    WHEN 'jaggery-mysore-pak'        THEN 2399
    WHEN 'roasted-almond-mysore-pak' THEN 3199
    WHEN 'chocolate-mysore-pak'      THEN 2799
    WHEN 'coffee-mysore-pak'         THEN 2599
    WHEN 'milk-mysore-pak'           THEN 2199
    WHEN 'anjeer-mysore-pak'         THEN 3399
  END
FROM products p WHERE p.slug IN ('traditional-mysore-pak','special-mysore-pak','kaju-mysore-pak','carrot-mysore-pak','millet-mysore-pak','mango-mysore-pak','jaggery-mysore-pak','roasted-almond-mysore-pak','chocolate-mysore-pak','coffee-mysore-pak','milk-mysore-pak','anjeer-mysore-pak');

-- ──────────────────────────────────────────────
-- FEATURED REVIEWS
-- ──────────────────────────────────────────────
INSERT INTO reviews (product_id, customer_name, customer_location, rating, review_text, is_featured)
SELECT p.id, 'Priya Sharma', 'Bangalore', 5,
  'The traditional Mysore Pak is so delicious — it tastes exactly like the ones I had in Mysuru as a child. Pure nostalgia!', true
FROM products p WHERE p.slug = 'traditional-mysore-pak' LIMIT 1;

INSERT INTO reviews (product_id, customer_name, customer_location, rating, review_text, is_featured)
SELECT p.id, 'Rajesh Kumar', 'Mumbai', 5,
  'Perfect sweetness and amazing taste. The packaging is premium too. Sent it as a Diwali gift and everyone loved it!', true
FROM products p WHERE p.slug = 'special-mysore-pak' LIMIT 1;

INSERT INTO reviews (product_id, customer_name, customer_location, rating, review_text, is_featured)
SELECT p.id, 'Ananya Rao', 'Delhi', 5,
  'Kaju Mysore Pak is heavenly! The cashew flavor combined with pure ghee is absolutely divine.', true
FROM products p WHERE p.slug = 'kaju-mysore-pak' LIMIT 1;

INSERT INTO reviews (product_id, customer_name, customer_location, rating, review_text, is_featured)
SELECT p.id, 'Vikram Patel', 'Hyderabad', 4,
  'Finally found authentic Mysore Pak online. The quality and freshness is unmatched.', true
FROM products p WHERE p.slug = 'traditional-mysore-pak' LIMIT 1;

INSERT INTO reviews (product_id, customer_name, customer_location, rating, review_text, is_featured)
SELECT p.id, 'Meera Nair', 'Chennai', 5,
  'The Chocolate Mysore Pak is a genius creation. My kids can''t stop eating it!', true
FROM products p WHERE p.slug = 'chocolate-mysore-pak' LIMIT 1;
