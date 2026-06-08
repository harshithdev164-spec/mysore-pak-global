"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, StarHalf, Gift, ChefHat, Flame, Truck, CheckCircle2, Package, Award, Sparkles, Heart, Instagram } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { testimonials } from "@/data/products";
import type { Product } from "@/data/products";

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
    weights: (p.weights ?? []).map((w: { id: string; label: string; price: number; stock_quantity: number }) => ({
      id: w.id,
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



const INSTAGRAM_POSTS = [
  { src: "/A bite that begins with a crunch and ends in nostalgia.Golden samosa perfection folded with slo.jpg",   caption: "A bite that begins with a crunch and ends in nostalgia. Golden samosa perfection folded with love." },
  { src: "/A royal crunch of tradition in every bite — our Avarekal Mixture is your perfect festive snack .jpg",   caption: "A royal crunch of tradition in every bite. Our Avarekal Mixture is your perfect festive snack." },
  { src: "/Golden, soft, and irresistibly rich, our Motichur Laddoos are crafted to turn every moment into.jpg",   caption: "Golden, soft, and irresistibly rich, our Motichur Laddoos are crafted to turn every moment into magic." },
  { src: "/One for you, one for me Because happiness is sweeter when shared.[Premium Indian sweets, Tradit.jpg",   caption: "One for you, one for me. Because happiness is sweeter when shared. Premium Indian sweets, tradition." },
];



/* ══════════════════════════════════════════
   INSTAGRAM POST CARD
   ══════════════════════════════════════════ */
function InstaCard({ post }: { post: { src: string; caption: string } }) {
  return (
    <a
      href="https://www.instagram.com/worldofmysorepakofficial?igsh=MThheDhvMXUyazhrYw=="
      target="_blank"
      rel="noopener noreferrer"
      className="group relative w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden flex-shrink-0 border border-[#2D5A3D]/10 cursor-pointer block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.src}
        alt={post.caption}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#1B3A2D]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-white/90 font-body text-xs text-center line-clamp-4 leading-relaxed">{post.caption}</p>
      </div>
      {/* Instagram badge */}
      <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
        <Instagram className="w-3.5 h-3.5 text-[#C9972D]" />
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════
   MOTION HELPERS
   ══════════════════════════════════════════ */
// Opacity-only animations — GPU composited, no layout recalculation
const fadeUp = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45 },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-40px" },
};

/* ══════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Index = ({ initialFeatured = [] }: { initialFeatured?: any[] }) => {
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollBottom = window.scrollY + window.innerHeight;
      const threshold = document.body.scrollHeight - 320;
      const isNear = scrollBottom >= threshold;
      setNearFooter((prev) => (prev === isNear ? prev : isNear));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Order server-fetched products to match FEATURED_SLUGS order.
  // Slugs must match what `app/page.tsx` fetches from the DB (the long SEO form).
  const featured = useMemo<Product[]>(() => {
    const FEATURED_SLUGS = [
      "buy-special-mysore-pak-online",
      "buy-carrot-mysore-pak-online",
      "buy-hazelnut-dark-chocolate-online",
      "buy-milk-chocolate-online",
      "buy-badam-halwa-almond-online",
      "buy-soft-soan-cake-online",
    ];
    const mapped = initialFeatured.map(mapApiProduct);
    // Order by the FEATURED_SLUGS list; if a slug isn't found, fall back to
    // whatever the server returned so the section never stays in skeleton state.
    const ordered = FEATURED_SLUGS
      .map((slug) => mapped.find((p) => p.slug === slug))
      .filter(Boolean) as Product[];
    return ordered.length > 0 ? ordered : mapped;
  }, [initialFeatured]);

  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════════
          HERO — Full-bleed banner
      ══════════════════════════════════════════ */}
      {/* Mobile: fixed-height e-commerce banner | Desktop: full-screen hero */}
      <section className="relative h-[70vh] sm:h-screen min-h-[320px] sm:min-h-[640px] overflow-hidden select-none">
        {/* Hero image — CSS-based responsive swap, no JS flash */}
        <div className="absolute inset-x-0 bottom-0 top-[4rem] sm:top-[5.5rem]">
          {/* Mobile image — hidden on sm+ */}
          <Image
            src="/mobile heroo.webp"
            alt="World of Mysore Pak"
            fill
            priority
            className="block sm:hidden object-contain object-center"
            sizes="100vw"
          />
          {/* Desktop image — hidden below sm */}
          <Image
            src="/pc heroo.webp"
            alt="World of Mysore Pak"
            fill
            priority
            className="hidden sm:block object-cover object-center"
            sizes="100vw"
          />
        </div>

      </section>

      {/* ── Tagline bridge ── */}
      <div className="relative bg-[#FBF7F0] py-6 overflow-hidden select-none">
        {/* Left/right edge fades so it dissolves into adjacent sections */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FBF7F0] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FBF7F0] to-transparent pointer-events-none z-10" />

        <div className="relative z-20 flex items-center justify-center gap-3 sm:gap-10 px-4">
          {/* Decorative side rule */}
          <svg width="60" height="12" viewBox="0 0 60 12" className="hidden sm:block opacity-30 shrink-0">
            <line x1="0" y1="6" x2="44" y2="6" stroke="#C9972D" strokeWidth="1" />
            <path d="M48 6 L54 2 L60 6 L54 10 Z" fill="#C9972D" />
          </svg>

          {["Authentic", "Traditional", "Pure"].map((word, i) => (
            <div key={word} className="flex items-center gap-3 sm:gap-10 shrink-0">
              <span className="font-body text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.4em] text-[#1B3A2D]">{word}</span>
              {i < 2 && (
                <svg width="8" height="8" viewBox="0 0 10 10" className="flex-shrink-0">
                  <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#C9972D" />
                </svg>
              )}
            </div>
          ))}

          {/* Decorative side rule — mirrored */}
          <svg width="60" height="12" viewBox="0 0 60 12" className="hidden sm:block opacity-30 shrink-0" style={{ transform: "scaleX(-1)" }}>
            <line x1="0" y1="6" x2="44" y2="6" stroke="#C9972D" strokeWidth="1" />
            <path d="M48 6 L54 2 L60 6 L54 10 Z" fill="#C9972D" />
          </svg>
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <section className="pt-6 pb-8 sm:pt-8 sm:pb-10 bg-[#FBF7F0] relative overflow-hidden">
        {/* Warm radial glow — same accent as products section */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, #C9972D12 0%, transparent 70%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65 }}
            className="text-center mb-4"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-2 block font-semibold">Explore</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D]">
              Shop by <span className="text-[#C9972D]">Category</span>
            </h2>
          </motion.div>

          {/* Single whileInView on the container — staggerChildren handles the cascade */}
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-12 lg:gap-x-16 justify-items-center"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {[
              { name: "Mysore Pak",  slug: "mysore-pak",  img: "/mysoree paak.png",   accent: "#C9972D" },
              { name: "Gift Boxes",  slug: "gift-boxes",  img: "/Gift Boxes.webp",   accent: "#C4512A" },
              { name: "Ghee Sweets", slug: "ghee-sweets", img: "/Ghee sweets.webp",  accent: "#1B3A2D" },
              { name: "Namkeens",    slug: "namkeens",    img: "/Namkeen.webp",       accent: "#1B3A2D" },
              { name: "Chocolates",  slug: "chocolates",  img: "/chocolates.webp",     accent: "#C9972D" },
              { name: "Specials",    slug: "specials",    img: "/specials.webp",      accent: "#C4512A" },
            ].map((cat) => (
              <motion.div
                key={cat.slug}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }}
              >
                <Link href={`/shop?category=${cat.slug}`} className="group flex flex-col items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.07, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
                    style={{ boxShadow: `0 0 0 3px ${cat.accent}28` }}
                  >
                    <Image
                      src={cat.img}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 80px, 128px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `${cat.accent}22` }}
                    />
                  </motion.div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-body text-[11px] sm:text-sm font-bold text-[#1B3A2D] tracking-wide group-hover:text-[#C9972D] transition-colors duration-300 text-center leading-tight">
                      {cat.name}
                    </span>
                    <span
                      className="block h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-300"
                      style={{ backgroundColor: cat.accent }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══ */}
      <section className="pt-8 pb-16 sm:pt-10 sm:pb-20 bg-[#FBF7F0] relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-3 block font-semibold">Most Loved</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D] mb-5">
              Taste the <span className="text-[#C9972D]">Tradition</span>
            </h2>
            <Link href="/shop" className="inline-flex items-center gap-2 text-[#1B3A2D] font-body text-sm font-bold border-b-2 border-[#C9972D] pb-0.5 hover:text-[#C9972D] transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-200/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* ══ HOW IT'S MADE — PROCESS VIDEOS ══ */}
      <section className="py-20 sm:py-28 bg-[#FBF7F0] relative overflow-hidden section-lazy section-gpu">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-3 block font-semibold">The Process</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D]">
              Crafted with <span className="text-[#C9972D]">Care</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-14 relative">
            {/* Connector line — runs through video circle centres */}
            <div className="hidden lg:block absolute top-[6.5rem] left-[14%] right-[14%] h-px bg-gradient-to-r from-transparent via-[#C9972D]/40 to-transparent pointer-events-none" />

            {[
              { step: "01", title: "Sweet Foundation",  desc: "Sugar and water are slowly cooked to form the perfect syrup, the foundation of every great Mysore Pak.", accent: "#F5B800", video: "/video1.MOV" },
              { step: "02", title: "Besan Magic",       desc: "Finely sifted gram flour is gently mixed in, creating a rich and smooth consistency.",                          accent: "#C9972D", video: "/video2.MOV" },
              { step: "03", title: "Ghee Indulgence",   desc: "Pure, aromatic ghee is poured in, giving the Mysore Pak its signature richness and melt-in-the-mouth texture.", accent: "#1B3A2D", video: "/video3.MOV" },
              { step: "04", title: "Final Craft",       desc: "The mixture is carefully set, cooled, and cut into perfectly crafted pieces.",                                   accent: "#C4512A", video: "/video4.MOV" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-4"
              >
                {/* Circular video */}
                <div className="relative flex-shrink-0">
                  {/* Outer decorative ring */}
                  <div
                    className="absolute -inset-1.5 rounded-full opacity-25 border-2"
                    style={{ borderColor: item.accent }}
                  />
                  <div
                    className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-xl border-2"
                    style={{ borderColor: `${item.accent}50` }}
                  >
                    <video
                      key={item.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      preload="none"
                      src={item.video}
                    />
                  </div>
                  {/* Step badge */}
                  <div
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10"
                    style={{ backgroundColor: item.accent }}
                  >
                    <span className="font-body text-[9px] font-black text-white">{item.step}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#1B3A2D] mb-1.5">{item.title}</h3>
                  <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COLLECTIONS ══ */}
      <section className="py-20 sm:py-28 bg-[#FBF7F0] relative section-lazy">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4"
          >
            <div>
              <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-3 block font-semibold">Explore</span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D]">
                Our <span className="text-[#C9972D]">Collections</span>
              </h2>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-[#1B3A2D] font-body text-sm font-bold border-b-2 border-[#C9972D] pb-0.5 hover:text-[#C9972D] transition-colors">
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { img: "/mysoree paak.png",  name: "Classic Mysore Pak",    sub: "The original, perfected"     },
              { img: "/Gift Boxes.webp",  name: "Premium Gift Hampers",  sub: "For every celebration"       },
              { img: "/specials.webp",    name: "Artisan Specials",      sub: "Limited seasonal drops"      },
              { img: "/chocolates.webp",   name: "Flavored Collection",   sub: "Bold new combinations"       },
            ].map((col, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (i % 2) * 0.1 }}
              >
                <Link href="/shop" className="group block relative overflow-hidden rounded-2xl aspect-video">
                  <Image src={col.img} alt={col.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A2D]/85 via-[#1B3A2D]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#FBF7F0] mb-1">{col.name}</h3>
                    <p className="font-body text-xs text-[#C9972D] uppercase tracking-wider mb-3">{col.sub}</p>
                    <div className="flex items-center gap-1 text-[#FBF7F0]/50 group-hover:text-[#C9972D] group-hover:gap-2 transition-all duration-300">
                      <span className="font-body text-xs uppercase tracking-wider">Shop Collection</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GOOGLE REVIEWS ══ */}
      <section className="py-24 sm:py-32 overflow-hidden relative section-lazy section-gpu" style={{ background: "linear-gradient(160deg, #0F2318 0%, #1B3A2D 40%, #152B21 100%)" }}>
        {/* Gold top border line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />
        {/* Gold bottom border line */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />

        {/* Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            {/* Ornament */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(90deg, transparent, #C9972D)" }} />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9972D]/30" style={{ background: "rgba(201,151,45,0.08)" }}>
                <svg width="16" height="16" viewBox="0 0 48 48" className="flex-shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="font-body text-[11px] uppercase tracking-[0.3em] text-[#C9972D] font-semibold">Verified Google Reviews</span>
              </div>
              <div className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(90deg, #C9972D, transparent)" }} />
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FBF7F0]">
              Loved by <span style={{ background: "linear-gradient(90deg, #C9972D, #E8B84B, #C9972D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Sweet Lovers</span>
            </h2>

            {/* Rating display */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="font-heading text-5xl font-bold" style={{ color: "#E8B84B" }}>4.5</span>
              <div className="flex flex-col items-start gap-1">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#FBBC05] text-[#FBBC05]" />
                  ))}
                  <StarHalf className="w-5 h-5 fill-[#FBBC05] text-[#FBBC05]" />
                </div>
                <span className="font-body text-xs text-[#FBF7F0]/50 tracking-wide">Based on 3.5k+ Google reviews</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Single review strip */}
        <div className="relative scroll-strip-wrap">
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #1B3A2D, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, #1B3A2D, transparent)" }} />
          <div className="flex gap-5 animate-photo-scroll" style={{ width: "max-content" }}>
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="w-80 sm:w-96 flex-shrink-0 rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: "rgba(251,247,240,0.06)",
                  border: "1px solid rgba(201,151,45,0.2)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(201,151,45,0.1)",
                }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md"
                      style={{ backgroundColor: t.avatarBg }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-[#FBF7F0] leading-tight">{t.name}</p>
                      <p className="font-body text-[11px] text-[#FBF7F0]/40 leading-tight mt-0.5">{t.time}</p>
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0 opacity-90">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" />
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px w-full" style={{ background: "linear-gradient(90deg, rgba(201,151,45,0.3), transparent)" }} />

                {/* Review text */}
                <p className="font-body text-sm text-[#FBF7F0]/75 leading-relaxed line-clamp-3">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* View on Google CTA */}
        <div className="text-center mt-12">
          <motion.a
            href="https://share.google/WJfPSrgZKS7MyEJ5v"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 font-body text-sm font-semibold text-[#1B3A2D] px-7 py-3 rounded-full transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #C9972D, #E8B84B)", boxShadow: "0 4px 20px rgba(201,151,45,0.35)" }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            View all reviews on Google
          </motion.a>
        </div>
      </section>

      {/* ══ INSTAGRAM — EVERY PIXEL TELLS A STORY ══ */}
      <motion.section
        animate={{ opacity: nearFooter ? 0 : 1, y: nearFooter ? 24 : 0, pointerEvents: nearFooter ? "none" : "auto" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="py-20 sm:py-28 bg-[#FBF7F0] overflow-hidden relative section-lazy">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-3 block font-semibold">@worldofmysorepak</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D]">
              Every Pixel <span className="text-[#C9972D]">Tells a Story.</span>
            </h2>
            <p className="font-body text-muted-foreground mt-3 text-sm sm:text-base">Tap in. Follow us on Instagram.</p>
          </motion.div>
        </div>

        {/* Row 1 — scrolls right */}
        <div className="relative mb-3 scroll-strip-wrap">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#FBF7F0] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#FBF7F0] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-4 animate-photo-scroll" style={{ width: "max-content" }}>
            {[...INSTAGRAM_POSTS, ...INSTAGRAM_POSTS].map((post, i) => (
              <InstaCard key={i} post={post} />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.instagram.com/worldofmysorepakofficial?igsh=MThheDhvMXUyazhrYw=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm font-bold text-[#1B3A2D] hover:text-[#C9972D] transition-colors"
          >
            Follow our journey <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.section>

    </div>
  );
};

export default Index;
