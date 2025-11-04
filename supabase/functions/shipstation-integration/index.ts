import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ShipStationOrder {
  orderId?: number;
  orderKey?: string;
  orderNumber: string;
  orderStatus: string;
  shipTo: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  orderTotal: number;
  shippingAmount: number;
  taxAmount: number;
  customerEmail: string;
  advancedOptions?: {
    customField1?: string;
    customField2?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const shipstationApiKey = Deno.env.get("SHIPSTATION_API_KEY");
    const shipstationApiSecret = Deno.env.get("SHIPSTATION_API_SECRET");

    console.log("Environment check:", {
      hasApiKey: !!shipstationApiKey,
      hasApiSecret: !!shipstationApiSecret,
      apiKeyLength: shipstationApiKey?.length,
      apiSecretLength: shipstationApiSecret?.length
    });

    if (!shipstationApiKey || !shipstationApiSecret) {
      console.error("Missing credentials - API Key:", !!shipstationApiKey, "API Secret:", !!shipstationApiSecret);
      return new Response(
        JSON.stringify({
          error: "ShipStation API credentials not configured in Supabase Edge Function Secrets",
          details: "Please add SHIPSTATION_API_KEY and SHIPSTATION_API_SECRET to your Supabase project settings",
          setupGuide: "See SHIPSTATION_SETUP.md for complete setup instructions",
          debug: {
            hasApiKey: !!shipstationApiKey,
            hasApiSecret: !!shipstationApiSecret
          }
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "test") {
      return new Response(
        JSON.stringify({
          message: "Environment check",
          hasApiKey: !!shipstationApiKey,
          hasApiSecret: !!shipstationApiSecret,
          apiKeyLength: shipstationApiKey?.length || 0,
          apiSecretLength: shipstationApiSecret?.length || 0,
          allEnvVars: Object.keys(Deno.env.toObject()).filter(k => k.includes('SHIP'))
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "create" && req.method === "POST") {
      const { orderId } = await req.json();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*)
        `)
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        throw new Error("Order not found");
      }

      const shipstationOrder: ShipStationOrder = {
        orderNumber: order.order_number,
        orderStatus: "awaiting_shipment",
        customerEmail: order.billing_address.email,
        shipTo: {
          name: `${order.shipping_address.firstName} ${order.shipping_address.lastName}`,
          street1: order.shipping_address.address,
          street2: order.shipping_address.apartment || "",
          city: order.shipping_address.city,
          state: order.shipping_address.state,
          postalCode: order.shipping_address.zipCode,
          country: order.shipping_address.country || "US",
          phone: order.shipping_address.phone || "",
        },
        items: order.order_items.map((item: any) => ({
          sku: item.product_sku,
          name: item.product_name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
        })),
        orderTotal: parseFloat(order.total_amount),
        shippingAmount: parseFloat(order.shipping_cost),
        taxAmount: parseFloat(order.tax_amount),
        advancedOptions: {
          customField1: "COLD_CHAIN_REQUIRED",
          customField2: "PEPTIDE_SHIPMENT",
        },
      };

      const authHeader = btoa(`${shipstationApiKey}:${shipstationApiSecret}`);
      const shipstationResponse = await fetch(
        "https://ssapi.shipstation.com/orders/createorder",
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shipstationOrder),
        }
      );

      if (!shipstationResponse.ok) {
        const errorText = await shipstationResponse.text();
        console.error("ShipStation API Error:", errorText);
        return new Response(
          JSON.stringify({
            error: "ShipStation API request failed",
            status: shipstationResponse.status,
            details: errorText,
            hint: "Verify your API credentials are correct and your ShipStation account is active. Do NOT use Store Connection - use API Keys only."
          }),
          {
            status: shipstationResponse.status,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const shipstationData = await shipstationResponse.json();

      await supabase
        .from("orders")
        .update({
          shipstation_order_id: shipstationData.orderId?.toString(),
          shipstation_order_key: shipstationData.orderKey,
          shipstation_status: "awaiting_shipment",
          shipstation_synced_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({
          success: true,
          shipstationOrderId: shipstationData.orderId,
          message: "Order synced to ShipStation successfully",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "tracking" && req.method === "GET") {
      const orderId = url.searchParams.get("orderId");

      if (!orderId) {
        throw new Error("Order ID is required");
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("shipstation_order_id")
        .eq("id", orderId)
        .single();

      if (orderError || !order || !order.shipstation_order_id) {
        throw new Error("Order not found or not synced with ShipStation");
      }

      const authHeader = btoa(`${shipstationApiKey}:${shipstationApiSecret}`);
      const shipstationResponse = await fetch(
        `https://ssapi.shipstation.com/orders/${order.shipstation_order_id}`,
        {
          headers: {
            "Authorization": `Basic ${authHeader}`,
          },
        }
      );

      if (!shipstationResponse.ok) {
        throw new Error("Failed to fetch tracking from ShipStation");
      }

      const shipstationData = await shipstationResponse.json();

      if (shipstationData.trackingNumber) {
        await supabase
          .from("orders")
          .update({
            tracking_number: shipstationData.trackingNumber,
            carrier: shipstationData.carrierCode,
            shipstation_status: shipstationData.orderStatus,
            shipped_at: shipstationData.shipDate,
            shipstation_synced_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          tracking: {
            trackingNumber: shipstationData.trackingNumber,
            carrier: shipstationData.carrierCode,
            status: shipstationData.orderStatus,
            shipDate: shipstationData.shipDate,
          },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "webhook" && req.method === "POST") {
      const webhookData = await req.json();

      if (webhookData.resource_type === "SHIP_NOTIFY") {
        const authHeader = btoa(`${shipstationApiKey}:${shipstationApiSecret}`);
        const shipmentResponse = await fetch(webhookData.resource_url, {
          headers: {
            "Authorization": `Basic ${authHeader}`,
          },
        });

        if (shipmentResponse.ok) {
          const shipmentData = await shipmentResponse.json();

          await supabase
            .from("orders")
            .update({
              tracking_number: shipmentData.trackingNumber,
              carrier: shipmentData.carrierCode,
              shipstation_status: "shipped",
              shipped_at: shipmentData.shipDate,
              shipstation_synced_at: new Date().toISOString(),
              status: "shipped",
            })
            .eq("shipstation_order_id", shipmentData.orderId?.toString());
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("ShipStation integration error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});