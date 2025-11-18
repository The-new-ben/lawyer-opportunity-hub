import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IntakeQuestion {
  id: string;
  text: string;
  type: "text" | "choice";
  options?: string[];
}

interface IntakeResponse {
  intro: string;
  method: string;
  questions: IntakeQuestion[];
  disclaimer?: string;
}

const IntakeAssistant = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IntakeResponse | null>(null);

  const startIntake = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("ai-court-orchestrator", {
        body: {
          action: "intake",
          locale: "en",
          context: { title, jurisdiction, goal },
        },
      });
      if (error) throw error;
      setData(data as IntakeResponse);
      toast({ title: "Intake ready", description: "Initial questions generated." });
    } catch (err) {
      console.error(err);
      toast({
        title: "AI intake failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="title">Case title</Label>
          <Input id="title" placeholder="e.g., Contract dispute" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jurisdiction">Jurisdiction</Label>
          <Input id="jurisdiction" placeholder="e.g., International" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal">Goal</Label>
          <Input id="goal" placeholder="e.g., Settlement or judgment" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
      </div>
      <div>
        <Button onClick={startIntake} disabled={loading || !title}>
          {loading ? "Generating..." : "Start Intake"}
        </Button>
      </div>

      {data && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Method: {data.method}</p>
          <p className="text-sm">{data.intro}</p>
          <div className="space-y-3">
            {data.questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label>{q.text}</Label>
                {q.type === "text" ? (
                  <Textarea placeholder="Your answer..." />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {q.options?.map((opt) => (
                      <Button key={opt} variant="secondary" size="sm">{opt}</Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {data.disclaimer && (
            <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IntakeAssistant;
