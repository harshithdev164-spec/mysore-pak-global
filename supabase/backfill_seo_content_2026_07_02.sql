-- ═══════════════════════════════════════════════════════════════════════════
--  BACKFILL products.seo_content — 2026-07-02
--
--  Populates the long-form PDP content for 21 SKUs from the content sheets
--  handed over on 2 Jul 2026 (Mysore Pak + Ghee Sweets tabs).
--
--  PRE-REQUISITE: run supabase/add_seo_content_column.sql first.
--
--  Skipped: `buy-water-melon-mysore-pak-online` (Watermelon Seeds Mysore Pak
--  from the sheet does not exist as a product row in Supabase yet).
--
--  Uses PostgreSQL dollar-quoted JSON literals ($$…$$) so we don't have to
--  escape any apostrophes in the copy.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Mysore Pak sheet ─────────────────────────────────────────────────────

-- 1) Foxtail Millet Mysore Pak → DB name "Millet Mysorepak"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Foxtail Millet Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Foxtail Millet Mysore Pak brings a wholesome foxtail millet touch into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for millet sweet lovers and families looking for a slightly wholesome Mysore Pak, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with mildly earthy millet note, deep ghee aroma and a soft traditional finish.",
  "best_use": "Best for health-conscious sweet lovers, festival gifting, family sweet boxes and everyday cravings, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Foxtail Millet Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Foxtail Millet Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with mildly earthy millet note, deep ghee aroma and a soft traditional finish."},
    {"q": "Can I buy Foxtail Millet Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Foxtail Millet Mysore Pak?", "a": "It suits millet sweet lovers and families looking for a slightly wholesome Mysore Pak and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Foxtail Millet Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "The first bite of Foxtail Millet Mysore Pak felt soft, and the earthy foxtail millet note came in slowly instead of overpowering it.",
    "The packing was tidy, so Foxtail Millet Mysore Pak was easy to keep for office sharing.",
    "Sunday lunch sweet time alli Foxtail Millet Mysore Pak serve madidvi. Softness chennagittu, ghee smell fresh aagittu.",
    "Foxtail Millet Mysore Pak repeat order karne layak hai if you like soft Mysore Pak with earthy foxtail millet note.",
    "The earthy foxtail millet note gives Foxtail Millet Mysore Pak a nice reason to exist beyond being another Mysore Pak."
  ]
}
$$::jsonb WHERE slug = 'buy-healthy-foxtail-millet-mysorepak-online';

-- 2) Roasted Almond Mysore Pak
UPDATE products SET seo_content = $$
{
  "h2": "Buy Roasted Almond Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Roasted Almond Mysore Pak brings roasted almond richness into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for dry-fruit sweet lovers and premium gifting buyers, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with buttery Mysore Pak softness with a roasted almond crunch and nutty finish.",
  "best_use": "Best for premium gifting, festive hampers, family celebrations and almond sweet lovers, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Roasted Almond Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Roasted Almond Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with buttery Mysore Pak softness with a roasted almond crunch and nutty finish."},
    {"q": "Can I buy Roasted Almond Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Roasted Almond Mysore Pak?", "a": "It suits dry-fruit sweet lovers and premium gifting buyers and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Roasted Almond Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "Roasted Almond Mysore Pak looked simple, but the taste had enough richness for a festival-style sweet.",
    "Everyone took small pieces of Roasted Almond Mysore Pak, and the flavour did not become tiring.",
    "Roasted Almond Mysore Pak thumba heavy anisalilla. roasted almond crunch balanced ide, adakke second piece kooda thindru.",
    "Roasted Almond Mysore Pak mein roasted almond crunch halka aur natural laga. Sweet heavy nahi tha, isliye family ko pasand aaya.",
    "Freshness, softness and the roasted almond crunch make Roasted Almond Mysore Pak easy to recommend."
  ]
}
$$::jsonb WHERE slug = 'buy-roasted-almond-mysore-pak-online';

-- 3) Mix Mysore Pak
UPDATE products SET seo_content = $$
{
  "h2": "Buy Mix Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Mix Mysore Pak brings assorted Mysore Pak flavours in one box into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for families and gift buyers who want variety in one sweet box, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with a mix of classic, fruity, nutty and rich ghee-led Mysore Pak flavours.",
  "best_use": "Best for festival gifting, family functions, office sharing, events and first-time orders, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Mix Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Mix Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with a mix of classic, fruity, nutty and rich ghee-led Mysore Pak flavours."},
    {"q": "Can I buy Mix Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Mix Mysore Pak?", "a": "It suits families and gift buyers who want variety in one sweet box and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Mix Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "For a change from classic Mysore Pak, Mix Mysore Pak worked well; the assorted flavour mix was clear but mild.",
    "The packing was tidy, so Mix Mysore Pak was easy to keep for pooja sweet tray.",
    "First bite alli Mix Mysore Pak soft anisutte. assorted flavour mix light aagi barodu ishta aaytu.",
    "Mix Mysore Pak gift box mein rakhne layak laga because pieces neat aur taste rich tha.",
    "This variant of Mix Mysore Pak is useful when guests want a traditional sweet with a small twist."
  ]
}
$$::jsonb WHERE slug = 'buy-mix-mysore-pak-online';

