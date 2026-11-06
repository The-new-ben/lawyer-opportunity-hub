import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, MessageSquare, Users, FileText, CreditCard, CheckCircle, TrendingUp, Award } from "lucide-react"

export function WorkflowInfographic() {
  const steps = [
    {
      id: 1,
      title: "Lead Intake",
      subtitle: "WhatsApp / Website",
      icon: MessageSquare,
      color: "bg-primary/10 border-primary/20 text-primary",
      description: "Lead captured via WhatsApp or website form"
    },
    {
      id: 2,
      title: "AI Processing",
      subtitle: "Scoring and Sorting",
      icon: TrendingUp,
      color: "bg-accent/10 border-accent/20 text-accent-foreground",
      description: "AI system analyzes and scores the lead"
    },
    {
      id: 3,
      title: "Matching",
      subtitle: "Matching Engine",
      icon: Users,
      color: "bg-success/10 border-success/20 text-success",
      description: "Filters suitable lawyers by specialization and capacity"
    },
    {
      id: 4,
      title: "Proposal",
      subtitle: "Lawyer Responds",
      icon: FileText,
      color: "bg-warning/10 border-warning/20 text-warning",
      description: "Lawyer sends quote and terms"
    },
    {
      id: 5,
      title: "Contract",
      subtitle: "Digital Signature",
      icon: CheckCircle,
      color: "bg-secondary/10 border-secondary/20 text-secondary-foreground",
      description: "Sign digital contract"
    },
    {
      id: 6,
      title: "Payment",
      subtitle: "WooCommerce",
      icon: CreditCard,
      color: "bg-destructive/10 border-destructive/20 text-destructive",
      description: "Commission and payment through the system"
    },
    {
      id: 7,
      title: "Execution",
      subtitle: "Project Management",
      icon: Award,
      color: "bg-primary-muted/10 border-primary-muted/20 text-primary-muted",
      description: "Track SLA, NPS and work completion"
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">Workflow - From Lead to Completion</CardTitle>
        <p className="text-muted-foreground">
          A fully automated process from lead capture to work completion and scoring
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className="flex items-center gap-4 w-full max-w-2xl">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2
                  ${step.color}
                `}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {step.subtitle}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                <div className="text-2xl font-bold text-muted-foreground/40 ml-4">
                  {step.id}
                </div>
              </div>
              
              {!isLast && (
                <div className="my-3">
                  <ArrowDown className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
            </div>
          )
        })}

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">KPI Metrics and Monthly Scoring</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
            <div>📈 Lead acceptance rate (60-90%)</div>
            <div>⏰ SLA compliance (≥95%)</div>
            <div>⭐ Average NPS score (≥8)</div>
            <div>💰 Refund ratio (≤3%)</div>
            <div>🎯 Pro bono hours (≥20/year)</div>
            <div>🏆 Tiers: Bronze → Silver → Gold → Platinum</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}