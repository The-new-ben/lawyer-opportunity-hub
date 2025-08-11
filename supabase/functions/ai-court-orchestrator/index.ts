import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntakePayload {
  action: "intake";
  locale?: string;
  context?: Record<string, unknown>;
}

type RequestBody = IntakePayload;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (body.action === "intake") {
      // OSS model proxy (optional)
      const MODEL_URL = Deno.env.get("MODEL_SERVER_URL");
      const MODEL_API_KEY = Deno.env.get("MODEL_API_KEY");

      if (MODEL_URL && MODEL_API_KEY) {
        try {
          const resp = await fetch(MODEL_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${MODEL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              task: "intake_questions",
              locale: body.locale ?? "en",
              context: body.context ?? {},
            }),
          });
          if (!resp.ok) throw new Error(`Model server error: ${resp.status}`);
          const data = await resp.json();
          return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (err) {
          console.error("Model call failed, falling back to mock:", err);
        }
      }

      // Mock fallback to keep the UI functional
      const mock = {
        intro: "We will structure your case using the IRAC method (Issue, Rule, Application, Conclusion).",
        method: "IRAC",
        questions: [
          { id: "q1", text: "Briefly describe the core dispute.", type: "text" },
          { id: "q2", text: "What jurisdiction(s) may apply?", type: "text" },
          { id: "q3", text: "Primary legal issue to resolve?", type: "choice", options: ["Contract", "Tort", "Property", "Criminal", "Other"] },
          { id: "q4", text: "What outcome would you consider a success?", type: "text" },
        ],
        disclaimer: "AI assistance is not legal advice. Please consult qualified counsel.",
      };

      return new Response(JSON.stringify(mock), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unsupported action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("ai-court-orchestrator error:", error);
    return new Response(JSON.stringify({ error: error.message ?? "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
