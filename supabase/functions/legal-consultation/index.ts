import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}

serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })
  try {
    const { question } = await req.json()
    const apiKey = Deno.env.get("OPENAI_API_KEY")
    const githubToken = Deno.env.get("GITHUB_TOKEN")
    const repo = Deno.env.get("GITHUB_REPO")
    if (!question || !apiKey || !githubToken || !repo) {
      return new Response(JSON.stringify({ error: "missing" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: "Provide brief legal guidance" }, { role: "user", content: question }], max_tokens: 300 })
    })
    const aiData = await aiResponse.json()
    const answer = aiData.choices?.[0]?.message?.content ?? ""
    await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json" },
      body: JSON.stringify({ title: question.slice(0, 50), body: `Q: ${question}\nA: ${answer}` })
    })
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})
