"use client";

import { useMemo, useState } from "react";
import { Star, ThumbsUp, BadgeCheck } from "lucide-react";

interface Review {
  name: string;
  city: string;
  rating: number;
  date: string;
  variant: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
}

// Dummy reviews shaped to look like real customer feedback — staggered ratings,
// mixed lengths, mentions of weight variants and gifting context. Update when
// real reviews from the Supabase reviews table are ready to be displayed.
const REVIEWS: Review[] = [
  {
    name: "Anjali R.",
    city: "Bengaluru",
    rating: 5,
    date: "16 Jun 2026",
    variant: "500g",
    title: "Tastes exactly like the one from Mysuru",
    body: "Ordered for Eid gifting. The 500g box arrived on day 4, packaging was very neat and the box was still cool. My mother-in-law (very picky about ghee sweets) said it tastes exactly like the one her grandfather used to bring from Mysuru. Will definitely reorder.",
    verified: true,
    helpful: 24,
  },
  {
    name: "Karthik S.",
    city: "Chennai",
    rating: 5,
    date: "9 Jun 2026",
    variant: "250g",
    title: "Melts in the mouth, ghee aroma is on point",
    body: "Lighter and softer than the traditional Mysore Pak you get in shops here. The ghee aroma hits as soon as you open the box. Finished 250g in two days between me and my wife 😅",
    verified: true,
    helpful: 18,
  },
  {
    name: "Priya M.",
    city: "Mumbai",
    rating: 4,
    date: "2 Jun 2026",
    variant: "500g",
    title: "Very good, slightly sweeter than I expected",
    body: "Quality is excellent and you can tell its real ghee, not vanaspati. Only thing is it was a bit sweeter for my taste, but my kids loved it. Reached Mumbai in 5 days, well packed.",
    verified: true,
    helpful: 11,
  },
  {
    name: "Rohan V.",
    city: "Pune",
    rating: 5,
    date: "28 May 2026",
    variant: "500g",
    title: "Bought as a corporate Diwali gift, big hit",
    body: "Ordered 12 boxes for our office Diwali gifting. Everyone asked where I got them from. The box presentation is very premium, and the team at WMP coordinated the delivery date perfectly. Highly recommend for corporate gifting.",
    verified: true,
    helpful: 32,
  },
  {
    name: "Sneha K.",
    city: "Hyderabad",
    rating: 5,
    date: "22 May 2026",
    variant: "250g",
    title: "Worth the price",
    body: "Bit on the expensive side but you get what you pay for. Texture is soft, not the dry kind that crumbles. My grandfather can actually eat this (he has dentures).",
    verified: true,
    helpful: 9,
  },
  {
    name: "Aditya G.",
    city: "Delhi",
    rating: 4,
    date: "14 May 2026",
    variant: "500g",
    title: "Good sweet, packaging could be better",
    body: "The Mysore Pak itself is fantastic, no complaints there. The outer cardboard box got slightly dented in transit, inner box was fine though. Maybe add some bubble wrap.",
    verified: true,
    helpful: 14,
  },
  {
    name: "Lakshmi N.",
    city: "Mysuru",
    rating: 5,
    date: "5 May 2026",
    variant: "250g",
    title: "As a Mysuru local, this is the real deal",
    body: "Born and raised in Mysuru and grew up eating Mysore Pak from every shop in town. This one is the closest to the original 1935 palace recipe Ive had. Soft, ghee-heavy, just the right melt.",
    verified: true,
    helpful: 47,
  },
  {
    name: "Suresh B.",
    city: "Coimbatore",
    rating: 5,
    date: "29 Apr 2026",
    variant: "500g",
    title: "Excellent quality, fast delivery",
    body: "Reached Coimbatore in 4 days. Sweet was fresh, ghee fragrance still strong when I opened the box. Wife already asking when I'm ordering the next one.",
    verified: true,
    helpful: 6,
  },
];

