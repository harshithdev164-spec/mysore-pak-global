"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, ExternalLink, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  product_name: string;
  weight_label: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string | null;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  awb_code: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  items: OrderItem[];
}

const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"];

const OrderConfirmation = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) { setLoading(false); return; }
    fetch(`/api/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((j) => { if (j.data) setOrder(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const isCod = order?.payment_method === "cod";
  const currentStep = STATUS_STEPS.indexOf(order?.status ?? "confirmed");

  if (loading) {
    return (
      <div className="pt-28 sm:pt-32 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-32 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-3">
            {isCod ? "Order Placed!" : "Payment Successful!"}
          </h1>
          <p className="font-body text-muted-foreground">
            {isCod
              ? "Your order is confirmed. Pay when it arrives at your doorstep."
              : "Thank you for your order. You'll receive a confirmation email shortly."}
          </p>
          {orderNumber && (
            <p className="font-mono text-sm font-semibold text-primary mt-2">{orderNumber}</p>
          )}

          {orderNumber && (
            <a
              href={`https://wa.me/916364895293?text=${encodeURIComponent(orderNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-medium px-4 py-2.5 rounded-full transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Track this order on WhatsApp
            </a>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4"
        >
          {/* Order Status Track */}
          {order && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-heading text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Order Status
              </h2>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        i <= currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {i < currentStep ? "✓" : i + 1}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 capitalize whitespace-nowrap">{step}</span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking */}
          {order?.awb_code && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-primary" />
                <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Tracking</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AWB Code</span>
                  <span className="font-mono font-semibold text-foreground">{order.awb_code}</span>
                </div>
                {order.courier_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Courier</span>
                    <span className="text-foreground">{order.courier_name}</span>
                  </div>
                )}
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary font-medium hover:underline mt-2 text-sm"
                  >
                    Track your shipment <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          {order?.items && order.items.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-primary" />
                <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Order Items</h2>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product_name} <span className="text-xs">({item.weight_label})</span> × {item.quantity}
                    </span>
                    <span className="text-foreground font-medium">₹{item.total_price}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span><span>₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>{order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground pt-1">
                    <span>{isCod ? "Amount to pay on delivery" : "Total paid"}</span>
                    <span className="text-primary">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment info */}
          {order && (
            <div className="bg-card border border-border rounded-xl p-5 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Payment</span>
                <span className="capitalize font-medium text-foreground">
                  {isCod ? "Cash on Delivery" : order.payment_method ?? "Online"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className={`font-semibold capitalize ${
                  order.payment_status === "paid" ? "text-green-600" :
                  isCod ? "text-amber-600" : "text-muted-foreground"
                }`}>
                  {isCod && order.payment_status === "pending" ? "Pay on delivery" : order.payment_status}
                </span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/profile">View All Orders</Link>
            </Button>
            <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-gold-dark">
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
