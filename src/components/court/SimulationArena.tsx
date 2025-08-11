import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const roles = [
  { id: "observer", label: "Observer" },
  { id: "juror", label: "Juror" },
  { id: "counsel", label: "Counsel" },
];

const SimulationArena = () => {
  const [role, setRole] = useState<string | null>(null);
  const [points, setPoints] = useState(0);

  const join = (r: string) => {
    setRole(r);
    setPoints((p) => p + 5);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <Button key={r.id} variant={role === r.id ? "default" : "secondary"} size="sm" onClick={() => join(r.id)}>
            Join as {r.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Your role: {role ?? "—"}</p>
            <p className="text-sm text-muted-foreground">Points: {points}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">Live Feed</p>
            <p className="text-xs text-muted-foreground">Arguments, evidence, and rulings will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">Leaderboard</p>
            <ul className="text-xs text-muted-foreground list-disc ml-4">
              <li>A. Smith — 42 pts</li>
              <li>M. Khan — 34 pts</li>
              <li>Y. Chen — 29 pts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimulationArena;
