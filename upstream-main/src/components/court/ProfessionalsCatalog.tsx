import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReputationBadge from "./ReputationBadge";

interface ProItem {
  id: string;
  name: string;
  role: "Lawyer" | "Mediator" | "Judge";
  specialties: string[];
  rating?: number;
  location?: string;
  reputationPoints?: number;
  photoUrl?: string;
}

const MOCK: ProItem[] = [
  { id: "p1", name: "Dr. Anna Clark", role: "Judge", specialties: ["International Law", "Arbitration"], location: "London", rating: 5, reputationPoints: 180 },
  { id: "p2", name: "Michael Singh", role: "Lawyer", specialties: ["Contract", "IP"], location: "Toronto", rating: 4.7, reputationPoints: 95 },
  { id: "p3", name: "Sara Haddad", role: "Mediator", specialties: ["Family", "Civil"], location: "Dubai", rating: 4.8, reputationPoints: 60 },
];

const ProfessionalsCatalog = () => {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("All");
  const [loc, setLoc] = useState("");

  const items = useMemo(() => {
    return MOCK.filter((i) => {
      const roleOk = role === "All" || i.role === role;
      const text = `${i.name} ${i.role} ${i.specialties.join(" ")} ${i.location ?? ""}`.toLowerCase();
      const qOk = text.includes(q.toLowerCase());
      const locOk = !loc || (i.location ?? "").toLowerCase().includes(loc.toLowerCase());
      return roleOk && qOk && locOk;
    });
  }, [q, role, loc]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
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
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="Any" value={loc} onChange={(e) => setLoc(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {/* No external images yet; fallback initials */}
                    <AvatarFallback>{p.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.location ?? "Global"}</p>
                  </div>
                </div>
                <Badge variant="secondary">{p.role}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.specialties.map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
              {typeof p.rating === 'number' && (
                <p className="text-xs text-muted-foreground">Rating: {p.rating.toFixed(1)} / 5</p>
              )}
              <ReputationBadge points={p.reputationPoints ?? 0} />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Registration and verification will be available soon.</p>
    </div>
  );
};

export default ProfessionalsCatalog;
