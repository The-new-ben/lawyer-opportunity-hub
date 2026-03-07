import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RoleMatchResult {
  filters: {
    specializations: string[];
    min_experience: number;
    jurisdictions: string[];
    languages: string[];
    qualities: string[];
  };
  search_prompt: string;
  roles: { lawyer: string[]; mediator: string[]; judge: string[]; juror: string[] };
}

const RoleMatchFinder = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("International Law");
  const [location, setLocation] = useState("Global");
  const [languages, setLanguages] = useState("English");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoleMatchResult | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-court-orchestrator", {
        body: {
          action: "role_match",
          locale: "en",
          context: {
            category,
            location,
            languages: languages.split(",").map(s => s.trim()).filter(Boolean),
            summary,
          },
        },
      });
      if (error) throw error;
      setResult(data as RoleMatchResult);
      toast({ title: "Ready", description: "AI role matching generated." });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="languages">Languages (comma separated)</Label>
          <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-1 md:col-start-1 md:row-start-2 md:row-span-1">
          <Label htmlFor="summary">Short case summary</Label>
          <Input id="summary" placeholder="Optional" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
      </div>
      <Button onClick={run} disabled={loading}>{loading ? "Finding..." : "Find Roles"}</Button>

      {result && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Search prompt</p>
            <p className="text-sm text-muted-foreground">{result.search_prompt}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Suggested filters</p>
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              <li>Specializations: {result.filters.specializations.join(", ")}</li>
              <li>Min experience: {result.filters.min_experience} years</li>
              <li>Jurisdictions: {result.filters.jurisdictions.join(", ")}</li>
              <li>Languages: {result.filters.languages.join(", ")}</li>
              <li>Qualities: {result.filters.qualities.join(", ")}</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Roles</p>
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              <li>Lawyer: {result.roles.lawyer.join(", ")}</li>
              <li>Mediator: {result.roles.mediator.join(", ")}</li>
              <li>Judge: {result.roles.judge.join(", ")}</li>
              <li>Juror: {result.roles.juror.join(", ")}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleMatchFinder;
