"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Truck, CreditCard, Globe2, Info } from "lucide-react";
import {
  SUPPORTED_COUNTRIES,
  COUNTRY_BY_CODE,
  validatePostalCode,
  isInternational,
} from "@/lib/countries";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** Parse weight label → kg (client-safe) */
function parseWeightKg(label: string): number {
  const s = label.toLowerCase().replace(/\s+/g, "");
  const kg = s.match(/([\d.]+)kg/);
  if (kg) return parseFloat(kg[1]);
  const g = s.match(/([\d.]+)(?:gm|g)/);
  if (g) return parseFloat(g[1]) / 1000;
  return 0.5;
}

interface CourierRate {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd: string;
}

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay">("razorpay");
  const [orderComplete, setOrderComplete] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    address: "", address2: "",
    city: "", state: "Karnataka",
    pincode: "",     // 6-digit India pincode (domestic only)
    postal_code: "", // free-format postal code (international only)
    country: "IN",
  });

  // Shipping rate state
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState("");
  const [rateOptions, setRateOptions] = useState<CourierRate[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);
  const rateAbortRef = useRef<AbortController | null>(null);
  const cheapestRate =
    rateOptions.find((o) => o.courier_company_id === selectedCourierId) ??
    rateOptions[0] ??
    null;

  const intl = isInternational(form.country);
  const countryCfg = COUNTRY_BY_CODE[form.country];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const savedCountry = localStorage.getItem("delivery_country");
    if (savedCountry) setForm((p) => ({ ...p, country: savedCountry }));
    const savedPincode = localStorage.getItem("delivery_pincode");
    if (savedPincode) setForm((p) => ({ ...p, pincode: p.pincode || savedPincode }));
    const savedPostal = localStorage.getItem("delivery_postal_code");
    if (savedPostal) setForm((p) => ({ ...p, postal_code: p.postal_code || savedPostal }));
    const savedCourier = localStorage.getItem("delivery_courier_id");
    if (savedCourier) setSelectedCourierId(parseInt(savedCourier, 10));
  }, []);

  // Persist courier selection so Cart and Checkout stay in sync.
  useEffect(() => {
    if (selectedCourierId !== null) {
      localStorage.setItem("delivery_courier_id", String(selectedCourierId));
    }
  }, [selectedCourierId]);

  useEffect(() => {
    if (mounted && items.length === 0 && !orderComplete) router.push("/shop");
  }, [mounted, items.length, router, orderComplete]);

  const totalWeight = items.reduce(
    (sum, item) => sum + parseWeightKg(item.weight) * item.quantity,
    0
  );

  useEffect(() => {
    setRateError("");
    setRateOptions([]);

    const ingest = (data: { error?: string; data?: CourierRate[] }) => {
      if (data.error) {
        setRateError(data.error);
        return;
      }
      const opts = data.data ?? [];
      setRateOptions(opts);
      // Keep saved courier choice if still in the new options; otherwise pick cheapest
      setSelectedCourierId((prev) => {
        if (prev && opts.some((o) => o.courier_company_id === prev)) return prev;
        if (opts.length === 0) return null;
        return opts.reduce((a, b) => (a.rate <= b.rate ? a : b)).courier_company_id;
      });
    };

    if (intl) {
      const pc = form.postal_code.trim();
      if (!pc || !validatePostalCode(pc, form.country)) return;
      rateAbortRef.current?.abort();
      const ctrl = new AbortController();
      rateAbortRef.current = ctrl;
      setRateLoading(true);
      fetch(
        `/api/shipping/intl-rates?country=${form.country}&postal_code=${encodeURIComponent(
          pc
        )}&weight_kg=${Math.max(totalWeight, 0.5).toFixed(2)}&value_inr=${Math.max(subtotal, 100)}`,
        { signal: ctrl.signal }
      )
        .then((r) => r.json())
        .then(ingest)
        .catch(() => {})
        .finally(() => setRateLoading(false));
    } else {
      const pc = form.pincode.trim();
      if (!/^\d{6}$/.test(pc)) return;
      rateAbortRef.current?.abort();
      const ctrl = new AbortController();
      rateAbortRef.current = ctrl;
      setRateLoading(true);
      fetch(
        `/api/shipping/rates?pincode=${pc}&weight=${Math.max(totalWeight, 0.1).toFixed(2)}`,
        { signal: ctrl.signal }
      )
        .then((r) => r.json())
        .then(ingest)
        .catch(() => {})
        .finally(() => setRateLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pincode, form.postal_code, form.country, intl]);

  // Domestic free-shipping threshold does NOT apply internationally.
  const shipping = intl
    ? cheapestRate?.rate ?? 0
    : subtotal > 1500
    ? 0
    : cheapestRate?.rate ?? 0;

  // Calculate GST: Chocolates 18%, Others 5%
  const gst = items.reduce((sum, item) => {
    const gstRate = item.product.category?.toLowerCase().includes("chocolate") ? 0.18 : 0.05;
    return sum + (item.price * item.quantity * gstRate);
  }, 0);

  const total = subtotal + shipping + gst;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };


  // ── Razorpay flow ─────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const shippingAddress = intl
        ? {
            address: form.address,
            address2: form.address2,
            city: form.city,
            state: form.state,
            postal_code: form.postal_code,
            pincode: form.postal_code, // legacy alias for compatibility
            country: form.country,
          }
        : {
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: "IN",
          };

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: shippingAddress,
          items: items.map((item) => ({
            product_name: item.product.name,
            weight_label: item.weight,
            quantity: item.quantity,
            unit_price: item.price,
          })),
          shipping_cost: shipping,
          courier_id: cheapestRate?.courier_company_id,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error ?? "Failed to initiate payment");

      const { razorpay_order_id, key_id, amount, currency, db_order_id, order_number } = orderData;

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.");

      const rzp = new window.Razorpay({
        key: key_id,
        amount,
        currency,
        name: "World of Mysore Pak",
        description: "Authentic Mysore Pak — Pure Ghee Sweets",
        image: "/logo.svg",
        order_id: razorpay_order_id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { order_number },
        theme: { color: "#C9972D" },
        modal: { ondismiss: () => {
          setLoading(false);
          setErrorMsg("Payment cancelled. Please try again.");
        } },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error ?? "Payment verification failed");
            setOrderComplete(true);
            clearCart();
            localStorage.removeItem("delivery_pincode");
            localStorage.removeItem("delivery_postal_code");
            router.push(`/order-confirmation?order=${verifyData.order_number}`);
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Payment verification failed.");
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRazorpay();
  };

  if (!mounted || items.length === 0) return null;

  return (
    <div className="pt-28 sm:pt-32 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-8"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold text-foreground">Shipping Details</h3>
              </div>

              {/* Country selector */}
              <div className="mb-4">
                <Label htmlFor="country" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" /> Ship to
                </Label>
                <select
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      country: e.target.value,
                      // Reset postal-related fields when country changes
                      pincode: "",
                      postal_code: "",
                      state: e.target.value === "IN" ? "Karnataka" : "",
                    }))
                  }
                  className="mt-1 w-full border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#C9972D] focus:border-[#C9972D]"
                >
                  <option value="IN">🇮🇳 India</option>
                  <optgroup label="International (DHL Express)">
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
                  <Input id="name" name="name" type="text" value={form.name} onChange={handleChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone {intl && countryCfg ? <span className="text-xs text-muted-foreground">({countryCfg.dial})</span> : null}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder={intl && countryCfg ? `${countryCfg.dial} ...` : ""}
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1" />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium text-foreground">Address line 1</Label>
                  <Input id="address" name="address" type="text" value={form.address} onChange={handleChange} required className="mt-1" />
                </div>

                {intl && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="address2" className="text-sm font-medium text-foreground">
                      Address line 2 <span className="text-muted-foreground">(apartment, suite — optional)</span>
                    </Label>
                    <Input id="address2" name="address2" type="text" value={form.address2} onChange={handleChange} className="mt-1" />
                  </div>
                )}

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-foreground">City</Label>
                  <Input id="city" name="city" type="text" value={form.city} onChange={handleChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-foreground">
                    {intl ? "State / Province" : "State"}
                  </Label>
                  <Input id="state" name="state" type="text" value={form.state} onChange={handleChange} required className="mt-1" />
                </div>

                {intl ? (
                  <div>
                    <Label htmlFor="postal_code" className="text-sm font-medium text-foreground">
                      {countryCfg?.postal_label ?? "Postal code"}
                    </Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      value={form.postal_code}
                      onChange={handleChange}
                      required
                      maxLength={12}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="pincode" className="text-sm font-medium text-foreground">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      type="text"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      inputMode="numeric"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Shipping — for international orders show both courier options as radio */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                {rateOptions.length > 1 ? "Choose Delivery Partner" : "Shipping"}
              </h3>
              {rateLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {intl ? "Calculating international shipping…" : "Checking rates for your pincode…"}
                </div>
              ) : rateOptions.length > 1 ? (
                <div className="space-y-2">
                  {rateOptions.map((opt) => (
                    <label
                      key={opt.courier_company_id}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${
                        selectedCourierId === opt.courier_company_id
                          ? "border-[#C9972D] bg-[#C9972D]/5"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="courier"
                          checked={selectedCourierId === opt.courier_company_id}
                          onChange={() => setSelectedCourierId(opt.courier_company_id)}
                          className="accent-[#C9972D]"
                        />
                        <span>
                          <span className="font-medium text-foreground text-sm">{opt.courier_name}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            {opt.etd} business days
                          </span>
                        </span>
                      </span>
                      <span className="font-semibold text-foreground text-sm">₹{opt.rate}</span>
                    </label>
                  ))}
                </div>
              ) : cheapestRate ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B3A2D]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-[#1B3A2D]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cheapestRate.courier_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Estimated delivery in {cheapestRate.etd} days
                    </p>
                    {subtotal > 1500 && (
                      <p className="text-xs text-green-600 font-medium mt-1">Free shipping on orders above ₹1500</p>
                    )}
                  </div>
                </div>
              ) : rateError ? (
                <p className="text-sm text-red-600">{rateError}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {intl
                    ? "Enter a valid postal code to see delivery options"
                    : form.pincode.length === 6
                    ? "Enter a valid pincode to see delivery options"
                    : "Enter your pincode above to see delivery time & cost"}
                </p>
              )}

              {intl && (
                <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Customs duty / import tax is paid by the recipient on delivery — amount depends on
                    your country&apos;s rules. We declare full product value on the commercial invoice.
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Payment Method</h3>

              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#C9972D] bg-[#C9972D]/5 mb-6">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#C9972D]">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Online Payment</p>
                  <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking</p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-gold-dark py-6 text-base font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  `Pay ₹${total.toFixed(2)} with Razorpay`
                )}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Order Summary</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.weight}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} ({item.weight}) × {item.quantity}
                  </span>
                  <span className="text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span><span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Shipping</span>
                  <span>
                    {intl
                      ? cheapestRate
                        ? `₹${cheapestRate.rate}`
                        : "—"
                      : subtotal > 1500
                      ? "Free"
                      : cheapestRate
                      ? `₹${cheapestRate.rate}`
                      : "—"}
                  </span>
                </div>
                {cheapestRate && (intl || subtotal <= 1500) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    via {cheapestRate.courier_name} · {cheapestRate.etd} {intl ? "business days" : "days"}
                  </p>
                )}
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>GST</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground mt-3 pt-3 border-t border-border">
                  <span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border space-y-2">
              {["100% Secure Payment", "Pure Ghee Guarantee", intl ? "DHL Express Worldwide" : "Delhivery & DTDC Express"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-3.5 h-3.5 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
