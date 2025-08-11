import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCaseDraft, mergeCaseDraft } from "@/hooks/useCaseDraft";

interface ChatMessage { role: "user" | "assistant"; content: string }

const REQUIRED_FIELDS = [
  "summary",
  "jurisdiction",
  "category",
  "goal",
  "parties",
  "evidence",
  "startDate",
] as const;

type RequiredField = typeof REQUIRED_FIELDS[number];

const prettyLabel: Record<RequiredField, string> = {
  summary: "Summary",
  jurisdiction: "Jurisdiction",
  category: "Category",
  goal: "Goal",
  parties: "Parties",
  evidence: "Evidence",
  startDate: "Start date",
};

const IntakeFreeform = () => {
  const { toast } = useToast();
  const { draft, update } = useCaseDraft();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [missing, setMissing] = useState<RequiredField[]>(REQUIRED_FIELDS as RequiredField[]);
  const [loading, setLoading] = useState(false);
  const [planPreview, setPlanPreview] = useState<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const completed: RequiredField[] = useMemo(() => {
    return (REQUIRED_FIELDS as RequiredField[]).filter((k) => {
      const v = (draft as any)[k];
      if (k === "parties" || k === "evidence") return Array.isArray(v) && v.length > 0;
      return !!v && String(v).trim().length > 0;
    });
  }, [draft]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const sendToAI = async (message?: string) => {
    const userMsg = (message ?? input).trim();
    if (!userMsg) return;
    const nextHistory = [...history, { role: "user", content: userMsg }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-court-orchestrator", {
        body: {
          action: "intake_extract",
          locale: "en",
          context: {
            history: nextHistory,
            required_fields: REQUIRED_FIELDS,
            current_fields: draft,
          },
        },
      });
      if (error) throw error;
      const res = data as {
        updated_fields?: Record<string, any>;
        missing_fields?: string[];
        next_question?: string | null;
        summary?: string;
      };
      if (res.updated_fields) {
        const next = mergeCaseDraft(res.updated_fields);
        update(next);
      }
      if (res.summary) {
        setHistory((h) => [...h, { role: "assistant", content: `Summary updated. ${res.summary}` }]);
      }
      const missingFields = (res.missing_fields || []) as RequiredField[];
      setMissing(missingFields);
      if (res.next_question) {
        setHistory((h) => [...h, { role: "assistant", content: res.next_question || "" }]);
      } else if (missingFields.length === 0) {
        setHistory((h) => [...h, { role: "assistant", content: "All required fields are filled. You can generate the case plan now." }]);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "AI intake failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateCase = async () => {
    if (missing.length > 0) {
      toast({ title: "Missing information", description: `Please provide: ${missing.map((m) => prettyLabel[m]).join(", ")}` });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-court-orchestrator", {
        body: {
          action: "case_builder",
          locale: "en",
          context: {
            summary: draft.summary,
            goal: draft.goal,
            jurisdiction: draft.jurisdiction,
            category: draft.category,
          },
        },
      });
      if (error) throw error;
      const plan = data as any;
      setPlanPreview(JSON.stringify(plan, null, 2));
      toast({ title: "Case plan created", description: "IRAC, timeline and checklist are ready." });
    } catch (e) {
      console.error(e);
      toast({ title: "Case generation failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Freeform Intake (AI)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Describe your case in your own words..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendToAI(); } }}
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => sendToAI()} disabled={loading}>{loading ? "Analyzing..." : "Send"}</Button>
            <Button variant="secondary" onClick={generateCase} disabled={loading}>Generate case</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(REQUIRED_FIELDS as RequiredField[]).map((k) => (
            <Badge key={k} variant={completed.includes(k) ? "secondary" : "outline"}>
              {prettyLabel[k]}
            </Badge>
          ))}
        </div>

        <div className="max-h-60 overflow-auto border rounded p-3 space-y-2">
          {history.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-sm" : "text-sm text-muted-foreground"}>
              <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.content}
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground">Working...</div>}
          <div ref={endRef} />
        </div>

        {planPreview && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Case plan preview</p>
            <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-64">{planPreview}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntakeFreeform;
