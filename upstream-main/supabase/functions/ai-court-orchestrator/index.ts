import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// Using HF Router Chat Completions (no direct HfInference)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntakePayload {
  action: "intake";
  locale?: string;
  context?: Record<string, unknown>;
  model?: string;
}

interface PartyInterrogationPayload {
  action: "party_interrogation";
  locale?: string;
  context?: {
    summary?: string;
    parties?: Array<{ name?: string; role?: string }>;
    jurisdiction?: string;
  };
  model?: string;
}

interface CaseBuilderPayload {
  action: "case_builder";
  locale?: string;
  context?: {
    summary?: string;
    goal?: string;
    jurisdiction?: string;
    category?: string;
  };
  model?: string;
}

interface RoleMatchPayload {
  action: "role_match";
  locale?: string;
  context?: {
    summary?: string;
    category?: string;
    location?: string;
    languages?: string[];
  };
  model?: string;
}

interface IntakeExtractPayload {
  action: "intake_extract";
  locale?: string;
  context?: {
    history?: Array<{ role: string; content: string }>;
    required_fields?: string[];
    current_fields?: Record<string, unknown>;
  };
  model?: string;
}

type RequestBody = IntakePayload | PartyInterrogationPayload | CaseBuilderPayload | RoleMatchPayload | IntakeExtractPayload;

const MODEL_URL = Deno.env.get("MODEL_SERVER_URL");
const MODEL_API_KEY = Deno.env.get("MODEL_API_KEY");
const HF_TOKEN = Deno.env.get("HUGGINGFACE_API_KEY") || Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
const HF_CHAT_DEFAULT_MODEL = Deno.env.get("HF_DEFAULT_CHAT_MODEL") || "openai/gpt-oss-120b:cerebras";

async function callModelViaProxy(task: string, locale: string, context: Record<string, unknown>) {
  if (!(MODEL_URL && MODEL_API_KEY)) return null;
  try {
    const resp = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MODEL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task, locale, context }),
    });
    if (!resp.ok) throw new Error(`Model server error: ${resp.status}`);
    return await resp.json();
  } catch (err) {
    console.error("Model proxy failed:", err);
    return null;
  }
}

async function callModelViaHF(prompt: string, model?: string) {
  const token = HF_TOKEN;
  if (!token) return null;
  try {
    const payload = {
      model: model || HF_CHAT_DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant. Always return ONLY a valid JSON object (no markdown/code fences, no surrounding text)." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.3,
      response_format: { type: "json_object" },
    };

    const resp = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(JSON.stringify({ level: 'error', message: 'HF chat API error', context: { status: resp.status, errText } }));
      return null;
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content;
    return text || JSON.stringify(data);
  } catch (err: any) {
    console.error(JSON.stringify({ level: 'error', message: 'HF generation failed', context: { error: err?.message } }));
    return null;
  }
}

function buildInterrogationPrompt(locale: string, ctx: PartyInterrogationPayload["context"]) {
  const summary = ctx?.summary || "";
  const parties = (ctx?.parties || [{ name: "Plaintiff", role: "Plaintiff" }, { name: "Defendant", role: "Defendant" }])
    .map(p => `${p.role || "Party"}: ${p.name || "N/A"}`).join("; ");
  return `You are a legal assistant creating structured interrogation questions for a court case. Locale: ${locale}.
Case summary: ${summary}
Parties: ${parties}
Return STRICT JSON with: { "parties": [ { "role": string, "name": string, "questions": [ { "id": string, "text": string, "type": "text" | "choice", "options"?: string[] } ] } ] }`;
}

function buildCasePlanPrompt(locale: string, ctx: CaseBuilderPayload["context"]) {
  const summary = ctx?.summary || "";
  const goal = ctx?.goal || "Fair resolution";
  const jurisdiction = ctx?.jurisdiction || "Global";
  const category = ctx?.category || "General";
  return `You are a senior legal analyst. Build a concise case plan in ${locale}. Input:
- Jurisdiction: ${jurisdiction}
- Category: ${category}
- Goal: ${goal}
- Summary: ${summary}
Respond in STRICT JSON with keys:
{
  "irac": {"issue": string, "rule": string, "application": string, "conclusion": string},
  "evidence_checklist": [ {"name": string, "required": boolean, "notes": string} ],
  "timeline": [ {"milestone": string, "due_in_days": number} ],
  "risks": string[]
}`;
}

