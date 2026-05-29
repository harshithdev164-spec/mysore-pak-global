# DTDC Integration Setup & Troubleshooting

## Overview
DTDC Express is configured as a domestic India shipping option (courier_id = 200). It's used for COD (Cash on Delivery) orders and prepaid orders when selected by the customer.

## Prerequisites
Before setting up DTDC, you need:
- Active DTDC business account
- API Key from DTDC
- Customer Code from DTDC
- Service Type ID (usually "GROUND EXPRESS" or "EXPRESS")
- Pickup location details (address, pincode, phone)

## Setup Instructions

### 1. Get DTDC Credentials
1. Login to DTDC portal: https://www.dtdc.in/
2. Navigate to **Account Settings** → **API Credentials** or **Integration**
3. Copy these values:
   - **API Key** (for booking/label/cancel operations)
   - **Customer Code** (your account identifier)
   - **X-Access-Token** (for tracking queries, optional)

### 2. Update `.env.local`
Add or update these variables:

```env
DTDC_API_BASE_URL=https://apis.dtdc.in/dtdc-api/api/customer/integration
DTDC_API_KEY=your_actual_api_key_here
DTDC_X_ACCESS_TOKEN=your_access_token_here
DTDC_CUSTOMER_CODE=your_customer_code_here
DTDC_SERVICE_TYPE_ID=GROUND EXPRESS
DTDC_BASE_RATE_INR=80        # Base rate for first KG
DTDC_PER_KG_INR=40           # Additional rate per KG
DTDC_ETD_DAYS=3-5            # Estimated Delivery Time
```

### 3. Verify Configuration
Run the debug endpoint to verify your credentials are set:

```bash
# In your browser or terminal:
curl "http://localhost:3000/api/admin/dtdc/debug?order_id=<actual-order-uuid>"

# Replace <actual-order-uuid> with a real order ID from your database
```

Expected response if configured correctly:
```json
{
  "success": true,
  "env": {
    "DTDC_API_KEY": "set",
    "DTDC_CUSTOMER_CODE": "set",
    "configured": true
  },
  "result": {
    "reference_number": "DTL123456789",
    "status": true
  }
}
```

## How It Works

### Order Creation Flow

1. **COD Orders with DTDC** (`/api/orders`):
   - When `courier_id = 200` and payment method is COD
   - System calls `createDtdcOrder()`
   - DTDC booking reference is saved to `orders.awb_code`
   - Order status updated to "pickup"

2. **Prepaid Orders with DTDC** (`/api/razorpay/verify`):
   - After Razorpay payment verification
   - If DTDC was selected, system creates DTDC shipment
   - Reference number stored in `orders.awb_code`
   - Errors are logged to `orders.notes` field

3. **Shipping Rate Calculation** (`/api/shipping/rates`):
   - Uses static rates (no live rate API)
   - Formula: `base_rate + (per_kg_rate * weight_kg)`
   - Default: ₹80 + (₹40 × weight)

## Troubleshooting

### Issue: "DTDC credentials not set"
**Cause**: Environment variables not configured

**Fix**:
1. Verify `.env.local` has all DTDC_* variables
2. Verify values are not placeholder text (e.g., `your_dtdc_api_key`)
3. Restart the dev server: `npm run dev`

### Issue: "DTDC API returned error"
**Steps to Debug**:

1. Note the order ID from order confirmation
2. Visit debug endpoint: 
   ```
   http://localhost:3000/api/admin/dtdc/debug?order_id=<order-id>
   ```

3. Check `last_exchange` in response for:
   - **DTDC Request**: What we sent to DTDC
   - **Response Status**: HTTP status code (should be 200)
   - **Response Body**: DTDC's error message

Common errors:
- **401/403 Unauthorized**: Invalid API Key or Customer Code
- **Invalid Pincode**: Shipment destination not serviceable
- **Invalid Address**: Missing required address fields
- **Timeout**: DTDC API server down (try again later)

### Issue: Order created but no AWB code
**Cause**: DTDC shipment creation failed silently

**Fix**:
1. Check order's `notes` field for error message
2. Use debug endpoint (see above)
3. Common causes:
   - Incomplete customer address
   - Invalid pincode
   - COD amount exceeds limit
   - DTDC account not activated for that service

### Issue: Address validation fails
**Solution**: Ensure these fields are provided:
- `address`: Full street address (min 2 chars)
- `city`: City name (min 2 chars)
- `state`: State/UT name (min 2 chars)
- `pincode`: Valid 6-digit Indian pincode

### Issue: Weight parsing error
**Solution**: Ensure product weight labels are formatted as:
- `"250g"` or `"250 gm"` (for grams)
- `"1kg"` or `"1 kg"` (for kilograms)
- Minimum weight: 0.5 kg (system floors lower values)

## Manual Shipment Creation

If auto-creation failed, manually trigger DTDC shipment from admin panel:

1. Go to Admin Orders view
2. Click the order
3. In DTDC section, click **"Create DTDC Shipment"**
4. If it fails, check the error message
5. Use debug endpoint to get full error details

## Testing

### Test with Debug Endpoint

```bash
# Test with existing order
curl "http://localhost:3000/api/admin/dtdc/debug?order_id=<order-uuid>"

# Example response on success:
{
  "success": true,
  "result": {
    "reference_number": "DTL123456789",
    "status": true,
    "message": "Shipment created successfully"
  },
  "env": {
    "configured": true,
    "DTDC_API_KEY": "set",
    "DTDC_CUSTOMER_CODE": "set"
  },
  "last_exchange": {
    "request": { ... },
    "status": 200,
    "response": "..."
  }
}
```

## Database Fields

Orders table stores DTDC info in:
- **`courier_id`**: 200 for DTDC
- **`courier_name`**: "DTDC Express"
- **`awb_code`**: DTDC reference/consignment number
- **`notes`**: Error messages if shipment creation failed

## Rates Configuration

To adjust shipping rates with DTDC:

```env
# Current configuration
DTDC_BASE_RATE_INR=80      # ₹80 for first 500g
DTDC_PER_KG_INR=40         # ₹40 per additional KG

# This means:
# 0.5 kg → ₹80
# 1.0 kg → ₹120 (80 + 40)
# 2.0 kg → ₹160 (80 + 80)
```

Update based on your DTDC contract terms.

## Support

**For DTDC Issues**: Contact DTDC support at https://www.dtdc.in/

**For Code Issues**: 
- Check server logs: `npm run dev` output
- Use debug endpoint: `/api/admin/dtdc/debug?order_id=<uuid>`
- Review error in order's `notes` field

## Related Files

- **Order Creation**: [`app/api/orders/route.ts`](app/api/orders/route.ts)
- **Payment Verification**: [`app/api/razorpay/verify/route.ts`](app/api/razorpay/verify/route.ts)
- **DTDC Library**: [`src/lib/dtdc.ts`](src/lib/dtdc.ts)
- **Debug Endpoint**: [`app/api/admin/dtdc/debug/route.ts`](app/api/admin/dtdc/debug/route.ts)
- **Shipping Rates**: [`app/api/shipping/rates/route.ts`](app/api/shipping/rates/route.ts)
