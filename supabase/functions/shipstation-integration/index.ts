import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function cdata(val: unknown): string {
  if (val === null || val === undefined) return "<![CDATA[]]>";
  const s = String(val).replace(/]]>/g, "]]]]><![CDATA[>");
  return "<![CDATA[" + s + "]]>";
}

function xmlTag(name: string, inner: string): string {
  return "<" + name + ">" + inner + "</" + name + ">";
}

function numTag(name: string, val: unknown): string {
  const num = parseFloat(String(val ?? "0")) || 0;
  return "<" + name + ">" + num.toFixed(2) + "</" + name + ">";
}

function intTag(name: string, val: unknown): string {
  const num = parseInt(String(val ?? "0"), 10) || 0;
  return "<" + name + ">" + num + "</" + name + ">";
}

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function buildItemXml(item: Record<string, unknown>): string {
  let options = "";
  if (item.size) {
    options +=
      "<Option>" +
      xmlTag("Name", cdata("Size")) +
      xmlTag("Value", cdata(item.size)) +
      "</Option>";
  }
  if (item.purity) {
    options +=
      "<Option>" +
      xmlTag("Name", cdata("Purity")) +
      xmlTag("Value", cdata(item.purity)) +
      "</Option>";
  }

  return (
    "<Item>" +
    xmlTag("SKU", cdata(item.product_sku)) +
    xmlTag("Name", cdata(item.product_name)) +
    intTag("Quantity", item.quantity) +
    numTag("UnitPrice", item.unit_price) +
    (options ? "<Options>" + options + "</Options>" : "") +
    "</Item>"
  );
}

function buildOrderXml(order: Record<string, unknown>): string {
  const ship = (order.shipping_address ?? {}) as Record<string, unknown>;
  const bill = (order.billing_address ?? {}) as Record<string, unknown>;

  const email = safeStr(bill.email || ship.email);
  const firstName = safeStr(ship.firstName || ship.first_name);
  const lastName = safeStr(ship.lastName || ship.last_name);
  const fullName = (firstName + " " + lastName).trim();
  const company = safeStr(ship.company || bill.company);

  const d = new Date(safeStr(order.created_at) || Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoDate =
    pad(d.getMonth() + 1) + "/" +
    pad(d.getDate()) + "/" +
    d.getFullYear() + " " +
    pad(d.getHours()) + ":" +
    pad(d.getMinutes()) + ":" +
    pad(d.getSeconds());

  const items = (order.order_items ?? []) as Record<string, unknown>[];
  let itemsXml = "";
  for (const item of items) {
    itemsXml += buildItemXml(item);
  }

  const addressBlock = (addr: Record<string, unknown>, includeEmail: boolean): string => {
    let xml = "";
    xml += xmlTag("Name", cdata(fullName));
    xml += xmlTag("Company", cdata(company));
    xml += xmlTag("Address1", cdata(addr.address1 || addr.address || addr.street1));
    xml += xmlTag("Address2", cdata(addr.address2 || addr.apartment || addr.street2));
    xml += xmlTag("City", cdata(addr.city));
    xml += xmlTag("State", cdata(addr.state));
    xml += xmlTag("PostalCode", cdata(addr.zipCode || addr.zip_code));
    xml += xmlTag("Country", cdata(addr.country || "US"));
    xml += xmlTag("Phone", cdata(addr.phone));
    if (includeEmail) {
      xml += xmlTag("Email", cdata(email));
    }
    return xml;
  };

  let xml = "";
  xml += "<Order>";
  xml += xmlTag("OrderID", cdata(order.order_number));
  xml += xmlTag("OrderNumber", cdata(order.order_number));
  xml += xmlTag("OrderDate", cdata(isoDate));
  xml += xmlTag("OrderStatus", cdata("awaiting_shipment"));
  xml += xmlTag("LastModified", cdata(isoDate));
  xml += numTag("OrderTotal", order.total_amount);
  xml += numTag("ShippingAmount", order.shipping_cost);
  xml += numTag("TaxAmount", order.tax_amount);
  xml += xmlTag("InternalNotes", cdata(order.notes));
  xml += "<Customer>";
  xml += xmlTag("CustomerCode", cdata(email));
  xml += "<BillTo>" + addressBlock(Object.keys(bill).length > 0 ? bill : ship, true) + "</BillTo>";
  xml += "<ShipTo>" + addressBlock(ship, false) + "</ShipTo>";
  xml += "</Customer>";
  xml += "<Items>" + itemsXml + "</Items>";
  xml += "</Order>";

  return xml;
}

function xmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/xml; charset=UTF-8" },
  });
}

function xmlError(msg: string, status = 500): Response {
  return xmlResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Error>' + cdata(msg) + "</Error>",
    status
  );
}

