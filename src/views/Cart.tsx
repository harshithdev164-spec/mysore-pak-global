"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import CartItemComponent from "@/components/CartItemComponent";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MapPin, Loader2, Truck, CheckCircle2, Globe2 } from "lucide-react";
import { SUPPORTED_COUNTRIES, COUNTRY_BY_CODE, validatePostalCode, isInternational } from "@/lib/countries";

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

  // Country (ISO-2). "IN" = domestic; anything else = international (Delhivery or DHL).
  const [country, setCountry] = useState("IN");
  const [postal, setPostal] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  // For domestic: single rate (cheapestRate is the only option).
  // For international: rateOptions has both [Delhivery, DHL]; selectedCourierId picks one.
  interface RateOption {
    courier_company_id: number;
    courier_name: string;
    rate: number;
    etd: string;
  }
  const [rateOptions, setRateOptions] = useState<RateOption[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);
  const [rateError, setRateError] = useState("");

  const intl = isInternational(country);
  const countryCfg = COUNTRY_BY_CODE[country];

  // Total weight of cart items
  const totalWeight = items.reduce(
    (sum, item) => sum + parseWeightKg(item.weight) * item.quantity,
    0
  );

  // Restore preferences from localStorage on mount
  useEffect(() => {
    const savedCountry = localStorage.getItem("delivery_country");
    if (savedCountry) setCountry(savedCountry);
    const savedPincode = localStorage.getItem("delivery_pincode");
    if (savedPincode) setPostal(savedPincode);
    const savedCourier = localStorage.getItem("delivery_courier_id");
    if (savedCourier) setSelectedCourierId(parseInt(savedCourier, 10));
  }, []);

  // Fetch rates whenever country/postal/weight changes
  useEffect(() => {
    setRateError("");
    setRateOptions([]);

    const valid = intl
      ? postal.length > 0 && validatePostalCode(postal, country)
      : /^\d{6}$/.test(postal);

    if (!valid) return;

    let cancelled = false;
    setRateLoading(true);
    const url = intl
      ? `/api/shipping/intl-rates?country=${country}&postal_code=${encodeURIComponent(
          postal
        )}&weight_kg=${Math.max(totalWeight, 0.5).toFixed(2)}&value_inr=${Math.max(subtotal, 100)}`
      : `/api/shipping/rates?pincode=${postal}&weight=${Math.max(
          totalWeight,
          0.1
        ).toFixed(2)}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setRateError(data.error);
          return;
        }
        const options: RateOption[] = data.data ?? [];
        setRateOptions(options);
        // Auto-select: keep saved choice if still valid; otherwise the cheapest
        setSelectedCourierId((prev) => {
          if (prev && options.some((o) => o.courier_company_id === prev)) return prev;
          if (options.length === 0) return null;
          return options.reduce((a, b) => (a.rate <= b.rate ? a : b)).courier_company_id;
        });
      })
      .catch(() => {
        if (!cancelled) setRateError("Couldn't fetch rates");
      })
      .finally(() => {
        if (!cancelled) setRateLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, postal, totalWeight, intl, subtotal]);

  // Persist preferences so Checkout can pre-fill
  useEffect(() => {
    localStorage.setItem("delivery_country", country);
    if (intl) {
      if (postal) localStorage.setItem("delivery_postal_code", postal);
    } else if (/^\d{6}$/.test(postal)) {
      localStorage.setItem("delivery_pincode", postal);
    }
    if (selectedCourierId !== null) {
      localStorage.setItem("delivery_courier_id", String(selectedCourierId));
    }
  }, [country, postal, intl, selectedCourierId]);

  const selectedRate =
    rateOptions.find((o) => o.courier_company_id === selectedCourierId) ?? rateOptions[0] ?? null;

  // Shipping cost — domestic free above ₹1500; intl uses customer's selected courier.
  const shipping =
    subtotal === 0
      ? 0
      : intl
      ? selectedRate?.rate ?? 0
      : subtotal > 1500
      ? 0
      : selectedRate?.rate ?? 99;
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
                      : intl
                      ? selectedRate
                        ? `₹${selectedRate.rate}`
                        : rateLoading
                        ? "Calculating…"
                        : "Enter postal code"
                      : subtotal > 1500
                      ? "Free"
                      : selectedRate
                      ? `₹${selectedRate.rate}`
                      : "₹99"}
                  </span>
                </div>
                {!intl && subtotal > 1500 && (
                  <p className="text-xs text-pistachio flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Free shipping on orders above ₹1,500!
                  </p>
                )}
                {!intl && subtotal > 0 && subtotal <= 1500 && selectedRate && (
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {selectedRate.courier_name} · {selectedRate.etd} days
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
                {intl && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5 leading-snug">
                    Customs duty / import tax is paid by the recipient on delivery —
                    amount varies by country.
                  </p>
                )}
              </div>

              {/* International courier picker — show both options as radios */}
              {intl && rateOptions.length > 0 && (
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Choose delivery partner
                  </div>
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
                          <span className="font-medium text-foreground">{opt.courier_name}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            {opt.etd} business days
                          </span>
                        </span>
                      </span>
                      <span className="font-semibold text-foreground text-sm">₹{opt.rate}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Country + postal-code estimate */}
              {subtotal > 0 && (
                <div className="border-t border-border pt-4 space-y-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                      <Globe2 className="w-3.5 h-3.5" />
                      Ship to
                    </label>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setPostal("");
                      }}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#C9972D] focus:border-[#C9972D]"
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

                  {(intl || subtotal <= 1500) && (
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {intl ? countryCfg?.postal_label ?? "Postal code" : "Pincode"}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode={intl ? "text" : "numeric"}
                          maxLength={intl ? 12 : 6}
                          value={postal}
                          onChange={(e) =>
                            setPostal(intl ? e.target.value : e.target.value.replace(/\D/g, ""))
                          }
                          placeholder={intl ? "e.g. 10001" : "Enter 6-digit pincode"}
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