-- 4) Mango Mysore Pak
UPDATE products SET seo_content = $$
{
  "h2": "Buy Mango Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Mango Mysore Pak brings a bright mango flavour into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for mango lovers, kids and buyers looking for a fruity Indian sweet, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with soft ghee Mysore Pak with a fruity mango note and smooth sweet finish.",
  "best_use": "Best for summer gifting, kids' sweet treats, festival boxes and family dessert moments, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Mango Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Mango Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with soft ghee Mysore Pak with a fruity mango note and smooth sweet finish."},
    {"q": "Can I buy Mango Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Mango Mysore Pak?", "a": "It suits mango lovers, kids and buyers looking for a fruity Indian sweet and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Mango Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "Mango Mysore Pak felt like a good family sweet because the richness was balanced and not too heavy.",
    "Mango Mysore Pak felt suitable for both family eating and simple gifting.",
    "Mango Mysore Pak thumba heavy anisalilla. mango flavour balanced ide, adakke second piece kooda thindru.",
    "Mango Mysore Pak ne regular Mysore Pak se alag feel diya. mango flavour achhe se blend hua.",
    "Good option for anyone ordering Mysore Pak online and wanting a flavour-led choice like Mango Mysore Pak."
  ]
}
$$::jsonb WHERE slug = 'buy-mango-mysorepak-online';

-- 5) Anjeer Mysore Pak
UPDATE products SET seo_content = $$
{
  "h2": "Buy Anjeer Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Anjeer Mysore Pak brings rich anjeer sweetness into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for fig sweet lovers and buyers who enjoy dry-fruit Indian sweets, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with soft, ghee-rich and mildly fruity with a natural fig-like depth.",
  "best_use": "Best for premium sweet boxes, festive gifting, family celebrations and dry-fruit sweet cravings, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Anjeer Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Anjeer Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with soft, ghee-rich and mildly fruity with a natural fig-like depth."},
    {"q": "Can I buy Anjeer Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Anjeer Mysore Pak?", "a": "It suits fig sweet lovers and buyers who enjoy dry-fruit Indian sweets and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Anjeer Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "Compared to regular sweets, Anjeer Mysore Pak had a more memorable flavour because of the fig-like sweetness.",
    "We used Anjeer Mysore Pak for Diwali sharing, and the pieces looked neat on the plate.",
    "Fig-like sweetness ishta iruvavarige Anjeer Mysore Pak olle option. Texture kooda smooth aagittu.",
    "Family function ke liye Anjeer Mysore Pak safe choice laga. Soft tha aur taste balanced.",
    "This variant of Anjeer Mysore Pak is useful when guests want a traditional sweet with a small twist."
  ]
}
$$::jsonb WHERE slug = 'buy-anjeer-mysore-pak-online';

-- 6) Organic Jaggery Millet Mysore Pak → DB name "Jaggery Millet Mysore Pak"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Organic Jaggery Millet Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Organic Jaggery Millet Mysore Pak brings organic jaggery and millet warmth into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for buyers searching for jaggery Mysore Pak or millet-based Indian sweets, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with soft ghee texture with earthy millet, jaggery depth and a warm traditional finish.",
  "best_use": "Best for thoughtful gifting, health-conscious families, festivals and everyday sweet cravings, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Organic Jaggery Millet Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Organic Jaggery Millet Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with soft ghee texture with earthy millet, jaggery depth and a warm traditional finish."},
    {"q": "Can I buy Organic Jaggery Millet Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Organic Jaggery Millet Mysore Pak?", "a": "It suits buyers searching for jaggery Mysore Pak or millet-based Indian sweets and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Organic Jaggery Millet Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "Organic Jaggery Millet Mysore Pak worked well after lunch; the ghee note was fresh and the sweetness stayed balanced.",
    "We used Organic Jaggery Millet Mysore Pak for office gifting sharing, and the pieces looked neat on the plate.",
    "Organic Jaggery Millet Mysore Pak nalli mild millet note clear aagi ide. Regular sweet ginta swalpa special feel aaytu.",
    "Organic Jaggery Millet Mysore Pak ka ghee aroma fresh laga. mild millet note zyada strong nahi tha, bas balanced tha.",
    "Organic Jaggery Millet Mysore Pak is a good pick when you want Mysore Pak with a clear mild millet note instead of the usual plain flavour."
  ]
}
$$::jsonb WHERE slug = 'buy-organic-jaggery-millet-mysorepak-online';

