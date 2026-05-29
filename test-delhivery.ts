import { createDelhiveryOrder } from "./src/lib/delhivery";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  try {
    const res = await createDelhiveryOrder({
      order_number: "TEST-" + Date.now(),
      order_date: "2023-10-10 10:10",
      customer_name: "Test User",
      customer_email: "test@example.com",
      customer_phone: "9876543210",
      address: "123 Test St",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      items: [{ name: "Mysore Pak", sku: "mysore-pak", units: 1, selling_price: 100 }],
      subtotal: 100,
      shipping_charges: 50,
      weight_kg: 0.5,
      payment_method: "Prepaid"
    });
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
run();
