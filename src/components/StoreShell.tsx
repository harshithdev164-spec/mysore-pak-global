"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import VideoPopup from "./VideoPopup";
// In-website ChatBot replaced by the FloatingWhatsApp button (rendered
// globally in app/layout.tsx) which links straight to our WhatsApp Business
// bot at +91 63648 95293.

const ANNOUNCEMENT_ITEMS = [
  "For Orders Within Mysore · Order via Swiggy & Zomato",
  "Free Shipping on Orders Above ₹1999",
  "100% Pure Ghee",
  "Traditional Mysuru Recipe",
  "Fresh Daily Batches",
  "Gift Boxes Available",
  "Pan India Delivery",
];

const announcementContent =
  ANNOUNCEMENT_ITEMS.join(" ✦ ") + " ✦ ";

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTourGuide = pathname?.startsWith("/tour-guide");
  const isAdmin = pathname?.startsWith("/admin");
  // "Watch Our Story" auto-popup is for first-time landings on the homepage
  // only — everywhere else it's noise that interrupts the page goal.
  const isHome = pathname === "/";

  if (isAdmin || isTourGuide) return <>{children}</>;

  return (
    <>
      {/* Announcement bar — sits above navbar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-8 bg-[#1B3A2D] text-[#FBF7F0] overflow-hidden flex items-center select-none">
        <div
          className="flex whitespace-nowrap animate-marquee"
          style={{ "--marquee-duration": "28s" } as React.CSSProperties}
        >
          <span className="font-body text-[11px] tracking-[0.18em] uppercase font-medium px-4">
            {announcementContent}
          </span>
          <span className="font-body text-[11px] tracking-[0.18em] uppercase font-medium px-4" aria-hidden>
            {announcementContent}
          </span>
        </div>
      </div>

      <Navbar />
      <main className="min-h-screen pt-8">{children}</main>
      <Footer />
      {isHome && <VideoPopup />}
    </>
  );
}
