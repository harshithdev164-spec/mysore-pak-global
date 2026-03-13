"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Instagram, Facebook, Twitter, ArrowUpRight } from "lucide-react";
import { TilePatternBg } from "@/components/TilePattern";

const Footer = () => (
  <footer className="relative overflow-hidden">
    {/* Main Footer */}
    <div className="relative bg-[#152E23] py-16 overflow-hidden">
      <TilePatternBg color="#2D5A3D" opacity={0.18} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/logo.jpeg"
                alt="World of Mysore Pak"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#C9972D]/30"
              />
              <div>
                <h3 className="font-heading text-sm font-bold text-[#FBF7F0] leading-tight uppercase tracking-wider">
                  World of
                </h3>
                <p className="font-heading text-base font-bold text-[#C9972D] leading-tight -mt-0.5">
                  Mysore Pak
                </p>
              </div>
            </div>
            <p className="text-[#FBF7F0]/50 font-body text-sm leading-relaxed max-w-xs mb-6">
              Preserving the heritage of Mysore Pak with authentic flavors, pure ghee, and traditional recipes —
              bringing Mysuru's sweetness to the world.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full bg-[#FBF7F0]/5 border border-[#FBF7F0]/10 flex items-center justify-center hover:bg-[#C9972D]/20 hover:border-[#C9972D]/30 transition-all duration-300"
                >
                  <Icon className="w-4 h-4 text-[#FBF7F0]/60" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-5 text-[#C9972D]">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", to: "/shop" },
                { label: "Bestsellers", to: "/shop" },
                { label: "Gift Boxes", to: "/shop" },
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

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-5 text-[#C9972D]">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Our Story", to: "/our-story" },
                { label: "The Process", to: "/our-story" },
                { label: "Our Founders", to: "/our-story" },
                { label: "Blog", to: "/" },
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
                <MapPin className="w-4 h-4 text-[#C9972D] mt-0.5 flex-shrink-0" />
                <span className="text-[#FBF7F0]/50 text-sm font-body">
                  Mysuru, Karnataka, India 570001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C9972D] flex-shrink-0" />
                <a href="mailto:info@worldofmysorepak.com" className="text-[#FBF7F0]/50 text-sm font-body hover:text-[#FBF7F0] transition-colors">
                  info@worldofmysorepak.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C9972D] flex-shrink-0" />
                <a href="tel:+919876543210" className="text-[#FBF7F0]/50 text-sm font-body hover:text-[#FBF7F0] transition-colors">
                  +91 98765 43210
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-[#FBF7F0]/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#FBF7F0]/30 text-xs font-body">
              © {new Date().getFullYear()} World of Mysore Pak. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service", "Shipping"].map((item) => (
                <a key={item} href="#" className="text-[#FBF7F0]/30 text-xs font-body hover:text-[#FBF7F0]/50 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
