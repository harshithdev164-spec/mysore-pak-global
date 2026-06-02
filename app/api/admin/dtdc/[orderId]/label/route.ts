export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getDtdcShippingLabel, isDtdcConfigured } from "@/lib/dtdc";

// GET /api/admin/dtdc/[orderId]/label
//
// Streams the 4x6 PDF label for the booked DTDC consignment of this order.
export async function GET(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  if (!isDtdcConfigured()) {
    return NextResponse.json({ error: "DTDC not configured" }, { status: 503 });
  }

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, awb_code")
    .eq("id", params.orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (!order.awb_code) {
    return NextResponse.json({ error: "Order has no DTDC reference number" }, { status: 400 });
  }

  const result = await getDtdcShippingLabel(order.awb_code);
  if (!result.ok || !result.pdf) {
    return NextResponse.json(
      { error: `DTDC label fetch failed (${result.status}): ${result.error ?? ""}` },
      { status: 502 }
    );
  }

  return new Response(new Uint8Array(result.pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="dtdc-label-${order.order_number}.pdf"`,
    },
  });
}
