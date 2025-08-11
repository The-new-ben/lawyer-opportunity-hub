import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { caseId, leadId, amount, description, paymentType = 'deposit' } = await req.json();
    logStep("Request parsed", { caseId, leadId, amount, paymentType });

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount provided");
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "ils",
            product_data: { 
              name: description || `${paymentType === 'deposit' ? 'Deposit' : 'Payment'} for legal case`,
              description: `${paymentType === 'deposit' ? 'Deposit' : 'Payment'} for ${caseId ? `case ${caseId}` : `lead ${leadId}`}`
            },
            unit_amount: Math.round(amount * 100), // Convert to agorot
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancel`,
      metadata: {
        case_id: caseId || '',
        lead_id: leadId || '',
        payment_type: paymentType,
        supabase_user_id: user.id
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Create payment record in Supabase
    const paymentData = {
      contract_id: caseId, // For compatibility with existing schema
      amount: amount,
      payment_type: paymentType,
      status: 'pending',
      stripe_payment_intent_id: session.id, // Store session ID for now
      created_at: new Date().toISOString()
    };

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      logStep("Error creating payment record", paymentError);
      throw paymentError;
    }

    logStep("Payment record created", { paymentId: payment.id });

    // If it's a deposit, also create deposit record
    if (paymentType === 'deposit' && (caseId || leadId)) {
      const depositData = {
        lead_id: leadId,
        lawyer_id: null, // Will be filled based on case/lead
        amount: amount,
        deposit_type: 'case_deposit',
        status: 'pending',
        quote_id: null,
        transaction_id: session.id
      };

      const { error: depositError } = await supabaseAdmin
        .from('deposits')
        .insert(depositData);

      if (depositError) {
        logStep("Error creating deposit record", depositError);
        // Don't throw error, payment is more important
      } else {
        logStep("Deposit record created");
      }
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      paymentId: payment.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});