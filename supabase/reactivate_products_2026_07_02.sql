-- ═══════════════════════════════════════════════════════════════════════════
--  REACTIVATE INACTIVE PRODUCTS — 2026-07-02
--
--  Root cause: 11 products were sitting with is_active = false, so their
--  detail pages 404'd via the `.eq("is_active", true)` filter in
--  app/products/[slug]/page.tsx. The bulk price update on 2 Jul updated
--  prices for 10 of them, which confirms they were meant to be live.
--
--  Flips those 10 back to active. The `test` product (a leftover dummy row)
--  stays inactive on purpose.
--
--  Match by slug so we never accidentally toggle the wrong product if a
--  name is reused later.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE products
SET is_active = true
WHERE slug IN (
  'mysore-pedha',
  'pa-ka-sandwich',
  'dry-fruit-barfi',
  'dry-fruit-ladoo',
  'coffee-mysore-pak',
  'chocolate-mysore-pak',
  'buy-choco-dates-with-roasted-almond-chocolate-online',
  'buy-choco-dipped-biscuit-online',
  'buy-rasamalai-chocolate-delight-online',
  'buy-roasted-cashew-cappuccino-online'
);

-- ── Verify: should list the 10 rows above with is_active = true now ──────
SELECT slug, name, is_active
FROM products
WHERE slug IN (
  'mysore-pedha',
  'pa-ka-sandwich',
  'dry-fruit-barfi',
  'dry-fruit-ladoo',
  'coffee-mysore-pak',
  'chocolate-mysore-pak',
  'buy-choco-dates-with-roasted-almond-chocolate-online',
  'buy-choco-dipped-biscuit-online',
  'buy-rasamalai-chocolate-delight-online',
  'buy-roasted-cashew-cappuccino-online'
)
ORDER BY slug;

-- ── Sanity: total active count (should go up by 10) ──────────────────────
SELECT count(*) AS active_products_total
FROM products
WHERE is_active = true;

COMMIT;
