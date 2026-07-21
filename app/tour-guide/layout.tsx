import type { Metadata } from "next";

// The /tour-guide page is a "use client" component and can't export metadata
// itself. This layout wraps it with the per-route SEO title, description and
// canonical so /tour-guide isn't stuck reusing the homepage's metadata.
export const metadata: Metadata = {
  title: "Mysuru Travel Guide - Palace, Zoo, Chamundi Hills & Hidden Gems",
  description:
    "A curated Mysuru travel guide with directions, timings, entry fees and photo spots for Mysore Palace, Chamundi Hills, GRS Fantasy Park, Ranganathittu and 20+ other places to visit.",
  alternates: { canonical: "/tour-guide" },
  openGraph: {
    title: "Mysuru Travel Guide - Palace, Zoo, Chamundi Hills & Hidden Gems",
    description:
      "A curated Mysuru travel guide with directions, timings and photo spots for Mysore Palace, Chamundi Hills, GRS Fantasy Park, Ranganathittu and 20+ other places to visit.",
    url: "https://www.worldofmysorepak.com/tour-guide",
    type: "website",
  },
};

export default function TourGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