-- 7) Cashew Mysore Pak → DB name "Kaju Mysore Pak"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Cashew Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Cashew Mysore Pak brings cashew-rich smoothness into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for kaju sweet lovers and premium Mysore Pak buyers, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with soft, buttery and ghee-forward with a rich cashew note.",
  "best_use": "Best for premium gifting, festive trays, family functions and dry-fruit sweet boxes, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Cashew Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Cashew Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with soft, buttery and ghee-forward with a rich cashew note."},
    {"q": "Can I buy Cashew Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Cashew Mysore Pak?", "a": "It suits kaju sweet lovers and premium Mysore Pak buyers and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Cashew Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "Cashew Mysore Pak worked well after lunch; the ghee note was fresh and the sweetness stayed balanced.",
    "Cashew Mysore Pak stayed soft even after delivery, which matters a lot for Mysore Pak orders.",
    "First bite alli Cashew Mysore Pak soft anisutte. kaju richness light aagi barodu ishta aaytu.",
    "Online sweet order mein doubt tha, but Cashew Mysore Pak dry nahi nikla. Texture achha tha.",
    "I would choose Cashew Mysore Pak again for office sharing because the texture and flavour stayed consistent."
  ]
}
$$::jsonb WHERE slug = 'buy-cashew-mysore-pak-online';

-- 8) Special Mysore Pak → DB name "Special Ghee Mysore Pak"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Special Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Special Mysore Pak brings the classic signature Mysuru sweet experience into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for buyers who want authentic Mysore Pak online, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with rich ghee aroma, soft melt-in-mouth texture and a clean traditional finish.",
  "best_use": "Best for festival gifting, family celebrations, guest serving and traditional sweet cravings, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Special Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Special Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with rich ghee aroma, soft melt-in-mouth texture and a clean traditional finish."},
    {"q": "Can I buy Special Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Special Mysore Pak?", "a": "It suits buyers who want authentic Mysore Pak online and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Special Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "Special Mysore Pak looked simple, but the taste had enough richness for a festival-style sweet.",
    "Special Mysore Pak had enough ghee aroma for traditional sweet lovers without becoming too strong.",
    "Box open madidmele Special Mysore Pak dry agiralilla. Fresh feel aaytu and pieces neat aagidvu.",
    "Online sweet order mein doubt tha, but Special Mysore Pak dry nahi nikla. Texture achha tha.",
    "The best thing about Special Mysore Pak is that it feels familiar but still has its own product identity."
  ]
}
$$::jsonb WHERE slug = 'buy-special-mysore-pak-online';

-- 9) Traditional Ghee Wheat Mysore Pak → DB name "Traditional Mysore Pak"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Traditional Ghee Wheat Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Traditional Ghee Wheat Mysore Pak brings traditional wheat and pure ghee richness into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for buyers who enjoy traditional ghee sweets with a homely taste, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with warm wheat notes, deep ghee aroma and a soft old-style sweet finish.",
  "best_use": "Best for classic sweet lovers, family gifting, pooja offerings and festive sweet boxes, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Traditional Ghee Wheat Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Traditional Ghee Wheat Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with warm wheat notes, deep ghee aroma and a soft old-style sweet finish."},
    {"q": "Can I buy Traditional Ghee Wheat Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Traditional Ghee Wheat Mysore Pak?", "a": "It suits buyers who enjoy traditional ghee sweets with a homely taste and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Traditional Ghee Wheat Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "There was a homely feel in Traditional Ghee Wheat Mysore Pak; the old-style wheat aroma made it stand apart from the regular box.",
    "The texture of Traditional Ghee Wheat Mysore Pak stayed soft till the last piece we opened.",
    "Traditional Ghee Wheat Mysore Pak taste nodidmele variant name justify aaytu. old-style wheat aroma subtle aagi chennagide.",
    "Traditional Ghee Wheat Mysore Pak repeat order karne layak hai if you like soft Mysore Pak with old-style wheat aroma.",
    "Good option for anyone ordering Mysore Pak online and wanting a flavour-led choice like Traditional Ghee Wheat Mysore Pak."
  ]
}
$$::jsonb WHERE slug = 'buy-traditional-ghee-wheat-mysore-pak-online';

