import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STATE_ABBR: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR",
  california: "CA", colorado: "CO", connecticut: "CT", delaware: "DE",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
  kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
  vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};

function toStateAbbr(val: string): string {
  const t = val.trim();
  if (t.length <= 2) return t.toUpperCase();
  return STATE_ABBR[t.toLowerCase()] || t;
}

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function cdata(val: unknown): string {
  const s = safeStr(val).replace(/]]>/g, "]]]]><![CDATA[>");
  return "<![CDATA[" + s + "]]>";
}

function tag(name: string, inner: string): string {
  return `<${name}>${inner}</${name}>`;
}

function numTag(name: string, val: unknown): string {
  return tag(name, (parseFloat(String(val ?? "0")) || 0).toFixed(2));
}

function intTag(name: string, val: unknown): string {
  return tag(name, String(parseInt(String(val ?? "0"), 10) || 0));
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr || Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    pad(d.getUTCMonth() + 1) + "/" +
    pad(d.getUTCDate()) + "/" +
    d.getUTCFullYear() + " " +
    pad(d.getUTCHours()) + ":" +
    pad(d.getUTCMinutes())
  );
}

function resolveState(val: unknown): string {
  const raw = safeStr(val);
  return raw ? toStateAbbr(raw) : "";
}

function resolveCountry(val: unknown): string {
  const raw = safeStr(val);
  if (!raw) return "US";
  if (raw.length === 2) return raw.toUpperCase();
  if (raw.toLowerCase() === "united states") return "US";
  if (raw.toLowerCase() === "canada") return "CA";
  return raw.substring(0, 2).toUpperCase();
}

function buildItemXml(item: Record<string, unknown>): string {
  let options = "";
  if (safeStr(item.size)) {
    options += "<Option>" + tag("Name", cdata("Size")) + tag("Value", cdata(item.size)) + "</Option>";
  }
  if (safeStr(item.purity)) {
    options += "<Option>" + tag("Name", cdata("Purity")) + tag("Value", cdata(item.purity)) + "</Option>";
  }

  return (
    "<Item>" +
    tag("LineItemID", cdata(item.id)) +
    tag("SKU", cdata(safeStr(item.product_sku) || "ITEM")) +
    tag("Name", cdata(safeStr(item.product_name) || "Product")) +
    numTag("Weight", 1) +
    tag("WeightUnits", "Ounces") +
    intTag("Quantity", item.quantity) +
    numTag("UnitPrice", item.unit_price) +
    (options ? "<Options>" + options + "</Options>" : "") +
    "</Item>"
  );
}

