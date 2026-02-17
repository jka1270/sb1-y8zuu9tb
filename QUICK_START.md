# Quick Start - Add Your API Keys Now!

## Step 1: Go to Supabase Dashboard

**Direct Link:** https://supabase.com/dashboard/project/tnqryelalqkmsxgvekki/settings/functions

Or manually:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click Project Settings (gear icon)
4. Click "Edge Functions"
5. Scroll to "Edge Function Secrets"

---

## Step 2: Add These 3 Secrets

Click "Add secret" for each one:

### Secret #1: StratosPay
```
Name: STRATOSPAY_API_KEY
Value: 0LJghOzWRo3NgOlMh2MKfm2JHO4REz
```

### Secret #2: ShipStation API Key
```
Name: SHIPSTATION_API_KEY
Value: [Paste your ShipStation API Key here]
```

### Secret #3: ShipStation API Secret
```
Name: SHIPSTATION_API_SECRET
Value: [Paste your ShipStation API Secret here]
```

---

## Step 3: Wait 60 Seconds

After adding all three secrets, wait one minute for them to propagate to your edge functions.

---

## Step 4: Test It!

### Test StratosPay Payment:
1. Add products to cart
2. Go to checkout
3. Select "Credit Card (StratosPay)"
4. Enter email and click "Complete Payment"

### Test ShipStation Sync:
1. Go to Admin Dashboard
2. Click "Order Management"
3. Click "Sync to ShipStation" on any order
4. Check your ShipStation account for the order

---

## That's It!

Your amino acid chain e-commerce platform now has:
- ✅ Credit card payment processing (StratosPay)
- ✅ Cash on delivery option
- ✅ Automatic order fulfillment (ShipStation)
- ✅ Real-time tracking updates
- ✅ Cold chain shipping support

---

## Need Help?

See **COMPLETE_SETUP_GUIDE.md** for detailed troubleshooting and configuration options.

### Common Issues:

**"Missing credentials" error?**
- Double-check secret names are EXACTLY as shown above (case-sensitive)
- Make sure all 3 secrets are added
- Wait 60 seconds after adding

**Still not working?**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Review edge function logs in Supabase dashboard

---

**Your Test Credentials:**

- StratosPay Test Key: `0LJghOzWRo3NgOlMh2MKfm2JHO4REz`
- ShipStation: Use your actual API credentials
- Make sure ShipStation API Keys (not Partner API) are being used
