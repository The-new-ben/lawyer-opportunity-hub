import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
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

    const body = await req.json();
    const { caseId, leadId, amount, description, paymentType = 'deposit', action, tier } = body;
    logStep("Request parsed", { caseId, leadId, amount, paymentType, action, tier });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

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

    const origin = req.headers.get("origin") || "";

    if (action === 'subscription' && tier) {
      const tierPriceMap: Record<string, string> = {
        bronze: Deno.env.get('STRIPE_PRICE_BRONZE') ?? '',
        silver: Deno.env.get('STRIPE_PRICE_SILVER') ?? '',
        gold: Deno.env.get('STRIPE_PRICE_GOLD') ?? '',
        platinum: Deno.env.get('STRIPE_PRICE_PLATINUM') ?? ''
      };
      const priceId = tierPriceMap[tier];
      if (!priceId) throw new Error('Invalid tier');
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment-cancel`,
        metadata: {
          supabase_user_id: user.id,
          tier
        }
      });
      logStep('Subscription checkout session created', { sessionId: session.id });
      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    if (action === 'billing_portal') {
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: origin
      });
      logStep('Billing portal session created');
      return new Response(JSON.stringify({ url: portal.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount provided");
    }

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
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancel`,
      metadata: {
        case_id: caseId || '',
        lead_id: leadId || '',
        payment_type: paymentType,
        supabase_user_id: user.id
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    const paymentData = {
      contract_id: caseId,
      amount: amount,
      payment_type: paymentType,
      status: 'pending',
      stripe_payment_intent_id: session.id,
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

    if (paymentType === 'deposit' && (caseId || leadId)) {
      const depositData = {
        lead_id: leadId,
        lawyer_id: null,
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
      status: 200
    });

  } catch (error) {
    logStep("ERROR", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});