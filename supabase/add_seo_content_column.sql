-- ═══════════════════════════════════════════════════════════════════════════
--  Add SEO content column to products
--
--  Holds the long-form PDP content that the rich product page renders:
--  H2 heading, product introduction, taste profile, best use, delivery trust
--  line, FAQ Q/A pairs, and review quotes.
--
--  Shape (validated at runtime by the PDP component, not by Postgres):
--    {
--      "h2":              "Buy X Online with Fresh Mysuru Sweetness",
--      "intro":           "X brings … Every bite …",
--      "taste_profile":   "Soft, rich and melt-in-mouth, with …",
--      "best_use":        "Best for …, especially when …",
--      "delivery_trust":  "X is freshly packed to …",
--      "faqs":  [{"q": "…", "a": "…"}, … up to 4],
--      "reviews": ["…", "…", … up to 5]
--    }
--
--  NULL = product falls back to the simple pre-existing PDP layout, so this
--  is a non-breaking migration.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE products
ADD COLUMN IF NOT EXISTS seo_content JSONB;

COMMENT ON COLUMN products.seo_content IS
  'Long-form PDP content: {h2, intro, taste_profile, best_use, delivery_trust, faqs[], reviews[]}. NULL = simple PDP layout.';
