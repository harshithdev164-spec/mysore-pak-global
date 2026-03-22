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
