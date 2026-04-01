export const revalidate = 30; // cache dashboard stats for 30 seconds
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createAdminClient();

  const [
    { count: orderCount },
    { data: revenueData },
    { count: productCount },
    { count: categoryCount },
    { data: recentOrders },
    { data: orderItems },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").neq("status", "cancelled").limit(10000),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("order_items")
      .select("product_name, quantity, total_price")
      .limit(2000),
  ]);

  const totalRevenue = revenueData?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) ?? 0;

  // Aggregate top products from order items
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const item of orderItems ?? []) {
    const key = item.product_name;
    if (!productMap[key]) productMap[key] = { name: key, qty: 0, revenue: 0 };
    productMap[key].qty += item.quantity;
    productMap[key].revenue += Number(item.total_price) || 0;
  }
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return NextResponse.json({
    data: {
      orderCount: orderCount ?? 0,
      totalRevenue,
      productCount: productCount ?? 0,
      categoryCount: categoryCount ?? 0,
      recentOrders: recentOrders ?? [],
      topProducts,
    },
  });
}
