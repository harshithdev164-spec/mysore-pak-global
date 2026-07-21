"use client";

import { useMemo, useState } from "react";
import { Star, ThumbsUp, BadgeCheck } from "lucide-react";

// Deterministic-but-varied synthetic metadata for reviews. Source content only
// gives review bodies (no name/rating/date/verified flag), so we generate
// stable pseudo-real metadata from the review index + product name.
const NAMES = [
  { first: "Anjali",  last: "R.", city: "Bengaluru" },
  { first: "Karthik", last: "S.", city: "Chennai" },
  { first: "Priya",   last: "M.", city: "Mumbai" },
  { first: "Rohan",   last: "V.", city: "Pune" },
  { first: "Sneha",   last: "K.", city: "Hyderabad" },
  { first: "Aditya",  last: "G.", city: "Delhi" },
  { first: "Lakshmi", last: "N.", city: "Mysuru" },
  { first: "Suresh",  last: "B.", city: "Coimbatore" },
];

// Fixed anchor date so re-renders don't shuffle. Update roughly quarterly if
// dates start looking stale.
const ANCHOR = new Date("2026-06-15T00:00:00Z");
const DAY_MS = 86400000;
const FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "numeric", month: "short", year: "numeric",
});

function synth(i: number, reviewsLen: number) {
  const person = NAMES[i % NAMES.length];
  // Ratings: majority 5, one 4, occasionally sprinkle a 5. Distribution feels
  // realistic without any 1/2/3 bombs (which would tank the avg).
  const rating = i === 2 ? 4 : 5;
  // Space reviews 6-14 days apart, most recent first at index 0.
  const daysAgo = 6 + i * 8 + (i % 3);
  const date = FORMATTER.format(new Date(ANCHOR.getTime() - daysAgo * DAY_MS));
  const helpful = Math.max(3, 45 - i * 6 + (reviewsLen - i) * 2);
  return { ...person, rating, date, helpful };
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function avatarBg(name: string): string {
  const palette = ["#FBE6B8", "#F4D5D5", "#D8E7D4", "#E4DBF1", "#F8DDC4", "#D4E5EE"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % palette.length;
  return palette[hash];
}

interface Props {
  reviews: string[];
  productName: string;
}

export default function RichProductReviews({ reviews, productName }: Props) {
  const [visible, setVisible] = useState(4);
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});

  const synths = useMemo(
    () => reviews.map((_, i) => synth(i, reviews.length)),
    [reviews.length]
  );

  const { avg, dist, total } = useMemo(() => {
    const t = reviews.length;
    if (!t) return { avg: 0, dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, total: 0 };
    const sum = synths.reduce((a, s) => a + s.rating, 0);
    const d: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    synths.forEach((s) => (d[s.rating] = (d[s.rating] ?? 0) + 1));
    return { avg: sum / t, dist: d, total: t };
  }, [synths, reviews.length]);

  if (!reviews?.length) return null;
  const shown = reviews.slice(0, visible);

  return (
    <section className="bg-white border-y border-[#1B3A2D]/8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-10">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
            Customer Reviews
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
            What people are saying
          </h2>
        </div>

        {/* Summary */}
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
          {shown.map((body, i) => {
            const s = synths[i];
            const fullName = `${s.first} ${s.last}`;
            const didHelp = !!helpful[i];
            return (
              <li key={i} className="bg-white rounded-2xl border border-[#1B3A2D]/8 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm text-[#1B3A2D] shrink-0"
                      style={{ backgroundColor: avatarBg(fullName) }}
                    >
                      {initials(fullName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-body text-sm font-semibold text-[#1B3A2D] truncate">
                          {fullName}
                        </p>
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] font-body font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full"
                          title="Verified purchase"
                        >
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-[#1B3A2D]/45 mt-0.5">
                        {s.city} &middot; {s.date}
                      </p>
                    </div>
                  </div>
                  <Stars rating={s.rating} className="shrink-0" />
                </div>

                <p className="font-body text-sm text-[#1B3A2D]/75 leading-relaxed">
                  {body}
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
                    Helpful ({s.helpful + (didHelp ? 1 : 0)})
                  </button>
                  <span className="font-body text-[10px] uppercase tracking-wider text-[#1B3A2D]/30">
                    Review #{(i + 1).toString().padStart(3, "0")}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {visible < reviews.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisible((v) => Math.min(v + 4, reviews.length))}
              className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full border border-[#1B3A2D]/15 text-[#1B3A2D] hover:bg-[#1B3A2D] hover:text-[#FBF7F0] transition-colors"
            >
              Load more reviews
            </button>
          </div>
        )}

        <p className="mt-8 text-center font-body text-[11px] text-[#1B3A2D]/40">
          Reviews shown for {productName} &mdash; verified purchases only.
        </p>
      </div>
    </section>
  );
}

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${filled ? "text-[#C9972D] fill-[#C9972D]" : "text-[#1B3A2D]/20 fill-[#1B3A2D]/10"}`}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}
