"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Star, Gift, ChefHat, Flame, Truck, CheckCircle2, Package, Award, Sparkles, Heart, Instagram } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { TilePatternBg, FloralPatternBg } from "@/components/TilePattern";
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

/* ══════════════════════════════════════════
   SLIDE DATA
   ══════════════════════════════════════════ */
type SlideConfig = {
  bg: string;
  textColor: string;
  accentColor: string;
  eyebrow: string;
  line1: string;
  line2: string;
  product: string;
  cta: string;
  ctaHref: string;
  ctaBg: string;
  ctaTextColor: string;
  badge1: { text: string; rotate: number };
  badge2: { text: string; rotate: number };
  fullBanner?: boolean;
};

const SLIDES: SlideConfig[] = [
  {
    bg: "#F5B800",
    textColor: "#1B3A2D",
    accentColor: "#7A3200",
    eyebrow: "Our Signature",
    line1: "Crafted in",
    line2: "Pure Ghee.",
    product: "/hero%201.png",
    cta: "Shop Now",
    ctaHref: "/shop",
    ctaBg: "#1B3A2D",
    ctaTextColor: "#FBF7F0",
    badge1: { text: "100%\nPure Ghee", rotate: 14 },
    badge2: { text: "Since\nGenerations", rotate: -10 },
    fullBanner: true,
  },
  {
    bg: "#1B3A2D",
    textColor: "#FBF7F0",
    accentColor: "#C9972D",
    eyebrow: "The Classic",
    line1: "The Art of",
    line2: "Mysore Pak.",
    product: "/hero%202.png",
    cta: "Explore Flavors",
    ctaHref: "/shop",
    ctaBg: "#C9972D",
    ctaTextColor: "#1B3A2D",
    badge1: { text: "Traditional\nRecipe", rotate: 10 },
    badge2: { text: "Freshly\nMade", rotate: -12 },
    fullBanner: true,
  },
];


const INSTAGRAM_POSTS = [
  { src: "/hero-mysore-pak.png",   likes: "2.4k", caption: "The golden beauty of freshly made Mysore Pak ✨ Pure ghee, pure love." },
  { src: "/hero-preparation.png",  likes: "1.8k", caption: "Watch the magic happen 🍳 Our masters at work in the kitchen." },
  { src: "/hero-stack.png",        likes: "3.1k", caption: "The perfect stack. The perfect bite. 🤍 #MysorePak #WorldOfMysorePak" },
  { src: "/hero-gift-boxes.png",   likes: "4.2k", caption: "Festival season is gift season 🎁 Premium hampers, now available." },
  { src: "/hero-closeup.png",      likes: "2.9k", caption: "Up close with perfection 📸 Every piece tells a story of craft." },
  { src: "/hero-giftbox.png",      likes: "1.6k", caption: "Wrapped with love, delivered with care 💛 Order yours today." },
  { src: "/brbrb.png",             likes: "3.5k", caption: "From Mysuru, to your home 🏠 Authentic taste, everywhere." },
];


/* ══════════════════════════════════════════
   STATIC SLIDE (previous slide, no animation)
   ══════════════════════════════════════════ */
