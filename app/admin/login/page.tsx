"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

type Step = "phone" | "code";

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Countdown after sending — enables "Resend" after 30s
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function requestOtp(e?: FormEvent) {
    e?.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setError(j.error ?? `Failed (${res.status})`);
        return;
      }
      setStep("code");
      setInfo("If this phone is registered, you'll receive a 6-digit code on WhatsApp.");
      setCooldown(30);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e?: FormEvent) {
    e?.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, remember }),
      });
      const j = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setError(j.error ?? `Failed (${res.status})`);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 rounded-full bg-amber-100 border border-amber-200 mb-4">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-800">
              World of Mysore Pak
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin sign-in</h1>
          <p className="text-sm text-gray-500 mt-2">
            {step === "phone"
              ? "Enter your registered WhatsApp number. We'll send a one-time code."
              : "Enter the 6-digit code sent to WhatsApp."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === "phone" ? (
            <form onSubmit={requestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  WhatsApp number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98xxxxxxxx or 91xxxxxxxxxx"
                  autoComplete="tel"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Indian numbers work with or without the &quot;91&quot; prefix.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
              >
                {loading ? "Sending…" : "Send code on WhatsApp"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  6-digit code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  autoFocus
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm tracking-[0.6em] font-mono text-center focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-600"
                />
                Keep me signed in for 30 days on this device
              </label>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
              >
                {loading ? "Verifying…" : "Verify + sign in"}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => { setStep("phone"); setCode(""); setError(null); setInfo(null); }}
                  className="text-gray-500 hover:text-gray-800 font-semibold"
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={cooldown > 0 || loading}
                  className="text-amber-700 hover:text-amber-900 font-semibold disabled:text-gray-400"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {info && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2 mt-4" role="status">
              {info}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-4" role="alert">
              {error}
            </p>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Not an admin? <a href="/" className="text-gray-500 hover:text-gray-800 underline">Return to shop</a>.
        </p>
      </div>
    </div>
  );
}
