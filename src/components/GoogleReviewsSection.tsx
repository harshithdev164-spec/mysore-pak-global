"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, StarHalf } from "lucide-react";

// ──────────────────────────────────────────────
// Types — mirror src/lib/google-places.ts shape
// ──────────────────────────────────────────────
interface GoogleReview {
  author: string;
  authorPhoto: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishedAt: string;
  authorProfileUrl: string | null;
}
interface GooglePlace {
  placeId: string;
  name: string;
  rating: number | null;
  userRatingCount: number | null;
  googleMapsUri: string | null;
  reviews: GoogleReview[];
}
interface ApiResponse {
  configured: boolean;
  place: GooglePlace | null;
  cached?: boolean;
  stale?: boolean;
  error?: string;
}

const GOOGLE_G = (
  <svg width="16" height="16" viewBox="0 0 48 48" className="flex-shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

// Avatar background based on author name hash — deterministic so reorders
// don't reshuffle colours.
const AVATAR_COLORS = ["#4285F4", "#EA4335", "#34A853", "#FBBC05", "#9C27B0", "#00ACC1"];
function avatarBg(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// Render the rating row — 5 stars including half-star support.
function StarRow({ rating, size = 5 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const filled = hasHalf ? full : Math.round(rating);
  const className = `w-${size} h-${size} text-[#FBBC05] fill-[#FBBC05]`;
  const empty = 5 - filled - (hasHalf ? 1 : 0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: filled }).map((_, i) => (
        <Star key={`f${i}`} className={className} />
      ))}
      {hasHalf && <StarHalf key="h" className={className} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className={`w-${size} h-${size} text-[#FBF7F0]/20`} />
      ))}
    </div>
  );
}

export default function GoogleReviewsSection() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews/google", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: ApiResponse) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setData({ configured: false, place: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const place = data?.place ?? null;
  const reviews = place?.reviews ?? [];
  const displayRating = place?.rating ?? null;
  const displayCount = place?.userRatingCount ?? null;
  const mapsUri =
    place?.googleMapsUri ??
    "https://www.google.com/maps/search/?api=1&query=World+of+Mysore+Pak+Mysuru";

  // We need at least 1 real review to render the strip; otherwise we drop
  // straight to the CTA so customers never see fake data.
  const hasReviews = reviews.length > 0;

  return (
    <section
      className="py-24 sm:py-32 overflow-hidden relative section-lazy section-gpu"
      style={{ background: "linear-gradient(160deg, #0F2318 0%, #1B3A2D 40%, #152B21 100%)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C9972D 30%, #E8B84B 50%, #C9972D 70%, transparent)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(90deg, transparent, #C9972D)" }} />
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9972D]/30"
              style={{ background: "rgba(201,151,45,0.08)" }}
            >
              {GOOGLE_G}
              <span className="font-body text-[11px] uppercase tracking-[0.3em] text-[#C9972D] font-semibold">
                Verified Google Reviews
              </span>
            </div>
            <div className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(90deg, #C9972D, transparent)" }} />
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FBF7F0]">
            Loved by{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #C9972D, #E8B84B, #C9972D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Sweet Lovers
            </span>
          </h2>

          {/* Live rating display — only when we have real data */}
          {displayRating != null && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="font-heading text-5xl font-bold" style={{ color: "#E8B84B" }}>
                {displayRating.toFixed(1)}
              </span>
              <div className="flex flex-col items-start gap-1">
                <StarRow rating={displayRating} />
                <span className="font-body text-xs text-[#FBF7F0]/50 tracking-wide">
                  {displayCount != null
                    ? `Based on ${displayCount.toLocaleString("en-IN")} Google review${displayCount === 1 ? "" : "s"}`
                    : "Live from Google Business"}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Review strip OR loading skeleton OR CTA-only */}
      {loading ? (
        <div className="relative max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl animate-pulse"
              style={{ background: "rgba(251,247,240,0.06)", border: "1px solid rgba(201,151,45,0.15)" }}
            />
          ))}
        </div>
      ) : hasReviews ? (
        <div className="relative scroll-strip-wrap">
          <div
            className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #1B3A2D, transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none"
            style={{ background: "linear-gradient(270deg, #1B3A2D, transparent)" }}
          />
          <div className="flex gap-5 animate-photo-scroll" style={{ width: "max-content" }}>
            {[...reviews, ...reviews].map((r, i) => (
              <div
                key={i}
                className="w-80 sm:w-96 flex-shrink-0 rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: "rgba(251,247,240,0.06)",
                  border: "1px solid rgba(201,151,45,0.2)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(201,151,45,0.1)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {r.authorPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.authorPhoto}
                        alt={r.author}
                        className="w-11 h-11 rounded-full flex-shrink-0 shadow-md object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md"
                        style={{ backgroundColor: avatarBg(r.author) }}
                      >
                        {r.author.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold text-[#FBF7F0] leading-tight truncate">
                        {r.author}
                      </p>
                      <p className="font-body text-[11px] text-[#FBF7F0]/40 leading-tight mt-0.5">
                        {r.relativeTime || "Google review"}
                      </p>
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0 opacity-90">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>

                <StarRow rating={r.rating} size={4} />

                <div
                  className="h-px w-full"
                  style={{ background: "linear-gradient(90deg, rgba(201,151,45,0.3), transparent)" }}
                />

                <p className="font-body text-sm text-[#FBF7F0]/75 leading-relaxed line-clamp-4">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // No real reviews available (API down / not configured / 0 reviews).
        // Keep the section honest with a single CTA rather than fake data.
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <p className="font-body text-[#FBF7F0]/60 text-sm sm:text-base mb-6">
            Read what our customers are saying on Google. Real, unedited reviews,
            straight from the source.
          </p>
        </div>
      )}

      <div className="text-center mt-12">
        <motion.a
          href={mapsUri}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2.5 font-body text-sm font-semibold text-[#1B3A2D] px-7 py-3 rounded-full transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #C9972D, #E8B84B)",
            boxShadow: "0 4px 20px rgba(201,151,45,0.35)",
          }}
        >
          {GOOGLE_G}
          {hasReviews ? "View all reviews on Google" : "See our Google listing"}
        </motion.a>
      </div>
    </section>
  );
}
