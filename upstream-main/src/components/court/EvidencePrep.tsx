import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import BiasReportButton from "./BiasReportButton";
import { uploadCourtDocument, searchEvidence } from "@/lib/api";

interface EvidenceRecord {
  id: string;
  document_url: string | null;
  description: string | null;
  evidence_text: string | null;
}

const EvidencePrep = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<EvidenceRecord[]>([]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    await uploadCourtDocument({ caseId: "demo", file, description });
    setFile(null); setDescription("");
    toast({ title: "Uploaded" });
  };

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await searchEvidence(q);
    setResults(data?.data ?? data);
  };

  return (
    <div className="space-y-4">
      <form className="grid gap-3 md:grid-cols-4" onSubmit={addItem} aria-label="Add evidence form">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ev-file">File</Label>
          <Input id="ev-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
        </div>
        <div className="space-y-2 md:col-span-4">
          <Label htmlFor="ev-notes">Description</Label>
          <Textarea id="ev-notes" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="md:col-span-4">
          <Button type="submit">Upload</Button>
        </div>
      </form>

      <form className="space-y-3" onSubmit={runSearch} aria-label="Search evidence">
        <div className="space-y-2">
          <Label htmlFor="ev-search">Search evidence</Label>
          <Input id="ev-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keyword" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {results.map((it) => (
          <Card key={it.id}>
            <CardContent className="p-4 space-y-2">
              {it.description && <p className="font-medium">{it.description}</p>}
              {it.document_url && <p className="text-sm break-all">{it.document_url}</p>}
              {it.evidence_text && <p className="text-sm text-muted-foreground max-h-40 overflow-y-auto">{it.evidence_text}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          Public demo only.
        </p>
        <BiasReportButton context="evidence" />
      </div>
    </div>
  );
};

export default EvidencePrep;
