import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Activity, Database, Mail, CreditCard } from "lucide-react"

export function SystemStatus() {
  const services = [
    {
      name: "אימות משתמשים",
      status: "operational",
      icon: CheckCircle,
      lastCheck: "עכשיו"
    },
    {
      name: "מסד נתונים",
      status: "operational", 
      icon: Database,
      lastCheck: "לפני דקה"
    },
    {
      name: "שירות אימייל",
      status: "degraded",
      icon: Mail,
      lastCheck: "לפני 2 דקות"
    },
    {
      name: "מערכת תשלומים",
      status: "operational",
      icon: CreditCard,
      lastCheck: "לפני דקה"
    },
    {
      name: "API כללי",
      status: "operational",
      icon: Activity,
      lastCheck: "עכשיו"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-success text-success-foreground'
      case 'degraded':
        return 'bg-warning text-warning-foreground'
      case 'down':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'פעיל'
      case 'degraded':
        return 'תקלה חלקית'
      case 'down':
        return 'לא פעיל'
      default:
        return 'לא ידוע'
    }
  }

  const overallStatus = services.every(s => s.status === 'operational') 
    ? 'operational' 
    : services.some(s => s.status === 'down') 
      ? 'down' 
      : 'degraded'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          סטטוס המערכת
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">סטטוס כללי</span>
          <Badge className={getStatusColor(overallStatus)}>
            {getStatusText(overallStatus)}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {service.lastCheck}
                  </span>
                  <Badge variant="outline" className={getStatusColor(service.status)}>
                    {getStatusText(service.status)}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {overallStatus !== 'operational' && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                זוהו בעיות במערכת
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              שירות האימייל חווה תקלות זמניות. ההרשמה עובדת אך ללא אימות אימייל.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}