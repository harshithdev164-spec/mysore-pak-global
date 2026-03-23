"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Our Story", to: "/our-story" },
  { label: "Shop", to: "/shop" },
];

const Navbar = () => {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-8 left-0 right-0 z-50 bg-[#FBF7F0] shadow-sm shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 sm:h-28">

            {/* Left — hamburger (mobile) / nav links (desktop) */}
            <div className="flex-1 flex items-center">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#1B3A2D]/8 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen
                  ? <X className="h-5 w-5 text-[#1B3A2D]" />
                  : <Menu className="h-5 w-5 text-[#1B3A2D]" />
                }
              </button>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-10">
                {navLinks.map((link) => (
                  <Link key={link.to} href={link.to} prefetch={true} className="relative group">
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
            </div>

            {/* Centre — Logo */}
            <div className="flex-shrink-0 flex justify-center">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <motion.img
                  src="/logo.svg"
                  alt="World of Mysore Pak"
                  whileHover={{ scale: 1.04 }}
                  className="h-16 sm:h-[66px] w-auto object-contain"
                />
              </Link>
            </div>

            {/* Right — cart (both) + auth (desktop) */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
              {/* Cart — visible on both mobile and desktop */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/cart"
                  className="flex flex-col items-center gap-0.5 px-1 py-1"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/cart icon.png"
                      alt="Cart"
                      className="h-[52px] w-[52px] md:h-9 md:w-9 object-contain drop-shadow-sm"
                    />
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-[#C9972D] text-[#1B3A2D] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold absolute -top-1 -right-1"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </div>
                  <span className="font-body text-[10px] font-semibold tracking-wide text-[#1B3A2D]">
                    Cart
                  </span>
                </Link>
              </motion.div>

              {/* Auth — desktop only */}
              <div className="hidden md:flex items-center">
                <Show when="signed-out">
                  <SignInButton mode="redirect">
                    <button className="flex items-center gap-1.5 font-body text-xs font-semibold text-[#1B3A2D]/60 hover:text-[#1B3A2D] transition-colors px-3 py-2.5 rounded-full hover:bg-[#1B3A2D]/5">
                      <User className="h-4 w-4" />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/profile"
                    className={`font-body text-xs font-semibold tracking-wider uppercase transition-colors duration-300 mr-3 ${
                      pathname === "/profile" ? "text-[#1B3A2D]" : "text-foreground/50 hover:text-[#1B3A2D]"
                    }`}
                  >
                    My Orders
                  </Link>
                  <UserButton />
                </Show>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed top-[calc(2rem+5rem)] left-0 right-0 z-40 bg-[#FBF7F0] border-b border-[#1B3A2D]/10 shadow-lg md:hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`font-body text-base font-semibold tracking-wider uppercase py-3 border-b border-[#1B3A2D]/6 transition-colors ${
                      pathname === link.to ? "text-[#1B3A2D]" : "text-[#1B3A2D]/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Auth section in mobile menu */}
                <div className="pt-4">
                  <Show when="signed-out">
                    <SignInButton mode="redirect">
                      <button
                        className="w-full flex items-center gap-2 font-body text-sm font-semibold text-[#1B3A2D]/60 hover:text-[#1B3A2D] transition-colors py-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Sign In
                      </button>
                    </SignInButton>
                  </Show>
                  <Show when="signed-in">
                    <div className="flex items-center gap-3">
                      <UserButton />
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="font-body text-sm font-semibold text-[#1B3A2D]/60 hover:text-[#1B3A2D] transition-colors"
                      >
                        My Orders
                      </Link>
                    </div>
                  </Show>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
