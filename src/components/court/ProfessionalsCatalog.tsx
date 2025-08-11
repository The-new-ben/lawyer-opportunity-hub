import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProItem {
  id: string;
  name: string;
  role: "Lawyer" | "Mediator" | "Judge";
  specialties: string[];
  rating?: number;
  location?: string;
}

const MOCK: ProItem[] = [
  { id: "p1", name: "Dr. Anna Clark", role: "Judge", specialties: ["International Law", "Arbitration"], location: "London", rating: 5 },
  { id: "p2", name: "Michael Singh", role: "Lawyer", specialties: ["Contract", "IP"], location: "Toronto", rating: 4.7 },
  { id: "p3", name: "Sara Haddad", role: "Mediator", specialties: ["Family", "Civil"], location: "Dubai", rating: 4.8 },
];

const ProfessionalsCatalog = () => {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("All");

  const items = useMemo(() => {
    return MOCK.filter((i) => {
      const roleOk = role === "All" || i.role === role;
      const text = `${i.name} ${i.role} ${i.specialties.join(" ")} ${i.location ?? ""}`.toLowerCase();
      return roleOk && text.includes(q.toLowerCase());
    });
  }, [q, role]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="search">Search directory</Label>
          <Input id="search" placeholder="Name, specialty, location..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Lawyer">Lawyer</SelectItem>
              <SelectItem value="Mediator">Mediator</SelectItem>
              <SelectItem value="Judge">Judge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{p.name}</p>
                <Badge variant="secondary">{p.role}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{p.location ?? "Global"}</p>
              <div className="flex flex-wrap gap-2">
                {p.specialties.map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
              {p.rating && (
                <p className="text-xs text-muted-foreground">Rating: {p.rating.toFixed(1)} / 5</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Registration and verification will be available soon.</p>
    </div>
  );
};

export default ProfessionalsCatalog;
