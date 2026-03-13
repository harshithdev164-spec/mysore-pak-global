"use client";

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const categories = ["All", "Mysore Pak"];

const FilterSidebar = ({ selectedCategory, setSelectedCategory, sortBy, setSortBy }: FilterSidebarProps) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Category</h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`block w-full text-left py-2 px-3 rounded-md text-sm transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
    <div>
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Sort By</h3>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground"
      >
        <option value="default">Default</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  </div>
);

export default FilterSidebar;
