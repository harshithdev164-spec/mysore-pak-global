import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { products } from "@/data/products";
import { SlidersHorizontal, X } from "lucide-react";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);

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
  }, [selectedCategory, sortBy]);

  return (
    <div className="pt-20">
      <section className="relative py-16 sm:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl font-bold text-secondary"
          >
            Our <span className="gold-text">Collection</span>
          </motion.h1>
          <p className="font-body text-muted-foreground mt-4">Handcrafted with love and pure ghee</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <p className="text-sm text-muted-foreground">{filtered.length} products</p>
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
