import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  const { data: prefs } = await supabaseAdmin
    .from('notification_preferences')
    .select('profile_id, whatsapp, digest_frequency')
    .neq('digest_frequency', 'realtime');

  const today = new Date().getUTCDay();

  for (const pref of prefs ?? []) {
    if (pref.digest_frequency === 'weekly' && today !== 1) {
      continue;
    }

    const { data: notifications } = await supabaseAdmin
      .from('notifications')
      .select('title')
      .eq('recipient_id', pref.profile_id)
      .is('read_at', null);

    if (!notifications || notifications.length === 0) {
      continue;
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('phone, whatsapp_number')
      .eq('id', pref.profile_id)
      .single();

    const summary = notifications.map(n => `- ${n.title}`).join('\n');

    if (pref.whatsapp && profile) {
      const phone = profile.whatsapp_number || profile.phone;
      if (phone) {
        await sendWhatsAppMessage(phone, `You have ${notifications.length} new notifications:\n${summary}`);
      }
    }

    await supabaseAdmin
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', pref.profile_id)
      .is('read_at', null);
  }

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
});

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const token = Deno.env.get('WHATSAPP_TOKEN');
  const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');
  if (!token || !phoneId) {
    console.log('Missing WhatsApp credentials');
    return;
  }
  const cleaned = phoneNumber.replace(/\D/g, '');
  const formatted = cleaned.startsWith('972') ? cleaned : `972${cleaned.substring(1)}`;
  await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: formatted,
      text: { body: message }
    })
  });
}
