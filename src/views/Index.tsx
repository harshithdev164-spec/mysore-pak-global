"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Gift, ChefHat, Flame, Truck, CheckCircle2, Package, Award, Sparkles, Heart, Instagram } from "lucide-react";
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



const INSTAGRAM_POSTS = [
  { src: "/Mysore Pak.webp",   likes: "2.4k", caption: "The golden beauty of freshly made Mysore Pak ✨ Pure ghee, pure love." },
  { src: "/Ghee Sweets.webp",  likes: "1.8k", caption: "Melt-in-mouth ghee sweets made fresh every day 🍯" },
  { src: "/Gift Boxes.webp",   likes: "4.2k", caption: "Festival season is gift season 🎁 Premium hampers, now available." },
  { src: "/Namkeen.webp",      likes: "3.1k", caption: "Crunchy, spicy, irresistible — our Namkeen range 🤍 #WorldOfMysorePak" },
  { src: "/Choclates.webp",    likes: "2.9k", caption: "Where tradition meets indulgence 📸 Our chocolate collection." },
  { src: "/Specials.webp",     likes: "1.6k", caption: "Limited specials — crafted for the season 💛 Order yours today." },
  { src: "/story 5.webp",      likes: "3.5k", caption: "From Mysuru, to your home 🏠 Authentic taste, everywhere." },
];



/* ══════════════════════════════════════════
   INSTAGRAM POST CARD
   ══════════════════════════════════════════ */
