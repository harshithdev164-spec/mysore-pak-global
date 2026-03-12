import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Droplets, BookOpen, Sparkles } from "lucide-react";
import Hero3D from "@/components/Hero3D";
import ProductCard from "@/components/ProductCard";
import TestimonialCard from "@/components/TestimonialCard";
import { products, categories, testimonials } from "@/data/products";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6 },
};

const Index = () => {
  const featured = products.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-cream-dark/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="pt-24 lg:pt-0"
            >
              <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-4">
                From the Heart of Mysuru
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-secondary leading-[1.1] mb-6">
                World of{" "}
                <span className="gold-text">Mysore Pak</span>
              </h1>
              <p className="font-body text-base sm:text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
                Authentic Mysuru sweetness crafted with pure ghee.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-gold-dark px-8 py-6 text-sm font-medium tracking-wide">
                  <Link to="/shop">Shop Mysore Pak</Link>
                </Button>
                <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-6 text-sm font-medium tracking-wide">
                  <Link to="/our-story">Explore Our Story</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Hero3D />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Introduction */}
      <section className="section-padding bg-card">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">Our Heritage</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-6">A Sweet Legacy</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              Experience the legacy of Mysore Pak, a beloved South Indian sweet crafted with traditional recipes and premium ingredients. Every piece tells a story of Mysuru's rich culinary heritage.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: "https://images.unsplash.com/photo-1666190020777-6210676b2699?w=500&q=80", label: "Traditional Preparation" },
              { img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80", label: "Premium Packaging" },
              { img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80", label: "Store Experience" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative overflow-hidden rounded-xl group"
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 to-transparent flex items-end p-6">
                  <p className="font-heading text-lg font-semibold text-cream">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">Our Collection</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">Bestselling Sweets</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <motion.div {...fadeUp} className="text-center mt-12">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-5">
              <Link to="/shop">View All Products</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Collections */}
      <section className="section-padding bg-card">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">Explore</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">Our Collections</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link to="/shop" className="block relative overflow-hidden rounded-xl group aspect-[3/4]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/30 to-transparent flex items-end p-6">
                    <h3 className="font-heading text-xl font-bold text-cream">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">Visit Us</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-6">
                The Sweet Experience Store
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                World of Mysore Pak offers an immersive sweet experience where visitors can witness the preparation of Mysore Pak and explore multiple varieties. Step into our world and taste the tradition.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {["Live Kitchen", "Fresh Sweets", "Gift Packing"].map((label) => (
                  <div key={label} className="text-center p-4 bg-card rounded-lg border border-border">
                    <p className="font-heading text-xs font-semibold text-primary">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80" alt="Sweet preparation" className="rounded-xl object-cover w-full aspect-square" loading="lazy" />
              <img src="https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80" alt="Display counters" className="rounded-xl object-cover w-full aspect-square mt-8" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quality Promise */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">Our Quality Promise</h2>
            <p className="font-body text-secondary-foreground/70 mt-4 max-w-xl mx-auto">
              We use only the finest ingredients including premium ghee to deliver superior taste in every bite.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Droplets, title: "Pure Ghee Ingredients", desc: "Made with 100% pure ghee sourced from the finest dairies." },
              { icon: BookOpen, title: "Traditional Recipes", desc: "Recipes passed down through generations of master sweet-makers." },
              { icon: Sparkles, title: "Freshly Made", desc: "Every order is freshly prepared to ensure peak flavor and quality." },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{item.title}</h3>
                <p className="font-body text-sm text-secondary-foreground/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">Reviews</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">What Our Customers Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
