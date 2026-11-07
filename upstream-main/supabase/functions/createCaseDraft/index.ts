import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
 "Access-Control-Allow-Origin": "*",
 "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}

serve(async req => {
 if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })
 const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
 const body = await req.json()
 const title = body.title || "Draft"
 const category = body.legal_category || "general"
 const case_number = `C-${Date.now()}`
 const token = crypto.randomUUID()
 const { data, error } = await supabase.from("cases").insert({ title, legal_category: category, status: "draft", case_number, invite_token: token }).select("id").single()
 if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
 const link = `${Deno.env.get("SITE_URL")}/defendant-intake?token=${token}`
 if (body.email) await sendEmail(body.email, link)
 if (body.phone) await sendWhatsAppMessage(body.phone, link)
 return new Response(JSON.stringify({ case_id: data.id, case_number }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
})

async function sendEmail(to: string, link: string) {
 const url = Deno.env.get("EMAIL_API_URL")
 const key = Deno.env.get("EMAIL_API_KEY")
 if (!url || !key) return
 await fetch(url, { method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ to, subject: "Case Draft", text: link }) })
}

async function sendWhatsAppMessage(to: string, link: string) {
 const token = Deno.env.get("WHATSAPP_TOKEN")
 const phone = Deno.env.get("WHATSAPP_PHONE_ID")
 if (!token || !phone) return
 await fetch(`https://graph.facebook.com/v17.0/${phone}/messages`, { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: link } }) })
}
