import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChargeRequest {
  amount: number;
  currency: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  external_reference: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stratosPayApiKey = Deno.env.get("STRATOSPAY_API_KEY");

    if (!stratosPayApiKey) {
      return new Response(
        JSON.stringify({
          error: "StratosPay API key not configured",
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

    const chargeData: ChargeRequest = await req.json();

    const response = await fetch("https://stratospay.com/api/v1/charge-card", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stratosPayApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chargeData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "Payment processing failed",
          details: responseData,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("StratosPay charge error:", error);
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