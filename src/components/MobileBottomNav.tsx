"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Store, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavItem = { label: string; to: string; icon: React.ComponentType<any> | null };
const navItems: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Story", to: "/our-story", icon: BookOpen },
  { label: "Shop", to: "/shop", icon: Store },
  { label: "Cart", to: "/cart", icon: null },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname?.startsWith(to);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBF7F0] border-t border-[#1B3A2D]/10 shadow-[0_-4px_20px_rgba(27,58,45,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {navItems.map(({ label, to, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              href={to}
              prefetch={true}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] relative select-none"
            >
              {active && (
                <motion.span
                  layoutId="mob-nav-pill"
                  className="absolute top-0 inset-x-0 mx-auto w-8 h-[2px] bg-[#C9972D] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative">
                {label === "Cart" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/cart icon.png"
                    alt="Cart"
                    className={`h-[28px] w-[28px] object-contain transition-opacity duration-200 ${
                      active ? "opacity-100" : "opacity-35"
                    }`}
                  />
                ) : Icon ? (
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors duration-200 ${
                      active ? "text-[#1B3A2D]" : "text-[#1B3A2D]/40"
                    }`}
                    strokeWidth={active ? 2.2 : 1.7}
                  />
                ) : null}
                {label === "Cart" && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C9972D] text-white text-[9px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center font-bold px-[3px] leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold font-body tracking-wider uppercase leading-none transition-colors duration-200 ${
                  active ? "text-[#1B3A2D]" : "text-[#1B3A2D]/40"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Account tab — placeholder until new auth is added */}
        <div className="flex-1 flex flex-col items-center justify-center gap-[3px] relative select-none">
          {isActive("/profile") && (
            <motion.span
              layoutId="mob-nav-pill"
              className="absolute top-0 inset-x-0 mx-auto w-8 h-[2px] bg-[#C9972D] rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Link href="/profile" className="flex flex-col items-center gap-[3px]">
            <User
              className={`h-[22px] w-[22px] transition-colors duration-200 ${isActive("/profile") ? "text-[#1B3A2D]" : "text-[#1B3A2D]/40"}`}
              strokeWidth={isActive("/profile") ? 2.2 : 1.7}
            />
            <span
              className={`text-[10px] font-semibold font-body tracking-wider uppercase leading-none transition-colors duration-200 ${
                isActive("/profile") ? "text-[#1B3A2D]" : "text-[#1B3A2D]/40"
              }`}
            >
              Account
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
