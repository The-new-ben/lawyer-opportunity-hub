import { StatsCard } from "@/components/StatsCard"
import { WorkflowInfographic } from "@/components/WorkflowInfographic"
import { SystemStatus } from "@/components/SystemStatus"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Plus,
  Calendar,
  Clock
} from "lucide-react"

export default function Dashboard() {
  const stats = [
    {
      title: "לידים חדשים החודש",
      value: 24,
      change: "+12% מהחודש הקודם",
      icon: UserPlus,
      trend: "up" as const
    },
    {
      title: "לקוחות פעילים",
      value: 156,
      change: "+8 לקוחות חדשים",
      icon: Users,
      trend: "up" as const
    },
    {
      title: "הכנסה החודש",
      value: "₪284,500",
      change: "+18% מהחודש הקודם",
      icon: DollarSign,
      trend: "up" as const
    },
    {
      title: "תיקים פעילים",
      value: 89,
      change: "23 תיקים חדשים",
      icon: FileText,
      trend: "up" as const
    }
  ]

  const recentLeads = [
    { id: 1, name: "רחל כהן", type: "דיני משפחה", status: "חדש", priority: "גבוה" },
    { id: 2, name: "דוד לוי", type: "דיני עבודה", status: "פניה ראשונית", priority: "בינוני" },
    { id: 3, name: "שרה אברהם", type: "דיני נזיקין", status: "ממתין לפגישה", priority: "נמוך" },
    { id: 4, name: "יוסף מרקוביץ", type: "דיני מקרקעין", status: "חדש", priority: "גבוה" }
  ]

  const upcomingMeetings = [
    { time: "09:00", client: "רחל כהן", type: "פגישת ייעוץ ראשונית" },
    { time: "11:30", client: "דוד לוי", type: "מעקב תיק" },
    { time: "14:00", client: "שרה אברהם", type: "חתימה על הסכם" },
    { time: "16:30", client: "יוסף מרקוביץ", type: "פגישת סיכום" }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "גבוה": return "bg-destructive"
      case "בינוני": return "bg-warning"
      case "נמוך": return "bg-success"
      default: return "bg-muted"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "חדש": return "bg-accent text-accent-foreground"
      case "פניה ראשונית": return "bg-primary text-primary-foreground"
      case "ממתין לפגישה": return "bg-warning text-warning-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">דשבורד ראשי</h1>
          <p className="text-muted-foreground">סקירה כללית של פעילות המשרד</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          ליד חדש
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              לידים אחרונים
            </CardTitle>
            <CardDescription>
              לידים שהתקבלו השבוע
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.type}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(lead.priority)}>
                      {lead.priority}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              לוח זמנים היום
            </CardTitle>
            <CardDescription>
              פגישות ומשימות להיום
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Clock className="h-4 w-4" />
                    {meeting.time}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{meeting.client}</div>
                    <div className="text-sm text-muted-foreground">{meeting.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <SystemStatus />
      </div>

      {/* Workflow Infographic */}
      <WorkflowInfographic />
    </div>
  )
}