function buildOrderXml(order: Record<string, unknown>): string {
  const ship = (order.shipping_address ?? {}) as Record<string, unknown>;
  const bill = (order.billing_address ?? ship) as Record<string, unknown>;

  const shipFirst = safeStr(ship.firstName || ship.first_name);
  const shipLast = safeStr(ship.lastName || ship.last_name);
  const shipName = (shipFirst + " " + shipLast).trim();

  const billFirst = safeStr(bill.firstName || bill.first_name);
  const billLast = safeStr(bill.lastName || bill.last_name);
  const billName = (billFirst + " " + billLast).trim();

  const email = safeStr(bill.email || ship.email);
  const customerCode = email || safeStr(order.order_number);

  const dateStr = safeStr(order.created_at);
  const updatedStr = safeStr(order.updated_at) || dateStr;

  const statusMap: Record<string, string> = {
    pending: "unpaid",
    processing: "paid",
    shipped: "shipped",
    delivered: "shipped",
    cancelled: "cancelled",
  };
  const orderStatus = statusMap[safeStr(order.status)] || "paid";

  const items = (order.order_items ?? []) as Record<string, unknown>[];
  let itemsXml = "";
  for (const item of items) {
    itemsXml += buildItemXml(item);
  }

  let xml = "<Order>";
  xml += tag("OrderID", cdata(order.id));
  xml += tag("OrderNumber", cdata(order.order_number));
  xml += tag("OrderDate", fmtDate(dateStr));
  xml += tag("OrderStatus", cdata(orderStatus));
  xml += tag("LastModified", fmtDate(updatedStr));
  xml += tag("ShippingMethod", cdata(order.shipping_method));
  xml += tag("PaymentMethod", cdata(order.payment_method));
  xml += numTag("OrderTotal", order.total_amount);
  xml += numTag("TaxAmount", order.tax_amount);
  xml += numTag("ShippingAmount", order.shipping_cost);
  xml += tag("InternalNotes", cdata(order.notes));

  xml += "<Customer>";
  xml += tag("CustomerCode", cdata(customerCode));

  xml += "<BillTo>";
  xml += tag("Name", cdata(billName || shipName || "Customer"));
  xml += tag("Company", cdata(bill.company));
  xml += tag("Phone", cdata(bill.phone || ship.phone));
  xml += tag("Email", cdata(email));
  xml += "</BillTo>";

  xml += "<ShipTo>";
  xml += tag("Name", cdata(shipName || billName || "Customer"));
  xml += tag("Company", cdata(ship.company));
  xml += tag("Address1", cdata(ship.address1 || ship.street1));
  xml += tag("Address2", cdata(ship.address2 || ship.apartment));
  xml += tag("City", cdata(ship.city));
  xml += tag("State", cdata(resolveState(ship.state)));
  xml += tag("PostalCode", cdata(ship.zipCode || ship.zip_code || ship.postalCode));
  xml += tag("Country", cdata(resolveCountry(ship.country)));
  xml += tag("Phone", cdata(ship.phone || bill.phone));
  xml += "</ShipTo>";

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

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseBasicAuth(req: Request): { username: string; password: string } | null {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.toLowerCase().startsWith("basic ")) return null;
  try {
    const decoded = atob(authHeader.substring(6));
    const colonIdx = decoded.indexOf(":");
    if (colonIdx < 0) return null;
    return {
      username: decoded.substring(0, colonIdx),
      password: decoded.substring(colonIdx + 1),
    };
  } catch {
    return null;
  }
}

