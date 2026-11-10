import { Badge } from "@/components/ui/badge";

interface ReputationBadgeProps {
  points: number;
}

function tierFromPoints(points: number) {
  if (points >= 200) return { tier: "Platinum", variant: "default" as const };
  if (points >= 120) return { tier: "Gold", variant: "secondary" as const };
  if (points >= 60) return { tier: "Silver", variant: "outline" as const };
  return { tier: "Bronze", variant: "outline" as const };
}

const ReputationBadge = ({ points }: ReputationBadgeProps) => {
  const { tier, variant } = tierFromPoints(points);
  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>Reputation: {tier}</Badge>
      <span className="text-xs text-muted-foreground">{points} pts</span>
    </div>
  );
};

export default ReputationBadge;
