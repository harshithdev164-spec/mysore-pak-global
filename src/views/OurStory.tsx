"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WOMPBg } from "@/components/TilePattern";
import { founders } from "@/data/products";

function GoldStar({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className="flex-shrink-0">
      <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#C9972D" />
    </svg>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="h-px flex-1 max-w-[5rem]" style={{ background: "linear-gradient(90deg, transparent, #C9972D)" }} />
      <GoldStar size={7} />
      <div className="h-px w-6" style={{ background: "#C9972D" }} />
      <GoldStar size={11} />
      <div className="h-px w-6" style={{ background: "#C9972D" }} />
      <GoldStar size={7} />
      <div className="h-px flex-1 max-w-[5rem]" style={{ background: "linear-gradient(90deg, #C9972D, transparent)" }} />
    </div>
  );
}

const TIMELINE = [
  {
    year: "1980s",
    era: "The Beginning",
    text: "A dream took root in the lanes of Mysuru — to preserve and share the authentic taste of Mysore Pak with the world. Three women, united by heritage and a love for sweets, began their quiet revolution.",
    accent: "#C9972D",
  },
  {
    year: "2005",
    era: "The Recipe",
    text: "After years of research alongside master sweet-makers and rigorous testing, the signature World of Mysore Pak formula was born — using only single-origin ghee and heritage besan.",
    accent: "#E8B84B",
  },
  {
    year: "2018",
    era: "The Launch",
    text: "World of Mysore Pak opened its doors in Mysuru. An immersive sweet experience store that felt more like a heritage gallery than a sweet shop — and the world took notice.",
    accent: "#C9972D",
  },
  {
    year: "Today",
    era: "Going Global",
    text: "With innovation in flavors and premium gifting, the brand now reaches sweet lovers across India and the globe, carrying the warmth of Mysuru wherever it goes.",
    accent: "#E8B84B",
  },
];

const PILLARS = [
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="20" cy="20" r="17" stroke="#C9972D" strokeWidth="1.5" />
        <path d="M20 8 L22 14 L28 14 L23.5 18 L25.5 24 L20 20.5 L14.5 24 L16.5 18 L12 14 L18 14 Z" fill="#C9972D" opacity="0.85" />
      </svg>
    ),
    title: "Heritage First",
    text: "Every recipe traces back to the royal kitchens of Mysuru. We guard these traditions with reverence and pass them on with pride.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M20 4 C20 4 10 12 10 22 C10 28 14.5 32 20 32 C25.5 32 30 28 30 22 C30 12 20 4 20 4Z" stroke="#C9972D" strokeWidth="1.5" />
        <path d="M20 12 C20 12 14 17 14 22 C14 25.3 16.7 28 20 28 C23.3 28 26 25.3 26 22 C26 17 20 12 20 12Z" fill="#C9972D" opacity="0.22" />
        <circle cx="20" cy="22" r="3" fill="#C9972D" opacity="0.65" />
      </svg>
    ),
    title: "Uncompromised Purity",
    text: "100% pure ghee, zero shortcuts. Our ingredients are sourced from trusted Karnataka dairies — the same ones used for generations.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M20 34 C20 34 6 26 6 17 C6 12 9.6 8 14 8 C16.5 8 18.8 9.3 20 11.2 C21.2 9.3 23.5 8 26 8 C30.4 8 34 12 34 17 C34 26 20 34 20 34Z" stroke="#C9972D" strokeWidth="1.5" />
        <path d="M20 30 C20 30 9 23.5 9 17 C9 13.7 11.4 11 14 11 C16 11 17.8 12.2 19 14 L20 15.5 L21 14 C22.2 12.2 24 11 26 11 C28.6 11 31 13.7 31 17 C31 23.5 20 30 20 30Z" fill="#C9972D" opacity="0.18" />
      </svg>
    ),
    title: "Made with Love",
    text: "Every batch is handcrafted by artisans who have spent decades perfecting their craft. This isn't just production — it's devotion.",
  },
];

const CORNER_POSITIONS = ["top-8 left-8", "top-8 right-8 scale-x-[-1]", "bottom-8 left-8 scale-y-[-1]", "bottom-8 right-8 scale-[-1]"];

