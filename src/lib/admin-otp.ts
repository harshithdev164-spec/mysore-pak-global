// ── OTP generation + hashing + verification ──────────────────────────────
//
// Uses SHA-256 with a per-code random salt for hashing (bcrypt would be
// nicer but adds a native binary dependency; SHA-256 with 32-byte random
// salt is plenty for 5-minute-lived 6-digit codes and works on both Node
// runtime and Edge without a native module).
//
// Rate limits + attempt caps are enforced in the API route, not here.

const CODE_LENGTH = 6;

/**
 * Generate a cryptographically-random 6-digit code as a zero-padded string.
 * Uses crypto.getRandomValues so it works everywhere Web Crypto is available.
 */
export function generateOtpCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // Take modulo 10^6 → 0..999999, then zero-pad to CODE_LENGTH.
  const n = buf[0] % 10 ** CODE_LENGTH;
  return String(n).padStart(CODE_LENGTH, "0");
}

/**
 * Hash a code with a random 32-byte salt, returned as `<b64salt>.<b64hash>`.
 * Recomputing the hash requires splitting on the dot and reusing the salt.
 */
export async function hashOtpCode(code: string): Promise<string> {
  const salt = new Uint8Array(32);
  crypto.getRandomValues(salt);
  const hash = await sha256(concat(salt, new TextEncoder().encode(code)));
  return `${toB64(salt)}.${toB64(hash)}`;
}

/**
 * Constant-time-ish compare of a plain code against a hashed value.
 * Returns false on malformed hash so callers don't leak parse errors.
 */
export async function verifyOtpCode(code: string, hashed: string): Promise<boolean> {
  const [saltB64, expectedB64] = hashed.split(".");
  if (!saltB64 || !expectedB64) return false;
  const salt = fromB64(saltB64);
  const actualHash = await sha256(concat(salt, new TextEncoder().encode(code)));
  const expected = fromB64(expectedB64);
  return constantTimeEqual(actualHash, expected);
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  const raw = atob(s);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Normalize a phone input to E.164 without leading + — the format we store.
 * Accepts inputs like "9538772164", "+91 9538 772164", "919538772164".
 * If input is a bare 10-digit Indian mobile, prefixes "91".
 */
export function normalizePhone(input: string): string | null {
  const digits = (input ?? "").replace(/\D+/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return "91" + digits;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}