interface ShipStationAddress {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface ShipStationOrder {
  orderId?: number;
  orderKey?: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  customerEmail?: string;
  billTo: ShipStationAddress;
  shipTo: ShipStationAddress;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  amountPaid: number;
  taxAmount: number;
  shippingAmount: number;
  advancedOptions?: {
    customField1?: string;
    customField2?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const shipstationApiKey = Deno.env.get("SHIPSTATION_API_KEY");
    const shipstationApiSecret = Deno.env.get("SHIPSTATION_API_SECRET");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "export" && req.method === "GET") {
      let ssUser = "";
      let ssPass = "";
      for (const [key, val] of url.searchParams.entries()) {
        if (key.toLowerCase() === "ss-username") ssUser = val;
        if (key.toLowerCase() === "ss-password") ssPass = val;
      }

      if (!ssUser || !ssPass) {
        return xmlError("Missing SS-UserName or SS-Password", 401);
      }

      if (ssUser !== shipstationApiKey || ssPass !== shipstationApiSecret) {
        return xmlError("Invalid credentials", 401);
      }

      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          created_at,
          status,
          total_amount,
          shipping_cost,
          tax_amount,
          shipping_address,
          billing_address,
          notes,
          order_items (
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price,
            size,
            purity
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        return xmlError("Database error: " + error.message);
      }

      const rows = orders ?? [];
      let ordersXml = "";
      for (const order of rows) {
        ordersXml += buildOrderXml(order as Record<string, unknown>);
      }

      const xml =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Orders pages="1">' +
        ordersXml +
        "</Orders>";

      return xmlResponse(xml);
    }

    if (!shipstationApiKey) {
      return new Response(
        JSON.stringify({
          error: "ShipStation API credentials not configured",
          details: "Please add SHIPSTATION_API_KEY to your Supabase project settings",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "test") {
      return new Response(
        JSON.stringify({
          message: "Environment check",
          hasApiKey: !!shipstationApiKey,
          apiKeyLength: shipstationApiKey?.length || 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "create" && req.method === "POST") {
      const { orderId } = await req.json();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`*, order_items(*)`)
        .eq("id", orderId)
        .single();

      if (orderError || !order) throw new Error("Order not found");

      const str = (v) => (v ? String(v).trim() : "");
      const bill = order.billing_address || {};
      const ship = order.shipping_address || bill;

      const buildAddrJson = (a) => ({
        name: (str(a.firstName || a.first_name) + " " + str(a.lastName || a.last_name)).trim() || "Customer",
        company: str(a.company) || "",
        street1: str(a.address1 || a.address || "123 Main St"),
        street2: str(a.address2 || a.apartment) || "",
        city: str(a.city) || "City",
        state: str(a.state) || "State",
        postalCode: str(a.zipCode || a.zip_code) || "00000",
        country: str(a.country) || "US",
        phone: str(a.phone) || "000-000-0000"
      });

      // SHIPSTATION JSON PAYLOAD (MOST ROBUST VERSION)
      // CLEAN & ROBUST PAYLOAD (No Nulls allowed)
      const payload = {
        orderNumber: String(order.order_number),
        orderKey: String(order.order_number),
        orderDate: new Date(order.created_at).toISOString(),
        paymentDate: new Date(order.created_at).toISOString(),
        orderStatus: "awaiting_shipment",
        customerUsername: str(bill.email || ship.email) || "customer@example.com",
        customerEmail: str(bill.email || ship.email) || "customer@example.com",
        billTo: buildAddrJson(bill),
        shipTo: buildAddrJson(ship),
        items: (order.order_items || []).map((item, index) => ({
          lineItemKey: str(item.id || item.product_sku) || `line-${index}`,
          sku: str(item.product_sku) || "SKU",
          name: str(item.product_name) || "Product",
          quantity: Math.max(1, Number(item.quantity) || 1),
          unitPrice: parseFloat(String(item.unit_price)) || 0,
          adjustment: false
        })),
        amountPaid: parseFloat(String(order.total_amount)) || 0,
        taxAmount: parseFloat(String(order.tax_amount)) || 0,
        shippingAmount: parseFloat(String(order.shipping_cost)) || 0,
        internalNotes: str(order.notes) || "",
        // Weight field is mandatory for some accounts, but must not be null
        weight: {
          value: 0,
          units: "ounces"
        },
        insuranceOptions: {
          insureShipment: false,
          insuredValue: 0
        },
        advancedOptions: {
          customField1: String(order.id || ""),
          nonMachinable: false,
          saturdayDelivery: false,
          containsAlcohol: false
        }
      };
      const auth = btoa(`${shipstationApiKey}:${shipstationApiSecret}`);
      
      // Kuch cases mein ShipStation "/orders/createorders" (plural) maangta hai array ke sath
      // Lekin hum /createorder (single) bhej rahe hain
      const ssResponse = await fetch("https://ssapi.shipstation.com/orders/createorder", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!ssResponse.ok) {
        const errorDetail = await ssResponse.text();
        throw new Error(`ShipStation Error: ${errorDetail}`);
      }

      const ssData = await ssResponse.json();
      await supabase.from("orders").update({ shipstation_order_id: ssData.orderId.toString() }).eq("id", orderId);

      return new Response(JSON.stringify({ success: true, shipstationOrderId: ssData.orderId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
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

      const basicAuth2 = btoa(`${shipstationApiKey}:${shipstationApiSecret}`);
      const shipstationResponse = await fetch(
        `https://ssapi.shipstation.com/orders/${order.shipstation_order_id}`,
        {
          headers: { "Authorization": `Basic ${basicAuth2}` },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "webhook" && req.method === "POST") {
      const webhookData = await req.json();

      if (webhookData.resource_type === "SHIP_NOTIFY") {
        const basicAuth3 = btoa(`${shipstationApiKey}:${shipstationApiSecret}`);
        const shipmentResponse = await fetch(webhookData.resource_url, {
          headers: { "Authorization": `Basic ${basicAuth3}` },
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
