import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PartyQuestion {
  id: string;
  text: string;
  type: "text" | "choice";
  options?: string[];
}

interface PartyBlock {
  role: string;
  name: string;
  questions: PartyQuestion[];
}

const PartyInterrogation = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState("");
  const [plaintiff, setPlaintiff] = useState("Plaintiff");
  const [defendant, setDefendant] = useState("Defendant");
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<PartyBlock[] | null>(null);

  const generate = async () => {
    setLoading(true);
    setBlocks(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-court-orchestrator", {
        body: {
          action: "party_interrogation",
          locale: "en",
          context: {
            summary,
            parties: [
              { name: plaintiff, role: "Plaintiff" },
              { name: defendant, role: "Defendant" },
            ],
          },
        },
      });
      if (error) throw error;
      setBlocks(data?.parties ?? null);
      toast({ title: "Generated", description: "Interrogation questions ready." });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">Case summary</Label>
          <Textarea id="summary" placeholder="Key facts, dispute nature, timeline..." value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Parties</Label>
          <div className="grid gap-2">
            <Input value={plaintiff} onChange={(e) => setPlaintiff(e.target.value)} placeholder="Plaintiff name" />
            <Input value={defendant} onChange={(e) => setDefendant(e.target.value)} placeholder="Defendant name" />
          </div>
        </div>
      </div>
      <Button onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "Generate Interrogation"}
      </Button>

      {blocks && (
        <div className="grid gap-3 md:grid-cols-2">
          {blocks.map((b) => (
            <Card key={b.role + b.name}>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-medium">{b.role}: {b.name}</p>
                <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
                  {b.questions.map((q) => (
                    <li key={q.id}>{q.text}{q.type === 'choice' && q.options ? ` (Choices: ${q.options.join(', ')})` : ''}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartyInterrogation;
