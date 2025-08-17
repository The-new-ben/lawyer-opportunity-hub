import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const HearingScheduler = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    toast({ title: "Hearing scheduled", description: `${title || 'Hearing'} • ${datetime} (${timezone}) • ID: ${id}` });
    setTitle(""); setDatetime(""); setTimezone("UTC");
  };

  return (
    <form className="space-y-3" onSubmit={create}>
      <div className="grid gap-3">
        <div className="space-y-2">
          <Label htmlFor="htitle">Title</Label>
          <Input id="htitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Preliminary hearing" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dt">Date & time</Label>
          <Input id="dt" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tz">Timezone</Label>
          <Input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC, GMT+2, PST..." />
        </div>
      </div>
      <Button type="submit">Schedule</Button>
    </form>
  );
};

export default HearingScheduler;
