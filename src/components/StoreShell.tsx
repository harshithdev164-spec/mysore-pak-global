"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import VideoPopup from "./VideoPopup";
import PurchaseNotification from "./PurchaseNotification";
// In-website ChatBot replaced by the FloatingWhatsApp button (rendered
// globally in app/layout.tsx) which links straight to our WhatsApp Business
// bot at +91 63648 95293.

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
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      {isHome && <VideoPopup />}
      {/* Purchase notification toasts — self-throttles per route + per session */}
      <PurchaseNotification />
    </>
  );
}
