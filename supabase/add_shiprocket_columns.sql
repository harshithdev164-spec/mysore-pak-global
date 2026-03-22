-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- Adds Shiprocket tracking fields to the orders table

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shiprocket_order_id bigint,
  ADD COLUMN IF NOT EXISTS shiprocket_shipment_id bigint,
  ADD COLUMN IF NOT EXISTS awb_code text,
  ADD COLUMN IF NOT EXISTS courier_id integer,
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS label_url text,
  ADD COLUMN IF NOT EXISTS invoice_url text;