function buildRoleMatchPrompt(locale: string, ctx: RoleMatchPayload["context"]) {
  const summary = ctx?.summary || "";
  const category = ctx?.category || "General";
  const location = ctx?.location || "Global";
  const langs = (ctx?.languages || ["English"]).join(", ");
  return `You help match legal professionals (lawyers, mediators, judges, jurors) to a case.
Input: {category: ${category}, location: ${location}, languages: ${langs}, summary: ${summary}}
Respond in STRICT JSON with:
{
  "filters": {
    "specializations": string[],
    "min_experience": number,
    "jurisdictions": string[],
    "languages": string[],
    "qualities": string[]
  },
  "search_prompt": string,
  "roles": { "lawyer": string[], "mediator": string[], "judge": string[], "juror": string[] }
}`;
}

function buildIntakeExtractPrompt(
  locale: string,
  history: Array<{ role: string; content: string }>,
  required: string[],
  current?: Record<string, unknown>
) {
  return `You are an intake orchestrator for court preparation. Locale: ${locale}.
Your job: From the chat history and current fields, extract and infer the structured fields needed to prepare a case.
Return STRICT JSON with exactly these keys:
{
  "updated_fields": {
    "title"?: string,
    "summary"?: string,
    "jurisdiction"?: string,
    "category"?: string,
    "goal"?: string,
    "parties"?: Array<{"role": string, "name": string, "email"?: string, "phone"?: string}>,
    "evidence"?: Array<{"title": string, "url"?: string, "notes"?: string, "category"?: string}>,
    "startDate"?: string
  },
  "missing_fields": string[],
  "next_question": string | null,
  "summary": string
}
Rules:
- Only include fields you can confidently infer.
- If missing_fields is not empty, propose a single clear next_question to collect the most critical missing field.
- Dates must be ISO-8601 if provided.

Current fields: ${JSON.stringify(current || {})}
Chat history (role:content):\n${history.map((m) => `${m.role}: ${m.content}`).join("\n")}
Required fields: ${required.join(", ")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const locale = (body as any).locale ?? "en";

    if (body.action === "intake") {
      // Try OSS proxy first (backwards-compatible with existing UI)
      const proxied = await callModelViaProxy("intake_questions", locale, body.context ?? {});
      if (proxied) {
        return new Response(JSON.stringify(proxied), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Try HF fallback
      const prompt = `Create an IRAC-based intake in ${locale}.
Return STRICT JSON with keys: intro, method, questions (array of {id,text,type,options?}), disclaimer.
Consider context: ${JSON.stringify(body.context || {})}`;
      const gen = await callModelViaHF(prompt, (body as any).model);
      if (gen) {
        try {
          const parsed = typeof gen === "string" ? JSON.parse(gen) : gen;
          return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch {
          // If model returned non-JSON, fall through to mock
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

      return new Response(JSON.stringify(mock), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "party_interrogation") {
      const b = body as PartyInterrogationPayload;
      const prompt = buildInterrogationPrompt(locale, b.context);
      const gen = await callModelViaHF(prompt, b.model);
      if (gen) {
        try {
          const parsed = typeof gen === "string" ? JSON.parse(gen) : gen;
          return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (e) {
          console.warn("Interrogation JSON parse failed, returning template:", e);
        }
      }
      const fallback = {
        parties: (b.context?.parties || [{ name: "Plaintiff", role: "Plaintiff" }, { name: "Defendant", role: "Defendant" }]).map((p, idx) => ({
          role: p.role || "Party",
          name: p.name || `Party ${idx + 1}`,
          questions: [
            { id: `q${idx + 1}-1`, text: "Please state your relationship to the dispute.", type: "text" },
            { id: `q${idx + 1}-2`, text: "List any documents supporting your claims.", type: "text" },
          ],
        })),
      };
      return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if ((body as any).action === "intake_extract") {
      const b = body as IntakeExtractPayload;
      const history = b.context?.history ?? [];
      const required = b.context?.required_fields ?? ["summary", "jurisdiction", "category", "goal", "parties", "evidence", "startDate"];
      const current = b.context?.current_fields ?? {};
      const prompt = buildIntakeExtractPrompt(locale, history as any, required, current);
      const gen = await callModelViaHF(prompt, b.model);
      if (gen) {
        try {
          if (typeof gen === "string") {
            let txt = gen.trim();
            // Strip code fences if present and isolate JSON object
            txt = txt.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
            const start = txt.indexOf("{");
            const end = txt.lastIndexOf("}");
            if (start !== -1 && end !== -1 && end > start) {
              txt = txt.slice(start, end + 1);
            }
            const parsed = JSON.parse(txt);
            return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          } else {
            return new Response(JSON.stringify(gen), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        } catch (e) {
          console.warn("Intake extract JSON parse failed, returning heuristic fallback:", e);
        }
      }
      const lastUser = [...history].reverse().find((m) => m.role === "user")?.content || "";
      const fallback = {
        updated_fields: { summary: (current as any).summary ?? lastUser },
        missing_fields: required.filter((k) => !(current as any)[k] && k !== "summary"),
        next_question: "Please specify the applicable jurisdiction.",
        summary: ((current as any).summary ?? lastUser).slice(0, 600),
      };
      return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "case_builder") {
      const b = body as CaseBuilderPayload;
      const prompt = buildCasePlanPrompt(locale, b.context);
      const gen = await callModelViaHF(prompt, b.model);
      if (gen) {
        try {
          const parsed = typeof gen === "string" ? JSON.parse(gen) : gen;
          return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (e) {
          console.warn("Case plan JSON parse failed, returning template:", e);
        }
      }
      const fallback = {
        irac: {
          issue: "What is the primary legal question in dispute?",
          rule: "Cite the applicable statutes, regulations, or precedents.",
          application: "Apply rules to facts, noting strengths/weaknesses.",
          conclusion: "Concise likely outcome under current facts/rules.",
        },
        evidence_checklist: [
          { name: "Contracts/Agreements", required: true, notes: "Signed copies, amendments" },
          { name: "Communications", required: true, notes: "Email, chat logs, letters" },
          { name: "Witness Statements", required: false, notes: "Signed summaries" },
        ],
        timeline: [
          { milestone: "File initial claim/response", due_in_days: 14 },
          { milestone: "Exchange discovery/evidence", due_in_days: 30 },
          { milestone: "Pre-hearing conference", due_in_days: 45 },
        ],
        risks: ["Jurisdictional challenges", "Insufficient documentation"],
      };
      return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "role_match") {
      const b = body as RoleMatchPayload;
      const prompt = buildRoleMatchPrompt(locale, b.context);
      const gen = await callModelViaHF(prompt, b.model);
      if (gen) {
        try {
          const parsed = typeof gen === "string" ? JSON.parse(gen) : gen;
          return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (e) {
          console.warn("Role match JSON parse failed, returning template:", e);
        }
      }
      const fallback = {
        filters: {
          specializations: ["International Law", "Arbitration"],
          min_experience: 5,
          jurisdictions: [b.context?.location || "Global"],
          languages: b.context?.languages || ["English"],
          qualities: ["Impartiality", "Clear communication"],
        },
        search_prompt: "Experienced international arbitration counsel near Global, multilingual.",
        roles: {
          lawyer: ["International arbitration counsel"],
          mediator: ["Cross-border commercial mediator"],
          judge: ["Arbitrator with public international law background"],
          juror: ["Community representative with no conflicts"],
        },
      };
      return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unsupported action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("ai-court-orchestrator error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message ?? "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});