import { StatsCard } from "@/components/StatsCard"
import { WorkflowInfographic } from "@/components/WorkflowInfographic"
import { SystemStatus } from "@/components/SystemStatus"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"
import { toast } from "sonner"
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Plus,
  Calendar,
  Clock,
  Brain,
  RefreshCw
} from "lucide-react"

export default function Dashboard() {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // AI Summary Query
  const { data: aiSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['ai-summary'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-summary');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefreshSummary = async () => {
    setIsLoadingSummary(true);
    try {
      await refetchSummary();
      toast.success("סיכום עודכן בהצלחה");
    } catch (error) {
      toast.error("שגיאה בעדכון הסיכום");
    } finally {
      setIsLoadingSummary(false);
    }
  };

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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "גבוה": return "destructive"
      case "בינוני": return "warning"
      case "נמוך": return "success"
      default: return "secondary"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "חדש": return "default"
      case "פניה ראשונית": return "secondary"
      case "ממתין לפגישה": return "warning"
      default: return "outline"
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center animate-slide-in-right">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary animate-fade-in">דשבורד ראשי</h1>
          <p className="text-sm sm:text-base text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
            סקירה כללית של פעילות המשרד
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto hover-scale animate-scale-in" style={{ animationDelay: '200ms' }}>
          <Plus className="h-4 w-4" />
          ליד חדש
        </Button>
      </div>

      {/* Stats Grid - Mobile First Responsive */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="animate-scale-in hover-scale"
            style={{ animationDelay: `${300 + (index * 100)}ms` }}
          >
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* AI Summary Card - Mobile Optimized */}
      <Card className="w-full animate-fade-in hover-scale" style={{ animationDelay: '700ms' }}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 animate-pulse" />
              סיכום AI של המשרד
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshSummary}
              disabled={isLoadingSummary}
              className="gap-2 w-full sm:w-auto hover-scale"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingSummary ? 'animate-spin' : ''}`} />
              רענן
            </Button>
          </div>
          <CardDescription className="text-sm">
            ניתוח אוטומטי של נתוני המשרד עם תובנות והמלצות
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {aiSummary ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{aiSummary.summary}</p>
              </div>
              {aiSummary.timestamp && (
                <p className="text-xs text-muted-foreground">
                  עודכן לאחרונה: {new Date(aiSummary.timestamp).toLocaleString('he-IL')}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 sm:p-8 text-muted-foreground">
              <div className="text-center space-y-2 animate-fade-in">
                <Brain className="h-8 w-8 mx-auto opacity-50 animate-pulse" />
                <p className="text-sm">לחץ על "רענן" לקבלת סיכום AI</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Grid - Mobile First */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 animate-fade-in" style={{ animationDelay: '800ms' }}>
        {/* Recent Leads - Mobile Optimized */}
        <Card className="w-full hover-scale animate-scale-in" style={{ animationDelay: '900ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5" />
              לידים אחרונים
            </CardTitle>
            <CardDescription className="text-sm">
              לידים שהתקבלו השבוע
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentLeads.map((lead, index) => (
                <div
                  key={lead.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale animate-fade-in"
                  style={{ animationDelay: `${1000 + (index * 100)}ms` }}
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm sm:text-base">{lead.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{lead.type}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={getPriorityVariant(lead.priority) as any} className="text-xs">
                      {lead.priority}
                    </Badge>
                    <Badge variant={getStatusVariant(lead.status) as any} className="text-xs">
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule - Mobile Optimized */}
        <Card className="w-full hover-scale animate-scale-in" style={{ animationDelay: '1000ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              לוח זמנים היום
            </CardTitle>
            <CardDescription className="text-sm">
              פגישות ומשימות להיום
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {upcomingMeetings.map((meeting, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale animate-fade-in"
                  style={{ animationDelay: `${1100 + (index * 100)}ms` }}
                >
                  <div className="flex items-center gap-2 text-primary font-medium text-sm">
                    <Clock className="h-4 w-4" />
                    {meeting.time}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm sm:text-base">{meeting.client}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{meeting.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status - Mobile Optimized */}
        <div className="animate-scale-in" style={{ animationDelay: '1200ms' }}>
          <SystemStatus />
        </div>
      </div>

      {/* Workflow Infographic - Mobile Optimized */}
      <div className="animate-fade-in" style={{ animationDelay: '1300ms' }}>
        <WorkflowInfographic />
      </div>
    </div>
  )
}