"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Instagram, Facebook, Twitter, ArrowUpRight } from "lucide-react";

const Footer = () => (
  <footer className="relative overflow-hidden">

    {/* ── SVG DESIGN DIVIDER ── */}
    <div className="bg-[#FBF7F0] -mb-px">
      <img
        src="/footer iconn.svg"
        alt=""
        aria-hidden="true"
        className="w-full h-auto block"
      />
    </div>

    {/* ── MAIN FOOTER ── */}
    <div className="relative bg-[#152E23] pt-14 md:pt-4 pb-10 overflow-hidden">
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #C9972D 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

          {/* Brand */}
          <div className="md:col-span-4">
            <div className="mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="World of Mysore Pak"
                className="h-24 w-auto object-contain"
              />
            </div>
            <p className="text-[#FBF7F0]/45 font-body text-sm leading-relaxed max-w-xs mb-6">
              Preserving the heritage of Mysore Pak with authentic flavors, pure ghee, and
              traditional recipes — bringing Mysuru&apos;s sweetness to the world.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-full bg-[#FBF7F0]/5 border border-[#FBF7F0]/10 flex items-center justify-center hover:bg-[#C9972D]/20 hover:border-[#C9972D]/40 transition-all duration-300"
                >
                  <Icon className="w-4 h-4 text-[#FBF7F0]/55" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div className="md:col-span-2">
            <h4 className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-5 text-[#C9972D]">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", to: "/shop" },
                { label: "Bestsellers",  to: "/shop" },
                { label: "Gift Boxes",   to: "/shop" },
                { label: "New Arrivals", to: "/shop" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.to}
                    className="text-[#FBF7F0]/40 hover:text-[#FBF7F0] transition-colors text-sm font-body flex items-center gap-1 group"
                  >
                    {l.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-2">
            <h4 className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-5 text-[#C9972D]">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Our Story",  to: "/our-story" },
                { label: "Careers",   to: "/careers"   },
                { label: "The Process", to: "/our-story" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.to}
                    className="text-[#FBF7F0]/40 hover:text-[#FBF7F0] transition-colors text-sm font-body flex items-center gap-1 group"
                  >
                    {l.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-5 text-[#C9972D]">
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#C9972D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C9972D]" />
                </div>
                <span className="text-[#FBF7F0]/45 text-sm font-body leading-relaxed">
                  Mysuru, Karnataka, India 570001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#C9972D]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#C9972D]" />
                </div>
                <a href="mailto:contact@worldofmysore.com" className="text-[#FBF7F0]/45 text-sm font-body hover:text-[#FBF7F0] transition-colors">
                  contact@worldofmysore.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#C9972D]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#C9972D]" />
                </div>
                <a href="tel:+919876543210" className="text-[#FBF7F0]/45 text-sm font-body hover:text-[#FBF7F0] transition-colors">
                  +91 98765 43210
                </a>
              </li>
            </ul>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap gap-2">
              {["100% Pure Ghee", "Fresh Daily", "Pan-India Delivery"].map((badge) => (
                <span
                  key={badge}
                  className="font-body text-[10px] font-semibold text-[#C9972D] bg-[#C9972D]/8 border border-[#C9972D]/15 px-3 py-1 rounded-full uppercase tracking-wider"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-7 border-t border-[#FBF7F0]/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-[#FBF7F0]/25 text-xs font-body">
                © {new Date().getFullYear()} World of Mysore Pak. All rights reserved.
              </p>
              <span className="hidden sm:block text-[#FBF7F0]/10">·</span>
              <p className="text-[#FBF7F0]/25 text-xs font-body italic">
                Sweetness at your fingertips
              </p>
            </div>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service", "Shipping"].map((item) => (
                <a key={item} href="#" className="text-[#FBF7F0]/25 text-xs font-body hover:text-[#FBF7F0]/50 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Designed & developed by */}
          <div className="mt-5 pt-5 border-t border-[#FBF7F0]/5 flex items-center justify-center gap-2.5">
            <span className="font-body text-[11px] text-[#FBF7F0]/25 tracking-wide">
              Designed &amp; Developed by
            </span>
            <a href="https://www.adsnapproductions.in/" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Adsnap-05.svg"
                alt="Adsnap"
                className="h-7 w-auto object-contain opacity-40 hover:opacity-80 transition-opacity duration-300"
              />
            </a>
          </div>
        </div>
      </div>
    </div>

  </footer>
);

export default Footer;
