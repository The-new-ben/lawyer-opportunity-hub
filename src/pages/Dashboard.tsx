import { StatsCard } from "@/components/StatsCard"
import { WorkflowInfographic } from "@/components/WorkflowInfographic"
import { SystemStatus } from "@/components/SystemStatus"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"
import { toast } from "sonner"
import { useLeads } from "@/hooks/useLeads"
import { useMeetings } from "@/hooks/useMeetings"
import { usePayments } from "@/hooks/usePayments"
import { useQuotes } from "@/hooks/useQuotes"
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
  RefreshCw,
  Activity,
  ArrowUpDown,
  Eye,
  CheckCircle
} from "lucide-react"

export default function Dashboard() {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  // Real data hooks
  const { leads, getLeadStats } = useLeads();
  const { meetings } = useMeetings();
  const { payments } = usePayments();
  const { quotes } = useQuotes();

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

  // Pipeline activity tracking
  const { data: pipelineActivity } = useQuery({
    queryKey: ['pipeline-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          quotes(*),
          meetings(*),
          deposits(*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
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

  // Real stats calculation
  const leadStats = getLeadStats();
  const totalPayments = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
  const todayMeetings = meetings?.filter(m => {
    const meetingDate = new Date(m.scheduled_at).toDateString();
    const today = new Date().toDateString();
    return meetingDate === today;
  }) || [];

  const stats = [
    {
      title: "סה״כ לידים",
      value: leadStats.totalLeads,
      change: `${leadStats.newLeads} חדשים`,
      icon: UserPlus,
      trend: "up" as const
    },
    {
      title: "לידים גבוהי עדיפות",
      value: leadStats.highPriorityLeads,
      change: `${leadStats.convertedLeads} הומרו`,
      icon: TrendingUp,
      trend: "up" as const
    },
    {
      title: "סה״כ תשלומים",
      value: `₪${totalPayments.toLocaleString()}`,
      change: `${payments?.length || 0} תשלומים`,
      icon: DollarSign,
      trend: "up" as const
    },
    {
      title: "פגישות היום",
      value: todayMeetings.length,
      change: `${meetings?.length || 0} סה״כ פגישות`,
      icon: Calendar,
      trend: "neutral" as const
    }
  ]

  // Real data
  const recentLeads = leads?.slice(0, 4) || [];
  const todayMeetingsDetailed = todayMeetings.slice(0, 4);

  // Pipeline activity status
  const getActivityStatus = (lead: any) => {
    const hasQuote = lead.quotes && lead.quotes.length > 0;
    const hasMeeting = lead.meetings && lead.meetings.length > 0;
    const hasDeposit = lead.deposits && lead.deposits.length > 0;
    
    if (hasDeposit) return { status: "מונטז", icon: CheckCircle, color: "text-green-600" };
    if (hasMeeting) return { status: "פגישה נקבעה", icon: Calendar, color: "text-blue-600" };
    if (hasQuote) return { status: "הצעת מחיר נשלחה", icon: FileText, color: "text-orange-600" };
    return { status: "בהמתנה", icon: Clock, color: "text-gray-600" };
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
      default: return "outline"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "new": return "default"
      case "contacted": return "secondary"
      case "qualified": return "default"
      case "converted": return "default"
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
            סקירה כללית של פעילות המשרד - עדכון אוטומטי
          </p>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">היום</SelectItem>
              <SelectItem value="week">השבוע</SelectItem>
              <SelectItem value="month">החודש</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2 w-full sm:w-auto hover-scale animate-scale-in" style={{ animationDelay: '200ms' }}>
            <Plus className="h-4 w-4" />
            ליד חדש
          </Button>
        </div>
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in" style={{ animationDelay: '800ms' }}>
        {/* Recent Leads - Mobile Optimized */}
        <Card className="w-full hover-scale animate-scale-in" style={{ animationDelay: '900ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5" />
              לידים אחרונים
            </CardTitle>
            <CardDescription className="text-sm">
              לידים שהתקבלו לאחרונה עם סטטוס פייפליין
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
                    <div className="font-medium text-sm sm:text-base">{lead.customer_name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{lead.legal_category}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <Badge variant={getPriorityVariant(lead.urgency_level) as any} className="text-xs">
                      {lead.urgency_level}
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

        {/* Pipeline Activity - Mobile Optimized */}
        <Card className="w-full hover-scale animate-scale-in" style={{ animationDelay: '1000ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              פעילות פייפליין אוטומטי
            </CardTitle>
            <CardDescription className="text-sm">
              מעקב אחר תהליכים אוטומטיים
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {pipelineActivity?.map((lead, index) => {
                const activityStatus = getActivityStatus(lead);
                const StatusIcon = activityStatus.icon;
                return (
                  <div
                    key={lead.id}
                    className="flex flex-col sm:flex-row gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale animate-fade-in"
                    style={{ animationDelay: `${1100 + (index * 100)}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${activityStatus.color}`} />
                      <div className="text-xs font-medium">{activityStatus.status}</div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm sm:text-base">{lead.customer_name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {lead.legal_category} • {new Date(lead.created_at).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in" style={{ animationDelay: '1200ms' }}>
        {/* Today's Schedule */}
        <Card className="w-full hover-scale animate-scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              פגישות היום
            </CardTitle>
            <CardDescription className="text-sm">
              פגישות שנקבעו להיום
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {todayMeetingsDetailed.length > 0 ? (
                todayMeetingsDetailed.map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className="flex flex-col sm:flex-row gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale animate-fade-in"
                  >
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      <Clock className="h-4 w-4" />
                      {new Date(meeting.scheduled_at).toLocaleTimeString('he-IL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm sm:text-base">פגישה עם לקוח</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{meeting.meeting_type}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">אין פגישות מתוכננות להיום</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="animate-scale-in">
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