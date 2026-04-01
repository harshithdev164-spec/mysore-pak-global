import { createClient, type RedisClientType } from "redis";

// Singleton pattern — reuse the connection across hot-reloaded serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var _redisClient: RedisClientType | undefined;
}

// Max ms any single Redis op is allowed to block the response
const OP_TIMEOUT_MS = 200;

/** Races a Redis promise against a short deadline — Redis never blocks the response. */
function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), OP_TIMEOUT_MS)),
  ]);
}

function getRedisClient(): RedisClientType | null {
  if (!process.env.REDIS_URL) return null; // No Redis configured — all ops become no-ops

  if (!global._redisClient) {
    global._redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 200, 3000),
        connectTimeout: 800, // Give up connecting after 800ms (was 5000ms)
        keepAlive: true,     // Send TCP keep-alives to avoid idle disconnects
      },
    }) as RedisClientType;

    global._redisClient.on("error", (err) => {
      // Log but never crash the app — Redis is a cache, not critical path
      console.error("[Redis]", err.message);
    });

    global._redisClient.connect().catch((err) => {
      console.error("[Redis] connect failed:", err.message);
      global._redisClient = undefined;
    });
  }

  return global._redisClient;
}

// Cache TTLs in seconds
export const TTL = {
  PRODUCTS_LIST: 5 * 60,    // 5 min  — shop page listing
  PRODUCT_DETAIL: 10 * 60,  // 10 min — individual product page
  CATEGORIES: 30 * 60,      // 30 min — rarely changes
};

/** Read a cached value. Returns null on miss or Redis unavailable. */
export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client?.isOpen) return null;
  try {
    const raw = await withTimeout(client.get(key) as Promise<string | null>, null);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null; // Redis failure must never break the API
  }
}

/** Write a value to cache with a TTL (seconds). Errors are swallowed. */
export async function setCached<T>(key: string, value: T, ttl: number): Promise<void> {
  const client = getRedisClient();
  if (!client?.isOpen) return;
  try {
    // setCached is fire-and-forget — don't block the response on writes
    client.setEx(key, ttl, JSON.stringify(value)).catch(() => {});
  } catch { /* ignore */ }
}

/** Delete one or more cache keys (call after writes). */
export async function deleteCached(...keys: string[]): Promise<void> {
  const client = getRedisClient();
  if (!client?.isOpen || keys.length === 0) return;
  try {
    await client.del(keys);
  } catch { /* ignore */ }
}

/**
 * Increment the products "generation" counter.
 * All list cache keys embed this counter, so incrementing it
 * invalidates every product list in one atomic operation.
 */
export async function bumpProductsVersion(): Promise<void> {
  const client = getRedisClient();
  if (!client?.isOpen) return;
  try {
    await client.incr("products:version");
  } catch { /* ignore */ }
}

export async function getProductsVersion(): Promise<number> {
  const client = getRedisClient();
  if (!client?.isOpen) return 0;
  try {
    const v = await withTimeout(client.get("products:version") as Promise<string | null>, null);
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}
