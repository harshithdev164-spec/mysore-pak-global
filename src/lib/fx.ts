/**
 * USD → INR FX rate, cached in-memory for 24 hours.
 * Used to convert DHL Express USD quotes to INR for Razorpay.
 */

const TTL_MS = 24 * 60 * 60 * 1000;

let cachedRate: number | null = null;
let cachedAt = 0;

function fallbackRate(): number {
  const env = process.env.DHL_FX_USD_INR_FALLBACK;
  const n = env ? parseFloat(env) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 85;
}

export async function getUsdToInr(): Promise<number> {
  const now = Date.now();
  if (cachedRate && now - cachedAt < TTL_MS) return cachedRate;

  try {
    const res = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=INR",
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const json = await res.json();
    const rate = json?.rates?.INR;
    if (typeof rate === "number" && rate > 0) {
      cachedRate = rate;
      cachedAt = now;
      return rate;
    }
    throw new Error("FX response missing INR rate");
  } catch (err) {
    console.error("[fx] USD→INR fetch failed, using fallback:", err);
    const rate = fallbackRate();
    cachedRate = rate;
    cachedAt = now;
    return rate;
  }
}
