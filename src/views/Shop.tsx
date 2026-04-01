"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { ChevronDown } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawProduct = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.base_price,
    originalPrice: p.original_price ?? undefined,
    category: p.category?.name ?? "",
    description: p.description ?? "",
    ingredients: p.ingredients ?? "",
    storage: p.storage ?? "",
    weights: (p.weights ?? []).map((w: any) => ({
      id: w.id ?? "",
      label: w.label,
      price: w.price,
      stock_quantity: w.stock_quantity ?? 100,
    })),
    image: p.image ?? "",
    badge: p.badge ?? undefined,
    rating: p.rating ?? 0,
    reviews: p.review_count ?? 0,
  };
}

// ── Hardcoded sidebar categories — same images as homepage, independent of DB ──
const SIDEBAR_CATEGORIES = [
  { slug: "mysore-pak",  name: "Mysore Pak",  image: "/mysoree paak.png" },
  { slug: "ghee-sweets", name: "Ghee Sweets", image: "/Ghee sweets.webp" },
  { slug: "gift-boxes",  name: "Gift Boxes",  image: "/Gift Boxes.webp" },
  { slug: "namkeens",    name: "Namkeens",    image: "/Namkeen.webp" },
  { slug: "chocolates",  name: "Chocolates",  image: "/chocolates.webp" },
  { slug: "specials",    name: "Specials",    image: "/specials.webp" },
] as const;

const SORT_OPTIONS = [
  { value: "default",    label: "Recommended" },
  { value: "price-low",  label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated" },
];

/* ── Sidebar category button ── */
function CatItem({
  slug, name, image, selected, onClick,
}: {
  slug: string; name: string; image: string | null;
  selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      className={`flex flex-col items-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 sm:py-3 rounded-xl w-full transition-colors duration-200 ${
        selected ? "bg-[#1B3A2D]/8" : "hover:bg-[#C9972D]/8"
      }`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
          selected
            ? "border-[#C9972D] shadow-md shadow-[#C9972D]/30 scale-105"
            : "border-[#1B3A2D]/10 group-hover:border-[#C9972D]/40"
        }`}
        style={selected ? {} : undefined}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              selected ? "bg-[#1B3A2D]" : "bg-[#1B3A2D]/10"
            }`}
          >
            <span
              className={`font-heading font-bold text-sm sm:text-base lg:text-lg ${
                selected ? "text-[#C9972D]" : "text-[#1B3A2D]/60"
              }`}
            >
              {name[0]}
            </span>
          </div>
        )}
      </div>
      <span
        className={`font-body text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-center leading-tight w-full truncate transition-colors duration-200 ${
          selected ? "text-[#C9972D]" : "text-[#1B3A2D]/55 hover:text-[#C9972D]"
        }`}
      >
        {name}
      </span>
      {selected && (
        <span className="w-3 sm:w-4 h-0.5 rounded-full bg-[#C9972D]" />
      )}
    </motion.button>
  );
}

interface Props {
  initialProducts: RawProduct[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCategories: any[];
}

const Shop = ({ initialProducts }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("category") ?? "mysore-pak";
  const urlSort     = searchParams.get("sort")     ?? "default";

  const products = useMemo<Product[]>(() => {
    let data: RawProduct[] = initialProducts;

    // Always filter by selected category
    const target = urlCategory.toLowerCase();
    data = data.filter((p: RawProduct) => {
      const catSlug = (p.category?.slug ?? "").toLowerCase();
      const catName = (p.category?.name ?? "").toLowerCase().replace(/\s+/g, "-");
      return catSlug === target || catName === target;
    });

    const sorted = [...data];
    switch (urlSort) {
      case "price-low":  sorted.sort((a, b) => a.base_price - b.base_price); break;
      case "price-high": sorted.sort((a, b) => b.base_price - a.base_price); break;
      case "rating":     sorted.sort((a, b) => b.rating - a.rating); break;
    }

    return sorted.map(mapApiProduct);
  }, [initialProducts, urlCategory, urlSort]);

  function selectCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", slug);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }

  function selectSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "default") params.delete("sort");
    else params.set("sort", sort);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }

  const selectedLabel =
    SIDEBAR_CATEGORIES.find((c) => c.slug === urlCategory)?.name ?? "Mysore Pak";

  // navbar (32px announcement + ~64px nav) = ~96px on mobile, ~112px on sm
  return (
    <div className="bg-[#FBF7F0] flex flex-col" style={{ height: "100dvh", paddingTop: "6rem" }}>

      {/* ── Shop Header — fixed, never scrolls ── */}
      <div className="bg-[#1B3A2D] py-5 sm:py-7 px-4 shrink-0 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#C9972D]/70 mb-1 block font-semibold">
              Our Collection
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#FBF7F0]">
              <span className="text-[#C9972D]">{selectedLabel}</span> Collection
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ── Main layout — fills remaining viewport height ── */}
      <div className="flex flex-1 min-h-0 max-w-7xl mx-auto w-full">

        {/* ── Left sidebar — does not scroll with products ── */}
        <aside className="flex flex-col w-[68px] sm:w-[88px] lg:w-[100px] shrink-0 overflow-y-auto scrollbar-hide border-r border-[#1B3A2D]/8 bg-[#FBF7F0] py-2 sm:py-4">
          {SIDEBAR_CATEGORIES.map((cat) => (
            <CatItem
              key={cat.slug}
              slug={cat.slug}
              name={cat.name}
              image={cat.image}
              selected={urlCategory === cat.slug}
              onClick={() => selectCategory(cat.slug)}
            />
          ))}
        </aside>

        {/* ── Products area — ONLY this scrolls ── */}
        <div className="flex-1 min-w-0 overflow-y-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">

          {/* Sort + count bar */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <p className="font-body text-sm text-[#1B3A2D]/50 shrink-0">
              {products.length} item{products.length !== 1 ? "s" : ""}
            </p>
            <div className="relative">
              <select
                value={urlSort}
                onChange={(e) => selectSort(e.target.value)}
                className="appearance-none bg-white border border-[#1B3A2D]/15 rounded-full pl-4 pr-8 py-2 font-body text-xs font-semibold text-[#1B3A2D] cursor-pointer focus:outline-none focus:border-[#C9972D]/50"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B3A2D]/40 pointer-events-none" />
            </div>
          </div>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-body text-[#1B3A2D]/40 text-base">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 pb-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
