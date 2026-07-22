"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function GiftHampers() {
  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center">
      <section className="relative w-full overflow-hidden bg-[#1B3A2D] py-32 sm:py-40">
        {/* Golden radial accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 70% at 50% 40%, #C9972D22 0%, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 rounded-full bg-[#C9972D]/15 border border-[#C9972D]/30 mb-8"
          >
            <span className="font-body text-[11px] font-bold tracking-[0.3em] uppercase text-[#C9972D]">
              Coming Soon
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FBF7F0] leading-[1.05] mb-6"
          >
            Gift Boxes,{" "}
            <span className="text-[#C9972D]">on the way.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-body text-base sm:text-lg text-[#FBF7F0]/70 leading-relaxed max-w-xl mx-auto mb-10"
          >
            Our gift box collection is being put together with the same care as
            our sweets. Check back soon.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/shop"
              className="inline-block px-7 py-4 bg-[#C9972D] text-[#1B3A2D] font-body text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[#b8862a] transition-colors shadow-lg shadow-[#C9972D]/30"
            >
              Browse the shop meanwhile
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
