const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const { STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_ROLE } = process.env;
if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY environment variable');
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL environment variable');
const supabaseServiceRole = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE;
if (!supabaseServiceRole) throw new Error('Missing service role key environment variable');
const supabase = createClient(SUPABASE_URL, supabaseServiceRole);

router.post('/checkout', async (req, res) => {
  try {
    const { lead_id, lawyer_id, amount, deposit_type, payment_method } = req.body;

    const { data: deposit, error } = await supabase
      .from('deposits')
      .insert({
        lead_id,
        lawyer_id,
        amount,
        deposit_type,
        payment_method,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Deposit' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_ORIGIN}/success`,
      cancel_url: `${process.env.CLIENT_ORIGIN}/cancel`,
      metadata: { deposit_id: deposit.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error', err);
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
});

module.exports = router;
