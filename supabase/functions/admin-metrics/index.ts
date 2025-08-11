import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers })
  const client = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )
  const { count: totalLeads = 0 } = await client.from("leads").select("id", { count: "exact", head: true })
  const { count: newLeads = 0 } = await client.from("leads").select("id", { count: "exact", head: true }).eq("status", "new")
  const { count: highPriorityLeads = 0 } = await client.from("leads").select("id", { count: "exact", head: true }).eq("urgency_level", "high")
  const { count: convertedLeads = 0 } = await client.from("leads").select("id", { count: "exact", head: true }).eq("status", "converted")
  const { count: totalClients = 0 } = await client.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client")
  const { count: newClients = 0 } = await client
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "client")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  const { count: totalCases = 0 } = await client.from("cases").select("id", { count: "exact", head: true })
  const { count: openCases = 0 } = await client.from("cases").select("id", { count: "exact", head: true }).eq("status", "open")
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date()
  end.setUTCHours(23, 59, 59, 999)
  const { count: meetingsToday = 0 } = await client
    .from("meetings")
    .select("id", { count: "exact", head: true })
    .gte("scheduled_at", start.toISOString())
    .lte("scheduled_at", end.toISOString())
  const { count: meetingsCompleted = 0 } = await client
    .from("meetings")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed")
  const { data: paidData, count: paidDeposits = 0 } = await client
    .from("deposits")
    .select("amount", { count: "exact" })
    .eq("status", "paid")
  const { count: pendingDeposits = 0 } = await client
    .from("deposits")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
  const totalAmount = paidData?.reduce((s, d) => s + d.amount, 0) ?? 0
  const body = {
    leads: { totalLeads, newLeads, highPriorityLeads, convertedLeads },
    clients: { totalClients, newThisMonth: newClients },
    cases: { totalCases, openCases },
    meetings: { today: meetingsToday, completed: meetingsCompleted },
    deposits: { paidDeposits, pendingDeposits, totalAmount },
  }
  return new Response(JSON.stringify(body), { headers: { ...headers, "Content-Type": "application/json" } })
})
