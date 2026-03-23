import { useState, useEffect, useCallback } from "react";

// Module-level cache — survives client-side navigation (SPA behavior)
// Keys are URLs, values are { data, timestamp }
const CACHE: Record<string, { data: unknown; ts: number }> = {};
const TTL = 60_000; // 60 seconds

export function useAdminFetch<T>(url: string) {
  const now = Date.now();
  const hit = CACHE[url];
  const initialData = hit && now - hit.ts < TTL ? (hit.data as T) : null;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(initialData === null);
  const [error, setError] = useState("");

  const load = useCallback(
    (silent = false, attempt = 0) => {
      if (!silent) setError("");
      fetch(url, { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => {
          if (j.error) {
            setError(j.error);
          } else {
            const value = j.data ?? j;
            CACHE[url] = { data: value, ts: Date.now() };
            setData(value as T);
          }
          setLoading(false);
        })
        .catch((e) => {
          if (attempt < 2) {
            // Auto-retry up to 2 times with exponential backoff (1s, 2s)
            setTimeout(() => load(silent, attempt + 1), 1000 * (attempt + 1));
          } else {
            setError(String(e));
            setLoading(false);
          }
        });
    },
    [url]
  );

  useEffect(() => {
    // Always refetch in background; if we had cache, skip loading spinner
    if (initialData !== null) {
      load(true); // silent background refresh
    } else {
      load(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Call mutate() after a write (create/update/delete) to force a fresh fetch
  const mutate = useCallback(() => {
    delete CACHE[url];
    setLoading(true);
    load(false);
  }, [url, load]);

  return { data, loading, error, mutate };
}

// Manually invalidate a cached URL (e.g. after a mutation on another page)
export function invalidateCache(url: string) {
  delete CACHE[url];
}