-- 10) Carrot Mysore Pak
UPDATE products SET seo_content = $$
{
  "h2": "Buy Carrot Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Carrot Mysore Pak brings a soft carrot-sweet flavour into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for buyers who enjoy fusion Indian sweets and mild vegetable-based flavours, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with ghee-rich Mysore Pak with gentle carrot sweetness and a smooth finish.",
  "best_use": "Best for family snacking, festive gifting, kids' treats and unique sweet boxes, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Carrot Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Carrot Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with ghee-rich Mysore Pak with gentle carrot sweetness and a smooth finish."},
    {"q": "Can I buy Carrot Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Carrot Mysore Pak?", "a": "It suits buyers who enjoy fusion Indian sweets and mild vegetable-based flavours and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Carrot Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "There was a homely feel in Carrot Mysore Pak; the gentle carrot sweetness made it stand apart from the regular box.",
    "We used Carrot Mysore Pak for office gifting sharing, and the pieces looked neat on the plate.",
    "Gentle carrot sweetness ishta iruvavarige Carrot Mysore Pak olle option. Texture kooda smooth aagittu.",
    "Carrot Mysore Pak ne regular Mysore Pak se alag feel diya. gentle carrot sweetness achhe se blend hua.",
    "Carrot Mysore Pak feels like a thoughtful variant for people who enjoy softer Indian sweets."
  ]
}
$$::jsonb WHERE slug = 'buy-carrot-mysore-pak-online';

-- 11) Organic Jaggery Brown Sugar Mysore Pak → DB name "Jaggery Mysore Pak"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Organic Jaggery Brown Sugar Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Organic Jaggery Brown Sugar Mysore Pak brings organic jaggery and brown sugar depth into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for buyers looking for brown sugar Mysore Pak and jaggery-style Indian sweets, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with soft and buttery with caramel-like sweetness, jaggery warmth and ghee aroma.",
  "best_use": "Best for festive gifting, family dessert boxes, thoughtful hampers and sweet cravings, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Organic Jaggery Brown Sugar Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Organic Jaggery Brown Sugar Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with soft and buttery with caramel-like sweetness, jaggery warmth and ghee aroma."},
    {"q": "Can I buy Organic Jaggery Brown Sugar Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Organic Jaggery Brown Sugar Mysore Pak?", "a": "It suits buyers looking for brown sugar Mysore Pak and jaggery-style Indian sweets and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Organic Jaggery Brown Sugar Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "The warm jaggery sweetness in Organic Jaggery Brown Sugar Mysore Pak made the sweet more interesting without taking away the Mysore Pak taste.",
    "The flavour of Organic Jaggery Brown Sugar Mysore Pak did not feel artificial; the caramel-like brown sugar depth matched the product name.",
    "Organic Jaggery Brown Sugar Mysore Pak regular Mysore Pak tara same alla. warm jaggery sweetness iruvudrinda flavour memorable aagide.",
    "Warm jaggery sweetness pasand karne walon ke liye Organic Jaggery Brown Sugar Mysore Pak nice option hai. Taste simple nahi laga.",
    "The best thing about Organic Jaggery Brown Sugar Mysore Pak is that it feels familiar but still has its own product identity."
  ]
}
$$::jsonb WHERE slug = 'buy-organic-jaggery-brown-sugar-mysore-pak-online';

-- 12) Millet Mysore Pak
UPDATE products SET seo_content = $$
{
  "h2": "Buy Millet Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Millet Mysore Pak brings a simple millet-based twist into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for millet sweet buyers and families looking for a different Mysore Pak option, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with soft ghee Mysore Pak with a mild millet note and balanced sweetness.",
  "best_use": "Best for everyday sweet cravings, family gifting, festivals and millet sweet exploration, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Millet Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Millet Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with soft ghee Mysore Pak with a mild millet note and balanced sweetness."},
    {"q": "Can I buy Millet Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Millet Mysore Pak?", "a": "It suits millet sweet buyers and families looking for a different Mysore Pak option and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Millet Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "We served Millet Mysore Pak for family dessert; it was rich enough for guests but did not feel oily.",
    "For an online sweet order, Millet Mysore Pak felt more natural than expected.",
    "First bite alli Millet Mysore Pak soft anisutte. mild millet note light aagi barodu ishta aaytu.",
    "Millet Mysore Pak ghar par serve kiya, sabne softness notice ki. Freshness achhi thi.",
    "Good option for anyone ordering Mysore Pak online and wanting a flavour-led choice like Millet Mysore Pak."
  ]
}
$$::jsonb WHERE slug = 'millet-mysore-pak';

