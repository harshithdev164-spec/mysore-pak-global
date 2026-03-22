"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

interface OrderItem {
  product_name: string;
  weight_label: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const PAYMENT_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid:    "bg-green-100 text-green-700",
  failed:  "bg-red-100 text-red-700",
};

export default function Profile() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) { setLoading(false); return; }

    fetch(`/api/orders?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setError(j.error);
        else setOrders(j.data ?? []);
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="pt-28 sm:pt-32 min-h-screen bg-[#FBF7F0] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C9972D] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-[#FBF7F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName ?? ""} className="w-16 h-16 rounded-full border-2 border-[#C9972D]/30 shadow-md object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#1B3A2D] flex items-center justify-center shadow-md">
              <span className="font-heading text-xl font-bold text-[#C9972D]">
                {user?.fullName?.[0] ?? "U"}
              </span>
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B3A2D]">
              {user?.fullName ?? "My Account"}
            </h1>
            <p className="font-body text-sm text-[#1B3A2D]/50 mt-0.5">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        {/* Orders section */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-5 h-5 text-[#C9972D]" />
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">My Orders</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="font-body text-sm text-red-500">{error}</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#1B3A2D]/5">
              <ShoppingBag className="w-10 h-10 text-[#1B3A2D]/20 mx-auto mb-3" />
              <p className="font-body text-[#1B3A2D]/40 text-base">No orders yet.</p>
              <Link href="/shop" className="inline-block mt-4 font-body text-sm font-semibold text-[#C9972D] hover:underline">
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order-confirmation?order=${order.order_number}`}
                  className="group block bg-white border border-[#1B3A2D]/5 rounded-2xl p-5 hover:shadow-md hover:border-[#C9972D]/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-heading text-sm font-bold text-[#1B3A2D]">
                          {order.order_number}
                        </span>
                        <span className={`font-body text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                        <span className={`font-body text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${PAYMENT_STYLES[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                          {order.payment_status}
                        </span>
                      </div>
                      <p className="font-body text-xs text-[#1B3A2D]/40 mt-1.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}
                        {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? "s" : ""}
                        {order.order_items?.[0] && (
                          <span className="ml-1 text-[#1B3A2D]/30">
                            — {order.order_items[0].product_name}
                            {order.order_items.length > 1 ? ` +${order.order_items.length - 1} more` : ""}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-heading text-base font-bold text-[#C9972D]">₹{order.total}</span>
                      <ChevronRight className="w-4 h-4 text-[#1B3A2D]/30 group-hover:text-[#C9972D] transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
