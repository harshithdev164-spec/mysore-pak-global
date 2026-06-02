// Edge-compatible HMAC-signed session for admin auth.
//
// We can't use node's `crypto` here because middleware runs on the edge
// runtime. Web Crypto's `crypto.subtle` works in both edge and Node ≥18.
//
// Cookie format:  <base64url(payload-json)>.<base64url(hmac)>
// Payload: { exp: <unix-seconds> }

export const ADMIN_COOKIE = "wmp_admin_session";
const ENC = new TextEncoder();
const DEC = new TextDecoder();

function b64urlEncode(bytes: Uint8Array | string): string {
  const b = typeof bytes === "string" ? ENC.encode(bytes) : bytes;
  let bin = "";
  for (let i = 0; i < b.byteLength; i++) bin += String.fromCharCode(b[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    ENC.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, ENC.encode(data));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export interface AdminSession {
  exp: number; // unix seconds
}

export async function createAdminSession(
  secret: string,
  ttlSeconds: number = 60 * 60 * 24 * 7 // 7 days
): Promise<string> {
  const payload: AdminSession = {
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadStr = b64urlEncode(JSON.stringify(payload));
  const sig = await hmac(secret, payloadStr);
  return `${payloadStr}.${b64urlEncode(sig)}`;
}

export async function verifyAdminSession(
  secret: string,
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const payloadStr = token.slice(0, dot);
  const sigStr = token.slice(dot + 1);

  let providedSig: Uint8Array;
  try {
    providedSig = b64urlDecode(sigStr);
  } catch {
    return null;
  }
  const expectedSig = await hmac(secret, payloadStr);
  if (!timingSafeEqual(providedSig, expectedSig)) return null;

  let session: AdminSession;
  try {
    session = JSON.parse(DEC.decode(b64urlDecode(payloadStr)));
  } catch {
    return null;
  }
  if (!session?.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
  return session;
}

// Constant-time string comparison for password checks.
export function passwordsMatch(a: string, b: string): boolean {
  const A = ENC.encode(a);
  const B = ENC.encode(b);
  if (A.length !== B.length) {
    // Still walk B so timing doesn't reveal length match.
    let _x = 0;
    for (let i = 0; i < B.length; i++) _x |= B[i];
    return false;
  }
  return timingSafeEqual(A, B);
}
