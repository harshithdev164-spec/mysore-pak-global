"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBasket, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Our Story", to: "/our-story" },
  { label: "Shop", to: "/shop" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const pathname = usePathname();

  return (
    <nav className="fixed top-8 left-0 right-0 z-50 bg-[#FBF7F0] shadow-sm shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-22">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
              <img
                src="/logo.jpeg"
                alt="World of Mysore Pak"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#C9972D]/30 shadow-md"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-heading text-sm font-bold text-[#1B3A2D] leading-tight uppercase tracking-wider">
                  World of
                </span>
                <span className="font-heading text-base font-bold text-[#C9972D] leading-tight -mt-0.5">
                  Mysore Pak
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.to} href={link.to} className="relative group">
                <span
                  className={`font-body text-sm font-semibold tracking-wider uppercase transition-colors duration-300 ${
                    pathname === link.to
                      ? "text-[#1B3A2D]"
                      : "text-foreground/50 hover:text-[#1B3A2D]"
                  }`}
                >
                  {link.label}
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-[#C9972D] rounded-full"
                  initial={false}
                  animate={{ width: pathname === link.to ? "100%" : "0%" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ display: "block" }}
                />
                {pathname !== link.to && (
                  <span className="absolute -bottom-1 left-0 h-0.5 bg-[#C9972D]/30 rounded-full w-0 group-hover:w-full transition-all duration-300" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/cart"
                className="relative group flex items-center gap-2 bg-[#1B3A2D] text-[#FBF7F0] px-4 py-2.5 rounded-full hover:bg-[#2D5A3D] transition-all duration-300 shadow-md"
              >
                <ShoppingBasket className="h-4 w-4" />
                <span className="font-body text-xs font-semibold tracking-wide hidden sm:inline">
                  Cart
                </span>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-[#C9972D] text-[#1B3A2D] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold absolute -top-1.5 -right-1.5"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[#1B3A2D]/5 hover:bg-[#1B3A2D]/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5 text-[#1B3A2D]" />
              ) : (
                <Menu className="h-5 w-5 text-[#1B3A2D]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-[#FBF7F0] border-t border-border/30 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 px-4 rounded-xl font-body text-base font-semibold tracking-wide transition-all duration-300 ${
                      pathname === link.to
                        ? "text-[#1B3A2D] bg-[#1B3A2D]/5"
                        : "text-foreground/50 hover:text-[#1B3A2D] hover:bg-[#1B3A2D]/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