function StaticSlide({ slide }: { slide: SlideConfig }) {
  if (slide.fullBanner) {
    return (
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.product}
          alt=""
          fetchPriority="high"
          className="absolute inset-x-0 bottom-0 top-[4.5rem] sm:top-[5.5rem] w-full object-cover"
          style={{ height: "calc(100% - 4.5rem)" }}
        />
        <div className="absolute inset-x-0 bottom-0 top-[4.5rem] sm:top-[5.5rem] bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col pt-[4.5rem] sm:pt-[5.5rem]">
      {/* Headline */}
      <div className="text-center pt-3 sm:pt-5 px-5 flex-none">
        <p
          className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2"
          style={{ color: slide.textColor, opacity: 0.55 }}
        >
          {slide.eyebrow}
        </p>
        <h1 className="font-body font-black uppercase leading-[0.86]" aria-hidden>
          <span
            className="block text-[clamp(2.6rem,5vw,6rem)] tracking-tighter"
            style={{ color: slide.textColor }}
          >
            {slide.line1}
          </span>
          <span
            className="block text-[clamp(3.8rem,7.5vw,8.5rem)] tracking-tighter"
            style={{ color: slide.accentColor }}
          >
            {slide.line2}
          </span>
        </h1>
      </div>

      {/* Product — fetchPriority=high marks this as the LCP element */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.product}
          alt=""
          fetchPriority="high"
          className="w-auto object-contain"
          style={{
            maxHeight: "min(46vh, 400px)",
            filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.32))",
          }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ANIMATED SLIDE (current slide, with animations)
   ══════════════════════════════════════════ */
function AnimatedSlide({ slide }: { slide: SlideConfig }) {
  if (slide.fullBanner) {
    return (
      <div className="absolute inset-0">
        {/* Full-bleed banner — starts below navbar */}
        <motion.img
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: "linear" }}
          src={slide.product}
          alt={`${slide.line1} ${slide.line2}`}
          className="absolute inset-x-0 bottom-0 top-[4.5rem] sm:top-[5.5rem] w-full object-cover"
          style={{ height: "calc(100% - 4.5rem)" }}
        />
        <div className="absolute inset-x-0 bottom-0 top-[4.5rem] sm:top-[5.5rem] bg-gradient-to-b from-black/30 via-transparent to-black/55" />

        {/* CTA only — pinned to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="absolute bottom-10 sm:bottom-14 inset-x-0 flex justify-center items-center gap-3 px-4"
        >
          <Link
            href={slide.ctaHref}
            className="btn-glow inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full font-body text-sm font-bold tracking-wide shadow-lg shadow-black/30 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: slide.ctaBg, color: slide.ctaTextColor }}
          >
            {slide.cta}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {slide.ctaHref !== "/our-story" && (
            <Link
              href="/our-story"
              className="inline-flex items-center gap-1.5 px-6 sm:px-8 py-3 rounded-full font-body text-sm font-semibold tracking-wide border-2 border-white/40 text-white hover:border-white/70 transition-colors"
            >
              Our Story
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col pt-[4.5rem] sm:pt-[5.5rem]">
      {/* Top: headline */}
      <div className="text-center pt-3 sm:pt-5 px-5 flex-none">
        {/* Eyebrow */}
        <div className="overflow-hidden mb-2">
          <motion.p
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 0.55 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] uppercase tracking-[0.4em] font-bold"
            style={{ color: slide.textColor }}
          >
            {slide.eyebrow}
          </motion.p>
        </div>

        {/* Line 1 */}
        <h1 className="font-body font-black uppercase leading-[0.86]">
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: "115%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.88, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block text-[clamp(2.6rem,5vw,6rem)] tracking-tighter"
              style={{ color: slide.textColor }}
            >
              {slide.line1}
            </motion.span>
          </div>

          {/* Line 2 — larger, accent color */}
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: "115%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.88, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="block text-[clamp(3.8rem,7.5vw,8.5rem)] tracking-tighter"
              style={{ color: slide.accentColor }}
            >
              {slide.line2}
            </motion.span>
          </div>
        </h1>
      </div>

      {/* Middle: Product + floating badge stickers */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center px-4">
        <motion.img
          initial={{ scale: 0.78, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          src={slide.product}
          alt={`${slide.line1} ${slide.line2}`}
          className="w-auto object-contain relative z-10"
          style={{
            maxHeight: "min(46vh, 400px)",
            filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.32))",
          }}
        />

        {/* Badge sticker 1 — top right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: slide.badge1.rotate }}
          transition={{ duration: 0.55, delay: 0.68, type: "spring", stiffness: 260, damping: 17 }}
          className="absolute top-2 right-3 sm:top-6 sm:right-10 lg:right-28 z-20 pointer-events-none"
        >
          <div
            className="w-[62px] h-[62px] sm:w-[76px] sm:h-[76px] rounded-full flex flex-col items-center justify-center shadow-xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.93)",
              border: `2.5px solid ${slide.accentColor}50`,
            }}
          >
            <span
              className="text-[7px] sm:text-[8.5px] font-black uppercase text-center leading-tight whitespace-pre-line px-2"
              style={{ color: slide.textColor }}
            >
              {slide.badge1.text}
            </span>
          </div>
        </motion.div>

        {/* Badge sticker 2 — bottom left */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: slide.badge2.rotate }}
          transition={{ duration: 0.55, delay: 0.82, type: "spring", stiffness: 260, damping: 17 }}
          className="absolute bottom-2 left-3 sm:bottom-6 sm:left-10 lg:left-28 z-20 pointer-events-none"
        >
          <div
            className="w-[62px] h-[62px] sm:w-[76px] sm:h-[76px] rounded-full flex flex-col items-center justify-center shadow-xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.93)",
              border: `2.5px solid ${slide.accentColor}50`,
            }}
          >
            <span
              className="text-[7px] sm:text-[8.5px] font-black uppercase text-center leading-tight whitespace-pre-line px-2"
              style={{ color: slide.textColor }}
            >
              {slide.badge2.text}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom: CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.48 }}
        className="flex-none pb-6 sm:pb-8 flex justify-center items-center gap-3 px-4"
      >
        <Link
          href={slide.ctaHref}
          className="btn-glow inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full font-body text-sm font-bold tracking-wide shadow-lg shadow-black/20 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: slide.ctaBg, color: slide.ctaTextColor }}
        >
          {slide.cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {slide.ctaHref !== "/our-story" && (
          <Link
            href="/our-story"
            className="inline-flex items-center gap-1.5 px-6 sm:px-8 py-3 rounded-full font-body text-sm font-semibold tracking-wide border-2 hover:opacity-75 transition-opacity"
            style={{
              borderColor: slide.ctaBg + "70",
              color: slide.textColor,
              opacity: 0.85,
            }}
          >
            Our Story
          </Link>
        )}
      </motion.div>
    </div>
  );
}

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
   MOTION HELPERS FOR BELOW-HERO SECTIONS
   ══════════════════════════════════════════ */
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7 },
};

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