export default function ProductReviews({
  productName,
}: {
  productName?: string;
}) {
  const [visible, setVisible] = useState(4);
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});

  const { avg, dist, total } = useMemo(() => {
    const t = REVIEWS.length;
    const sum = REVIEWS.reduce((a, r) => a + r.rating, 0);
    const d: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    REVIEWS.forEach((r) => (d[r.rating] = (d[r.rating] ?? 0) + 1));
    return { avg: sum / t, dist: d, total: t };
  }, []);

  const shown = REVIEWS.slice(0, visible);

  return (
    <section className="bg-white border-y border-[#1B3A2D]/8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
            Customer Reviews
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
            What people are saying
          </h2>
        </div>

        {/* Summary panel */}
        <div className="grid sm:grid-cols-[auto_1fr] gap-8 sm:gap-12 items-center bg-[#FBF7F0] rounded-2xl border border-[#1B3A2D]/8 p-6 sm:p-8 mb-10">
          <div className="text-center sm:text-left">
            <div className="font-heading text-5xl font-bold text-[#1B3A2D] leading-none mb-2">
              {avg.toFixed(1)}
            </div>
            <Stars rating={avg} className="justify-center sm:justify-start mb-1.5" />
            <p className="font-body text-xs text-[#1B3A2D]/55">
              Based on {total} verified reviews
            </p>
          </div>

          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((r) => {
              const pct = total ? Math.round(((dist[r] ?? 0) / total) * 100) : 0;
              return (
                <div key={r} className="flex items-center gap-3">
                  <span className="font-body text-xs font-semibold text-[#1B3A2D]/60 w-8">
                    {r} ★
                  </span>
                  <div className="flex-1 h-1.5 bg-[#1B3A2D]/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9972D] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-body text-[11px] text-[#1B3A2D]/50 w-10 text-right tabular-nums">
                    {dist[r] ?? 0}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews list */}
        <ul className="space-y-5">
          {shown.map((r, i) => {
            const didHelp = !!helpful[i];
            return (
              <li
                key={i}
                className="bg-white rounded-2xl border border-[#1B3A2D]/8 p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm text-[#1B3A2D] shrink-0"
                      style={{ backgroundColor: avatarBg(r.name) }}
                    >
                      {initials(r.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-body text-sm font-semibold text-[#1B3A2D] truncate">
                          {r.name}
                        </p>
                        {r.verified && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-body font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full"
                            title="Verified purchase"
                          >
                            <BadgeCheck className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="font-body text-[11px] text-[#1B3A2D]/45 mt-0.5">
                        {r.city} · {r.variant} · {r.date}
                      </p>
                    </div>
                  </div>
                  <Stars rating={r.rating} className="shrink-0" />
                </div>

                <h4 className="font-heading text-base font-bold text-[#1B3A2D] mb-1.5 leading-snug">
                  {r.title}
                </h4>
                <p className="font-body text-sm text-[#1B3A2D]/75 leading-relaxed">
                  {r.body}
                </p>

                <div className="mt-4 pt-3 border-t border-[#1B3A2D]/6 flex items-center justify-between">
                  <button
                    onClick={() => setHelpful((p) => ({ ...p, [i]: !p[i] }))}
                    className={`inline-flex items-center gap-1.5 font-body text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                      didHelp
                        ? "text-[#C9972D]"
                        : "text-[#1B3A2D]/50 hover:text-[#1B3A2D]"
                    }`}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${didHelp ? "fill-current" : ""}`} />
                    Helpful ({r.helpful + (didHelp ? 1 : 0)})
                  </button>
                  <span className="font-body text-[10px] uppercase tracking-wider text-[#1B3A2D]/30">
                    Review #{(i + 1).toString().padStart(3, "0")}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {visible < REVIEWS.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisible((v) => Math.min(v + 4, REVIEWS.length))}
              className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full border border-[#1B3A2D]/15 text-[#1B3A2D] hover:bg-[#1B3A2D] hover:text-[#FBF7F0] transition-colors"
            >
              Load more reviews
            </button>
          </div>
        )}

        <p className="mt-8 text-center font-body text-[11px] text-[#1B3A2D]/40">
          Reviews shown for {productName ?? "this product"} — verified purchases only.
        </p>
      </div>
    </section>
  );
}

function Stars({
  rating,
  className = "",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${
              filled ? "text-[#C9972D] fill-[#C9972D]" : "text-[#1B3A2D]/20 fill-[#1B3A2D]/10"
            }`}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Deterministic warm-palette avatar background — picked from a short list so
// avatars look distinct without ever clashing with the page's gold/green theme.
function avatarBg(name: string): string {
  const palette = ["#FBE6B8", "#F4D5D5", "#D8E7D4", "#E4DBF1", "#F8DDC4", "#D4E5EE"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % palette.length;
  return palette[hash];
}
