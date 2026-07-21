"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, StarHalf, Gift, ChefHat, Flame, Truck, CheckCircle2, Package, Award, Sparkles, Heart, Instagram } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import GoogleReviewsSection from "@/components/GoogleReviewsSection";
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
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);

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

  // Start the hero videos muted. Audio in the source file was causing playback
  // hitches on lower-end devices, so we drop it entirely — muted autoplay is
  // also the only mode all browsers unconditionally allow. iOS Safari checks
  // the muted DOM property + attribute + playsinline before autoplay decisions,
  // so we set all three defensively.
  useEffect(() => {
    [mobileVideoRef.current, desktopVideoRef.current].forEach((v) => {
      if (!v) return;
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      v.play().catch(() => { /* iOS Low Power Mode — poster/still frame shows */ });
    });
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
        {/* SEO-only H1 — visually hidden but present in the DOM so Google
            picks up the homepage's primary heading. The hero is a full-bleed
            video with no on-screen text, so a visible H1 would clutter the
            design. */}
        <h1 className="sr-only">
          World of Mysore Pak — Traditional Sweets from Mysuru Delivered Pan-India
        </h1>
        {/* Hero video — CSS-based responsive swap, no JS flash.
            Both videos autoplay muted + loop (browser requires muted for autoplay).
            Posters use the previous still images so nothing pops in blank while
            the .webm is downloading. */}
        <div className="absolute inset-x-0 bottom-0 top-[4rem] sm:top-[5.5rem]">
          {/* Mobile — vertical video, hidden on sm+ */}
          <video
            ref={mobileVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disableRemotePlayback
            aria-label="World of Mysore Pak"
            className="block sm:hidden absolute inset-0 w-full h-full object-cover object-center"
          >
            {/* Source in a child <source> — iOS is happier fetching this way than
                from a src attribute when combined with autoplay. */}
            <source src="/WOMP%20VERTICAL.webm" type="video/webm" />
          </video>
          {/* Desktop — landscape video, hidden below sm */}
          <video
            ref={desktopVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disableRemotePlayback
            aria-label="World of Mysore Pak"
            className="hidden sm:block absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src="/WOMP%20HERO.webm" type="video/webm" />
          </video>
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
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-20 bg-[#FBF7F0] relative overflow-hidden">
        {/* Warm radial glow — same accent as products section */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, #C9972D12 0%, transparent 70%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65 }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] mb-3 block font-semibold">Explore</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D]">
              Shop by <span className="text-[#C9972D]">Category</span>
            </h2>
            <p className="font-body text-sm text-[#1B3A2D]/55 mt-3 max-w-md mx-auto">
              Hand-picked traditions, from the original Mysore Pak to festive gift boxes.
            </p>
          </motion.div>

          {/* Mobile: horizontal snap-scroll with 3.2 items visible (peek for discoverability)
              Desktop: balanced 5-column grid centered with comfortable gutters */}
          <motion.div
            className="
              flex sm:grid sm:grid-cols-5
              overflow-x-auto sm:overflow-visible
              snap-x snap-mandatory sm:snap-none
              gap-5 sm:gap-6 lg:gap-8
              -mx-4 sm:mx-0 px-4 sm:px-0
              pb-4 sm:pb-0
              [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
            "
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {[
              { name: "Mysore Pak",  slug: "mysore-pak",  img: "/mysoree paak.png",   accent: "#C9972D" },
              { name: "Gift Boxes",  slug: "gift-boxes",  img: "/Gift Boxes.webp",   accent: "#C4512A" },
              { name: "Ghee Sweets", slug: "ghee-sweets", img: "/ghee-sweets.webp",  accent: "#1B3A2D" },
              { name: "Namkeens",    slug: "namkeens",    img: "/Namkeen.webp",       accent: "#1B3A2D" },
              { name: "Chocolates",  slug: "chocolates",  img: "/chocolates.webp",     accent: "#C9972D" },
            ].map((cat) => (
              <motion.div
                key={cat.slug}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                className="snap-start shrink-0 sm:shrink basis-[28%] sm:basis-auto min-w-[112px] sm:min-w-0"
              >
                <Link href={`/shop?category=${cat.slug}`} className="group flex flex-col items-center gap-3 sm:gap-4">
                  <motion.div
                    whileHover={{ scale: 1.06, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden bg-white shadow-md group-hover:shadow-xl transition-shadow duration-300"
                    style={{ boxShadow: `0 0 0 2px ${cat.accent}33, 0 8px 22px -10px ${cat.accent}55` }}
                  >
                    <Image
                      src={cat.img}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 96px, (max-width: 1024px) 128px, 144px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover wash — subtle tint of the accent colour */}
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `${cat.accent}1f` }}
                    />
                  </motion.div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="font-body text-[12px] sm:text-sm lg:text-[15px] font-bold text-[#1B3A2D] tracking-wide group-hover:text-[#C9972D] transition-colors duration-300 text-center leading-tight whitespace-nowrap">
                      {cat.name}
                    </span>
                    <span
                      className="block h-[2px] w-6 sm:w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: cat.accent }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile-only scroll hint — fades in then out, gives a visual cue you can swipe */}
          <div className="sm:hidden mt-2 flex justify-center gap-1 text-[#1B3A2D]/30">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
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
              { img: "/ghee-sweets.webp", name: "Ghee Sweet Selection",  sub: "Hand-stirred in copper"      },
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

      {/* ══ GOOGLE REVIEWS — live from Places API ══ */}
      <GoogleReviewsSection />

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
