import { StatsCard } from "@/components/StatsCard"
import { WorkflowInfographic } from "@/components/WorkflowInfographic"
import { SystemStatus } from "@/components/SystemStatus"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"
import { toast } from "sonner"
import { useLeads } from "@/hooks/useLeads"
import { useMeetings } from "@/hooks/useMeetings"
import { usePayments } from "@/hooks/usePayments"
import { useClients } from "@/hooks/useClients"
import { useCases } from "@/hooks/useCases"
import {
  Users,
  UserPlus,
  DollarSign,
  FileText,
  Plus,
  Calendar,
  Clock,
  Brain,
  RefreshCw,
  Activity,
  CheckCircle,
  Gavel
} from "lucide-react"

export default function Dashboard() {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("today")

  const { leads, getLeadStats } = useLeads()
  const { meetings } = useMeetings()
  const { payments } = usePayments()
  const { getClientStats } = useClients()
  const { getCaseStats } = useCases()

  const { data: aiSummary, refetch: refetchSummary } = useQuery({
    queryKey: ["ai-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-summary")
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000
  })

  const { data: courtSessions = [] } = useQuery({
    queryKey: ["court-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("court_sessions")
        .select("*")
        .order("scheduled_at", { ascending: true })
      if (error) throw error
      return data
    }
  })

  const { data: pipelineActivity } = useQuery({
    queryKey: ["pipeline-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          quotes(*),
          meetings(*),
          deposits(*)
        `)
        .order("created_at", { ascending: false })
        .limit(10)
      if (error) throw error
      return data
    },
    refetchInterval: 30000
  })

  const handleRefreshSummary = async () => {
    setIsLoadingSummary(true)
    try {
      await refetchSummary()
      toast.success("Summary updated")
    } catch (error) {
      toast.error("Error updating summary")
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const leadStats = getLeadStats()
  const clientStats = getClientStats()
  const caseStats = getCaseStats()
  const totalPayments = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0
  const todayMeetings = meetings?.filter(m => {
    const meetingDate = new Date(m.scheduled_at).toDateString()
    const today = new Date().toDateString()
    return meetingDate === today
  }) || []
  const upcomingSessions = courtSessions.filter(s => new Date(s.scheduled_at) >= new Date())

  const stats = [
    {
      title: "Total Leads",
      value: leadStats.totalLeads,
      change: `${leadStats.newLeads} new`,
      icon: UserPlus,
      trend: "up" as const
    },
    {
      title: "Total Clients",
      value: clientStats.totalClients,
      change: `${clientStats.newThisMonth} new this month`,
      icon: Users,
      trend: "up" as const
    },
    {
      title: "Open Cases",
      value: caseStats.openCases,
      change: `${caseStats.totalCases} total`,
      icon: FileText,
      trend: "neutral" as const
    },
    {
      title: "Upcoming Court Sessions",
      value: upcomingSessions.length,
      change: `${courtSessions.length} total`,
      icon: Gavel,
      trend: "neutral" as const
    },
    {
      title: "Total Payments",
      value: `₪${totalPayments.toLocaleString()}`,
      change: `${payments?.length || 0} payments`,
      icon: DollarSign,
      trend: "up" as const
    }
  ]

  const recentLeads = leads?.slice(0, 4) || []
  const todayMeetingsDetailed = todayMeetings.slice(0, 4)

  const getActivityStatus = (lead: {
    quotes?: unknown[]
    meetings?: unknown[]
    deposits?: unknown[]
  }) => {
    const hasQuote = lead.quotes && lead.quotes.length > 0
    const hasMeeting = lead.meetings && lead.meetings.length > 0
    const hasDeposit = lead.deposits && lead.deposits.length > 0

    if (hasDeposit) return { status: "Converted", icon: CheckCircle, color: "text-green-600" }
    if (hasMeeting) return { status: "Meeting Scheduled", icon: Calendar, color: "text-blue-600" }
    if (hasQuote) return { status: "Quote Sent", icon: FileText, color: "text-orange-600" }
    return { status: "Pending", icon: Clock, color: "text-gray-600" }
  }

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
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in flex flex-col overflow-x-hidden" dir="ltr">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center animate-slide-in-right">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary animate-fade-in">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground animate-fade-in" style={{ animationDelay: "100ms" }}>
            Overview of office activity with automatic updates
          </p>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2 w-full sm:w-auto hover-scale animate-scale-in" style={{ animationDelay: "200ms" }}>
            <Plus className="h-4 w-4" />
            New Lead
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="animate-scale-in hover-scale"
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      <Card className="w-full animate-fade-in hover-scale" style={{ animationDelay: "700ms" }}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 animate-pulse" />
              AI Office Summary
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSummary}
              disabled={isLoadingSummary}
              className="gap-2 w-full sm:w-auto hover-scale"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingSummary ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <CardDescription className="text-sm">
            Automatic analysis of office data with insights and recommendations
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
                  Last updated: {new Date(aiSummary.timestamp).toLocaleString("en-US")}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 sm:p-8 text-muted-foreground">
              <div className="text-center space-y-2 animate-fade-in">
                <Brain className="h-8 w-8 mx-auto opacity-50 animate-pulse" />
                <p className="text-sm">Press "Refresh" to get AI summary</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in" style={{ animationDelay: "800ms" }}>
        <Card className="w-full hover-scale animate-scale-in" style={{ animationDelay: "900ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5" />
              Recent Leads
            </CardTitle>
            <CardDescription className="text-sm">
              Latest leads with pipeline status
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentLeads.map((lead, index) => (
                <div
                  key={lead.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale animate-fade-in"
                  style={{ animationDelay: `${1000 + index * 100}ms` }}
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm sm:text-base">{lead.customer_name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{lead.legal_category}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <Badge
                      variant={getPriorityVariant(lead.urgency_level) as BadgeProps["variant"]}
                      className="text-xs"
                    >
                      {lead.urgency_level}
                    </Badge>
                    <Badge
                      variant={getStatusVariant(lead.status) as BadgeProps["variant"]}
                      className="text-xs"
                    >
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full hover-scale animate-scale-in" style={{ animationDelay: "1000ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Pipeline Activity
            </CardTitle>
            <CardDescription className="text-sm">
              Tracking automated processes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {pipelineActivity?.map((lead, index) => {
                const activityStatus = getActivityStatus(lead)
                const StatusIcon = activityStatus.icon
                return (
                  <div
                    key={lead.id}
                    className="flex flex-col sm:flex-row gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale animate-fade-in"
                    style={{ animationDelay: `${1100 + index * 100}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${activityStatus.color}`} />
                      <div className="text-xs font-medium">{activityStatus.status}</div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm sm:text-base">{lead.customer_name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {lead.legal_category} • {new Date(lead.created_at).toLocaleDateString("en-US")}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in" style={{ animationDelay: "1200ms" }}>
        <Card className="w-full hover-scale animate-scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Today's Meetings
            </CardTitle>
            <CardDescription className="text-sm">
              Meetings scheduled for today
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
                      {new Date(meeting.scheduled_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm sm:text-base">Client Meeting</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{meeting.meeting_type}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No meetings scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="animate-scale-in">
          <SystemStatus />
        </div>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "1300ms" }}>
        <WorkflowInfographic />
      </div>
    </div>
  )
}

