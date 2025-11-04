# StratosPay Integration Setup

## Overview
This application integrates StratosPay for secure credit card payment processing. The integration uses a Supabase Edge Function to securely handle API credentials.

## Setup Instructions

### 1. Add StratosPay API Key to Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Project Settings > Edge Functions > Manage secrets**
4. Add the following secret:
   - **Name:** `STRATOSPAY_API_KEY`
   - **Value:** Your StratosPay test or production API key

   For testing, use: `0LJghOzWRo3NgOlMh2MKfm2JHO4REz`

5. Click "Add secret" to save

### 2. Verify Environment Variables

The following environment variables should already be configured in your `.env` file:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 3. How It Works

#### Payment Flow
1. Customer fills out checkout form with shipping and billing information
2. Customer selects "Credit Card (StratosPay)" as payment method
3. Customer clicks "Complete Payment" button
4. Frontend calls the `stratospay-charge` edge function with payment details
5. Edge function securely processes payment using StratosPay API
6. On success, order is created in database with payment details
7. Customer receives confirmation and order is tracked

#### Security Features
- API keys are stored securely in Supabase Edge Function secrets
- Never exposed to client-side code
- All payment processing happens server-side via edge function
- Payments are processed over HTTPS

#### API Endpoint

The integration uses the StratosPay charge API:
```
POST https://stratospay.com/api/v1/charge-card
```

With the following payload structure:
```json
{
  "amount": 1000,
  "currency": "USD",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "external_reference": "ORDER-1234567890"
}
```

#### Response Format

Success response:
```json
{
  "message": "Payment is processing onchain",
  "status": "onchain",
  "data": {
    "external_reference": "ORDER-1234567890",
    "amount": 1000,
    "currency": "USD",
    "status": "onchain",
    "created_at": "2025-07-20T15:24:24.000000Z",
    "customer": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  }
}
```

### 4. Database Schema

The orders table includes the following StratosPay-specific fields:
- `stratospay_transaction_id` - Unique transaction ID from StratosPay
- `stratospay_reference` - External reference used for the payment
- `payment_method` - Set to 'stratospay' for card payments
- `payment_status` - Set to 'paid' when payment succeeds

### 5. Testing

To test the integration:

1. Add items to your cart
2. Proceed to checkout
3. Fill in shipping information
4. Select "Credit Card (StratosPay)" as payment method
5. Enter email address
6. Click "Complete Payment"
7. Payment will be processed and order created

### 6. Production Deployment

For production:
1. Update `STRATOSPAY_API_KEY` in Supabase secrets with your production key
2. Ensure all environment variables are correctly configured
3. Test the payment flow thoroughly before going live

### 7. Troubleshooting

**Payment fails immediately:**
- Check that `STRATOSPAY_API_KEY` is correctly set in Supabase Edge Function secrets
- Verify the API key is valid and not expired
- Check browser console and Supabase Edge Function logs for errors

**Order created but payment not recorded:**
- Check the order details in the database
- Verify `stratospay_transaction_id` and `stratospay_reference` fields are populated
- Check that `payment_status` is set to 'paid'

**Edge function not found:**
- Verify the edge function `stratospay-charge` is deployed
- Check Supabase dashboard under Edge Functions

### 8. Support

For StratosPay API issues, refer to their documentation or contact their support team.
For integration issues, check the Supabase Edge Function logs in your dashboard.
