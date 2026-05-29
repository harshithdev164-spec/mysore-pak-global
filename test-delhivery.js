const fs = require("fs");
const envVars = fs.readFileSync(".env.local", "utf8").split('\n');
envVars.forEach(line => {
  if (line && line.includes('=')) {
    const [k, v] = line.split('=');
    process.env[k.trim()] = v.replace(/"/g, '').trim();
  }
});

async function run() {
  const token = process.env.DELHIVERY_TOKEN;
  const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION;
  const BASE_URL = "https://track.delhivery.com";

  const payload = {
    shipments: [
      {
        name: "Test User",
        add: "123 Test St",
        pin: "560001",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        phone: "9876543210",
        order: "TEST-" + Date.now(),
        payment_mode: "Prepaid",
        pickup_location: pickupLocation, // Added fixed mandatory field
        return_pin: "560001",
        return_city: "Bangalore",
        return_phone: "9876543210",
        return_add: "123 Test St",
        return_state: "Karnataka",
        return_country: "India",
        products_desc: "Mysore Pak (x1)",
        hsn_code: "",
        cod_amount: "0",
        order_date: "2023-10-10 10:10",
        total_amount: "150",
        seller_inv: "TEST-" + Date.now(),
        quantity: "1",
        weight: "500",
        shipping_mode: "Express"
      }
    ],
    pickup_location: {
      name: pickupLocation
    }
  };

  const form = new URLSearchParams();
  form.append("format", "json");
  form.append("data", JSON.stringify(payload));

  try {
    const res = await fetch(`${BASE_URL}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: form.toString()
    });
    const json = await res.json();
    console.log("RESPONSE_JSON:");
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.log("ERR:", e.message);
  }
}
run();
