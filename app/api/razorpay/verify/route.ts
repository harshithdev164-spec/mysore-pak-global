export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import crypto from "crypto";
import { createDelhiveryOrder, parseWeightKg } from "@/lib/delhivery";
import { createDhlShipment, isDhlConfigured } from "@/lib/dhl";
import { HS_CODE_SWEETS } from "@/lib/countries";
import {
  sendOrderConfirmedTemplate,
  sendOrderShippedTemplate,
  trackingUrlFor,
} from "@/lib/whatsapp-templates";
import { sendOrderConfirmation } from "@/lib/emails/send-order-confirmation";

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
  }

  let body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    db_order_id: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch order items to decrement stock
  const { data: orderData } = await supabase
    .from("orders")
    .select(`
      id, order_number,
      items:order_items(id, product_weight_id, quantity)
    `)
    .eq("id", db_order_id)
    .single();

  if (orderData?.items && Array.isArray(orderData.items)) {
    // Decrement stock for each item
    for (const item of orderData.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weightId = (item as any).product_weight_id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qty = (item as any).quantity ?? 1;
      if (weightId) {
        // Decrement stock safely
        const { data: weight } = await supabase
          .from("product_weights")
          .select("stock_quantity")
          .eq("id", weightId)
          .single();
        if (weight) {
          const newStock = Math.max(0, (weight.stock_quantity ?? 0) - qty);
          await supabase
            .from("product_weights")
            .update({ stock_quantity: newStock })
            .eq("id", weightId);
        }
      }
    }
  }

  // Mark order as paid + confirmed in DB
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      notes: `razorpay_payment_id:${razorpay_payment_id}`,
    })
    .eq("id", db_order_id)
    .select("order_number")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  // ── Proactive WhatsApp: order confirmed ───────────────────────────
  // Best-effort; never blocks the payment response. Fires once per payment.
  try {
    const { data: customer } = await supabase
      .from("orders")
      .select("customer_name, customer_phone, total")
      .eq("id", db_order_id)
      .maybeSingle();
    if (customer?.customer_phone) {
      await sendOrderConfirmedTemplate({
        to: customer.customer_phone,
        customer_name: (customer.customer_name ?? "").split(" ")[0] || "there",
        order_number: data.order_number,
        total: Math.round(Number(customer.total ?? 0)),
      });
    }
  } catch (err) {
    console.error("[verify] order_confirmed whatsapp failed:", err);
  }

  // ── Order confirmation email via ZeptoMail ────────────────────────
  // Same best-effort contract as WhatsApp — never blocks the response.
  // Dedup handled inside sendOrderConfirmation via confirmation_email_sent_at.
  try {
    const emailResult = await sendOrderConfirmation(db_order_id);
    if (!emailResult.ok && emailResult.error) {
      console.error("[verify] confirmation email failed:", emailResult.error);
    }
  } catch (err) {
    console.error("[verify] confirmation email threw:", err);
  }

  // Auto-create courier shipment (best-effort — payment is already confirmed above).
  // Branches on customer's chosen courier (`courier_id`):
  //   100 → DHL Express (CSB-V customs form)
  //   else → Delhivery (domestic + international, default)
  try {
    // Fetch full order details
    const { data: fullOrder } = await supabase
      .from("orders")
      .select(`
        id, order_number, customer_name, customer_email, customer_phone,
        subtotal, shipping_cost, courier_id, shipping_address,
        created_at,
        items:order_items(product_name, weight_label, quantity, unit_price)
      `)
      .eq("id", db_order_id)
      .single();

    if (fullOrder) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addr = (fullOrder.shipping_address ?? {}) as Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderItems = (fullOrder.items ?? []) as any[];

      const country = String(addr.country ?? "IN").toUpperCase();
      const courierId = (fullOrder as { courier_id?: number }).courier_id ?? 1;

      // Total weight in kg
      const totalWeight = orderItems.reduce(
        (sum: number, item: { weight_label: string; quantity: number }) => {
          return sum + parseWeightKg(item.weight_label) * item.quantity;
        },
        0
      );

      const useDhl = courierId === 100 && country !== "IN" && isDhlConfigured();
      const useDtdc = courierId === 200;

      if (useDtdc) {
        // ── DTDC: domestic India ──
        try {
          const { createDtdcOrder } = await import("@/lib/dtdc");
          const dtdcResult = await createDtdcOrder({
            order_number: fullOrder.order_number,
            customer_name: fullOrder.customer_name,
            customer_email: fullOrder.customer_email,
            customer_phone: fullOrder.customer_phone,
            address: addr.address ?? "",
            city: addr.city ?? "",
            state: addr.state ?? "",
            pincode: addr.pincode ?? addr.postal_code ?? "",
            items: orderItems.map((item) => ({
              name: item.product_name,
              units: item.quantity,
              selling_price: item.unit_price,
            })),
            subtotal: fullOrder.subtotal,
            shipping_charges: fullOrder.shipping_cost ?? 0,
            weight_kg: Math.max(totalWeight, 0.5),
            payment_method: "Prepaid",
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dbUpdate: Record<string, any> = {
            courier_name: "DTDC Express",
          };
          if (dtdcResult.reference_number) {
            dbUpdate.awb_code = dtdcResult.reference_number;
            dbUpdate.status = "pickup";
          }

          await supabase.from("orders").update(dbUpdate).eq("id", db_order_id);
        } catch (dtdcErr) {
          const errMsg = dtdcErr instanceof Error ? dtdcErr.message : String(dtdcErr);
          console.error("[DTDC verify] Order creation failed:", errMsg);
          // Update order with error note for admin to see
          await supabase.from("orders").update({
            courier_name: "DTDC Express",
            notes: `DTDC shipment creation failed: ${errMsg.slice(0, 200)}`
          }).eq("id", db_order_id);
        }
      } else if (!useDhl && process.env.DELHIVERY_TOKEN) {
        // ── Delhivery: domestic AND international (when customer picked it) ──
        const orderDate = new Date(fullOrder.created_at)
          .toISOString()
          .replace("T", " ")
          .slice(0, 16);

        const delResult = await createDelhiveryOrder({
          order_number: fullOrder.order_number,
          order_date: orderDate,
          customer_name: fullOrder.customer_name,
          customer_email: fullOrder.customer_email,
          customer_phone: fullOrder.customer_phone,
          address: addr.address ?? "",
          city: addr.city ?? "",
          state: addr.state ?? "",
          pincode: addr.pincode ?? addr.postal_code ?? "",
          country,
          items: orderItems.map((item) => ({
            name: item.product_name,
            sku: `${item.product_name.toLowerCase().replace(/\s+/g, "-")}-${item.weight_label.toLowerCase().replace(/\s+/g, "")}`,
            units: item.quantity,
            selling_price: item.unit_price,
          })),
          subtotal: fullOrder.subtotal,
          shipping_charges: fullOrder.shipping_cost ?? 0,
          weight_kg: Math.max(totalWeight, 0.1),
          payment_method: "Prepaid",
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbUpdate: Record<string, any> = {
          courier_name: "Delhivery",
        };
        if (delResult.waybill) {
          dbUpdate.awb_code = delResult.waybill;
          dbUpdate.status = "pickup";
        }

        await supabase.from("orders").update(dbUpdate).eq("id", db_order_id);

        if (delResult.waybill) {
          await sendOrderShippedTemplate({
            to: fullOrder.customer_phone,
            customer_name: (fullOrder.customer_name ?? "").split(" ")[0] || "there",
            order_number: fullOrder.order_number,
            courier: "Delhivery",
            awb: delResult.waybill,
            tracking_url: trackingUrlFor("Delhivery", delResult.waybill),
          });
        }
      } else if (useDhl) {
        // ── DHL Express (only when customer explicitly picked it) ──
        const dhlResult = await createDhlShipment({
          order_number: fullOrder.order_number,
          customer_name: fullOrder.customer_name,
          customer_email: fullOrder.customer_email,
          customer_phone: fullOrder.customer_phone,
          address: addr.address ?? "",
          address2: addr.address2,
          city: addr.city ?? "",
          state: addr.state ?? "",
          postal_code: addr.postal_code ?? addr.pincode ?? "",
          country,
          items: orderItems.map((item) => ({
            name: item.product_name,
            sku: `${item.product_name.toLowerCase().replace(/\s+/g, "-")}-${item.weight_label.toLowerCase().replace(/\s+/g, "")}`,
            units: item.quantity,
            selling_price_inr: item.unit_price,
            weight_kg: parseWeightKg(item.weight_label),
            hs_code: HS_CODE_SWEETS,
          })),
          declared_value_inr: fullOrder.subtotal,
          weight_kg: Math.max(totalWeight, 0.5),
          payment_method: "Prepaid",
        });

        // Persist only the universal fields. DHL-specific columns (label PDF,
        // invoice PDF) require add_dhl_columns.sql migration and are skipped
        // here so the verify route stays portable.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbUpdate: Record<string, any> = {
          courier_name: "DHL Express",
        };
        if (dhlResult.tracking_number) {
          dbUpdate.awb_code = dhlResult.tracking_number;
          dbUpdate.status = "pickup";
        }

        await supabase.from("orders").update(dbUpdate).eq("id", db_order_id);

        if (dhlResult.tracking_number) {
          await sendOrderShippedTemplate({
            to: fullOrder.customer_phone,
            customer_name: (fullOrder.customer_name ?? "").split(" ")[0] || "there",
            order_number: fullOrder.order_number,
            courier: "DHL Express",
            awb: dhlResult.tracking_number,
            tracking_url: trackingUrlFor("DHL Express", dhlResult.tracking_number),
          });
        }
      }
    }
  } catch (err) {
    // Log but never block the payment confirmation response
    console.error(
      "[verify] courier auto-create failed:",
      err instanceof Error ? err.message : err
    );
  }

  return NextResponse.json({ success: true, order_number: data.order_number });
}
