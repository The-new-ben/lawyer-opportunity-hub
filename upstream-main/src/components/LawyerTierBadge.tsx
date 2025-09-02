import { Badge } from "@/components/ui/badge"
import { Crown, Star, Award, Shield } from "lucide-react"

interface LawyerTierBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  className?: string
}

export function LawyerTierBadge({ tier, className }: LawyerTierBadgeProps) {
  const tierConfig = {
    bronze: {
      label: "ברונזה",
      icon: Shield,
      variant: "secondary" as const,
      className: "bg-amber-100 text-amber-800 border-amber-300"
    },
    silver: {
      label: "כסף", 
      icon: Star,
      variant: "secondary" as const,
      className: "bg-slate-100 text-slate-800 border-slate-300"
    },
    gold: {
      label: "זהב",
      icon: Award,
      variant: "default" as const,
      className: "bg-yellow-100 text-yellow-800 border-yellow-300"
    },
    platinum: {
      label: "פלטינום",
      icon: Crown,
      variant: "default" as const,
      className: "bg-purple-100 text-purple-800 border-purple-300"
    }
  }

  const config = tierConfig[tier]
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}