import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CasePlan {
  irac: { issue: string; rule: string; application: string; conclusion: string };
  evidence_checklist: { name: string; required: boolean; notes: string }[];
  timeline: { milestone: string; due_in_days: number }[];
  risks: string[];
}

const CaseBuilder = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState("");
  const [goal, setGoal] = useState("Fair resolution");
  const [jurisdiction, setJurisdiction] = useState("Global");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<CasePlan | null>(null);

  const generate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-court-orchestrator", {
        body: {
          action: "case_builder",
          locale: "en",
          context: { summary, goal, jurisdiction, category },
        },
      });
      if (error) throw error;
      setPlan(data as CasePlan);
      toast({ title: "Generated", description: "Case plan ready." });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">Case summary</Label>
          <Textarea id="summary" placeholder="Key facts and background..." value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal">Goal</Label>
          <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jurisdiction">Jurisdiction</Label>
          <Input id="jurisdiction" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
      </div>
      <Button onClick={generate} disabled={loading}>{loading ? "Generating..." : "Build Case Plan"}</Button>

      {plan && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">IRAC</p>
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              <li><strong>Issue:</strong> {plan.irac.issue}</li>
              <li><strong>Rule:</strong> {plan.irac.rule}</li>
              <li><strong>Application:</strong> {plan.irac.application}</li>
              <li><strong>Conclusion:</strong> {plan.irac.conclusion}</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Evidence checklist</p>
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              {plan.evidence_checklist.map((e, idx) => (
                <li key={idx}>{e.name} {e.required ? "(required)" : "(optional)"} — {e.notes}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Timeline</p>
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              {plan.timeline.map((t, idx) => (
                <li key={idx}>{t.milestone} — due in {t.due_in_days} days</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Risks</p>
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              {plan.risks.map((r, idx) => (<li key={idx}>{r}</li>))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseBuilder;