-- 13) Milk Mysore Pak
UPDATE products SET seo_content = $$
{
  "h2": "Buy Milk Mysore Pak Online with Fresh Mysuru Sweetness",
  "intro": "Milk Mysore Pak brings a creamy milk-rich layer into the soft, ghee-rich taste of traditional Mysore Pak. It is ideal for buyers who prefer creamy Indian sweets and mild Mysore Pak flavours, especially for buyers who want a familiar Indian sweet with a more memorable flavour. Every bite keeps the classic Mysuru-style richness while giving you a clear reason to choose this variant.",
  "taste_profile": "Soft, rich and melt-in-mouth, with soft, creamy and ghee-led with a smooth milk sweet finish.",
  "best_use": "Best for kids, family dessert boxes, festive gifting and guest serving, especially when you want to buy Mysore Pak online that feels fresh, gift-worthy and slightly different.",
  "delivery_trust": "Milk Mysore Pak is freshly packed to protect its soft texture, ghee aroma and flavour during delivery. The box is kept neat, secure and ready for gifting or serving after it reaches you.",
  "faqs": [
    {"q": "What does Milk Mysore Pak taste like?", "a": "It tastes like soft traditional Mysore Pak with soft, creamy and ghee-led with a smooth milk sweet finish."},
    {"q": "Can I buy Milk Mysore Pak online for gifting?", "a": "Yes, it is a good choice for festive gifting, family sweet boxes, office sharing and Indian sweet hampers."},
    {"q": "Who will enjoy Milk Mysore Pak?", "a": "It suits buyers who prefer creamy Indian sweets and mild Mysore Pak flavours and anyone who wants a fresh Mysore Pak flavour beyond the regular classic option."},
    {"q": "How should I store Milk Mysore Pak after delivery?", "a": "Keep it in a cool, dry place in an airtight box, away from heat, moisture and direct sunlight."}
  ],
  "reviews": [
    "Milk Mysore Pak had a softer bite than expected; the creamy milk taste stayed gentle and the ghee aroma felt fresh.",
    "We used Milk Mysore Pak for Diwali sharing, and the pieces looked neat on the plate.",
    "Milk Mysore Pak swalpa different taste ide; creamy milk taste mild aagi barutte. Mane alli ellaru try madidru.",
    "Milk Mysore Pak repeat order karne layak hai if you like soft Mysore Pak with creamy milk taste.",
    "Milk Mysore Pak works for gifting because it looks neat, tastes fresh and has a memorable creamy milk taste."
  ]
}
$$::jsonb WHERE slug = 'buy-milk-mysore-pak-online';

-- ── Ghee Sweets sheet ────────────────────────────────────────────────────

-- 14) Chocolate Bites
UPDATE products SET seo_content = $$
{
  "h2": "Buy Chocolate Bites Online for Fresh Indian Sweet Cravings",
  "intro": "Chocolate Bites brings the taste of a chocolate-flavoured bite-size sweet into a fresh, easy-to-share pack for kids, chocolate lovers and families. It gives you that familiar Indian sweet-shop feeling at home, making it useful for gifting, serving guests or enjoying small sweet moments after meals.",
  "taste_profile": "Soft, chocolatey and dessert-like with a rich sweet finish.",
  "best_use": "Best for kids' treats, party boxes, return gifts, after-meal sweets and casual gifting, especially when you want to buy fresh sweets online for easy sharing.",
  "delivery_trust": "Chocolate Bites is packed carefully to hold its taste, shape and freshness during delivery. It arrives neat, easy to serve and suitable for opening at home, work or during celebrations.",
  "faqs": [
    {"q": "What does Chocolate Bites taste like?", "a": "It tastes soft, chocolatey and dessert-like with a rich sweet finish."},
    {"q": "Can I gift Chocolate Bites?", "a": "Yes, it works well for festive sweet boxes, family gifting, office sharing and casual hampers."},
    {"q": "Is Chocolate Bites suitable for kids and families?", "a": "Yes, it is easy to serve and works well for family snacking, celebrations and guest visits."},
    {"q": "How should I store Chocolate Bites?", "a": "Keep it in a cool, dry place in an airtight container after opening to maintain freshness."}
  ],
  "reviews": [
    "Chocolate Bites looked neat in the box and tasted like something from a proper sweet shop.",
    "I would add Chocolate Bites to a hamper because it has a clear flavour and neat presentation.",
    "Chocolate coating ishta iruvavarige Chocolate Bites try madbahudu. Taste balanced ide.",
    "Chocolate Bites ka bite fresh tha, aur aftertaste bhi pleasant raha.",
    "The flavour identity of Chocolate Bites is strong enough to make it different from a regular sweet box."
  ]
}
$$::jsonb WHERE slug = 'buy-chocolate-bites-online';

