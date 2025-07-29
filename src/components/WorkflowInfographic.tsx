import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, MessageSquare, Users, FileText, CreditCard, CheckCircle, TrendingUp, Award } from "lucide-react"

export function WorkflowInfographic() {
  const steps = [
    {
      id: 1,
      title: "קליטת ליד",
      subtitle: "WhatsApp / אתר",
      icon: MessageSquare,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      description: "הליד נקלט דרך WhatsApp או טופס באתר"
    },
    {
      id: 2,
      title: "עיבוד AI",
      subtitle: "ניקוד ומיון",
      icon: TrendingUp,
      color: "bg-purple-50 border-purple-200 text-purple-700",
      description: "מערכת AI מנתחת ומנקדת את הליד"
    },
    {
      id: 3,
      title: "התאמה",
      subtitle: "מנוע התאמות",
      icon: Users,
      color: "bg-green-50 border-green-200 text-green-700",
      description: "מיון עורכי דין מתאימים לפי התמחות ויכולת"
    },
    {
      id: 4,
      title: "הצעה",
      subtitle: "עורך דין מגיב",
      icon: FileText,
      color: "bg-orange-50 border-orange-200 text-orange-700",
      description: "עורך דין שולח הצעת מחיר ותנאים"
    },
    {
      id: 5,
      title: "חוזה",
      subtitle: "חתימה דיגיטלית",
      icon: CheckCircle,
      color: "bg-indigo-50 border-indigo-200 text-indigo-700",
      description: "חתימה על חוזה דיגיטלי"
    },
    {
      id: 6,
      title: "תשלום",
      subtitle: "WooCommerce",
      icon: CreditCard,
      color: "bg-red-50 border-red-200 text-red-700",
      description: "עמלה ותשלום דרך המערכת"
    },
    {
      id: 7,
      title: "ביצוע",
      subtitle: "ניהול פרויקט",
      icon: Award,
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
      description: "מעקב SLA, NPS וביצוע העבודה"
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">זרימת עבודה - מליד ועד לביצוע</CardTitle>
        <p className="text-muted-foreground">
          תהליך אוטומטי מלא מקליטת הליד ועד לביצוע העבודה והניקוד
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
          <h4 className="font-semibold text-primary mb-2">מדדי KPI וניקוד חודשי</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
            <div>📈 אחוז קבלת לידים (60-90%)</div>
            <div>⏰ עמידה ב-SLA (≥95%)</div>
            <div>⭐ ציון NPS ממוצע (≥8)</div>
            <div>💰 יחס החזרים (≤3%)</div>
            <div>🎯 שעות פרו-בונו (≥20/שנה)</div>
            <div>🏆 דרגות: ברונזה → כסף → זהב → פלטינום</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}