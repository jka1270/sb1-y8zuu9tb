import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stratospayTestKey = Deno.env.get('STRATOSPAY_TEST_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log('Stratospay webhook received:', payload);

    // Verify webhook signature if available
    const signature = req.headers.get('x-stratospay-signature');
    if (signature && stratospayTestKey) {
      // Add signature verification logic here if Stratospay provides it
      console.log('Webhook signature:', signature);
    }

    const { 
      transaction_id, 
      external_reference, 
      status, 
      amount, 
      currency,
      customer,
      created_at 
    } = payload;

    if (status === 'succeeded' || status === 'completed') {
      const orderReference = external_reference;
      
      const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('id, payment_status')
        .eq('order_number', orderReference)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        throw fetchError;
      }

      if (orders) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_transaction_id: transaction_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', orders.id);

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw updateError;
        }

        console.log(`Order ${orderReference} marked as paid`);
      }
    }

    return new Response(
      JSON.stringify({ received: true, processed: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed', 
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});