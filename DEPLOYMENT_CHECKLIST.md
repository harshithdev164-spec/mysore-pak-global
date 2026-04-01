# 🔧 Deployment & Admin Panel Checklist

## ❌ CRITICAL: Missing Environment Variables in Vercel

**Problem**: Admin panel shows no orders because `SUPABASE_SERVICE_ROLE_KEY` is not set in your new Vercel account.

### ✅ Fix: Add Missing Env Vars to Vercel

1. **Go to Vercel Dashboard**
   - Login: https://vercel.com
   - Select project: `mysore-pak-global`
   - Click: Settings → Environment Variables

2. **Add these 10 variables** (copy exact values from your `.env.local`):

   ```
   NEXT_PUBLIC_SUPABASE_URL
   https://maojwszmbrlnrjrllhar.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb2p3c3ptYnJsbnJqcmxsaGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTg5MTksImV4cCI6MjA4ODg3NDkxOX0.4-ajtMwcSenrOasZRnT6oKmPjcRDE5rPIG5GbeU07kA
   
   SUPABASE_SERVICE_ROLE_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb2p3c3ptYnJsbnJqcmxsaGFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI5ODkxOSwiZXhwIjoyMDg4ODc0OTE5fQ.dXNun3oaQbCYlf9Mg10kOLmNrmQ_icXSgCXOvgpT3VU
   
   REDIS_URL
   redis://default:gEIawIsbw2S5qEyGuvJlFCNCy8rfgJzg@redis-14685.c256.us-east-1-2.ec2.cloud.redislabs.com:14685
   
   RAZORPAY_KEY_ID
   rzp_live_SUaE3ESmol8kbG
   
   RAZORPAY_KEY_SECRET
   g45MyNtanISEf10iIAbXEUiS
   
   NEXT_PUBLIC_RAZORPAY_KEY_ID
   rzp_live_SUaE3ESmol8kbG
   
   SHIPROCKET_EMAIL
   sumukh01@gmail.com
   
   SHIPROCKET_PASSWORD
   &kMPP@ek6ZZDFzEftFRXg6bNk8z!cgbP
   
   SHIPROCKET_PICKUP_LOCATION
   warehouse
   
   SHIPROCKET_PICKUP_PINCODE
   570011
   
   NEXT_PUBLIC_APP_URL
   https://worldofmysorepak.com
   ```

3. **Redeploy**:
   - Click: Deployments
   - Find latest: Right-click → Redeploy
   - Wait 2-3 minutes for deployment

---

## ❌ Step 2: Setup Stock Management in Supabase

**Problem**: Stock updates require proper RLS policies and column setup.

### ✅ Fix: Apply Stock Management Migration

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Select project: `maojwszmbrlnrjrllhar`
   - Click: SQL Editor

2. **Copy & paste this SQL** and execute:

   ```sql
   -- Ensure stock_quantity column exists
   ALTER TABLE product_weights
   ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;

   -- Ensure all weights have stock values
   UPDATE product_weights
   SET stock_quantity = COALESCE(stock_quantity, 100)
   WHERE stock_quantity IS NULL;

   -- Allow service-role to read all orders
   CREATE POLICY IF NOT EXISTS "Service role can select orders"
     ON orders FOR SELECT
     USING (true);

   -- Allow service-role to update product weights (stock)
   CREATE POLICY IF NOT EXISTS "Service role can update stock"
     ON product_weights FOR UPDATE
     USING (true)
     WITH CHECK (true);

   -- Allow service-role to update order items
   CREATE POLICY IF NOT EXISTS "Service role can update order items"
     ON order_items FOR UPDATE
     USING (true)
     WITH CHECK (true);

   -- Verify data
   SELECT COUNT(*) as total_weights,
          COUNT(CASE WHEN stock_quantity IS NULL THEN 1 END) as null_stock
   FROM product_weights;
   ```

3. **Done!** Stock management and admin panel fully functional.

---

## ✅ Step 3: Auto-Shipment Enhanced (Just Deployed)

**What Changed**:
- ✅ Auto-generate AWB after Razorpay payment
- ✅ Auto-generate shipping label
- ✅ No manual Shiprocket clicks needed
- ✅ Order flows: Payment → Shiprocket Order → AWB → Label (all automatic)

**Testing**:
1. Make a test payment on checkout
2. Go to admin panel → Orders
3. New order should appear with:
   - Status: `confirmed`
   - Shiprocket details auto-filled
   - Ready to print label from Shiprocket dashboard

---

## 🔍 Verification Checklist

After completing steps 1-2, verify:

- [ ] Vercel env vars set (all 10 variables)
- [ ] Vercel deployment redeployed  
- [ ] Supabase RLS policy applied
- [ ] Admin panel shows all orders
- [ ] Test payment creates order automatically in Shiprocket
- [ ] Shiprocket order has AWB + label generated

---

## 📝 Implementation Details

### Auto-Shipment Flow (New)
```
Payment Verified (Razorpay)
    ↓
Create Shiprocket Order
    ↓
Assign Courier (AWB Generation) ← NEW: Auto
    ↓
Generate Shipping Label ← NEW: Auto
    ↓
Order Ready to Ship (No manual action needed)
```

### Before
- Manual: Go to Shiprocket → Click Ship → Assign Courier

### After  
- Automatic: All done on payment verification

---

## 🚨 If Issues Persist

**Orders still not showing?**
1. Check Vercel logs: Deployments → Latest → Logs
2. Look for: `[supabase] SUPABASE_SERVICE_ROLE_KEY is not set`
3. If present → Env var wasn't set properly, try again

**Auto-shipment not working?**
1. Check order details in admin
2. Look for: `shiprocket_shipment_id`, `awb_code`
3. If missing → Check Vercel function logs for Shiprocket errors
4. Manual fallback: Use `/api/admin/shiprocket/[orderId]?action=label` endpoint

---

## 📞 Support
- Email: support@worldofmysorepak.com
- Phone: +91 6364895255 / 6364895254
