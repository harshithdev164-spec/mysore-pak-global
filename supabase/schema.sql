-- ============================================================
-- World of Mysore Pak — Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- 1. CATEGORIES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  image       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 2. PRODUCTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  description    TEXT,
  ingredients    TEXT,
  storage        TEXT,
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  base_price     NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  image          TEXT,
  badge          TEXT,
  rating         NUMERIC(3, 2) DEFAULT 0,
  review_count   INTEGER DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 3. PRODUCT WEIGHT VARIANTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_weights (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label          TEXT NOT NULL,          -- "250g", "500g", "1kg"
  weight_grams   INTEGER NOT NULL,
  price          NUMERIC(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 100,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 4. ORDERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number     TEXT UNIQUE NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  subtotal         NUMERIC(10, 2) NOT NULL,
  shipping_cost    NUMERIC(10, 2) DEFAULT 0,
  discount         NUMERIC(10, 2) DEFAULT 0,
  total            NUMERIC(10, 2) NOT NULL,
  payment_method   TEXT,
  payment_status   TEXT DEFAULT 'pending'
                   CHECK (payment_status IN ('pending','paid','failed','refunded')),
  shipping_address JSONB NOT NULL,        -- { address, city, state, pincode }
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────
-- 5. ORDER ITEMS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
  product_weight_id UUID REFERENCES product_weights(id) ON DELETE SET NULL,
  product_name      TEXT NOT NULL,        -- snapshot at order time
  weight_label      TEXT NOT NULL,
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  unit_price        NUMERIC(10, 2) NOT NULL,
  total_price       NUMERIC(10, 2) NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 6. REVIEWS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name     TEXT NOT NULL,
  customer_location TEXT,
  rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text       TEXT NOT NULL,
  is_featured       BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- INDEXES for performance
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category_id   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug          ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active     ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_weights_pid    ON product_weights(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id     ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number    ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email  ON orders(customer_email);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Public can read active products"
  ON products FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read product weights"
  ON product_weights FOR SELECT USING (true);

-- Anyone can create an order (guest checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read their order by email"
  ON orders FOR SELECT USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read order items"
  ON order_items FOR SELECT USING (true);

-- Reviews
CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Anyone can submit a review"
  ON reviews FOR INSERT WITH CHECK (true);
