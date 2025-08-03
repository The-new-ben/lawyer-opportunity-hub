const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || ''
);

const checkoutSchema = z.object({
  lead_id: z.coerce.number().int().positive(),
  lawyer_id: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  deposit_type: z.string().min(1),
  payment_method: z.string().min(1)
});

router.post('/checkout', async (req, res) => {
  try {
    const result = checkoutSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    const { lead_id, lawyer_id, amount, deposit_type, payment_method } = result.data;

    const { data: deposit, error } = await supabase
      .from('deposits')
      .insert({
        lead_id,
        lawyer_id,
        amount,
        deposit_type,
        payment_method,
        status: 'pending'
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
