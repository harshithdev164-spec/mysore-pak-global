-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- Renames Shiprocket column tracking identifiers to generic/Delhivery descriptors
-- This ensures no past data is lost but brings naming consistency for our migration.

ALTER TABLE orders
  RENAME COLUMN shiprocket_order_id TO delhivery_package_id;

ALTER TABLE orders
  RENAME COLUMN shiprocket_shipment_id TO delhivery_waybill;
