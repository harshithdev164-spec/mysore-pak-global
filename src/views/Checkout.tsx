"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Truck, CreditCard, Banknote } from "lucide-react";

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
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [orderComplete, setOrderComplete] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    address: "", city: "", state: "Karnataka", pincode: "",
  });

  // Shipping rate state
  const [rateLoading, setRateLoading] = useState(false);
  const [cheapestRate, setCheapestRate] = useState<CourierRate | null>(null);
  const rateAbortRef = useRef<AbortController | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("delivery_pincode");
    if (saved) setForm((p) => ({ ...p, pincode: p.pincode || saved }));
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0 && !orderComplete) router.push("/shop");
  }, [mounted, items.length, router, orderComplete]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.fullName || "",
        email: prev.email || user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [user]);

  const totalWeight = items.reduce(
    (sum, item) => sum + parseWeightKg(item.weight) * item.quantity,
    0
  );

  useEffect(() => {
    const pc = form.pincode.trim();
    if (!/^\d{6}$/.test(pc)) {
      setCheapestRate(null);
      return;
    }
    rateAbortRef.current?.abort();
    const ctrl = new AbortController();
    rateAbortRef.current = ctrl;
    setRateLoading(true);
    fetch(
      `/api/shipping/rates?pincode=${pc}&weight=${Math.max(totalWeight, 0.1).toFixed(2)}`,
      { signal: ctrl.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        const best: CourierRate | undefined = data.data?.[0];
        setCheapestRate(best ?? null);
      })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pincode]);

  const shipping = subtotal > 1500 ? 0 : (cheapestRate?.rate ?? 99);
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── COD flow ──────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: {
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          items: items.map((item) => ({
            product_name: item.product.name,
            weight_label: item.weight,
            quantity: item.quantity,
            unit_price: item.price,
          })),
          payment_method: "cod",
          shipping_cost: shipping,
          courier_id: cheapestRate?.courier_company_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");
      setOrderComplete(true);
      clearCart();
      localStorage.removeItem("delivery_pincode");
      router.push(`/order-confirmation?order=${data.data.order_number}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  // ── Razorpay flow ─────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: {
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
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
        modal: { ondismiss: () => setLoading(false) },
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
    if (paymentMethod === "cod") {
      await handleCOD();
    } else {
      await handleRazorpay();
    }
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
                {user && (
                  <span className="font-body text-xs text-[#C9972D] bg-[#C9972D]/10 px-2.5 py-1 rounded-full">
                    Auto-filled from your account
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { name: "name", label: "Full Name", type: "text" },
                  { name: "phone", label: "Phone", type: "tel" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "address", label: "Address", type: "text" },
                  { name: "city", label: "City", type: "text" },
                  { name: "state", label: "State", type: "text" },
                  { name: "pincode", label: "Pincode", type: "text" },
                ].map((field) => (
                  <div key={field.name} className={field.name === "address" ? "sm:col-span-2" : ""}>
                    <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
                      {field.label}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      required
                      className="mt-1"
                      {...(field.name === "pincode" ? { maxLength: 6, inputMode: "numeric" as const } : {})}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Shipping</h3>
              {rateLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking rates for your pincode…
                </div>
              ) : cheapestRate ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B3A2D]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-[#1B3A2D]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cheapestRate.courier_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Estimated delivery in {cheapestRate.etd} days</p>
                    {subtotal > 1500 && (
                      <p className="text-xs text-green-600 font-medium mt-1">Free shipping on orders above ₹1500</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {form.pincode.length === 6
                    ? "Enter a valid pincode to see delivery options"
                    : "Enter your pincode above to see delivery time & cost"}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Payment Method</h3>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {/* Online Payment */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "razorpay"
                      ? "border-[#C9972D] bg-[#C9972D]/5"
                      : "border-border hover:border-[#C9972D]/40"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === "razorpay" ? "bg-[#C9972D]" : "bg-muted"
                  }`}>
                    <CreditCard className={`w-4 h-4 ${paymentMethod === "razorpay" ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Online Payment</p>
                    <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking</p>
                  </div>
                </button>

                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#C9972D] bg-[#C9972D]/5"
                      : "border-border hover:border-[#C9972D]/40"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === "cod" ? "bg-[#C9972D]" : "bg-muted"
                  }`}>
                    <Banknote className={`w-4 h-4 ${paymentMethod === "cod" ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when it arrives</p>
                  </div>
                </button>
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
                ) : paymentMethod === "cod" ? (
                  `Place Order — Pay ₹${total} on Delivery`
                ) : (
                  `Pay ₹${total} with Razorpay`
                )}
              </Button>

              {paymentMethod === "cod" && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Your order will be confirmed immediately. Pay when delivered.
                </p>
              )}
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
                    {subtotal > 1500 ? "Free" : cheapestRate ? `₹${cheapestRate.rate}` : "₹99"}
                  </span>
                </div>
                {cheapestRate && subtotal <= 1500 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    via {cheapestRate.courier_name} · {cheapestRate.etd} days
                  </p>
                )}
                <div className="flex justify-between font-semibold text-foreground mt-3 pt-3 border-t border-border">
                  <span>Total</span><span className="text-primary">₹{total}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border space-y-2">
              {["100% Secure Payment", "Pure Ghee Guarantee", "Shiprocket Delivery"].map((t) => (
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
