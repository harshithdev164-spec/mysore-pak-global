"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { TilePatternBg, FloralPatternBg, CornerOrnament } from "@/components/TilePattern";
import type { Product } from "@/data/products";
import { SlidersHorizontal, X } from "lucide-react";

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
    weights: (p.weights ?? []).map((w: { label: string; price: number }) => ({
      label: w.label,
      price: w.price,
    })),
    image: p.image ?? "",
    badge: p.badge ?? undefined,
    rating: p.rating ?? 0,
    reviews: p.review_count ?? 0,
  };
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => { if (j.data) setProducts(j.data.map(mapApiProduct)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [products, selectedCategory, sortBy]);

  return (
    <div className="pt-[4.5rem] sm:pt-[5.5rem]">

      {/* ── Shop Header ── */}
      <section className="relative py-14 sm:py-18 bg-[#FBF7F0] overflow-hidden">
        {/* Layered SVG backgrounds */}
        <TilePatternBg color="#2D5A3D" opacity={0.055} />
        <FloralPatternBg color="#C9972D" opacity={0.065} />
        {/* Radial spotlight in the center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, #C9972D10 0%, transparent 65%)" }}
        />
        {/* Corner ornaments */}
        <CornerOrnament className="absolute top-0 left-0 opacity-40" color="#C9972D" size={110} />
        <CornerOrnament className="absolute top-0 right-0 opacity-40 scale-x-[-1]" color="#C9972D" size={110} />
        <CornerOrnament className="absolute bottom-0 left-0 opacity-40 scale-y-[-1]" color="#2D5A3D" size={90} />
        <CornerOrnament className="absolute bottom-0 right-0 opacity-40 scale-[-1]" color="#2D5A3D" size={90} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-3 block font-semibold">Our Collection</span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1B3A2D]">
              Shop <span className="text-[#C9972D]">Mysore Pak</span>
            </h1>
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="block h-px w-12 bg-[#C9972D]/40" />
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#C9972D" opacity="0.7" />
              </svg>
              <span className="font-body text-sm text-[#1B3A2D]/50">Handcrafted with love and pure ghee</span>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#C9972D" opacity="0.7" />
              </svg>
              <span className="block h-px w-12 bg-[#C9972D]/40" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-[#FBF7F0]">
        {/* Very faint tile pattern on products background */}
        <TilePatternBg color="#2D5A3D" opacity={0.03} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex lg:gap-8">
          {/* Desktop filter */}
          <div className="hidden lg:block w-60 shrink-0">
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {/* Mobile filter toggle */}
          <div className="flex-1">
            <div className="lg:hidden flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">{loading ? "Loading..." : `${filtered.length} products`}</p>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>

            {filterOpen && (
              <div className="lg:hidden mb-6 p-4 bg-card rounded-lg border border-border relative">
                <button onClick={() => setFilterOpen(false)} className="absolute top-3 right-3">
                  <X className="h-4 w-4" />
                </button>
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">No products found.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