function InstaCard({ post }: { post: { src: string; likes: string; caption: string } }) {
  return (
    <a
      href="https://www.instagram.com/worldofmysorepak"
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
        <div className="flex items-center gap-1.5 text-white">
          <Heart className="w-4 h-4 fill-white" />
          <span className="font-body text-sm font-bold">{post.likes}</span>
        </div>
        <p className="text-white/80 font-body text-xs text-center line-clamp-3 leading-relaxed">{post.caption}</p>
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
const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    // Try featured products first; fall back to newest 6 if none are starred
    fetch("/api/products?featured=true&limit=6")
      .then((r) => r.json())
      .then((j) => {
        if (j.data && j.data.length > 0) {
          setFeatured(j.data.map(mapApiProduct));
        } else {
          return fetch("/api/products?limit=6")
            .then((r) => r.json())
            .then((j2) => { if (j2.data) setFeatured(j2.data.map(mapApiProduct)); });
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════════
          HERO — Full-bleed banner
      ══════════════════════════════════════════ */}
      {/* Mobile: fixed-height e-commerce banner | Desktop: full-screen hero */}
      <section className="relative h-[70vh] sm:h-screen min-h-[320px] sm:min-h-[640px] overflow-hidden select-none">
        {/* Image — Ken Burns on desktop only (expensive on mobile) */}
        <motion.div
          initial={{ scale: isMobile ? 1 : 1.04 }}
          animate={{ scale: 1 }}
          transition={isMobile ? { duration: 0 } : { duration: 6, ease: "linear" }}
          className="absolute inset-x-0 bottom-0 top-[4rem] sm:top-[5.5rem]"
        >
          <Image
            src="/hero 1.jpeg"
            alt="World of Mysore Pak"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>

        {/* Gradient overlay — stronger on mobile for text legibility */}
        <div className="absolute inset-x-0 bottom-0 top-[4rem] sm:top-[5.5rem] bg-gradient-to-b from-black/40 via-black/10 to-black/70 sm:from-black/30 sm:via-transparent sm:to-black/55" />

        {/* Mobile-only: brand headline overlaid in centre */}
        <div className="sm:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 px-6 text-center pointer-events-none">
          <h1 className="font-heading text-3xl font-bold text-white leading-tight drop-shadow-lg">
            World of<br />Mysore Pak
          </h1>
          <p className="font-body text-xs text-white/80 mt-1">Pure Ghee Sweets from Mysuru</p>
        </div>

        {/* CTA — pinned to bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="absolute bottom-6 sm:bottom-14 inset-x-0 flex justify-center items-center gap-3 px-4"
        >
          <Link
            href="/shop"
            className="btn-glow inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-body text-sm font-bold tracking-wide shadow-lg shadow-black/30 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#1B3A2D", color: "#FBF7F0" }}
          >
            Shop Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/our-story"
            className="inline-flex items-center gap-1.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-body text-sm font-semibold tracking-wide border-2 border-white/40 text-white hover:border-white/70 transition-colors"
          >
            Our Story
          </Link>
        </motion.div>
      </section>

      {/* ── Tagline bridge ── */}
      <div className="relative bg-[#FBF7F0] py-6 overflow-hidden select-none">
        {/* Left/right edge fades so it dissolves into adjacent sections */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FBF7F0] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FBF7F0] to-transparent pointer-events-none z-10" />

        <div className="relative z-20 flex items-center justify-center gap-5 sm:gap-10">
          {/* Decorative side rule */}
          <svg width="60" height="12" viewBox="0 0 60 12" className="hidden sm:block opacity-30">
            <line x1="0" y1="6" x2="44" y2="6" stroke="#C9972D" strokeWidth="1" />
            <path d="M48 6 L54 2 L60 6 L54 10 Z" fill="#C9972D" />
          </svg>

          {["Authentic", "Handcrafted", "Pure"].map((word, i) => (
            <div key={word} className="flex items-center gap-5 sm:gap-10">
              <span className="font-body text-[11px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#1B3A2D]">{word}</span>
              {i < 2 && (
                <svg width="10" height="10" viewBox="0 0 10 10" className="flex-shrink-0">
                  <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#C9972D" />
                </svg>
              )}
            </div>
          ))}

          {/* Decorative side rule — mirrored */}
          <svg width="60" height="12" viewBox="0 0 60 12" className="hidden sm:block opacity-30" style={{ transform: "scaleX(-1)" }}>
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
              { name: "Mysore Pak",  slug: "mysore-pak",  img: "/Mysore Pak.webp",   accent: "#C9972D" },
              { name: "Ghee Sweets", slug: "ghee-sweets", img: "/Ghee Sweets.webp",  accent: "#1B3A2D" },
              { name: "Gift Boxes",  slug: "gift-boxes",  img: "/Gift Boxes.webp",   accent: "#C4512A" },
              { name: "Namkeens",    slug: "namkeens",    img: "/Namkeen.webp",       accent: "#1B3A2D" },
              { name: "Chocolates",  slug: "chocolates",  img: "/Choclates.webp",     accent: "#C9972D" },
              { name: "Specials",    slug: "specials",    img: "/Specials.webp",      accent: "#C4512A" },
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
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* ══ VIRTUAL TOUR ══ */}
      <section className="py-10 sm:py-20 bg-[#1B3A2D] relative overflow-hidden section-lazy section-gpu">
        <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-6 sm:mb-10"
          >
            <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-2 block font-semibold">Immersive Experience</span>
            <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-[#FBF7F0] mb-2 sm:mb-4">
              Step Inside Our <span className="text-[#C9972D]">Sweet Shop</span>
            </h2>
            <p className="font-body text-[#FBF7F0]/50 text-xs sm:text-base max-w-sm sm:max-w-md mx-auto leading-relaxed">
              Take a virtual walk through our store — explore every corner of World of Mysore Pak.
            </p>
          </motion.div>

          {/* Tour embed frame — tall on mobile, 16:9 on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-[#C9972D]/25 shadow-2xl shadow-black/40"
          >
            {/* Mobile: fixed tall height. Desktop: 16:9 */}
            <div className="h-[70vh] sm:h-auto sm:aspect-video">
              <iframe
                src="/World of Mysore Pak_HTML_Package/index.html"
                className="w-full h-full border-0"
                allow="fullscreen; gyroscope; accelerometer"
                loading="lazy"
                title="360° Virtual Tour — World of Mysore Pak"
              />
            </div>
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(201,151,45,0.15)" }} />
          </motion.div>

          {/* Caption row — hidden on mobile to reduce clutter */}
          <div className="hidden sm:flex items-center justify-between gap-4 mt-5 px-1">
            <div className="flex items-center gap-2 text-[#FBF7F0]/40">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 3 C4.2 3 2 5.2 2 8 C2 10.8 4.2 13 7 13 C9.8 13 12 10.8 12 8 C12 5.2 9.8 3 7 3Z" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
                <path d="M2 7 Q5 6 7 7 Q9 8 12 7" stroke="currentColor" strokeWidth="0.8" />
              </svg>
              <span className="font-body text-xs">360° Immersive View</span>
            </div>
            <span className="font-body text-[11px] text-[#FBF7F0]/25 uppercase tracking-[0.25em]">Mysuru · Karnataka · India</span>
            <div className="flex items-center gap-2 text-[#FBF7F0]/40">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M9 7 L12 5 L12 9 Z" fill="currentColor" opacity="0.6" />
              </svg>
              <span className="font-body text-xs">HD Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT'S MADE — PROCESS VIDEOS ══ */}
      <section className="py-20 sm:py-28 bg-[#FBF7F0] relative overflow-hidden section-lazy">
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

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-14 relative"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Connector line — runs through video circle centres */}
            <div className="hidden lg:block absolute top-[6.5rem] left-[14%] right-[14%] h-px bg-gradient-to-r from-transparent via-[#C9972D]/40 to-transparent pointer-events-none" />

            {[
              { step: "01", title: "Source Pure Ghee",     desc: "100% pure ghee from trusted Karnataka dairies — the soul of every piece.",                  accent: "#F5B800", video: "" },
              { step: "02", title: "Traditional Recipe",   desc: "Master confectioners follow century-old recipes, mixing besan into golden ghee.",             accent: "#C9972D", video: "" },
              { step: "03", title: "Cooked to Perfection", desc: "Slow-cooked until it hits the perfect melt-in-mouth texture Mysore Pak is famous for.",      accent: "#1B3A2D", video: "" },
              { step: "04", title: "Packed & Dispatched",  desc: "Sealed and sent the same day so you get it at its absolute freshest.",                        accent: "#C4512A", video: "" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }}
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
                    {/* ── REPLACE src="" WITH YOUR VIDEO FILE WHEN READY ── */}
                    <video
                      src={item.video || undefined}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ display: item.video ? "block" : "none" }}
                    />
                    {/* Placeholder shown until real video is added */}
                    {!item.video && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${item.accent}22 0%, ${item.accent}44 100%)` }}
                      >
                        {/* Play icon */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: item.accent }}
                        >
                          <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4 ml-0.5">
                            <path d="M6 4l10 6-10 6V4z" />
                          </svg>
                        </div>
                        <span className="font-body text-[9px] uppercase tracking-[0.2em] text-[#1B3A2D]/50">Video coming soon</span>
                      </div>
                    )}
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
              </motion.div>
            ))}
          </motion.div>
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
              { img: "/Mysore Pak.webp",  name: "Classic Mysore Pak",    sub: "The original, perfected"     },
              { img: "/Gift Boxes.webp",  name: "Premium Gift Hampers",  sub: "For every celebration"       },
              { img: "/Specials.webp",    name: "Artisan Specials",      sub: "Limited seasonal drops"      },
              { img: "/Choclates.webp",   name: "Flavored Collection",   sub: "Bold new combinations"       },
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
              <span className="font-heading text-5xl font-bold" style={{ color: "#E8B84B" }}>5.0</span>
              <div className="flex flex-col items-start gap-1">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#FBBC05] text-[#FBBC05]" />
                  ))}
                </div>
                <span className="font-body text-xs text-[#FBF7F0]/50 tracking-wide">Based on all Google reviews</span>
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
            href="https://www.google.com/maps/search/World+of+Mysore+Pak"
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
      <section className="py-20 sm:py-28 bg-[#FBF7F0] overflow-hidden relative section-lazy">
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
            href="https://www.instagram.com/worldofmysorepak"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm font-bold text-[#1B3A2D] hover:text-[#C9972D] transition-colors"
          >
            Follow our journey <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

    </div>
  );
};

export default Index;
