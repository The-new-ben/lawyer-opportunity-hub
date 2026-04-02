import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface BiasReportButtonProps {
  context: string;
}

const BiasReportButton = ({ context }: BiasReportButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const submit = () => {
    toast({
      title: "Report submitted",
      description: "Thank you. Our team will review potential bias/conflict.",
    });
    setOpen(false);
    setReason("");
  };

  return (
    <div className="space-y-2">
      {!open && (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Report bias / conflict
        </Button>
      )}
      {open && (
        <div className="space-y-2 p-3 rounded-md border">
          <div className="space-y-2">
            <Label htmlFor={`bias-${context}`}>Describe the issue</Label>
            <Textarea id={`bias-${context}`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe potential bias, conflict of interest, or fairness concern." />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={!reason.trim()}>Submit</Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiasReportButton;