const OurStory = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <div className="overflow-hidden">

      {/* ══ HERO ══ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0A1A10 0%, #1B3A2D 45%, #0F2318 100%)" }}
      >
        <WOMPBg opacity={0.5} light />

        {/* Giant watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
          <span
            className="font-heading font-black uppercase leading-none"
            style={{ fontSize: "clamp(5rem, 22vw, 22rem)", color: "rgba(201,151,45,0.045)", letterSpacing: "-0.03em" }}
          >
            MYSURU
          </span>
        </div>

        {/* Corner ornaments */}
        {CORNER_POSITIONS.map((pos, i) => (
          <svg key={i} width="56" height="56" viewBox="0 0 56 56" className={`absolute ${pos} opacity-30`} fill="none">
            <path d="M0 0 L0 20 M0 0 L20 0" stroke="#C9972D" strokeWidth="1.5" />
            <path d="M0 0 Q20 4 16 16 Q4 20 0 0Z" fill="#C9972D" opacity="0.3" />
            <circle cx="20" cy="20" r="2" fill="#C9972D" opacity="0.5" />
          </svg>
        ))}

        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />

        {/* Hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#C9972D]/30 mb-10"
            style={{ background: "rgba(201,151,45,0.08)" }}
          >
            <GoldStar size={7} />
            <span className="font-body text-[11px] uppercase tracking-[0.35em] text-[#C9972D] font-semibold">Est. in the Heart of Mysuru</span>
            <GoldStar size={7} />
          </motion.div>

          <div className="overflow-hidden mb-1">
            <motion.h1
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading font-black leading-[0.88] tracking-tight text-[#FBF7F0]"
              style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
            >
              A Sweet
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading font-black leading-[0.88] tracking-tight"
              style={{
                fontSize: "clamp(3.5rem, 10vw, 9rem)",
                background: "linear-gradient(90deg, #C9972D, #E8B84B 50%, #C9972D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Legacy.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="font-body text-[#FBF7F0]/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          >
            From the royal kitchens of Mysuru to every corner of the world — this is the story of tradition, devotion, and the perfect piece of Mysore Pak.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.72 }}
            className="flex items-center justify-center gap-3 text-[#C9972D]/60"
          >
            <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, #C9972D)" }} />
            <span className="font-body text-xs uppercase tracking-[0.3em]">Mysuru · Karnataka · India</span>
            <div className="h-px w-12" style={{ background: "linear-gradient(90deg, #C9972D, transparent)" }} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#FBF7F0]/25">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#C9972D]/50 to-transparent" />
        </motion.div>
      </section>

      {/* ══ THE SOUL ══ */}
      <section className="py-24 sm:py-32 bg-[#FBF7F0] relative overflow-hidden">
        <WOMPBg opacity={0.45} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -top-5 -left-5 right-5 bottom-5 rounded-3xl border border-[#C9972D]/20" style={{ background: "rgba(201,151,45,0.03)" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-mysore-pak.png"
              alt="Mysore Pak — The Soul of Mysuru"
              className="relative w-full h-80 sm:h-[480px] object-cover rounded-3xl shadow-2xl"
            />
            {/* Floating badge */}
            <div
              className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl border border-[#C9972D]/20"
              style={{ background: "linear-gradient(135deg, #1B3A2D, #2D5A3D)" }}
            >
              <span className="font-heading text-3xl font-black text-[#C9972D] leading-none">100%</span>
              <span className="font-body text-[9px] uppercase tracking-[0.12em] text-[#FBF7F0]/60 mt-0.5">Pure Ghee</span>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <div>
              <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold">The Soul</span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D] mt-2 leading-tight">
                Born from the<br />
                <span style={{ background: "linear-gradient(90deg, #C9972D, #E8B84B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Kitchens of Royalty
                </span>
              </h2>
            </div>
            <GoldDivider />
            <p className="font-body text-[#1B3A2D]/70 leading-relaxed text-base sm:text-lg">
              Mysore Pak was first crafted in the royal kitchen of the Mysore Palace over a century ago. A happy accident — a confectioner experimenting with sugar, besan and ghee — and a legend was born.
            </p>
            <p className="font-body text-[#1B3A2D]/55 leading-relaxed text-sm sm:text-base">
              At World of Mysore Pak, we carry that same spirit. Every batch is made with the reverence of a craft passed down through generations, using the same three core ingredients — and nothing more.
            </p>
            <div className="border-l-2 border-[#C9972D] pl-5 py-1 mt-2">
              <p className="font-heading text-lg sm:text-xl font-bold text-[#1B3A2D] italic leading-snug">
                &ldquo;A sweet that carries the weight of history in every bite.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ TIMELINE ══ */}
      <section
        className="py-24 sm:py-32 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F2318 0%, #1B3A2D 50%, #152B21 100%)" }}
      >
        <WOMPBg opacity={0.5} light />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold">Milestones</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FBF7F0] mt-2">
              Our{" "}
              <span style={{ background: "linear-gradient(90deg, #C9972D, #E8B84B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Journey
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Center vertical line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden sm:block"
              style={{ background: "linear-gradient(180deg, transparent, #C9972D 8%, #C9972D 92%, transparent)" }}
            />

            <div className="flex flex-col gap-16">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Card */}
                  <div className={`sm:w-[45%] ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"} pl-12 sm:pl-0`}>
                    <span className="font-heading font-black leading-none block mb-1" style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", color: item.accent, opacity: 0.18 }}>
                      {item.year}
                    </span>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FBF7F0] mb-3">{item.era}</h3>
                    <p className="font-body text-sm text-[#FBF7F0]/60 leading-relaxed">{item.text}</p>
                  </div>

                  {/* Node */}
                  <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-1 sm:top-auto">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                      style={{
                        borderColor: item.accent,
                        background: "linear-gradient(135deg, #0F2318, #1B3A2D)",
                        boxShadow: `0 0 22px ${item.accent}35`,
                      }}
                    >
                      <GoldStar size={10} />
                    </div>
                  </div>

                  <div className="hidden sm:block sm:w-[45%]" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ THE CRAFT ══ */}
      <section className="py-24 sm:py-32 bg-[#FBF7F0] relative overflow-hidden">
        <WOMPBg opacity={0.4} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text — right on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:order-2"
          >
            <div>
              <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold">The Craft</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D] mt-2 leading-tight">
                Handcrafted,<br />
                <span className="text-[#C9972D]">Every Single Time.</span>
              </h2>
            </div>
            <GoldDivider />
            <p className="font-body text-[#1B3A2D]/70 leading-relaxed text-base">
              No machines. No shortcuts. Our sweet-makers slow-cook each batch in heavy-bottomed vessels, stirring by hand until the mixture hits that elusive, golden melt-in-mouth consistency.
            </p>
            <p className="font-body text-[#1B3A2D]/55 leading-relaxed text-sm">
              The process takes patience — sometimes hours for a single batch. But that patience is what makes the difference between ordinary and extraordinary.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[{ num: "100%", label: "Pure Ghee" }, { num: "3", label: "Ingredients" }, { num: "∞", label: "Generations" }].map((s, i) => (
                <div key={i} className="text-center py-4 rounded-xl border border-[#C9972D]/20" style={{ background: "rgba(201,151,45,0.04)" }}>
                  <span className="font-heading text-2xl font-black text-[#C9972D] block leading-tight">{s.num}</span>
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-[#1B3A2D]/50 mt-1 block">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image — left on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:order-1"
          >
            <div className="absolute -top-5 -right-5 left-5 bottom-5 rounded-3xl border border-[#C9972D]/20" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-preparation.png"
              alt="Our craftsmen at work"
              className="relative w-full h-80 sm:h-[480px] object-cover rounded-3xl shadow-2xl"
            />
            <div
              className="absolute top-5 left-5 px-4 py-2 rounded-full"
              style={{ background: "rgba(27,58,45,0.9)", border: "1px solid rgba(201,151,45,0.3)" }}
            >
              <span className="font-body text-xs font-semibold text-[#C9972D] uppercase tracking-wider">Handcrafted Daily</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ PILLARS ══ */}
      <section
        className="py-24 sm:py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F2318, #1B3A2D 50%, #0F2318)" }}
      >
        <WOMPBg opacity={0.5} light />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold">What We Stand For</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#FBF7F0] mt-2">
              Our{" "}
              <span style={{ background: "linear-gradient(90deg, #C9972D, #E8B84B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Pillars
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {PILLARS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="flex flex-col items-center text-center gap-5 p-8 rounded-2xl"
                style={{
                  background: "rgba(251,247,240,0.04)",
                  border: "1px solid rgba(201,151,45,0.15)",
                  boxShadow: "inset 0 1px 0 rgba(201,151,45,0.1)",
                }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(201,151,45,0.1)", border: "1px solid rgba(201,151,45,0.2)" }}
                >
                  {p.icon}
                </div>
                <h3 className="font-heading text-xl font-bold text-[#FBF7F0]">{p.title}</h3>
                <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, #C9972D, transparent)" }} />
                <p className="font-body text-sm text-[#FBF7F0]/60 leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOUNDERS ══ */}
      <section className="py-24 sm:py-32 bg-[#FBF7F0] relative overflow-hidden">
        <WOMPBg opacity={0.45} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-4"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold">The Visionaries</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B3A2D] mt-2">
              The Women Behind the <span className="text-[#C9972D]">Brand</span>
            </h2>
            <div className="flex justify-center mt-4">
              <GoldDivider />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {founders.map((founder, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.65, delay: i * 0.15 }}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow duration-500"
                    style={{ background: "linear-gradient(135deg, #1B3A2D, #2D5A3D)", border: "2px solid rgba(201,151,45,0.3)" }}
                  >
                    <span className="font-heading text-3xl font-black text-[#C9972D]">
                      {founder.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="absolute -inset-2 rounded-full border border-[#C9972D]/20 group-hover:border-[#C9972D]/50 transition-colors duration-500" />
                </div>

                <h3 className="font-heading text-xl font-bold text-[#1B3A2D] mb-1">{founder.name}</h3>
                <span
                  className="font-body text-xs uppercase tracking-[0.2em] font-semibold mb-4 px-4 py-1 rounded-full"
                  style={{ color: "#C9972D", background: "rgba(201,151,45,0.08)", border: "1px solid rgba(201,151,45,0.2)" }}
                >
                  {founder.role}
                </span>
                <div className="h-px w-10 mb-4" style={{ background: "linear-gradient(90deg, transparent, #C9972D, transparent)" }} />
                <p className="font-body text-sm text-[#1B3A2D]/60 leading-relaxed">{founder.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VISION ══ */}
      <section
        className="py-28 sm:py-40 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0A1A10 0%, #1B3A2D 50%, #0F2318 100%)" }}
      >
        <WOMPBg opacity={0.5} light />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }} />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden>
          <span
            className="font-heading font-black uppercase"
            style={{ fontSize: "clamp(5rem, 28vw, 26rem)", color: "rgba(201,151,45,0.03)", letterSpacing: "-0.04em", lineHeight: 1 }}
          >
            VISION
          </span>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="font-heading text-[7rem] text-center select-none mb-0"
              aria-hidden
              style={{ color: "rgba(201,151,45,0.2)", lineHeight: "0.6", fontFamily: "Georgia, serif" }}
            >
              &ldquo;
            </div>
            <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-[#FBF7F0] leading-relaxed">
              To build a global sweet experience brand that celebrates the rich culinary heritage of Mysuru — while innovating with modern flavors and unwavering devotion. Every piece of Mysore Pak carries the warmth, tradition, and love of our city.
            </p>
            <div className="flex items-center justify-center gap-3 mt-10">
              <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #C9972D)" }} />
              <GoldStar size={9} />
              <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold">Our Vision</span>
              <GoldStar size={9} />
              <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #C9972D, transparent)" }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-20 sm:py-28 bg-[#FBF7F0] relative overflow-hidden">
        <WOMPBg opacity={0.45} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpeg" alt="World of Mysore Pak" className="w-16 h-16 rounded-full mx-auto mb-8 border-2 border-[#C9972D]/30 shadow-lg" />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D] mb-5">
              Ready to Taste <span className="text-[#C9972D]">History?</span>
            </h2>
            <p className="font-body text-[#1B3A2D]/60 mb-10 text-base leading-relaxed max-w-md mx-auto">
              Experience the authentic taste of Mysuru&apos;s finest — delivered fresh to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-body text-sm font-bold text-[#1B3A2D]"
                  style={{ background: "linear-gradient(135deg, #C9972D, #E8B84B)", boxShadow: "0 4px 20px rgba(201,151,45,0.35)" }}
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <Link
                href="/shop?category=gift-boxes"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-body text-sm font-semibold text-[#1B3A2D] border-2 border-[#C9972D]/40 hover:border-[#C9972D] transition-colors duration-300"
              >
                Gift Someone Sweet
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OurStory;
