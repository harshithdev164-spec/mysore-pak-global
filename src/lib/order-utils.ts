// src/lib/order-utils.ts

export async function generateOrderNumber(supabase: any): Promise<string> {
  // Fetch recent orders to find the latest valid numeric order number
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("order_number")
    .order("created_at", { ascending: false })
    .limit(100);

  let nextOrderNum = 1;
  if (recentOrders && recentOrders.length > 0) {
    for (const record of recentOrders) {
      if (record.order_number && /^\d+$/.test(record.order_number)) {
        nextOrderNum = parseInt(record.order_number, 10) + 1;
        break;
      }
    }
  }

  return nextOrderNum.toString().padStart(4, "0");
}