function parseXmlText(xml: string, tagName: string): string {
  const openTag = `<${tagName}>`;
  const closeTag = `</${tagName}>`;
  const start = xml.indexOf(openTag);
  if (start < 0) return "";
  const contentStart = start + openTag.length;
  const end = xml.indexOf(closeTag, contentStart);
  if (end < 0) return "";
  return xml.substring(contentStart, end).trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ssUsername = Deno.env.get("SHIPSTATION_CUSTOM_STORE_USERNAME") || Deno.env.get("SHIPSTATION_API_KEY") || "";
    const ssPassword = Deno.env.get("SHIPSTATION_CUSTOM_STORE_PASSWORD") || Deno.env.get("SHIPSTATION_API_SECRET") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "export" && req.method === "GET") {
      const creds = parseBasicAuth(req);
      if (!creds || creds.username !== ssUsername || creds.password !== ssPassword) {
        return new Response("Unauthorized", {
          status: 401,
          headers: { ...corsHeaders, "WWW-Authenticate": 'Basic realm="ShipStation"' },
        });
      }

      const startDate = url.searchParams.get("start_date");
      const endDate = url.searchParams.get("end_date");
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const pageSize = 100;

      let query = supabase
        .from("orders")
        .select(
          `id, order_number, created_at, updated_at, status, payment_status, total_amount, shipping_cost, tax_amount, shipping_address, billing_address, shipping_method, payment_method, notes, shipstation_order_id, order_items (id, product_name, product_sku, quantity, unit_price, size, purity)`,
          { count: "exact" }
        )
        .order("updated_at", { ascending: false });

      if (startDate) {
        const sd = new Date(startDate);
        if (!isNaN(sd.getTime())) {
          query = query.gte("updated_at", sd.toISOString());
        }
      }
      if (endDate) {
        const ed = new Date(endDate);
        if (!isNaN(ed.getTime())) {
          query = query.lte("updated_at", ed.toISOString());
        }
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: orders, error, count } = await query;

      if (error) {
        return xmlResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Orders pages="0"></Orders>'
        );
      }

      const rows = orders ?? [];
      const totalPages = Math.max(1, Math.ceil((count ?? rows.length) / pageSize));

      let ordersXml = "";
      for (const order of rows) {
        ordersXml += buildOrderXml(order as Record<string, unknown>);
      }

      const xml =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        `<Orders pages="${totalPages}">` +
        ordersXml +
        "</Orders>";

      return xmlResponse(xml);
    }

    if (action === "shipnotify" && req.method === "POST") {
      const creds = parseBasicAuth(req);
      if (!creds || creds.username !== ssUsername || creds.password !== ssPassword) {
        return new Response("Unauthorized", {
          status: 401,
          headers: { ...corsHeaders, "WWW-Authenticate": 'Basic realm="ShipStation"' },
        });
      }

      const body = await req.text();

      const orderId = parseXmlText(body, "OrderID");
      const orderNumber = parseXmlText(body, "OrderNumber");
      const trackingNumber = parseXmlText(body, "TrackingNumber");
      const carrier = parseXmlText(body, "Carrier");
      const service = parseXmlText(body, "Service");
      const shipDate = parseXmlText(body, "ShipDate");
      const shippingCost = parseXmlText(body, "ShippingCost");

      const updateData: Record<string, unknown> = {
        tracking_number: trackingNumber || null,
        carrier: carrier || null,
        shipstation_status: "shipped",
        shipstation_synced_at: new Date().toISOString(),
        status: "shipped",
        updated_at: new Date().toISOString(),
      };

      if (shipDate) {
        updateData.shipped_at = new Date(shipDate).toISOString();
      }

      if (shippingCost && parseFloat(shippingCost) > 0) {
        updateData.shipping_cost = parseFloat(shippingCost);
      }

      let updated = false;

      if (orderId) {
        const { error: updateError } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", orderId);
        if (!updateError) updated = true;
      }

      if (!updated && orderNumber) {
        const { error: updateError } = await supabase
          .from("orders")
          .update(updateData)
          .eq("order_number", orderNumber);
        if (!updateError) updated = true;
      }

      return xmlResponse('<?xml version="1.0" encoding="UTF-8"?><Response>OK</Response>');
    }

    if (action === "test") {
      return jsonResponse({
        message: "ShipStation Custom Store endpoint is active",
        hasCredentials: !!(ssUsername && ssPassword),
        endpointUrl: `${supabaseUrl}/functions/v1/shipstation-integration`,
        instructions: {
          step1: "In ShipStation, go to Settings > Selling Channels > Store Setup",
          step2: "Click 'Connect a Store or Marketplace'",
          step3: "Choose 'Custom Store'",
          step4: `Set the URL to: ${supabaseUrl}/functions/v1/shipstation-integration`,
          step5: "Enter the username and password you configured as SHIPSTATION_CUSTOM_STORE_USERNAME and SHIPSTATION_CUSTOM_STORE_PASSWORD",
          step6: "Set statuses: Unpaid = 'unpaid', Paid = 'paid', Shipped = 'shipped', Cancelled = 'cancelled'",
          step7: "Click 'Test Connection'",
        },
      });
    }

    if (action === "tracking" && req.method === "GET") {
      const orderId = url.searchParams.get("orderId");
      if (!orderId) {
        return jsonResponse({ error: "Order ID is required" }, 400);
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("tracking_number, carrier, shipstation_status, shipped_at, status")
        .eq("id", orderId)
        .maybeSingle();

      if (orderError || !order) {
        return jsonResponse({ error: "Order not found" }, 404);
      }

      return jsonResponse({
        success: true,
        tracking: {
          trackingNumber: order.tracking_number,
          carrier: order.carrier,
          status: order.shipstation_status || order.status,
          shipDate: order.shipped_at,
        },
      });
    }

    return jsonResponse({ error: "Invalid action. Valid actions: export, shipnotify, test, tracking" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (new URL(req.url).searchParams.get("action") === "export" ||
        new URL(req.url).searchParams.get("action") === "shipnotify") {
      return xmlResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Orders pages="0"></Orders>'
      );
    }
    return jsonResponse({ error: message }, 500);
  }
});
