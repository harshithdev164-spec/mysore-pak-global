// Admin stats — cache for 30 s to avoid hammering Supabase on every refresh
export const revalidate = 30;
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
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = revenueData?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) ?? 0;

  return NextResponse.json({
    data: {
      orderCount: orderCount ?? 0,
      totalRevenue,
      productCount: productCount ?? 0,
      categoryCount: categoryCount ?? 0,
      recentOrders: recentOrders ?? [],
    },
  });
}