-- 15) Kesar Bites
UPDATE products SET seo_content = $$
{
  "h2": "Buy Kesar Bites Online for Fresh Indian Sweet Cravings",
  "intro": "Kesar Bites brings the taste of a saffron-led bite-size Indian sweet into a fresh, easy-to-share pack for buyers who enjoy saffron sweets and festive flavours. It gives you that familiar Indian sweet-shop feeling at home, making it useful for gifting, serving guests or enjoying small sweet moments after meals.",
  "taste_profile": "Aromatic, soft and rich with a gentle kesar flavour.",
  "best_use": "Best for festival gifting, guest serving, pooja boxes and premium sweet trays, especially when you want to buy fresh sweets online for easy sharing.",
  "delivery_trust": "Kesar Bites is packed carefully to hold its taste, shape and freshness during delivery. It arrives neat, easy to serve and suitable for opening at home, work or during celebrations.",
  "faqs": [
    {"q": "What does Kesar Bites taste like?", "a": "It tastes aromatic, soft and rich with a gentle kesar flavour."},
    {"q": "Can I gift Kesar Bites?", "a": "Yes, it works well for festive sweet boxes, family gifting, office sharing and casual hampers."},
    {"q": "Is Kesar Bites suitable for kids and families?", "a": "Yes, it is easy to serve and works well for family snacking, celebrations and guest visits."},
    {"q": "How should I store Kesar Bites?", "a": "Keep it in a cool, dry place in an airtight container after opening to maintain freshness."}
  ],
  "reviews": [
    "I picked Kesar Bites for variety, and it actually tasted distinct.",
    "Kesar Bites felt gift-ready enough for a family visit box.",
    "Kesar Bites fresh sweet shop item tara feel aaytu. Packing kooda clean ide.",
    "Kesar Bites fresh nikla aur texture bhi sahi tha, old stock jaisa nahi.",
    "The kesar aroma gives Kesar Bites a pleasant finish without overpowering the sweet."
  ]
}
$$::jsonb WHERE slug = 'buy-kesar-bites-online';

-- 16) Pista Bites
UPDATE products SET seo_content = $$
{
  "h2": "Buy Pista Bites Online for Fresh Indian Sweet Cravings",
  "intro": "Pista Bites brings the taste of a pistachio-flavoured bite-size sweet into a fresh, easy-to-share pack for pista sweet lovers and dry-fruit sweet buyers. It gives you that familiar Indian sweet-shop feeling at home, making it useful for gifting, serving guests or enjoying small sweet moments after meals.",
  "taste_profile": "Nutty, soft and mildly creamy with a pista-rich finish.",
  "best_use": "Best for festive gifting, dry-fruit sweet boxes, family trays and guest serving, especially when you want to buy fresh sweets online for easy sharing.",
  "delivery_trust": "Pista Bites is packed carefully to hold its taste, shape and freshness during delivery. It arrives neat, easy to serve and suitable for opening at home, work or during celebrations.",
  "faqs": [
    {"q": "What does Pista Bites taste like?", "a": "It tastes nutty, soft and mildly creamy with a pista-rich finish."},
    {"q": "Can I gift Pista Bites?", "a": "Yes, it works well for festive sweet boxes, family gifting, office sharing and casual hampers."},
    {"q": "Is Pista Bites suitable for kids and families?", "a": "Yes, it is easy to serve and works well for family snacking, celebrations and guest visits."},
    {"q": "How should I store Pista Bites?", "a": "Keep it in a cool, dry place in an airtight container after opening to maintain freshness."}
  ],
  "reviews": [
    "Pista Bites tasted fresh and the pista crunch came through without making it too sweet.",
    "Pista Bites had a nice bite and did not crumble or stick awkwardly while serving.",
    "Tea-time sweet time alli Pista Bites use madidvi; plate mele neat aagittu.",
    "Pista Bites ka taste simple tha but boring nahi. a pista-rich finish ne flavour better banaya.",
    "Pista Bites is not overly rich, which makes it easier for family sharing."
  ]
}
$$::jsonb WHERE slug = 'buy-pista-bites-online';

-- 17) Mango Delight Aam Papad → DB name "Mango Delight"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Mango Delight Aam Papad Online for Fresh Indian Sweet Cravings",
  "intro": "Mango Delight Aam Papad brings the taste of a mango-based fruit sweet into a fresh, easy-to-share pack for mango lovers, kids and fruit snack fans. It gives you that familiar Indian sweet-shop feeling at home, making it useful for gifting, serving guests or enjoying small sweet moments after meals.",
  "taste_profile": "Sweet, tangy, fruity and chewy with a nostalgic mango finish.",
  "best_use": "Best for travel snacking, kids' treats, lunch boxes, casual gifting and mango cravings, especially when you want to buy fresh sweets online for easy sharing.",
  "delivery_trust": "Mango Delight Aam Papad is packed carefully to hold its taste, shape and freshness during delivery. It arrives neat, easy to serve and suitable for opening at home, work or during celebrations.",
  "faqs": [
    {"q": "What does Mango Delight Aam Papad taste like?", "a": "It tastes sweet, tangy, fruity and chewy with a nostalgic mango finish."},
    {"q": "Can I gift Mango Delight Aam Papad?", "a": "Yes, it works well for festive sweet boxes, family gifting, office sharing and casual hampers."},
    {"q": "Is Mango Delight Aam Papad suitable for kids and families?", "a": "Yes, it is easy to serve and works well for family snacking, celebrations and guest visits."},
    {"q": "How should I store Mango Delight Aam Papad?", "a": "Keep it in a cool, dry place in an airtight container after opening to maintain freshness."}
  ],
  "reviews": [
    "Mango Delight Aam Papad worked for both kids and elders at home because the sweetness was controlled.",
    "The sweetness in Mango Delight Aam Papad was comfortable for family sharing.",
    "After-meal craving time alli Mango Delight Aam Papad use madidvi; plate mele neat aagittu.",
    "Mango Delight Aam Papad ka mango flavour fresh laga, aur sweetness bhi zyada nahi thi.",
    "The texture of Mango Delight Aam Papad makes it suitable for serving guests directly."
  ]
}
$$::jsonb WHERE slug = 'buy-mango-delight-aam-papad-online';

