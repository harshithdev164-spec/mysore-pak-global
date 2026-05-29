export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  ingredients: string;
  storage: string;
  weights: { id: string; label: string; price: number; stock_quantity: number }[];
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
  seoTitle?: string;
  seoDescription?: string;
}

export const products: Product[] = [
  {
    "id": "13",
    "name": "Millet Mysorepak",
    "slug": "buy-healthy-foxtail-millet-mysorepak-online",
    "price": 499,
    "category": "Mysore Pak",
    "description": "Buy Foxtail Millet MysorePak online from World of Mysore Pak — a healthy take on the classic sweet, made with nutrient-rich millet and rich ghee indulgence.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Healthy Foxtail Millet Mysore Pak Online with Rich Ghee",
    "seoDescription": "Buy Foxtail Millet MysorePak online from World of Mysore Pak — a healthy take on the classic sweet, made with nutrient-rich millet and rich ghee indulgence."
  },
  {
    "id": "8",
    "name": "Roasted Almond Mysore Pak",
    "slug": "buy-roasted-almond-mysore-pak-online",
    "price": 949,
    "category": "Mysore Pak",
    "description": "Packed with roasted California almonds, this premium Mysore Pak offers a crunchy texture with every bite.",
    "ingredients": "Roasted Almonds, Gram flour, Pure Ghee, Sugar, Cardamom",
    "storage": "Store in a cool, dry place. Best consumed within 12 days.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 949,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 1699,
        "stock_quantity": 100
      },
      {
        "id": "w3",
        "label": "1kg",
        "price": 3199,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1599599810769-bcde93a92e6f?w=600&q=80",
    "rating": 4.8,
    "reviews": 112,
    "seoTitle": "Buy Ghee - Roasted Almond Mysore Pak Online | Crunchy Badam",
    "seoDescription": "Buy Roasted Almond Mysore Pak Online from World of Mysore Pak. Crafted with crunchy almond and pure ghee for a rich Badam Mysore Pak with authentic taste."
  },
  {
    "id": "14",
    "name": "Watermelon Seeds Mysore Pak",
    "slug": "buy-water-melon-mysore-pak-online",
    "price": 499,
    "category": "Mysore Pak",
    "description": "Buy Watermelon Mysore Pak online from World of Mysore Pak and enjoy a refreshingly wholesome treat packed with natural flavor, protein, and a fruity twist.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Fruity Watermelon Mysore Pak Online Made with Pure Ghee",
    "seoDescription": "Buy Watermelon Mysore Pak online from World of Mysore Pak and enjoy a refreshingly wholesome treat packed with natural flavor, protein, and a fruity twist."
  },
  {
    "id": "15",
    "name": "Mix Mysore Pak",
    "slug": "buy-mix-mysore-pak-online",
    "price": 499,
    "category": "Mysore Pak",
    "description": "Buy Mix Mysorepak online from World of Mysore Pak. A combo of pure ghee Mysorepak with assorted flavors—perfect for gifting, festivals, and indulgent moments.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Mixed Varieties of Pure Ghee Mysore Pak Online Now",
    "seoDescription": "Buy Mix Mysorepak online from World of Mysore Pak. A combo of pure ghee Mysorepak with assorted flavors—perfect for gifting, festivals, and indulgent moments."
  },
  {
    "id": "6",
    "name": "Mango Mysore Pak",
    "slug": "buy-mango-mysorepak-online",
    "price": 799,
    "category": "Mysore Pak",
    "description": "Summer meets tradition in this Alphonso mango-infused Mysore Pak. A fruity twist on the beloved classic.",
    "ingredients": "Alphonso Mango pulp, Gram flour, Pure Ghee, Sugar",
    "storage": "Refrigerate. Best consumed within 10 days.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 799,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 1399,
        "stock_quantity": 100
      },
      {
        "id": "w3",
        "label": "1kg",
        "price": 2599,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
    "badge": "Seasonal",
    "rating": 4.7,
    "reviews": 134,
    "seoTitle": "Buy Ghee Mango Mysore Pak Online | Unique Fruity Twist",
    "seoDescription": "Buy Mango Mysore Pak online from World of Mysore Pak – a fruity twist on tradition made with mango pulp and ghee. Enjoy rich, bold flavor in every bite."
  },
  {
    "id": "12",
    "name": "Anjeer Mysore Pak",
    "slug": "buy-anjeer-mysore-pak-online",
    "price": 999,
    "category": "Mysore Pak",
    "description": "Premium Afghani figs blended into Mysore Pak for a unique, chewy-meets-melt texture that is truly one of a kind.",
    "ingredients": "Afghani Figs, Gram flour, Pure Ghee, Sugar, Cardamom, Nuts",
    "storage": "Refrigerate. Best consumed within 10 days.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 999,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 1799,
        "stock_quantity": 100
      },
      {
        "id": "w3",
        "label": "1kg",
        "price": 3399,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80",
    "badge": "Premium",
    "rating": 4.8,
    "reviews": 65,
    "seoTitle": "Buy Fig-Filled 100% Pure Ghee Anjeer Mysore Pak Online",
    "seoDescription": "Buy Anjeer Mysore Pak online –a soft, rich sweet made with figs and 100% pure ghee. World of Mysore Pak brings this delightful fusion of bold texture and taste."
  },
  {
    "id": "16",
    "name": "Jaggery Millet Mysore Pak",
    "slug": "buy-organic-jaggery-millet-mysorepak-online",
    "price": 499,
    "category": "Mysore Pak",
    "description": "Buy Organic Jaggery Millet Mysore Pak online from World of Mysore Pak – a soft, earthy treat made with foxtail millet, jaggery & pure ghee for mindful indulgence.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Organic Jaggery Millet Mysore Pak Online | 100% Pure Ghee",
    "seoDescription": "Buy Organic Jaggery Millet Mysore Pak online from World of Mysore Pak – a soft, earthy treat made with foxtail millet, jaggery & pure ghee for mindful indulgence."
  },
  {
    "id": "3",
    "name": "Kaju Mysore Pak",
    "slug": "buy-cashew-mysore-pak-online",
    "price": 899,
    "category": "Mysore Pak",
    "description": "Kaju Mysore Pak is a rich variation of the traditional sweet made with cashews and pure ghee, offering a creamy melt-in-mouth texture.",
    "ingredients": "Cashews, Gram flour, Pure Ghee, Sugar, Cardamom",
    "storage": "Store in a cool, dry place. Refrigerate for extended freshness. Best consumed within 12 days.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 899,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 1599,
        "stock_quantity": 100
      },
      {
        "id": "w3",
        "label": "1kg",
        "price": 2999,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=80",
    "rating": 4.7,
    "reviews": 156,
    "seoTitle": "Buy Creamy Kaju Mysore Pak Online | Soft & Nutty Delight",
    "seoDescription": "Buy Kaju Mysore Pak online from World of Mysore Pak – a rich, buttery sweet made with cashews, offering a melt-in-mouth texture for indulgent moments."
  },
  {
    "id": "17",
    "name": "Spl Mysore Pak",
    "slug": "buy-special-mysore-pak-online",
    "price": 499,
    "category": "Mysore Pak",
    "description": "Craving rich-flavoured Special Mysore Pak? World of Mysore Pak brings Karnataka’s iconic ghee-rich sweet. Buy online now at the best Mysore Pak price!",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Pure Ghee Special Mysore Pak Online | Taste of Tradition",
    "seoDescription": "Craving rich-flavoured Special Mysore Pak? World of Mysore Pak brings Karnataka’s iconic ghee-rich sweet. Buy online now at the best Mysore Pak price!"
  },
  {
    "id": "1",
    "name": "Traditional Mysore Pak",
    "slug": "buy-traditional-ghee-wheat-mysore-pak-online",
    "price": 699,
    "category": "Mysore Pak",
    "description": "The original Mysore Pak made with the finest gram flour, pure ghee, and sugar. A melt-in-mouth delicacy with a rich, buttery flavor that has been perfected over generations.",
    "ingredients": "Gram flour (Besan), Pure Ghee, Sugar, Cardamom",
    "storage": "Store in a cool, dry place. Best consumed within 15 days. Refrigerate for extended freshness.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 699,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 1199,
        "stock_quantity": 100
      },
      {
        "id": "w3",
        "label": "1kg",
        "price": 2199,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1666190020777-6210676b2699?w=600&q=80",
    "badge": "Bestseller",
    "rating": 4.9,
    "reviews": 342,
    "seoTitle": "Buy Authentic Traditional Mysore Pak Online Made with Pure Ghee",
    "seoDescription": "Order Jaggery Mysore Pak from World of Mysore Pak made with organic jaggery and 100% pure ghee. A rich, earthy sweet with molasses depth and soft texture."
  },
  {
    "id": "7",
    "name": "Jaggery Mysore Pak",
    "slug": "buy-organic-jaggery-brown-sugar-mysore-pak-online",
    "price": 749,
    "category": "Mysore Pak",
    "description": "Sweetened with organic jaggery instead of sugar, this variation offers a deeper, more earthy sweetness with all the ghee richness.",
    "ingredients": "Gram flour, Pure Ghee, Organic Jaggery, Cardamom",
    "storage": "Store in a cool, dry place. Best consumed within 15 days.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 749,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 1299,
        "stock_quantity": 100
      },
      {
        "id": "w3",
        "label": "1kg",
        "price": 2399,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&q=80",
    "rating": 4.6,
    "reviews": 98,
    "seoTitle": "Buy 100% Pure Ghee Organic Jaggery Mysore Pak Online",
    "seoDescription": "Buy Jaggery Mysore Pak online from World of Mysore Pak. Made with 100% pure ghee and organic jaggery for a soft, molasses-rich and wholesome flavor."
  },
  {
    "id": "11",
    "name": "Milk Mysore Pak",
    "slug": "buy-milk-mysore-pak-online",
    "price": 699,
    "category": "Mysore Pak",
    "description": "A softer, milkier version of Mysore Pak made with condensed milk and pure ghee for an ultra-creamy experience.",
    "ingredients": "Condensed Milk, Gram flour, Pure Ghee, Sugar, Cardamom",
    "storage": "Refrigerate. Best consumed within 10 days.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 699,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 1199,
        "stock_quantity": 100
      },
      {
        "id": "w3",
        "label": "1kg",
        "price": 2199,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=600&q=80",
    "rating": 4.6,
    "reviews": 88,
    "seoTitle": "Buy Pure Ghee Milk Mysore Pak Online | Authentic Treat",
    "seoDescription": "Buy Milk Mysore Pak online from World of Mysore Pak – a creamy delight made with pure ghee and milk. Enjoy authentic flavor and melt-in-mouth softness."
  },
  {
    "id": "4",
    "name": "Carrot Mysore Pak",
    "slug": "buy-carrot-mysore-pak-online",
    "price": 749,
    "category": "Mysore Pak",
    "description": "A delightful fusion of Gajar Halwa and Mysore Pak. Fresh carrots blended with gram flour and ghee create this unique seasonal treat.",
    "ingredients": "Fresh Carrots, Gram flour, Pure Ghee, Sugar, Cardamom, Nuts",
    "storage": "Refrigerate after opening. Best consumed within 10 days.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 749,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 1299,
        "stock_quantity": 100
      },
      {
        "id": "w3",
        "label": "1kg",
        "price": 2399,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
    "badge": "Seasonal",
    "rating": 4.6,
    "reviews": 89,
    "seoTitle": "Buy Carrot Mysore Pak Online | Pure Ghee & Natural Taste",
    "seoDescription": "Buy Carrot Mysore Pak online from World of Mysore Pak – made with gajar and 100% pure ghee for a vibrant flavor, natural sweetness, and wholesome delight."
  },
  {
    "id": "18",
    "name": "Chocolate Bites",
    "slug": "buy-chocolate-bites-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Buy Chocolate Bites Online from world of mysore pak. Enjoy crunchy chocolate bites packed with flavor. Perfect choco bites for mini treats with nutty goodness.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Chocolate Bites Online – Choco Bites with Kaju Paste",
    "seoDescription": "Buy Chocolate Bites Online from world of mysore pak. Enjoy crunchy chocolate bites packed with flavor. Perfect choco bites for mini treats with nutty goodness."
  },
  {
    "id": "19",
    "name": "Kesar Bites",
    "slug": "buy-kesar-bites-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Buy Kesar Bites Online. Flaky saffron bites made with pure ghee, kesar essence, and almonds. A soft, nutty saffron delight crafted by World of Mysore Pak.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Kesar Bites Online – Saffron Bites with 100% Pure Ghee",
    "seoDescription": "Buy Kesar Bites Online. Flaky saffron bites made with pure ghee, kesar essence, and almonds. A soft, nutty saffron delight crafted by World of Mysore Pak."
  },
  {
    "id": "20",
    "name": "Pista Bites",
    "slug": "buy-pista-bites-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Buy Pista Bites Online. Flaky pistachio sweets made with 100% pure ghee and rich pista. A nutty delight from World of Mysore Pak, perfect for all occasions.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Pista Bites Online – Rich Ghee Pistachio Bites Sweet",
    "seoDescription": "Buy Pista Bites Online. Flaky pistachio sweets made with 100% pure ghee and rich pista. A nutty delight from World of Mysore Pak, perfect for all occasions."
  },
  {
    "id": "21",
    "name": "Mango Delight",
    "slug": "buy-mango-delight-aam-papad-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Buy Mango Delight Online from World of Mysore Pak. Aam papad sweet layered with mango pulp and white chocolate, enriched with pure ghee for rich, flaky texture.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Mango Delight Online – 100% Pure Ghee Aam Papad Sweet",
    "seoDescription": "Buy Mango Delight Online from World of Mysore Pak. Aam papad sweet layered with mango pulp and white chocolate, enriched with pure ghee for rich, flaky texture."
  },
  {
    "id": "22",
    "name": "Kaju Bites",
    "slug": "buy-kaju-cashew-bites-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Searching for a unique sweet? Try Kaju Bites online from World of Mysore Pak. Flaky, nutty Cashew Bites made with pure ghee, kaju paste, & caramelized sugar.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Kaju Bites Online – Soft Cashew Bites Made with Ghee",
    "seoDescription": "Searching for a unique sweet? Try Kaju Bites online from World of Mysore Pak. Flaky, nutty Cashew Bites made with pure ghee, kaju paste, & caramelized sugar."
  },
  {
    "id": "23",
    "name": "Rose Bites",
    "slug": "buy-rose-bites-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Looking for rose sweets? Try Rose Bites with kaju paste, 100% pure ghee, and rose petals. A floral cashew delight by World of Mysore Pak. Order online now.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Rose Bites Online – Rose Sweets Made with Kaju Paste",
    "seoDescription": "Looking for rose sweets? Try Rose Bites with kaju paste, 100% pure ghee, and rose petals. A floral cashew delight by World of Mysore Pak. Order online now."
  },
  {
    "id": "24",
    "name": "Badusha",
    "slug": "buy-badusha-sweets-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Flaky, golden badusha made with 100% pure ghee and tradition. Enjoy the ghee balushahi. Buy the crisp layers of  balu shahi Online from world of mysore pak",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Badusha Online – Authentic Balushahi Ghee Sweet Online",
    "seoDescription": "Flaky, golden badusha made with 100% pure ghee and tradition. Enjoy the ghee balushahi. Buy the crisp layers of  balu shahi Online from world of mysore pak"
  },
  {
    "id": "25",
    "name": "Soan Cake",
    "slug": "buy-soft-soan-cake-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Buy Soan Cake Online – made with 100% pure ghee and a soft, flaky cake texture. A modern twist on Soan Papdi by World of Mysore Pak, fresh and delightful.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Soan Cake Online – Soft & Pure Ghee Soan Papdi Cake",
    "seoDescription": "Buy Soan Cake Online – made with 100% pure ghee and a soft, flaky cake texture. A modern twist on Soan Papdi by World of Mysore Pak, fresh and delightful."
  },
  {
    "id": "26",
    "name": "Badam Halwa",
    "slug": "buy-badam-halwa-almond-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Buy Badam Halwa Online – soft, rich almond halwa made with pure ghee & milk. A smooth sweet from World of Mysore Pak that melts in your mouth with every bite.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Pure Ghee Badam Halwa Online – Fresh Almond Sweet Treat",
    "seoDescription": "Buy Badam Halwa Online – soft, rich almond halwa made with pure ghee & milk. A smooth sweet from World of Mysore Pak that melts in your mouth with every bite."
  },
  {
    "id": "27",
    "name": "Pure Ghee Soan Papdi",
    "slug": "buy-pure-ghee-soan-papdi-sweets-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Buy Pure Ghee Soan Papdi online – flaky, fresh papdi mithai crafted with tradition and rich ghee. Order this classic soan papdi sweet from World of Mysore Pak.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Pure Ghee Soan Papdi Online – Traditional Papdi Mithai",
    "seoDescription": "Buy Pure Ghee Soan Papdi online – flaky, fresh papdi mithai crafted with tradition and rich ghee. Order this classic soan papdi sweet from World of Mysore Pak."
  },
  {
    "id": "28",
    "name": "Kaju Barfi",
    "slug": "buy-kaju-barfi-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Craving classic sweets? Buy silky smooth kaju barfi made with premium cashews & 100% pure ghee from world of mysore pak. Evergreen treat of kaju now at online.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Kaju Barfi Online – Authentic Cashew Burfi with Ghee",
    "seoDescription": "Craving classic sweets? Buy silky smooth kaju barfi made with premium cashews & 100% pure ghee from world of mysore pak. Evergreen treat of kaju now at online."
  },
  {
    "id": "29",
    "name": "Pure Ghee Bombay Halwa",
    "slug": "buy-bombay-halwa-online",
    "price": 499,
    "category": "Ghee Sweets",
    "description": "Buy taste chewy bombay halwa From the world of mysore pak Online. Slow-cooked bombay halwa in pure ghee with glossy finish. A traditional sweet for all events.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Traditional Pure Ghee Bombay Halwa Jelly Sweet Online",
    "seoDescription": "Buy taste chewy bombay halwa From the world of mysore pak Online. Slow-cooked bombay halwa in pure ghee with glossy finish. A traditional sweet for all events."
  },
  {
    "id": "30",
    "name": "Salted Pista",
    "slug": "buy-salted-pista-crunchy-roasted-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy salted pista online from World of Mysore Pak. Crisp roasted pistachios lightly salted, delivering a wholesome, tasty, nutritious snack perfect anytime.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Roasted and Crunchy Salted Pista Namkeen Snack Online",
    "seoDescription": "Buy salted pista online from World of Mysore Pak. Crisp roasted pistachios lightly salted, delivering a wholesome, tasty, nutritious snack perfect anytime."
  },
  {
    "id": "31",
    "name": "Plain Khakhra",
    "slug": "buy-plain-khakhra-healthy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Plain Khakhra Snack Online from World of Mysore Pak – crispy and roasted to perfection. Enjoy the natural flavor with your favorite dips in every bite.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Natural Crunchy Plain Khakhra Namkeen Snack Online",
    "seoDescription": "Buy Plain Khakhra Snack Online from World of Mysore Pak – crispy and roasted to perfection. Enjoy the natural flavor with your favorite dips in every bite."
  },
  {
    "id": "32",
    "name": "Cheese khakhra",
    "slug": "buy-cheese-khakhra-cheesy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving cheese namkeens? Buy cheese khakhra snack online from World of Mysore Pak. Roasted crunchy delight with rich cheesy flavor, perfect for any craving.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Savory and Cheesy Cheese Khakhra Namkeen Online",
    "seoDescription": "Craving cheese namkeens? Buy cheese khakhra snack online from World of Mysore Pak. Roasted crunchy delight with rich cheesy flavor, perfect for any craving."
  },
  {
    "id": "33",
    "name": "Jeera khakhra",
    "slug": "buy-jeera-khakhra-cumin-flatbread-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Jeera Khakhra Namkeen Snack Online from World of Mysore Pak – a light, crispy, cumin-flavored treat perfect for a savory and crunchy khakhra jeera snack",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Crispy and Roasted healthy Jeera Khakhra Snack Online",
    "seoDescription": "Buy Jeera Khakhra Namkeen Snack Online from World of Mysore Pak – a light, crispy, cumin-flavored treat perfect for a savory and crunchy khakhra jeera snack"
  },
  {
    "id": "34",
    "name": "Methi masala khakhra",
    "slug": "buy-methi-masala-khakhra-fenugreek-flatbread-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Methi Masala Khakhra Namkeen Snack Online from World of Mysore Pak – a roasted, whole wheat treat blended with methi and spices for a savory delight.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Methi Masala Khakhra – Tasty Namkeen Snack Online",
    "seoDescription": "Buy Methi Masala Khakhra Namkeen Snack Online from World of Mysore Pak – a roasted, whole wheat treat blended with methi and spices for a savory delight."
  },
  {
    "id": "35",
    "name": "Masala Khakhra",
    "slug": "buy-masala-khakhra-spiced-crispy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Masala Khakhra Namkeen Snack Online from World of Mysore Pak – bold Indian wheat crisps roasted with flavorful masala for a savory crunch you’ll love.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy tasty and Spicy Masala Khakhra Indian Snack Online",
    "seoDescription": "Buy Masala Khakhra Namkeen Snack Online from World of Mysore Pak – bold Indian wheat crisps roasted with flavorful masala for a savory crunch you’ll love."
  },
  {
    "id": "36",
    "name": "Salt Kaju",
    "slug": "buy-salt-kaju-salted-cashew-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Salt Kaju Namkeen Snack Online from World of Mysore Pak – roasted cashew nuts lightly salted for a savory and crunchy delight you’ll enjoy anytime.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Crispy Salt Kaju Cashew Nut Namkeen Snack Online",
    "seoDescription": "Buy Salt Kaju Namkeen Snack Online from World of Mysore Pak – roasted cashew nuts lightly salted for a savory and crunchy delight you’ll enjoy anytime."
  },
  {
    "id": "37",
    "name": "Chilli Kaju",
    "slug": "buy-chilli-kaju-spicy-chilli-cashew-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Chilli Kaju Namkeen Snack Online from World of Mysore Pak – fiery roasted cashew nuts seasoned for bold heat, perfect for all the spice lovers out there.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Spicy Roasted Chilli Kaju Cashew Namkeen Snack Online",
    "seoDescription": "Buy Chilli Kaju Namkeen Snack Online from World of Mysore Pak – fiery roasted cashew nuts seasoned for bold heat, perfect for all the spice lovers out there."
  },
  {
    "id": "38",
    "name": "Cheddar Cheese Makhana",
    "slug": "buy-cheddar-cheese-makhana-cheesy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Cheddar Cheese Makhana Snack Online from World of Mysore Pak – a crispy, light snack with bold cheesy flavor. A perfect cheesy treat for any snack time!",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Cheddar Cheese Makhana Snack with Cheesy Crunch Online",
    "seoDescription": "Buy Cheddar Cheese Makhana Snack Online from World of Mysore Pak – a crispy, light snack with bold cheesy flavor. A perfect cheesy treat for any snack time!"
  },
  {
    "id": "39",
    "name": "Peri Peri Makhana",
    "slug": "buy-peri-peri-makhana-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving peri peri makhana? World of Mysore Pak offers roasted Peri Peri Makhana with cheesy, spicy flavor. Perfect snack for spice lovers—order online today!",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Spicy and Roasted Peri Peri Makhana Snack Online",
    "seoDescription": "Craving peri peri makhana? World of Mysore Pak offers roasted Peri Peri Makhana with cheesy, spicy flavor. Perfect snack for spice lovers—order online today!"
  },
  {
    "id": "40",
    "name": "Tomato Cheese Makhana",
    "slug": "buy-tomato-cheese-makhana-tangy-cheesy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving something cheesy? Try tomato cheese makhana from World of Mysore Pak. Light, crunchy foxnuts with bold tomato and cheddar flavor. Buy online today.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Tomato Cheese Makhana – Tomato Fox Nut Snack Online",
    "seoDescription": "Craving something cheesy? Try tomato cheese makhana from World of Mysore Pak. Light, crunchy foxnuts with bold tomato and cheddar flavor. Buy online today."
  },
  {
    "id": "41",
    "name": "Pepper Makhana",
    "slug": "buy-pepper-makhana-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Salt & Black Pepper Makhana Online from World of Mysore Pak – a crunchy, roasted snack that’s light, bold in flavor, and perfect for your savory cravings.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Roasted and Crispy Pepper Makhana Snack Online",
    "seoDescription": "Buy Salt & Black Pepper Makhana Online from World of Mysore Pak – a crunchy, roasted snack that’s light, bold in flavor, and perfect for your savory cravings."
  },
  {
    "id": "42",
    "name": "Split Peanuts",
    "slug": "buy-split-peanuts-crunchy-peanut-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy crunchy split peanuts online from World of Mysore Pak. A simple, wholesome snack made with roasted groundnuts—delicious solo or in your favorite mixtures.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Split Peanuts – Roasted Groundnut Snacks Online",
    "seoDescription": "Buy crunchy split peanuts online from World of Mysore Pak. A simple, wholesome snack made with roasted groundnuts—delicious solo or in your favorite mixtures."
  },
  {
    "id": "43",
    "name": "Palak Chakkuli",
    "slug": "buy-palak-chakkuli-spinach-spiral-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy palak chakkuli online at World of Mysore Pak. This green murukku snack blends rice flour and spinach into a crispy treat, perfect for guilt-free munching.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Palak Chakkuli – Crispy Spinach Murukku Snack Online",
    "seoDescription": "Buy palak chakkuli online at World of Mysore Pak. This green murukku snack blends rice flour and spinach into a crispy treat, perfect for guilt-free munching."
  },
  {
    "id": "44",
    "name": "Ragi Chakkuli",
    "slug": "buy-ragi-chakkuli-millet-spiral-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Try ragi chakli from World of Mysore Pak. Crunchy spirals made from ragi flour, deep-fried and seasoned—perfect as a nutritious, guilt-free snack. Buy online.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Crispy and Healthy Ragi Chakkuli Millet Snack Online",
    "seoDescription": "Try ragi chakli from World of Mysore Pak. Crunchy spirals made from ragi flour, deep-fried and seasoned—perfect as a nutritious, guilt-free snack. Buy online."
  },
  {
    "id": "45",
    "name": "Chakkuli",
    "slug": "buy-chakkuli-traditional-spiral-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving murukku? Buy chakkuli online from World of Mysore Pak. A deep-fried snack made with rice flour, urad dal, and spices for a crunchy, savory delight.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Chakkuli – Spicy & Crispy Authentic Murukku Snack Online",
    "seoDescription": "Craving murukku? Buy chakkuli online from World of Mysore Pak. A deep-fried snack made with rice flour, urad dal, and spices for a crunchy, savory delight."
  },
  {
    "id": "46",
    "name": "Karela (Vaccum Fried)",
    "slug": "buy-karela-vacuum-fried-bitter-gourd-chips-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Want to try crispy bitter gourd snacks with a twist? Explore karela chips from the world of Mysore Pak online. Buy karela vacuum fried chips bold & nutritious.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Karela Vacuum Fried – Crispy Bitter Gourd Chips Online",
    "seoDescription": "Want to try crispy bitter gourd snacks with a twist? Explore karela chips from the world of Mysore Pak online. Buy karela vacuum fried chips bold & nutritious."
  },
  {
    "id": "47",
    "name": "Bendi (Vaccum Fried)",
    "slug": "buy-bendi-vacuum-fried-okra-chips-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy vacuum fried bendi chips from World of Mysore Pak. These crispy lady finger snacks are healthy, flavorful, & a guilt-free twist on traditional fried chips.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Bendi Vacuum Fried – Lady Finger Snack Crisp Online",
    "seoDescription": "Buy vacuum fried bendi chips from World of Mysore Pak. These crispy lady finger snacks are healthy, flavorful, & a guilt-free twist on traditional fried chips."
  },
  {
    "id": "48",
    "name": "Sev",
    "slug": "buy-sev-crispy-gram-flour-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving crunchy sev namkeen? Buy besan sev online from World of Mysore Pak. Mildly spiced and crispy, perfect for snacking or topping chaats and dishes.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Sev – Crispy Besan Sev Namkeen for Chaat & Snacks Online",
    "seoDescription": "Craving crunchy sev namkeen? Buy besan sev online from World of Mysore Pak. Mildly spiced and crispy, perfect for snacking or topping chaats and dishes."
  },
  {
    "id": "49",
    "name": "Potato Sticks",
    "slug": "buy-potato-sticks-crispy-fried-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy crispy potato stick chips from world of Mysore Pak. Savory finger chips with garlic & spice. Crispy aloo strings ready to eat namkeen must try finger chips.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Potato Sticks – Crispy Finger Chips Snack Online",
    "seoDescription": "Buy crispy potato stick chips from world of Mysore Pak. Savory finger chips with garlic & spice. Crispy aloo strings ready to eat namkeen must try finger chips."
  },
  {
    "id": "50",
    "name": "Khara Chips",
    "slug": "buy-khara-chips-spicy-potato-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Love spicy aloo chips? Try Khara Chips from World of Mysore Pak. These masala potato chips are crunchy, zesty, and full of bold Indian flavor. Buy online.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Khara Chips – Spicy Potato Masala Crunch Chips Online",
    "seoDescription": "Love spicy aloo chips? Try Khara Chips from World of Mysore Pak. These masala potato chips are crunchy, zesty, and full of bold Indian flavor. Buy online."
  },
  {
    "id": "51",
    "name": "Salt Chips",
    "slug": "buy-salt-chips-classic-potato-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Love potato chips? Buy salt chips pak online, lightly salted potato chips with golden crunch classic, irresistible & simple. Now available at world of mysore.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Salt Chips  – Lightly Salted Aloo Chips Snack Online",
    "seoDescription": "Love potato chips? Buy salt chips pak online, lightly salted potato chips with golden crunch classic, irresistible & simple. Now available at world of mysore."
  },
  {
    "id": "52",
    "name": "Cajun Hot & Spicy Makana",
    "slug": "buy-cajun-hot-spicy-makhana-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving spice? Order Cajun Hot & Spicy Makhana online from World of Mysore Pak. Roasted lotus seeds with a bold, airy crunch & a kick of fiery cajun masala.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Cajun Hot & Spicy Makhana – Crunchy Lotus Seeds Online",
    "seoDescription": "Craving spice? Order Cajun Hot & Spicy Makhana online from World of Mysore Pak. Roasted lotus seeds with a bold, airy crunch & a kick of fiery cajun masala."
  },
  {
    "id": "53",
    "name": "Grains And Pulses",
    "slug": "buy-grains-and-pulses-essential-snacks-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Looking for a healthy snack? Order grains and pulses online from World of Mysore Pak. A crunchy, spiced mix of whole grains pulses with bold Indian flavors.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Grains and Pulses – Spiced Whole Grain Snacks Online",
    "seoDescription": "Looking for a healthy snack? Order grains and pulses online from World of Mysore Pak. A crunchy, spiced mix of whole grains pulses with bold Indian flavors."
  },
  {
    "id": "54",
    "name": "Spicy Moong Dal",
    "slug": "spicy-moong-dal",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving something spicy? Order masala moong dal online. World of Mysore Pak’s spicy moong dal is crunchy, zesty, and bursting with bold chilli spice flavor.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Spicy Moong Dal – Masala Moong Dal Snack Online",
    "seoDescription": "Craving something spicy? Order masala moong dal online. World of Mysore Pak’s spicy moong dal is crunchy, zesty, and bursting with bold chilli spice flavor."
  },
  {
    "id": "55",
    "name": "Salt Moong Dal",
    "slug": "buy-salt-moong-dal-crispy-lentil-namkeen-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving a protein-rich namkeen? Try salt moong dal from World of Mysore Pak. Fried moong dal lightly salted for a crispy, savory snack. Buy online today.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Salt Moong Dal – Crispy Fried Moong Namkeen Online",
    "seoDescription": "Craving a protein-rich namkeen? Try salt moong dal from World of Mysore Pak. Fried moong dal lightly salted for a crispy, savory snack. Buy online today."
  },
  {
    "id": "56",
    "name": "Mysore Masala Kadlepuri",
    "slug": "buy-mysore-masala-kadlepuri-spicy-puffed-rice-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Mysore Masala Kadlepuri—a masala puffed rice blend bursting with flavor online from world of Mysore Pak.  puffed rice mix full of bold kara pori flavor.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Mysore Masala Kadlepuri – Kara Pori Puffed Rice Online",
    "seoDescription": "Buy Mysore Masala Kadlepuri—a masala puffed rice blend bursting with flavor online from world of Mysore Pak.  puffed rice mix full of bold kara pori flavor."
  },
  {
    "id": "57",
    "name": "Methi Matri",
    "slug": "buy-methi-matri-fenugreek-crispy-tea-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy crunchy methi matri from world of mysore pak online. Made with fenugreek leaves and spices. Enjoy and taste the savory, golden-brown tea-time snack.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Methi Matri – Spiced Methi Snack Crunch Online",
    "seoDescription": "Buy crunchy methi matri from world of mysore pak online. Made with fenugreek leaves and spices. Enjoy and taste the savory, golden-brown tea-time snack."
  },
  {
    "id": "58",
    "name": "Ribbon Muruku",
    "slug": "buy-ribbon-muruku-flat-crispy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Ribbon Muruku Online from World of Mysore Pak. This crunchy ribbon pakoda is made with rice & urad dal flour—a crispy, twisted snack for every occasion.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Ribbon Muruku – Crispy Ribbon Pakoda Snack Online",
    "seoDescription": "Buy Ribbon Muruku Online from World of Mysore Pak. This crunchy ribbon pakoda is made with rice & urad dal flour—a crispy, twisted snack for every occasion."
  },
  {
    "id": "59",
    "name": "Pepper Kaju",
    "slug": "buy-pepper-kaju-black-pepper-cashew-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy the crunchy, spicy Pepper Kaju snack online. Discover the pepper cashew nuts from world of Mysore Pak. Fried in ghee and seasoned with black pepper.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Pepper Kaju – Black Pepper Cashew Nut Snack Online",
    "seoDescription": "Buy the crunchy, spicy Pepper Kaju snack online. Discover the pepper cashew nuts from world of Mysore Pak. Fried in ghee and seasoned with black pepper."
  },
  {
    "id": "60",
    "name": "Masala Kaju",
    "slug": "buy-masala-kaju-spicy-cashew-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Masala Kaju online from World of Mysore Pak. Crispy roasted cashews spiced with bold masala. A protein-rich, crunchy treat perfect for all-day snacking.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Masala Kaju  – Spicy Cashew Masala Fry Delight Online",
    "seoDescription": "Buy Masala Kaju online from World of Mysore Pak. Crispy roasted cashews spiced with bold masala. A protein-rich, crunchy treat perfect for all-day snacking."
  },
  {
    "id": "61",
    "name": "Salt Makhana",
    "slug": "buy-salt-makhana-salted-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Salt Makhana online. Enjoy roasted lotus seeds with a perfect salty touch. Try the lotus crispy, healthy seed popcorn snack from the world of Mysore Pak.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Salt Makhana – Healthy Roasted Lotus Seeds Snack Online",
    "seoDescription": "Buy Salt Makhana online. Enjoy roasted lotus seeds with a perfect salty touch. Try the lotus crispy, healthy seed popcorn snack from the world of Mysore Pak."
  },
  {
    "id": "62",
    "name": "Fried Channa",
    "slug": "buy-fried-channa-crunchy-and-crispy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Looking for roasted channa-style snacks? Buy Fried Channa Online from World of Mysore Pak. Kabuli chickpeas spiced and fried crisp for a protein-rich crunch.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Fried Channa – Spicy Roasted Chickpeas Snack Online",
    "seoDescription": "Looking for roasted channa-style snacks? Buy Fried Channa Online from World of Mysore Pak. Kabuli chickpeas spiced and fried crisp for a protein-rich crunch."
  },
  {
    "id": "63",
    "name": "Gatiya",
    "slug": "buy-gatiya-gujarati-crunchy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving Gatiya? Try Gathiya namkeen from World of Mysore Pak. A crispy, soft-textured Gujarati snack made from gram flour—flavorful and perfect anytime.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Gatiya – Lightly Spiced Gathiya Namkeen Murukku Online",
    "seoDescription": "Craving Gatiya? Try Gathiya namkeen from World of Mysore Pak. A crispy, soft-textured Gujarati snack made from gram flour—flavorful and perfect anytime."
  },
  {
    "id": "64",
    "name": "Bakarwadi",
    "slug": "buy-bakarwadi-sweet-spicy-spiral-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Bakarwadi online—crispy, spicy, sweet Maharashtrian snack made with moong dal filling from the world of Mysore Pak, enjoy crunchy bhakarwadi snacks anytime.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Bakarwadi – Crispy Spicy Bhakarwadi Snack Online",
    "seoDescription": "Buy Bakarwadi online—crispy, spicy, sweet Maharashtrian snack made with moong dal filling from the world of Mysore Pak, enjoy crunchy bhakarwadi snacks anytime."
  },
  {
    "id": "65",
    "name": "Thill Murk",
    "slug": "buy-thill-murk-sesame-crunchy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Love crunchy sesame sticks snacks? Buy Thil Murukku from the world of Mysore Pak online—garlic-chili rice coils packed with flavor. Prefect healthy snack.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Thill Muruk Online – Spicy Sesame Stick Snack Delight",
    "seoDescription": "Love crunchy sesame sticks snacks? Buy Thil Murukku from the world of Mysore Pak online—garlic-chili rice coils packed with flavor. Prefect healthy snack."
  },
  {
    "id": "66",
    "name": "Masala Peanut",
    "slug": "buy-masala-peanut-spicy-namkeen-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Masala Peanut Online from World of Mysore Pak. Spicy, crispy groundnuts fried with tangy masala. A crunchy snack perfect for tea time or evening munching.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Masala Peanuts Online – Spicy Groundnut Masala Snack",
    "seoDescription": "Buy Masala Peanut Online from World of Mysore Pak. Spicy, crispy groundnuts fried with tangy masala. A crunchy snack perfect for tea time or evening munching."
  },
  {
    "id": "67",
    "name": "Mysore Spl Avarekalu",
    "slug": "buy-mysore-special-avarekalu-crispy-bean-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Mysore Spl Avarekalu online from the World of Mysore Pak. Enjoy a crunchy avarekalu mixture with peanuts, cashews, and spices—crafted for snack lovers.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Mysore Spl Avarekalu – Avarekalu Mixture Delight Online",
    "seoDescription": "Buy Mysore Spl Avarekalu online from the World of Mysore Pak. Enjoy a crunchy avarekalu mixture with peanuts, cashews, and spices—crafted for snack lovers."
  },
  {
    "id": "68",
    "name": "Mota Sev",
    "slug": "buy-mota-sev-thick-crispy-namkeen-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Mota Sev Online from World of Mysore Pak. A chunky, spicy besan sev snack with bold masala and a crispy bite. A rustic Indian shev you’ll love to munch!",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Mota Sev Online – Spicy Chunky Besan Namkeen Snack",
    "seoDescription": "Buy Mota Sev Online from World of Mysore Pak. A chunky, spicy besan sev snack with bold masala and a crispy bite. A rustic Indian shev you’ll love to munch!"
  },
  {
    "id": "69",
    "name": "Kodubale",
    "slug": "buy-kodubale-spicy-crunchy-ring-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving something crunchy? Try Kodubale—spicy ring murukku made from rice flour and spices. Buy online from World of Mysore Pak. A South Indian classic snack.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Kodubale Online – Spicy Ring Murukku Rice Snack",
    "seoDescription": "Craving something crunchy? Try Kodubale—spicy ring murukku made from rice flour and spices. Buy online from World of Mysore Pak. A South Indian classic snack."
  },
  {
    "id": "70",
    "name": "Fried Green Peas",
    "slug": "buy-fried-green-peas-crunchy-savory-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Fried Green Peas Online from World of Mysore Pak. Crispy roasted matar namkeen, perfect for tea time or mixing with other snacks. Light, crunchy & tasty.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Fried Green Peas Online – Crunchy Matar Namkeen Snack",
    "seoDescription": "Buy Fried Green Peas Online from World of Mysore Pak. Crispy roasted matar namkeen, perfect for tea time or mixing with other snacks. Light, crunchy & tasty."
  },
  {
    "id": "71",
    "name": "Channa Dal",
    "slug": "buy-channa-dal-crispy-namkeen-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Looking for a crunchy snack? Try Channa Dal namkeen from World of Mysore Pak. Spicy, crispy channa dal namkeen is perfect with tea or as a topping for chaat.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Channa Dal Namkeen Online – Crispy Dal Snack Bites",
    "seoDescription": "Looking for a crunchy snack? Try Channa Dal namkeen from World of Mysore Pak. Spicy, crispy channa dal namkeen is perfect with tea or as a topping for chaat."
  },
  {
    "id": "72",
    "name": "Spl Om Pudi",
    "slug": "buy-spl-om-pudi-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Crave a light snack with a twist? Buy Spl Om Pudi Online from World of Mysore Pak. Made with ajwain, hing, & spices, this crispy treat is perfect for tea time.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Delicious Spicy Special Om Pudi Mixture Snacks Online",
    "seoDescription": "Crave a light snack with a twist? Buy Spl Om Pudi Online from World of Mysore Pak. Made with ajwain, hing, & spices, this crispy treat is perfect for tea time."
  },
  {
    "id": "73",
    "name": "Garlic Mixture",
    "slug": "buy-garlic-mixture-bold-spicy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Love garlicky snacks? Buy Garlic Mixture Online from World of Mysore Pak. A bold and spicy namkeen made with crispy ingredients, garlic, & rich Indian spices.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Garlic Mixture Online – Bold & Spicy Garlic Namkeen",
    "seoDescription": "Love garlicky snacks? Buy Garlic Mixture Online from World of Mysore Pak. A bold and spicy namkeen made with crispy ingredients, garlic, & rich Indian spices."
  },
  {
    "id": "74",
    "name": "Mysore Mixture",
    "slug": "buy-mysore-mixture-snacks-mixture-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Mysore Mixture online and enjoy a crispy, spicy snacks mixture from the world of Mysore Pak. Perfect  Indian mixture snack delights with bold flavors.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Mysore Mixture Online – Crunchy Indian Mixture Namkeen",
    "seoDescription": "Buy Mysore Mixture online and enjoy a crispy, spicy snacks mixture from the world of Mysore Pak. Perfect  Indian mixture snack delights with bold flavors."
  },
  {
    "id": "75",
    "name": "Andhra Muruku",
    "slug": "buy-andhra-muruku-spicy-crunchy-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Buy Andhra Muruku Online from World of Mysore Pak. Spicy, crispy ring murukku made from rice flour. A crunchy Andhra snack perfect for tea-time cravings.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Andhra Muruku Online – Authentic Andhra Tea-Time Snack",
    "seoDescription": "Buy Andhra Muruku Online from World of Mysore Pak. Spicy, crispy ring murukku made from rice flour. A crunchy Andhra snack perfect for tea-time cravings."
  },
  {
    "id": "76",
    "name": "Mini Nippattu",
    "slug": "buy-mini-nippattu-crispy-tea-time-snack-online",
    "price": 499,
    "category": "Namkeens",
    "description": "Craving crispy nippattu snacks? Buy crunchy mini nippattu online. Enjoy the authentic taste from World of Mysore Pak—perfect with tea, coffee, or anytime.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Mini Nippattu Crunchy Tea-Time Snack Online",
    "seoDescription": "Craving crispy nippattu snacks? Buy crunchy mini nippattu online. Enjoy the authentic taste from World of Mysore Pak—perfect with tea, coffee, or anytime."
  },
  {
    "id": "77",
    "name": "Roasted Cashew Cappuccino",
    "slug": "buy-roasted-cashew-cappuccino-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Buy Roasted Cashew Cappuccino online from World of Mysore Pak. A rich chocolate nuts treat with roasted cashews and smooth cappuccino chocolate in every bite.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Crispy Roasted Cashew Cappuccino Chocolates Online",
    "seoDescription": "Buy Roasted Cashew Cappuccino online from World of Mysore Pak. A rich chocolate nuts treat with roasted cashews and smooth cappuccino chocolate in every bite."
  },
  {
    "id": "78",
    "name": "Dipped Chocolate Oreo",
    "slug": "buy-chocolate-dipped-oreo-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Craving Dipped Oreos with a twist? Buy Dipped Chocolate Oreos online from World of Mysore Pak—a crunchy, chocolate-coated treat made for joyful snacking.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Crunchy Dipped Chocolate Oreo Delight Treat Online",
    "seoDescription": "Craving Dipped Oreos with a twist? Buy Dipped Chocolate Oreos online from World of Mysore Pak—a crunchy, chocolate-coated treat made for joyful snacking."
  },
  {
    "id": "79",
    "name": "Rasamalai Chocolate",
    "slug": "buy-rasamalai-chocolate-delight-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Craving something new? Buy Rasamalai Chocolate Fusion Treats online. A festive fusion of traditional dessert and rich chocolate from World of Mysore Pak.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Rasamalai Chocolate Milk Based Fusion Treats Online",
    "seoDescription": "Craving something new? Buy Rasamalai Chocolate Fusion Treats online. A festive fusion of traditional dessert and rich chocolate from World of Mysore Pak."
  },
  {
    "id": "80",
    "name": "Choco Dipped Biscuit",
    "slug": "buy-choco-dipped-biscuit-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Buy Choco Dipped Biscuits online from World of Mysore Pak. Light, crisp biscuits coated in rich chocolate—perfect for chocolate lovers and snack-time joy.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Delightful Choco Dipped Biscuit Chocolate Bites Online",
    "seoDescription": "Buy Choco Dipped Biscuits online from World of Mysore Pak. Light, crisp biscuits coated in rich chocolate—perfect for chocolate lovers and snack-time joy."
  },
  {
    "id": "81",
    "name": "Choco Dates with Roasted Almond Chocolate",
    "slug": "buy-choco-dates-with-roasted-almond-chocolate-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Buy Choco Dates with Roasted Almond online from World of Mysore Pak. These choco dates with almonds offer a rich, healthy, chocolate-covered date delight.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Choco Dates with Roasted Almond Chocolate Online",
    "seoDescription": "Buy Choco Dates with Roasted Almond online from World of Mysore Pak. These choco dates with almonds offer a rich, healthy, chocolate-covered date delight."
  },
  {
    "id": "82",
    "name": "Milk Chocolate",
    "slug": "buy-milk-chocolate-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Order milk chocolate online at World of Mysore Pak. Taste the best chocolate bars with creamy texture and rich flavor, including our white chocolate range.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Milk Chocolate Bars Online – Smooth and Creamy",
    "seoDescription": "Order milk chocolate online at World of Mysore Pak. Taste the best chocolate bars with creamy texture and rich flavor, including our white chocolate range."
  },
  {
    "id": "83",
    "name": "White Chocolate Raisins",
    "slug": "buy-white-chocolate-raisins-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Buy White Chocolate Raisins online from World of Mysore Pak. Sweet raisins coated in smooth white chocolate—perfect for gifting, snacking, or daily cravings.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy White Chocolate Raisins Online for Daily Treats",
    "seoDescription": "Buy White Chocolate Raisins online from World of Mysore Pak. Sweet raisins coated in smooth white chocolate—perfect for gifting, snacking, or daily cravings."
  },
  {
    "id": "84",
    "name": "Roasted Kaju Milk Chocolate",
    "slug": "buy-roasted-kaju-milk-chocolate-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Order Roasted Kaju Milk Chocolate at World of Mysore Pak. Made with smooth milk chocolate and crunchy roasted cashews for the perfect nutty and creamy bite.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Roasted Kaju Milk Chocolate Online - Rich Flavor",
    "seoDescription": "Order Roasted Kaju Milk Chocolate at World of Mysore Pak. Made with smooth milk chocolate and crunchy roasted cashews for the perfect nutty and creamy bite."
  },
  {
    "id": "85",
    "name": "Hazelnut Dark Chocolate",
    "slug": "buy-hazelnut-dark-chocolate-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Want to try chocolate with hazelnuts? Taste the rich Hazelnut Dark Chocolate from world of mysore pak online, a perfect treat of dark chocolate with nuts.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Hazelnut Dark Chocolate Online – Bold & Nutty Taste",
    "seoDescription": "Want to try chocolate with hazelnuts? Taste the rich Hazelnut Dark Chocolate from world of mysore pak online, a perfect treat of dark chocolate with nuts."
  },
  {
    "id": "86",
    "name": "Fruit & Nut Milk Chocolate",
    "slug": "buy-fruit-and-nut-milk-chocolate-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Buy Fruit & Nut Milk Chocolate online, Creamy dried fruit chocolate bar with crunchy nuts. Perfect blend of dried fruit goodness from world of mysore pak.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Dried Fruit & Nut Milk Chocolate Online – Crunch & Cream",
    "seoDescription": "Buy Fruit & Nut Milk Chocolate online, Creamy dried fruit chocolate bar with crunchy nuts. Perfect blend of dried fruit goodness from world of mysore pak."
  },
  {
    "id": "87",
    "name": "Roasted Almond Dark Chocolate",
    "slug": "buy-roasted-almond-dark-chocolate-online",
    "price": 499,
    "category": "Chocolates",
    "description": "Searching for a dark chocolate crunch? Buy Roasted Almond Dark Chocolate online from World of Mysore Pak. Bold almonds taste with rich dark chocolate flavor.",
    "ingredients": "Premium ingredients, pure ghee, and traditional recipes.",
    "storage": "Store in a cool, dry place.",
    "weights": [
      {
        "id": "w1",
        "label": "250g",
        "price": 499,
        "stock_quantity": 100
      },
      {
        "id": "w2",
        "label": "500g",
        "price": 899,
        "stock_quantity": 100
      }
    ],
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "rating": 4.5,
    "reviews": 0,
    "seoTitle": "Buy Roasted Almond Dark Chocolate Bar Online",
    "seoDescription": "Searching for a dark chocolate crunch? Buy Roasted Almond Dark Chocolate online from World of Mysore Pak. Bold almonds taste with rich dark chocolate flavor."
  }
];

