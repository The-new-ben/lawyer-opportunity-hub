import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const SummonsForm = () => {
  const { toast } = useToast();
  const [role, setRole] = useState("defendant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    toast({ title: "Summons created", description: `ID: ${id}` });
    setName(""); setEmail(""); setPhone(""); setMessage("");
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-3">
        <div className="space-y-2">
          <Label>Party role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plaintiff">Plaintiff</SelectItem>
              <SelectItem value="defendant">Defendant</SelectItem>
              <SelectItem value="witness">Witness</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="msg">Message (optional)</Label>
          <Textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Include case reference, deadline, instructions..." />
        </div>
      </div>
      <Button type="submit">Create Summons</Button>
    </form>
  );
};

export default SummonsForm;
