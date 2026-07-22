"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProductLite {
  slug: string;
  name: string;
}

interface Notification {
  key: number;
  name: string;
  city: string;
  product: ProductLite;
  timeAgo: string;
}

// ── Data pools ──────────────────────────────────────────────────────────────

// Mix of North and South Indian first names — abbreviated last initial to
// keep the tone friendly and preserve a shred of privacy vibe.
const FIRST_NAMES = [
  "Aarav", "Aditi", "Ananya", "Arjun", "Bhavna", "Chirag", "Deepika", "Dhruv",
  "Divya", "Eshan", "Gaurav", "Harshith", "Ishaan", "Karthik", "Kavya", "Lakshmi",
  "Manoj", "Meera", "Nikhil", "Nisha", "Nithya", "Pooja", "Prakash", "Priya",
  "Raghav", "Rahul", "Rakesh", "Rashmi", "Ravi", "Rohan", "Sanjay", "Sanya",
  "Shreya", "Siddharth", "Sneha", "Suresh", "Swathi", "Tanvi", "Varun", "Vinay",
];

const LAST_INITIALS = ["A.", "B.", "D.", "G.", "H.", "K.", "M.", "N.", "P.", "R.", "S.", "V."];

// Weighted toward Mysuru + Bengaluru + Chennai + Mumbai + Delhi — matches
// where most orders come from. Weight = repetition in the array.
const CITIES = [
  "Bengaluru", "Bengaluru", "Bengaluru", "Bengaluru",
  "Mysuru", "Mysuru", "Mysuru",
  "Chennai", "Chennai",
  "Mumbai", "Mumbai",
  "Delhi", "Delhi",
  "Hyderabad", "Hyderabad",
  "Pune",
  "Coimbatore",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
  "Trivandrum",
  "Nagpur",
  "Indore",
  "Lucknow",
  "Chandigarh",
  "Surat",
  "Vadodara",
  "Bhubaneswar",
];

const TIMES = [
  "just now",
  "1 minute ago",
  "3 minutes ago",
  "5 minutes ago",
  "7 minutes ago",
  "9 minutes ago",
  "12 minutes ago",
  "18 minutes ago",
];

// ── Timing (in ms) ──────────────────────────────────────────────────────────
// Aggressive cadence: appear every ~5 seconds. Visible for 3 s, hidden for 2 s.
const FIRST_DELAY_MS = 2_000;
const VISIBLE_MS = 3_000;
const GAP_MIN_MS = 2_000;
const GAP_MAX_MS = 2_500;

// Text-only avatar palette — deterministic pick per name so the same person
// always shows in the same colour. Warm brand palette, high contrast text.
const AVATAR_COLORS = [
  "#C9972D", // gold
  "#C4512A", // terracotta
  "#1B3A2D", // brand green
  "#8E5A9C", // aubergine
  "#3E7CB1", // teal-blue
  "#B85450", // brick
  "#4F7A46", // olive
];

// ── Throttling ──────────────────────────────────────────────────────────────
const HIDE_FOR_HOURS_AFTER_DISMISS = 24;
const OFF_UNTIL_KEY = "wmp_purchase_notif_off_until";

// ── Skip on these routes ────────────────────────────────────────────────────
const SKIP_PATHS = ["/cart", "/checkout", "/admin", "/tour-guide"];

function isCurrentlyDismissed(): boolean {
  try {
    const offUntil = localStorage.getItem(OFF_UNTIL_KEY);
    if (offUntil && new Date(offUntil).getTime() > Date.now()) return true;
  } catch { /* private mode — allow */ }
  return false;
}

function snoozeForHours(hours: number) {
  try {
    const until = new Date(Date.now() + hours * 3_600_000).toISOString();
    localStorage.setItem(OFF_UNTIL_KEY, until);
  } catch { /* ignore */ }
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Deterministic colour picker so "Harshith" always draws the same colour.
function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

function makeNotification(products: ProductLite[], key: number): Notification | null {
  if (!products.length) return null;
  const first = pick(FIRST_NAMES);
  const initial = pick(LAST_INITIALS);
  return {
    key,
    name: `${first} ${initial}`,
    city: pick(CITIES),
    product: pick(products),
    timeAgo: pick(TIMES),
  };
}

export default function PurchaseNotification() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Whether to render on this route
  const enabled = useMemo(() => {
    if (!pathname) return false;
    return !SKIP_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    if (isCurrentlyDismissed()) setDismissed(true);
  }, []);

  // Fetch a pool of active product names once (no images — those were slow
  // to load and the notification is now text-only). Names are ~1 KB total so
  // this returns almost instantly.
  useEffect(() => {
    if (!enabled || dismissed) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("slug, name")
        .eq("is_active", true)
        .limit(40);
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = ((data ?? []) as any[])
        .filter((r) => r.slug && r.name)
        .map((r) => ({ slug: r.slug as string, name: r.name as string }));
      setProducts(rows);
    })();
    return () => { cancelled = true; };
  }, [enabled, dismissed]);

  // Rotation loop — first one after FIRST_DELAY_MS, then cycles.
  useEffect(() => {
    if (!enabled || dismissed || products.length === 0) return;

    let timeoutId: number | undefined;
    let keyCounter = 0;

    const showOne = () => {
      const n = makeNotification(products, ++keyCounter);
      if (!n) return;
      setCurrent(n);
      // Auto-hide after VISIBLE_MS, then queue the next one
      timeoutId = window.setTimeout(() => {
        setCurrent(null);
        const gap = GAP_MIN_MS + Math.random() * (GAP_MAX_MS - GAP_MIN_MS);
        timeoutId = window.setTimeout(showOne, gap);
      }, VISIBLE_MS);
    };

    timeoutId = window.setTimeout(showOne, FIRST_DELAY_MS);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [enabled, dismissed, products]);

  function dismiss() {
    setCurrent(null);
    setDismissed(true);
    snoozeForHours(HIDE_FOR_HOURS_AFTER_DISMISS);
  }

  if (!mounted || !enabled || dismissed) return null;

  const node = (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.key}
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.2 } }}
          transition={{ type: "spring", damping: 22, stiffness: 320 }}
          className="fixed bottom-5 left-4 sm:left-6 z-[70] w-[calc(100vw-2rem)] sm:w-[340px] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="relative flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl border border-[#1B3A2D]/8 shadow-2xl shadow-[#1B3A2D]/15 px-3 py-3 pr-8">
            {/* Text-only avatar — deterministic colour per name, no HTTP request */}
            <div
              className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-heading font-bold text-lg"
              style={{ backgroundColor: colorForName(current.name) }}
              aria-hidden
            >
              {current.name.trim().charAt(0).toUpperCase()}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-body text-[13px] leading-tight text-[#1B3A2D]">
                <span className="font-semibold">{current.name}</span>
                <span className="text-[#1B3A2D]/60"> from {current.city}</span>
              </p>
              <p className="font-body text-[13px] leading-tight text-[#1B3A2D]/80 mt-0.5 truncate">
                just bought <span className="font-semibold">{current.product.name}</span>
              </p>
              <p className="font-body text-[10px] leading-tight text-[#1B3A2D]/40 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {current.timeAgo}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label="Hide purchase notifications for 24 hours"
              className="absolute top-2 right-2 w-6 h-6 rounded-full text-[#1B3A2D]/40 hover:text-[#1B3A2D]/80 hover:bg-[#1B3A2D]/5 flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(node, document.body);
}
