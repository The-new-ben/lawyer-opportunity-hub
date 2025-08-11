import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BiasReportButton from "./BiasReportButton";

interface EvidenceItem {
  id: string;
  title: string;
  url?: string;
  notes?: string;
  category?: string;
  votes: number;
}

const EvidencePrep = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [q, setQ] = useState("");

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).slice(2, 10);
    const newItem: EvidenceItem = { id, title, url: url || undefined, notes: notes || undefined, category: category || undefined, votes: 0 };
    setItems((prev) => [newItem, ...prev]);
    setTitle(""); setUrl(""); setCategory(""); setNotes("");
    toast({ title: "Evidence added", description: "Item added to the collaborative board." });
  };

  const vote = (id: string, delta: number) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, votes: Math.max(0, it.votes + delta) } : it));
  };

  const results = useMemo(() => {
    const text = q.toLowerCase();
    return items.filter((i) => `${i.title} ${i.category ?? ''} ${i.notes ?? ''}`.toLowerCase().includes(text));
  }, [items, q]);

  return (
    <div className="space-y-4">
      <form className="grid gap-3 md:grid-cols-4" onSubmit={addItem} aria-label="Add evidence form">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ev-title">Title</Label>
          <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Contract PDF, Photo, Email, etc." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ev-url">Link (optional)</Label>
          <Input id="ev-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ev-cat">Category</Label>
          <Input id="ev-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Documents, Photos, Messages..." />
        </div>
        <div className="space-y-2 md:col-span-4">
          <Label htmlFor="ev-notes">Notes</Label>
          <Textarea id="ev-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context, relevance, and chain-of-custody notes." />
        </div>
        <div className="md:col-span-4">
          <Button type="submit">Add to board</Button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="ev-search">Search evidence</Label>
          <Input id="ev-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keyword, category..." />
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {results.map((it) => (
            <Card key={it.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{it.title}</p>
                  <div className="flex items-center gap-2">
                    {it.category && <Badge variant="outline">{it.category}</Badge>}
                    <Badge variant="secondary">{it.votes} votes</Badge>
                  </div>
                </div>
                {it.url && (
                  <a className="text-sm underline" href={it.url} target="_blank" rel="noreferrer noopener"
                     aria-label={`Open evidence ${it.title}`}>{it.url}</a>
                )}
                {it.notes && <p className="text-sm text-muted-foreground">{it.notes}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => vote(it.id, +1)}>Upvote</Button>
                  <Button size="sm" variant="ghost" onClick={() => vote(it.id, -1)}>Downvote</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          Public demo: uploads are link-based for now. Verified submissions, digital signatures, and secure storage will be added next.
        </p>
        <BiasReportButton context="evidence" />
      </div>
    </div>
  );
};

export default EvidencePrep;
