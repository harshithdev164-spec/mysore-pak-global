"use client";

import { useCallback, useEffect, useState } from "react";

// ──────────────────────────────────────────────
// Favorites (localStorage)
// ──────────────────────────────────────────────

const FAV_KEY = "tour_guide_favorites";

function readFavs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeFavs(set: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set)));
  // Notify other components mounted on the same page
  window.dispatchEvent(new CustomEvent("tour-guide-favs-changed"));
}

/** Hook that exposes favorite state + toggler. Re-renders any consumer when favorites change. */
export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set());

  // Hydrate on mount + listen for external changes (other cards, storage events)
  useEffect(() => {
    setFavs(readFavs());
    const onChange = () => setFavs(readFavs());
    window.addEventListener("tour-guide-favs-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("tour-guide-favs-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const cur = readFavs();
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    writeFavs(cur);
    setFavs(new Set(cur));
  }, []);

  const isFav = useCallback((id: string) => favs.has(id), [favs]);

  return { favs, isFav, toggle, count: favs.size };
}

// ──────────────────────────────────────────────
// Open-now check — best-effort parser for hour strings
// ──────────────────────────────────────────────

interface TimeRange {
  startMin: number;
  endMin: number;
}

/** Parse a time string like "7:30 AM" into total minutes since midnight (0–1440). */
function parseTime(s: string): number | null {
  const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const period = (m[3] ?? "").toLowerCase();
  if (period === "pm" && h < 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Parse an hours string like:
 *   "9:00 AM – 5:00 PM"
 *   "7:30 AM – 2:00 PM, 3:30 PM – 6:00 PM"
 *   "10:00 AM – 5:30 PM (Light show: Sun 7-7:45 PM)"
 *
 * Returns the time ranges in 24h minute-since-midnight values.
 * Ignores closed-day clauses; closed-on-Tuesday etc. are NOT modelled — best effort only.
 */
function parseRanges(hours: string): TimeRange[] {
  if (!hours) return [];
  // Strip parenthetical clauses (light shows, day-specific notes)
  const clean = hours.replace(/\([^)]*\)/g, "").trim();
  // Split on commas (multiple windows like "7:30 AM – 2:00 PM, 3:30 PM – 6:00 PM")
  const segments = clean.split(",").map((s) => s.trim()).filter(Boolean);
  const ranges: TimeRange[] = [];
  for (const seg of segments) {
    // Accept – or - as separator
    const parts = seg.split(/[–-]/).map((s) => s.trim());
    if (parts.length < 2) continue;
    const start = parseTime(parts[0]);
    const end = parseTime(parts[1]);
    if (start === null || end === null) continue;
    ranges.push({ startMin: start, endMin: end });
  }
  return ranges;
}

export function isOpenNow(hours: string | undefined | null, now: Date = new Date()): boolean {
  if (!hours) return false;
  const lower = hours.toLowerCase();
  if (lower.includes("24 hour") || lower.includes("always open")) return true;
  if (lower.includes("free")) {
    // Free doesn't imply always open; check ranges still
  }
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  // Best-effort: if the hours string explicitly excludes today's day, treat as closed
  if (lower.includes(`closed ${dayName}`) || lower.includes(`closed on ${dayName}s`)) return false;
  if (
    (dayName === "tuesday" && lower.includes("closed tuesdays")) ||
    (dayName === "monday" && lower.includes("closed mondays")) ||
    (dayName === "wednesday" && lower.includes("closed wednesdays"))
  ) {
    return false;
  }

  const minutes = now.getHours() * 60 + now.getMinutes();
  const ranges = parseRanges(hours);
  if (ranges.length === 0) return false;
  return ranges.some((r) => minutes >= r.startMin && minutes <= r.endMin);
}

// ──────────────────────────────────────────────
// Haversine distance + geolocation hook
// ──────────────────────────────────────────────

const EARTH_KM = 6371;

/** Great-circle distance between two lat/lng points, in kilometres. */
export function kmBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

interface UserLocation {
  lat: number;
  lng: number;
}

export function useUserLocation() {
  const [loc, setLoc] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "error">("idle");

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  return { loc, status, request };
}
