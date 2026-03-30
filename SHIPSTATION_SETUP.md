# ShipStation Integration Setup Guide

## Overview
Research Raws integrates with ShipStation using the REST API, **NOT** through a Store Connection. This allows for more flexibility and proper cold chain handling for amino acid chain shipments.

## Setup Steps

### 1. Get ShipStation API Key

1. Log into your ShipStation account at https://ship.shipstation.com
2. Navigate to **Settings** (gear icon) → **API Settings**
3. Click **Create new key**
4. Give it a name (e.g., "Research Shipping V2")
5. Click **Save**
6. **Copy the API Key** that appears (it's the only credential you need)
7. Keep this credential secure

**Note:** ShipStation only requires the API Key for authentication - no separate secret is needed.

### 2. Remove Store Connection (If Exists)

If you previously tried to set up a Store Connection:

1. Go to **Settings** → **Stores**
2. Find "Research Raws" or any store connection
3. Click **Edit** → **Disconnect Store**
4. Delete the store connection

**Important:** We don't need a Store Connection. Our Edge Function creates orders directly via API.

### 3. Configure Supabase Environment Variable

Add your ShipStation API Key to Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add one secret:
   - Key: `SHIPSTATION_API_KEY`
   - Value: [paste your API key from ShipStation]

### 4. Test the Integration

1. Log into Research Raws admin panel
2. Go to Order Management
3. Create or select an order
4. Click the **Sync** button
5. Order should appear in ShipStation with:
   - Cold chain markers (Custom Field 1: COLD_CHAIN_REQUIRED)
   - Amino acid chain designation (Custom Field 2: AMINO ACID CHAIN_SHIPMENT)

## How It Works

### Order Creation Flow
1. Customer places order on Research Raws
2. Admin clicks "Sync" in Order Management
3. Edge Function sends order to ShipStation API
4. ShipStation creates order with cold chain requirements
5. Order ID stored in Research Raws database

### Tracking Updates
1. Admin clicks "Track" button in Order Management
2. Edge Function queries ShipStation API
3. Latest tracking info synced to Research Raws
4. Tracking number displayed in order list

### Automatic Updates (Webhook)
1. When order ships in ShipStation, webhook fires
2. Edge Function receives shipment notification
3. Database automatically updated with:
   - Tracking number
   - Carrier information
   - Ship date
   - Status change to "shipped"

## Webhook Configuration (Optional)

To receive automatic updates when orders ship:

1. In ShipStation, go to **Settings** → **Integrations** → **Webhooks**
2. Click **Add Webhook**
3. Configure:
   - **URL:** `https://[your-project].supabase.co/functions/v1/shipstation-integration?action=webhook`
   - **Event:** Ship Notify
   - **Store:** All Stores
4. Click **Save Webhook**

## Troubleshooting

### Error: "ShipStation credentials not configured"
- Verify API Key is set in Supabase Edge Function Secrets
- Ensure there are no extra spaces in the credential
- Confirm the secret name is exactly `SHIPSTATION_API_KEY`

### Error: "Failed to sync to ShipStation"
- Check that API Key is valid and not expired
- Verify ShipStation account is active
- Check Supabase Edge Function logs for detailed error
- Try generating a new API key in ShipStation

### Orders not appearing in ShipStation
- Verify order has complete shipping address
- Check that customer email is present
- Review ShipStation API rate limits

### Tracking not updating
- Ensure order was synced to ShipStation first
- Verify ShipStation has processed the order
- Check that shipment has been created in ShipStation

## API Endpoints

### Sync Order to ShipStation
```
POST /functions/v1/shipstation-integration?action=create
Body: { "orderId": "uuid" }
```

### Get Tracking Information
```
GET /functions/v1/shipstation-integration?action=tracking&orderId=uuid
```

### Webhook Handler
```
POST /functions/v1/shipstation-integration?action=webhook
Body: ShipStation webhook payload
```

## Cold Chain Features

All orders synced to ShipStation include:
- **Custom Field 1:** COLD_CHAIN_REQUIRED (flags for temperature control)
- **Custom Field 2:** AMINO ACID CHAIN_SHIPMENT (identifies product type)

These fields help warehouse staff identify orders requiring special handling.

## Support

For issues with:
- **Research Raws integration:** Contact your development team
- **ShipStation API:** Visit https://www.shipstation.com/docs/api/
- **ShipStation account:** Contact ShipStation support