/* ══════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════ */
const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=6")
      .then((r) => r.json())
      .then((j) => { if (j.data) setFeatured(j.data.map(mapApiProduct)); })
      .catch(console.error);
  }, []);

  const [current, setCurrent]     = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const hasTransitioned           = useRef(false);

  const goTo = useCallback(
    (idx: number) => {
      if (idx === current) return;
      hasTransitioned.current = true;
      setPrevSlide(current);
      setCurrent(idx);
    },
    [current]
  );

  /* Auto-advance every 5 s */
  useEffect(() => {
    const id = setInterval(() => goTo((current + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, [current, goTo]);

  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════════
          HERO — Brars-style: solid bg + big headline
                 + centered product + floating badges
      ══════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] overflow-hidden select-none">

        {/* ── Layer 1: Previous slide (static base, fully visible) ── */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: SLIDES[prevSlide].bg }}
        >
          <StaticSlide slide={SLIDES[prevSlide]} />
        </div>

        {/* ── Layer 2: Current slide — full content inside circle reveal ── */}
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            className="absolute inset-0"
            style={{ backgroundColor: SLIDES[current].bg }}
            initial={{
              clipPath: hasTransitioned.current
                ? "circle(0% at 50% 50%)"
                : "circle(150% at 50% 50%)",
            }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(150% at 50% 50%)", transition: { duration: 0 } }}
            transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
          >
            <AnimatedSlide slide={SLIDES[current]} />
          </motion.div>
        </AnimatePresence>

        {/* ── Layer 3: Dot navigation (always above, never clipped) ── */}
        <div className="absolute bottom-0 left-0 right-0 z-50 pb-3 flex flex-col items-center gap-2 pointer-events-none">
          {/* Slide counter */}
          <span className="font-body text-[10px] tracking-widest tabular-nums" style={{ color: SLIDES[current].textColor, opacity: 0.45 }}>
            0{current + 1} / 0{SLIDES.length}
          </span>

          {/* Dots */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative overflow-hidden rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "2.75rem" : "0.6rem",
                  height: "0.6rem",
                  backgroundColor:
                    i === current
                      ? SLIDES[current].textColor + "30"
                      : SLIDES[current].textColor + "40",
                }}
              >
                {i === current && (
                  <div
                    key={`prog-${current}`}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      backgroundColor: SLIDES[current].ctaBg,
                      animation: "fill-progress 5s linear forwards",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tagline bridge ── */}
      <div className="relative bg-[#FBF7F0] py-6 overflow-hidden select-none">
        <TilePatternBg opacity={0.06} />
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
        <TilePatternBg opacity={0.06} />
        {/* Warm radial glow — same accent as products section */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, #C9972D12 0%, transparent 70%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65 }}
            className="text-center mb-4"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-2 block font-semibold">Explore</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D]">
              Shop by <span className="text-[#C9972D]">Category</span>
            </h2>
          </motion.div>

          <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12 lg:gap-16">
            {[
              { name: "Mysore Pak",  slug: "mysore-pak",  img: "/hero-mysore-pak.png",   accent: "#C9972D" },
              { name: "Ghee Sweets", slug: "ghee-sweets", img: "/hero-preparation.png",  accent: "#1B3A2D" },
              { name: "Gift Boxes",  slug: "gift-boxes",  img: "/hero-gift-boxes.png",   accent: "#C4512A" },
              { name: "Namkeens",    slug: "namkeens",    img: "/hero-giftbox.png",       accent: "#1B3A2D" },
              { name: "Chocolates",  slug: "chocolates",  img: "/hero-closeup.png",       accent: "#C9972D" },
              { name: "Specials",    slug: "specials",    img: "/hero-stack.png",         accent: "#C4512A" },
            ].map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.07 }}
              >
                <Link href={`/shop?category=${cat.slug}`} className="group flex flex-col items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.07, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    className="relative w-[6.5rem] h-[6.5rem] sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-400"
                    style={{ boxShadow: `0 0 0 3px ${cat.accent}28` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.img}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover tint ring */}
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `${cat.accent}22` }}
                    />
                  </motion.div>
                  {/* Name pill */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-body text-xs sm:text-sm font-bold text-[#1B3A2D] tracking-wide group-hover:text-[#C9972D] transition-colors duration-300 text-center">
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
          </div>
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══ */}
      <section className="pt-8 pb-16 sm:pt-10 sm:pb-20 bg-[#FBF7F0] relative">
        <TilePatternBg opacity={0.06} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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
      <section className="py-16 sm:py-24 bg-[#1B3A2D] relative overflow-hidden">
        <TilePatternBg opacity={0.08} color="#ffffff" />
        {/* Corner ornaments */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 Q50 12 38 38 Q12 50 0 0Z" fill="#C9972D" />
            <path d="M0 0 Q12 50 38 38 Q50 12 0 0Z" fill="#C9972D" opacity="0.6" />
            <circle cx="55" cy="55" r="6" fill="#C9972D" opacity="0.3" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 Q50 12 38 38 Q12 50 0 0Z" fill="#C9972D" />
            <path d="M0 0 Q12 50 38 38 Q50 12 0 0Z" fill="#C9972D" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 Q50 12 38 38 Q12 50 0 0Z" fill="#FBF7F0" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none scale-[-1]">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 Q50 12 38 38 Q12 50 0 0Z" fill="#FBF7F0" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-3 block font-semibold">Immersive Experience</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FBF7F0] mb-4">
              Step Inside Our <span className="text-[#C9972D]">Sweet Shop</span>
            </h2>
            <p className="font-body text-[#FBF7F0]/55 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Take a virtual walk through our kitchen — see where every piece of Mysore Pak is born.
            </p>
          </motion.div>

          {/* Tour embed frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden border border-[#C9972D]/25 shadow-2xl shadow-black/40"
            style={{ aspectRatio: "16/9" }}
          >
            {/* ── INSERT VIRTUAL TOUR EMBED HERE ── */}
            {/* Replace this placeholder div with your <iframe> or tour component */}
            <div className="absolute inset-0 bg-[#0E2218] flex flex-col items-center justify-center gap-5">
              {/* Camera / 360° icon */}
              <div className="w-20 h-20 rounded-full border-2 border-[#C9972D]/40 flex items-center justify-center bg-[#C9972D]/10">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
                  <circle cx="24" cy="24" r="10" stroke="#C9972D" strokeWidth="2" />
                  <circle cx="24" cy="24" r="4" fill="#C9972D" opacity="0.7" />
                  <path d="M24 6 C14 6 6 14 6 24 C6 34 14 42 24 42 C34 42 42 34 42 24 C42 14 34 6 24 6Z" stroke="#C9972D" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                  <path d="M6 24 Q14 20 24 24 Q34 28 42 24" stroke="#C9972D" strokeWidth="1.5" opacity="0.35" />
                  <path d="M8 18 Q16 22 24 18 Q32 14 40 18" stroke="#C9972D" strokeWidth="1" opacity="0.25" />
                  <path d="M8 30 Q16 26 24 30 Q32 34 40 30" stroke="#C9972D" strokeWidth="1" opacity="0.25" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-body text-[#C9972D] text-sm font-bold uppercase tracking-[0.2em] mb-1">360° Virtual Tour</p>
                <p className="font-body text-[#FBF7F0]/35 text-xs tracking-wide">Tour embed coming soon</p>
              </div>
            </div>
            {/* Decorative gold border glow */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(201,151,45,0.2)" }} />
          </motion.div>

          {/* Bottom caption row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1"
          >
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
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT'S MADE — PROCESS VIDEOS ══ */}
      <section className="py-20 sm:py-28 bg-[#FBF7F0] relative overflow-hidden">
        <TilePatternBg opacity={0.06} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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
              { step: "01", title: "Source Pure Ghee",     desc: "100% pure ghee from trusted Karnataka dairies — the soul of every piece.",                  accent: "#F5B800", video: "" },
              { step: "02", title: "Traditional Recipe",   desc: "Master confectioners follow century-old recipes, mixing besan into golden ghee.",             accent: "#C9972D", video: "" },
              { step: "03", title: "Cooked to Perfection", desc: "Slow-cooked until it hits the perfect melt-in-mouth texture Mysore Pak is famous for.",      accent: "#1B3A2D", video: "" },
              { step: "04", title: "Packed & Dispatched",  desc: "Sealed and sent the same day so you get it at its absolute freshest.",                        accent: "#C4512A", video: "" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
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
          </div>
        </div>
      </section>

      {/* ══ COLLECTIONS ══ */}
      <section className="py-20 sm:py-28 bg-[#FBF7F0] relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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
              { img: "/hero-mysore-pak.png",  no: "01", name: "Classic Mysore Pak",    sub: "The original, perfected"     },
              { img: "/hero-gift-boxes.png",  no: "02", name: "Premium Gift Hampers",  sub: "For every celebration"       },
              { img: "/hero-preparation.png", no: "03", name: "Artisan Specials",      sub: "Limited seasonal drops"      },
              { img: "/hero-closeup.png",     no: "04", name: "Flavored Collection",   sub: "Bold new combinations"       },
            ].map((col, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (i % 2) * 0.1 }}
              >
                <Link href="/shop" className="group block relative overflow-hidden rounded-2xl aspect-video">
                  <img src={col.img} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A2D]/85 via-[#1B3A2D]/20 to-transparent" />
                  <span className="absolute top-5 left-5 font-heading text-6xl font-black text-white/15 group-hover:text-white/25 transition-colors duration-500 leading-none">{col.no}</span>
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
      <section className="py-24 sm:py-32 overflow-hidden relative" style={{ background: "linear-gradient(160deg, #0F2318 0%, #1B3A2D 40%, #152B21 100%)" }}>
        <TilePatternBg opacity={0.08} color="#ffffff" />

        {/* Gold top border line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />
        {/* Gold bottom border line */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />

        {/* Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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
      <section className="py-20 sm:py-28 bg-[#FBF7F0] overflow-hidden relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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

      {/* ══ FINAL CTA ══ */}
      <section className="py-20 sm:py-32 relative forest-gradient overflow-hidden">
        <TilePatternBg opacity={0.1} color="#ffffff" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <img src="/logo.jpeg" alt="World of Mysore Pak" className="w-20 h-20 rounded-full mx-auto mb-8 border-2 border-[#C9972D]/40 shadow-xl" />
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-6xl font-bold text-[#FBF7F0] mb-8 leading-tight">
              Ready to Taste <span className="text-[#C9972D]">Tradition?</span>
            </h2>
            <p className="font-body text-[#FBF7F0]/60 text-base sm:text-lg max-w-lg mx-auto mb-12 leading-relaxed">
              Order now and experience the authentic taste of Mysuru&apos;s finest Mysore Pak, delivered fresh to your doorstep.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-[#C9972D] text-[#1B3A2D] px-10 py-5 rounded-full font-body text-base font-bold tracking-wide hover:bg-[#DAA520] transition-all duration-300 shadow-xl shadow-black/20"
            >
              Order Now <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
