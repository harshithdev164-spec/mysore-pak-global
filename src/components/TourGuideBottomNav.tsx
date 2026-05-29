"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map as MapIcon } from "lucide-react";

/**
 * Persistent bottom nav for the tour-guide section.
 * Two slots — Explore + Map. Renders only inside /tour-guide routes, mobile only.
 */
export default function TourGuideBottomNav() {
  const pathname = usePathname() ?? "";
  if (!pathname.startsWith("/tour-guide")) return null;

  const isMap = pathname.startsWith("/tour-guide/map");
  const isExplore = !isMap; // anything in tour-guide that isn't /map counts as explore

  return (
    <>
      {/* Spacer so content isn't hidden behind the nav */}
      <div className="h-24 lg:hidden" aria-hidden />

      <nav
        className="lg:hidden fixed bottom-3 left-3 right-3 z-50"
        aria-label="Tour guide navigation"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-[#1B3A2D]/10 shadow-2xl shadow-[#1B3A2D]/15 p-1.5 flex items-stretch gap-1.5">
          <NavTab
            href="/tour-guide"
            active={isExplore}
            icon={<Compass size={20} strokeWidth={isExplore ? 2.5 : 2} />}
            label="Explore"
          />
          <NavTab
            href="/tour-guide/map"
            active={isMap}
            icon={<MapIcon size={20} strokeWidth={isMap ? 2.5 : 2} />}
            label="Map"
          />
        </div>
      </nav>
    </>
  );
}

function NavTab({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[12px] font-bold tracking-wider uppercase transition-all duration-200 ${
        active
          ? "bg-[#1B3A2D] text-[#FBF7F0] shadow-md shadow-[#1B3A2D]/30"
          : "text-[#1B3A2D]/60 hover:text-[#1B3A2D] hover:bg-[#1B3A2D]/5"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