export const categories = [
  { name: "Mysore Pak", slug: "mysore-pak", image: "https://images.unsplash.com/photo-1666190020777-6210676b2699?w=600&q=80" },
  { name: "Ghee Sweets", slug: "ghee-sweets", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80" },
  { name: "Namkeens", slug: "namkeens", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80" },
  { name: "Chocolates", slug: "chocolates", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80" },
];

export const testimonials = [
  { name: "Priya Sharma",       avatarBg: "#4285F4", time: "2 weeks ago",  text: "The traditional Mysore Pak is so delicious — it tastes exactly like the ones I had in Mysuru as a child. Pure nostalgia! The ghee quality is unmatched.", rating: 5 },
  { name: "Rajesh Kumar",       avatarBg: "#EA4335", time: "1 month ago",  text: "Perfect sweetness and amazing taste. The packaging is premium too. Sent it as a Diwali gift and everyone absolutely loved it. Will order again!", rating: 5 },
  { name: "Ananya Rao",         avatarBg: "#34A853", time: "3 weeks ago",  text: "Kaju Mysore Pak is heavenly! The cashew flavor combined with pure ghee is absolutely divine. Highly recommend the gift boxes.", rating: 5 },
  { name: "Vikram Patel",       avatarBg: "#FBBC05", time: "2 months ago", text: "Finally found authentic Mysore Pak online. The quality and freshness is unmatched. Ships very quickly, arrived perfectly packed.", rating: 5 },
  { name: "Meera Nair",         avatarBg: "#4285F4", time: "1 week ago",   text: "The Chocolate Mysore Pak is a genius creation. My kids cannot stop eating it! Ordered thrice already. Best sweet shop online.", rating: 5 },
  { name: "Suresh Venkatesh",   avatarBg: "#EA4335", time: "5 days ago",   text: "Best Mysore Pak I have tasted outside of Mysuru. Pure ghee aroma hits you the moment you open the box. Absolutely authentic.", rating: 5 },
  { name: "Deepa Krishnamurthy",avatarBg: "#34A853", time: "3 months ago", text: "Ordered the assorted gift hamper for my parents' anniversary. Presentation was stunning and the sweets were incredibly fresh. 10/10!", rating: 5 },
  { name: "Arun Menon",         avatarBg: "#FBBC05", time: "1 month ago",  text: "Smooth, melt-in-mouth texture with that perfect ghee aftertaste. This is exactly how Mysore Pak should taste. Superb quality!", rating: 5 },
];

export const founders = [
  { name: "Sushma V Prasad", role: "Co-Founder", bio: "Passionate about preserving the culinary heritage of Mysuru, Sushma brings decades of knowledge in traditional sweet-making techniques." },
  { name: "Shruthi Pavan Shroff", role: "Co-Founder", bio: "With a vision to take Indian sweets global, Shruthi leads the brand strategy and innovation at World of Mysore Pak." },
  { name: "Sowmya Pavan Bargi", role: "Co-Founder", bio: "Sowmya oversees quality and operations, ensuring every piece of Mysore Pak meets the highest standards of taste and freshness." },
];