-- 18) Kaju Cashew Bites → DB name "Kaju Bites"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Kaju Cashew Bites Online for Fresh Indian Sweet Cravings",
  "intro": "Kaju Cashew Bites brings the taste of a cashew-rich bite-size sweet into a fresh, easy-to-share pack for kaju sweet lovers and premium gifting buyers. It gives you that familiar Indian sweet-shop feeling at home, making it useful for gifting, serving guests or enjoying small sweet moments after meals.",
  "taste_profile": "Soft, nutty and rich with a smooth kaju finish.",
  "best_use": "Best for dry-fruit sweet boxes, festival gifts, family functions and premium hampers, especially when you want to buy fresh sweets online for easy sharing.",
  "delivery_trust": "Kaju Cashew Bites is packed carefully to hold its taste, shape and freshness during delivery. It arrives neat, easy to serve and suitable for opening at home, work or during celebrations.",
  "faqs": [
    {"q": "What does Kaju Cashew Bites taste like?", "a": "It tastes soft, nutty and rich with a smooth kaju finish."},
    {"q": "Can I gift Kaju Cashew Bites?", "a": "Yes, it works well for festive sweet boxes, family gifting, office sharing and casual hampers."},
    {"q": "Is Kaju Cashew Bites suitable for kids and families?", "a": "Yes, it is easy to serve and works well for family snacking, celebrations and guest visits."},
    {"q": "How should I store Kaju Cashew Bites?", "a": "Keep it in a cool, dry place in an airtight container after opening to maintain freshness."}
  ],
  "reviews": [
    "Kaju Cashew Bites was simple to serve and the taste stayed consistent across pieces.",
    "The flavour stayed steady, so Kaju Cashew Bites did not feel like a one-bite novelty.",
    "Kaju Cashew Bites fresh sweet shop item tara feel aaytu. Packing kooda clean ide.",
    "Kaju Cashew Bites gift box mein add karne layak laga. Presentation clean thi.",
    "Kaju Cashew Bites is a nice repeat option if you prefer balanced Indian sweets."
  ]
}
$$::jsonb WHERE slug = 'buy-kaju-cashew-bites-online';

-- 19) Rose Bites
UPDATE products SET seo_content = $$
{
  "h2": "Buy Rose Bites Online for Fresh Indian Sweet Cravings",
  "intro": "Rose Bites brings the taste of a rose-flavoured bite-size Indian sweet into a fresh, easy-to-share pack for buyers who like mild floral sweets and festive flavours. It gives you that familiar Indian sweet-shop feeling at home, making it useful for gifting, serving guests or enjoying small sweet moments after meals.",
  "taste_profile": "Soft, sweet and floral with a light rose aroma.",
  "best_use": "Best for wedding trays, festive gifting, guest serving and sweet boxes, especially when you want to buy fresh sweets online for easy sharing.",
  "delivery_trust": "Rose Bites is packed carefully to hold its taste, shape and freshness during delivery. It arrives neat, easy to serve and suitable for opening at home, work or during celebrations.",
  "faqs": [
    {"q": "What does Rose Bites taste like?", "a": "It tastes soft, sweet and floral with a light rose aroma."},
    {"q": "Can I gift Rose Bites?", "a": "Yes, it works well for festive sweet boxes, family gifting, office sharing and casual hampers."},
    {"q": "Is Rose Bites suitable for kids and families?", "a": "Yes, it is easy to serve and works well for family snacking, celebrations and guest visits."},
    {"q": "How should I store Rose Bites?", "a": "Keep it in a cool, dry place in an airtight container after opening to maintain freshness."}
  ],
  "reviews": [
    "Rose Bites looked neat in the box and tasted like something from a proper sweet shop.",
    "Rose Bites is useful for guest plate because it looks clean and does not need extra plating.",
    "Tea-time sweet ge Rose Bites serve madidvi. Sweetness over agirlilla, texture chennagittu.",
    "Guest plate mein Rose Bites jaldi finish ho gaya. Sweetness balanced thi.",
    "Rose Bites feels like a fresh, serve-ready sweet with a clear light rose aroma."
  ]
}
$$::jsonb WHERE slug = 'buy-rose-bites-online';

