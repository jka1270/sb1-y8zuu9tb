# Complete Integration Setup Guide

This guide will walk you through setting up StratosPay payment processing and ShipStation order fulfillment for your amino acid chain e-commerce platform.

---

## Prerequisites

You need the following credentials:

1. **StratosPay Test Key**: `0LJghOzWRo3NgOlMh2MKfm2JHO4REz`
2. **ShipStation API Key**: (Your key here)
3. **ShipStation API Secret**: (Your secret here)

---

## Step 1: Add Secrets to Supabase Edge Functions

All API keys must be stored securely in Supabase Edge Function Secrets (NOT in your .env file for production).

### Navigate to Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `tnqryelalqkmsxgvekki`
3. Click on **Project Settings** (gear icon in bottom left)
4. Click on **Edge Functions** in the left sidebar
5. Scroll down to **Edge Function Secrets** section
6. Click **Add secret**

### Add the Following Three Secrets

Add each of these secrets one by one:

#### Secret 1: StratosPay API Key
- **Name:** `STRATOSPAY_API_KEY`
- **Value:** `0LJghOzWRo3NgOlMh2MKfm2JHO4REz`
- Click **Add secret**

#### Secret 2: ShipStation API Key
- **Name:** `SHIPSTATION_API_KEY`
- **Value:** [Paste your ShipStation API Key here]
- Click **Add secret**

#### Secret 3: ShipStation API Secret
- **Name:** `SHIPSTATION_API_SECRET`
- **Value:** [Paste your ShipStation API Secret here]
- Click **Add secret**

### Important Notes

- After adding secrets, wait 60 seconds for them to propagate
- Do NOT add these secrets to your `.env` file in production
- The `.env` file is only for development/testing purposes

---

## Step 2: Verify Your Edge Functions Are Deployed

### Check Deployed Functions

1. In Supabase Dashboard, go to **Edge Functions**
2. You should see these three functions:
   - `stratospay-charge` - Processes credit card payments
   - `shipstation-integration` - Syncs orders to ShipStation
   - `stratospay-webhook` - Handles StratosPay webhooks (if configured)

### If Functions Are Missing

They should already be deployed, but if you need to redeploy:
- The functions are automatically deployed from the `supabase/functions/` directory
- Contact support if you see any deployment errors

---

## Step 3: Test StratosPay Integration

### How to Test Payment Processing

1. **Add products to cart** on your website
2. **Proceed to checkout**
3. Fill in shipping information
4. Select **"Credit Card (StratosPay)"** as payment method
5. Enter your email address
6. Click **"Complete Payment"**

### What Should Happen

- Payment request sent to StratosPay API
- If successful: Order created in database with `payment_status = 'paid'`
- Order will have `stratospay_transaction_id` and `stratospay_reference` fields populated
- You'll see a success message and be redirected

### Test Credentials

Use the test key: `0LJghOzWRo3NgOlMh2MKfm2JHO4REz`

This is configured in your edge function for testing purposes.

---

## Step 4: Test ShipStation Integration

### How Orders Get Synced to ShipStation

There are two ways orders sync to ShipStation:

#### Method 1: Automatic Sync (Recommended)

Orders are automatically synced when:
- Payment is completed successfully
- Admin approves a Cash on Delivery order

#### Method 2: Manual Sync

Admins can manually sync orders:
1. Go to **Admin Dashboard**
2. Click **Order Management**
3. Find the order you want to sync
4. Click **"Sync to ShipStation"** button

### What Should Happen

- Order details sent to ShipStation API
- ShipStation creates order with status "awaiting_shipment"
- Database updated with `shipstation_order_id` and `shipstation_order_key`
- Tracking information updates automatically when order ships

### Verify in ShipStation

1. Log into your ShipStation account at https://ship.shipstation.com
2. Check **Orders > Awaiting Shipment**
3. You should see your synced order with:
   - Customer name and address
   - All order items
   - Special handling notes: "COLD_CHAIN_REQUIRED"

---

## Step 5: Configure ShipStation Webhook (Optional)

To receive automatic tracking updates when orders ship:

### In ShipStation Dashboard

1. Go to **Settings > Account Settings > API Settings**
2. Scroll to **Webhooks**
3. Click **Add Webhook**
4. Configure as follows:
   - **Event:** Ship Notify
   - **URL:** `https://tnqryelalqkmsxgvekki.supabase.co/functions/v1/shipstation-integration?action=webhook`
   - **Store:** All Stores
5. Click **Save**

### What This Does

When you mark an order as "Shipped" in ShipStation:
- ShipStation sends tracking info to your webhook
- Your database automatically updates with tracking number and carrier
- Customer can see tracking info in their order history

---

## How It All Works Together

