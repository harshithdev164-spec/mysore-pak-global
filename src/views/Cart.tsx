"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import CartItemComponent from "@/components/CartItemComponent";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MapPin, Loader2, Truck, CheckCircle2 } from "lucide-react";

/** Parse weight label → kg (client-safe copy) */
function parseWeightKg(label: string): number {
  const s = label.toLowerCase().replace(/\s+/g, "");
  const kg = s.match(/([\d.]+)kg/);
  if (kg) return parseFloat(kg[1]);
  const g = s.match(/([\d.]+)(?:gm|g)/);
  if (g) return parseFloat(g[1]) / 1000;
  return 0.5;
}

const Cart = () => {
  const { items, subtotal } = useCart();

  // Pincode + rate state
  const [pincode, setPincode] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [cheapestRate, setCheapestRate] = useState<{
    rate: number;
    name: string;
    etd: string;
  } | null>(null);
  const [rateError, setRateError] = useState("");

  // Total weight of cart items
  const totalWeight = items.reduce(
    (sum, item) => sum + parseWeightKg(item.weight) * item.quantity,
    0
  );

  // Fetch rates when pincode is 6 digits
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) {
      setCheapestRate(null);
      setRateError("");
      return;
    }
    let cancelled = false;
    setRateLoading(true);
    setRateError("");
    fetch(`/api/shipping/rates?pincode=${pincode}&weight=${Math.max(totalWeight, 0.1).toFixed(2)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) { setRateError("Couldn't fetch rates"); return; }
        const best = data.data?.[0];
        if (best) setCheapestRate({ rate: best.rate, name: best.courier_name, etd: best.etd });
        else setCheapestRate(null);
      })
      .catch(() => { if (!cancelled) setRateError("Couldn't fetch rates"); })
      .finally(() => { if (!cancelled) setRateLoading(false); });
    return () => { cancelled = true; };
  }, [pincode, totalWeight]);

  // Persist pincode to localStorage so Checkout can pre-fill
  useEffect(() => {
    if (/^\d{6}$/.test(pincode)) {
      localStorage.setItem("delivery_pincode", pincode);
    }
  }, [pincode]);

  // Shipping cost: free above ₹1500, else cheapest rate (or ₹99 default)
  const shipping =
    subtotal === 0 ? 0 : subtotal > 1500 ? 0 : (cheapestRate?.rate ?? 99);
  const total = subtotal + shipping;

  return (
    <div className="pt-28 sm:pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-8"
        >
          Your Cart
        </motion.h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingBag className="h-16 w-16 text-muted mx-auto mb-4" />
            <p className="font-body text-lg text-muted-foreground mb-6">Your cart is empty</p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-gold-dark">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {items.map((item) => (
                <CartItemComponent key={`${item.product.id}-${item.weight}`} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24 space-y-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">Order Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {subtotal === 0
                      ? "—"
                      : subtotal > 1500
                      ? "Free"
                      : cheapestRate
                      ? `₹${cheapestRate.rate}`
                      : "₹99"}
                  </span>
                </div>
                {subtotal > 1500 && (
                  <p className="text-xs text-pistachio flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Free shipping on orders above ₹1,500!
                  </p>
                )}
                {subtotal > 0 && subtotal <= 1500 && cheapestRate && (
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {cheapestRate.name} · {cheapestRate.etd} days
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>

              {/* Pincode delivery estimate */}
              {subtotal > 0 && subtotal <= 1500 && (
                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Check delivery to your pincode
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit pincode"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-1 focus:ring-[#C9972D] focus:border-[#C9972D]"
                    />
                    {rateLoading && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />
                    )}
                  </div>
                  {rateError && (
                    <p className="text-xs text-red-500 mt-1">{rateError}</p>
                  )}
                </div>
              )}

              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-gold-dark py-5">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