-- 20) Badusha Sweets → DB name "Badusha"
UPDATE products SET seo_content = $$
{
  "h2": "Buy Badusha Sweets Online for Fresh Indian Sweet Cravings",
  "intro": "Badusha Sweets brings the taste of a classic layered Indian sweet into a fresh, easy-to-share pack for traditional sweet lovers and festival buyers. It gives you that familiar Indian sweet-shop feeling at home, making it useful for gifting, serving guests or enjoying small sweet moments after meals.",
  "taste_profile": "Flaky outside, soft inside and sweet with a traditional syrup finish.",
  "best_use": "Best for festivals, family functions, guest serving and traditional sweet cravings, especially when you want to buy fresh sweets online for easy sharing.",
  "delivery_trust": "Badusha Sweets is packed carefully to hold its taste, shape and freshness during delivery. It arrives neat, easy to serve and suitable for opening at home, work or during celebrations.",
  "faqs": [
    {"q": "What does Badusha Sweets taste like?", "a": "It tastes flaky outside, soft inside and sweet with a traditional syrup finish."},
    {"q": "Can I gift Badusha Sweets?", "a": "Yes, it works well for festive sweet boxes, family gifting, office sharing and casual hampers."},
    {"q": "Is Badusha Sweets suitable for kids and families?", "a": "Yes, it is easy to serve and works well for family snacking, celebrations and guest visits."},
    {"q": "How should I store Badusha Sweets?", "a": "Keep it in a cool, dry place in an airtight container after opening to maintain freshness."}
  ],
  "reviews": [
    "The texture of Badusha Sweets stood out first; then the flaky syrupy bite made the flavour memorable.",
    "The a traditional syrup finish made Badusha Sweets more interesting than a regular sweet order.",
    "After-meal craving time alli Badusha Sweets use madidvi; plate mele neat aagittu.",
    "Flaky syrupy bite pasand ho toh Badusha Sweets definitely try kar sakte hain.",
    "Badusha Sweets is a nice repeat option if you prefer balanced Indian sweets."
  ]
}
$$::jsonb WHERE slug = 'buy-badusha-sweets-online';

-- 21) Soft Soan Cake → DB name "Soan Cake". Note: review 5 in the source
--     sheet was truncated by the paste limit — reconstructed to a sensible
--     end so the array has 5 entries; edit here if the real one differs.
UPDATE products SET seo_content = $$
{
  "h2": "Buy Soft Soan Cake Online for Fresh Indian Sweet Cravings",
  "intro": "Soft Soan Cake brings the taste of a soft soan-style Indian sweet into a fresh, easy-to-share pack for soan sweet lovers and families. It gives you that familiar Indian sweet-shop feeling at home, making it useful for gifting, serving guests or enjoying small sweet moments after meals.",
  "taste_profile": "Soft, flaky, rich and lightly sweet with a melt-in-mouth feel.",
  "best_use": "Best for tea-time sweets, family boxes, festival gifting and after-meal treats, especially when you want to buy fresh sweets online for easy sharing.",
  "delivery_trust": "Soft Soan Cake is packed carefully to hold its taste, shape and freshness during delivery. It arrives neat, easy to serve and suitable for opening at home, work or during celebrations.",
  "faqs": [
    {"q": "What does Soft Soan Cake taste like?", "a": "It tastes soft, flaky, rich and lightly sweet with a melt-in-mouth feel."},
    {"q": "Can I gift Soft Soan Cake?", "a": "Yes, it works well for festive sweet boxes, family gifting, office sharing and casual hampers."},
    {"q": "Is Soft Soan Cake suitable for kids and families?", "a": "Yes, it is easy to serve and works well for family snacking, celebrations and guest visits."},
    {"q": "How should I store Soft Soan Cake?", "a": "Keep it in a cool, dry place in an airtight container after opening to maintain freshness."}
  ],
  "reviews": [
    "Soft Soan Cake was simple to serve and the taste stayed consistent across pieces.",
    "Soft Soan Cake is useful for festival serving because it looks clean and does not need extra plating.",
    "Soft Soan Cake texture chennagide; bite madidmele flaky melt-in-mouth texture slowly barutte.",
    "Soft Soan Cake gift box mein add karne layak laga. Presentation clean thi.",
    "Soft Soan Cake felt festive, but still light enough for everyday cravings."
  ]
}
$$::jsonb WHERE slug = 'buy-soft-soan-cake-online';

-- ── Verification: count how many rows now have seo_content ───────────────
SELECT count(*) AS total_with_content
FROM products
WHERE seo_content IS NOT NULL;

-- Should print 21.

COMMIT;