### Complete Order Flow

1. **Customer Places Order**
   - Fills out checkout form
   - Selects payment method (StratosPay or Cash on Delivery)

2. **StratosPay Payment** (if credit card selected)
   - Frontend calls `stratospay-charge` edge function
   - Edge function uses secure API key to process payment
   - Payment confirmation returned
   - Order created in database with status "paid"

3. **Order Created in Database**
   - All order details stored
   - Payment information recorded
   - Customer receives confirmation

4. **ShipStation Sync**
   - Order automatically synced to ShipStation
   - Or admin can manually sync from dashboard
   - Order appears in ShipStation for fulfillment

5. **Order Fulfillment**
   - Warehouse picks and packs order
   - Cold chain shipping labels generated
   - Order marked as "Shipped" in ShipStation

6. **Tracking Updates**
   - Webhook sends tracking info back to your database
   - Customer can track order in real-time
   - Email notifications sent (if configured)

---

## Troubleshooting

### StratosPay Issues

**Error: "StratosPay API key not configured"**
- Solution: Add `STRATOSPAY_API_KEY` to Supabase Edge Function Secrets
- Wait 60 seconds after adding the secret
- Hard refresh your browser (Ctrl+Shift+R)

**Payment button doesn't work**
- Check browser console for errors
- Verify email address is entered
- Ensure amount is valid (> $0)

**Payment succeeds but order not created**
- Check Supabase database logs
- Verify orders table exists and has correct permissions
- Contact support with transaction ID

### ShipStation Issues

**Error: "ShipStation API credentials not configured"**
- Solution: Add both `SHIPSTATION_API_KEY` and `SHIPSTATION_API_SECRET` to Supabase secrets
- Make sure you're using API Keys, NOT Partner API keys
- Do NOT create a "Store Connection" - use API Keys only

**Sync button shows "Missing credentials"**
- Verify secrets are added correctly in Supabase dashboard
- Check spelling: `SHIPSTATION_API_KEY` and `SHIPSTATION_API_SECRET` (case-sensitive)
- Wait 60 seconds after adding secrets

**Order syncs but doesn't appear in ShipStation**
- Verify your ShipStation account is active
- Check ShipStation API rate limits
- Review ShipStation account for any holds or issues
- Check that order data meets ShipStation requirements

**Tracking number not updating**
- Configure ShipStation webhook (see Step 5)
- Verify webhook URL is correct
- Check ShipStation webhook logs for errors

---

## Security Best Practices

### What NOT to Do

- ❌ Do NOT commit API keys to git
- ❌ Do NOT store secrets in `.env` for production
- ❌ Do NOT expose API keys in frontend code
- ❌ Do NOT share your secrets publicly

### What TO Do

- ✅ Store ALL secrets in Supabase Edge Function Secrets
- ✅ Use environment variables for local development only
- ✅ Rotate API keys periodically
- ✅ Monitor API usage and set up alerts
- ✅ Use test keys for development
- ✅ Keep production keys separate from test keys

---

## Production Checklist

Before going live, ensure:

- [ ] All three secrets added to Supabase Edge Functions
- [ ] Test order successfully processed with StratosPay
- [ ] Test order successfully synced to ShipStation
- [ ] Webhook configured and tested
- [ ] Database backups enabled
- [ ] Error monitoring configured
- [ ] Customer email notifications working
- [ ] Admin dashboard accessible
- [ ] Cold chain shipping procedures documented
- [ ] Returns/refunds process defined

---

## Support Resources

### StratosPay
- Website: https://stratospay.com
- API Docs: Check StratosPay developer portal
- Test Key: `0LJghOzWRo3NgOlMh2MKfm2JHO4REz`

### ShipStation
- Website: https://www.shipstation.com
- Support: https://help.shipstation.com
- API Docs: https://www.shipstation.com/docs/api/

### Supabase
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Edge Functions: https://supabase.com/docs/guides/functions

---

## Quick Reference: Where to Add Secrets

**Go to Supabase Dashboard:**
https://supabase.com/dashboard/project/tnqryelalqkmsxgvekki/settings/functions

**Add these three secrets:**

```
STRATOSPAY_API_KEY = 0LJghOzWRo3NgOlMh2MKfm2JHO4REz
SHIPSTATION_API_KEY = [your ShipStation API key]
SHIPSTATION_API_SECRET = [your ShipStation API secret]
```

**Then wait 60 seconds and test!**

---

## Need Help?

If you encounter any issues:

1. Check browser console for errors
2. Review Supabase Edge Function logs
3. Verify all secrets are correctly added
4. Ensure edge functions are deployed
5. Test with simple test cases first
6. Contact support with detailed error messages

---

**Last Updated:** October 24, 2025
