import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, DollarSign, Clock, Users, Star, TrendingUp } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useCases } from "@/hooks/useCases";
import { useMeetings } from "@/hooks/useMeetings";
import { CreateMeetingDialog } from "@/components/CreateMeetingDialog";
import { useRole } from "@/hooks/useRole";

export default function LawyerDashboard() {
  const { role } = useRole();
  const { leads } = useLeads();
  const { cases, getCaseStats } = useCases();
  const { meetings, getMeetingStats } = useMeetings();

  // Filter data for current lawyer (in real app, would use lawyer ID from profile)
  const myLeads = leads?.filter(lead => lead.assigned_lawyer_id) || [];
  const myCases = cases || [];
  const myMeetings = meetings || [];

  const caseStats = getCaseStats();
  const meetingStats = getMeetingStats();

  const upcomingMeetings = myMeetings
    .filter(meeting => new Date(meeting.scheduled_at) > new Date() && meeting.status === 'scheduled')
    .slice(0, 3);

  const recentLeads = myLeads
    .filter(lead => lead.status === 'new')
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">לוח עורך דין</h1>
          <p className="text-muted-foreground">ניהול התיקים והלקוחות שלך</p>
        </div>
        <CreateMeetingDialog 
          lawyerId="lawyer-id" // In real app, get from auth context
        />
      </div>

      {/* Key Metrics for Lawyer */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים שהוקצו</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              {recentLeads.length} חדשים השבוע
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תיקים פעילים</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseStats.openCases}</div>
            <p className="text-xs text-muted-foreground">
              מתוך {caseStats.totalCases} סך הכל
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פגישות השבוע</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">
              {meetingStats.today} היום
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">דירוג</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              4.8
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 ml-1" />
            </div>
            <p className="text-xs text-muted-foreground">
              מבוסס על 24 דירוגים
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              לידים חדשים שהוקצו
            </CardTitle>
            <CardDescription>לידים שדורשים טיפול מיידי</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{lead.customer_name}</h4>
                      <p className="text-sm text-muted-foreground">{lead.legal_category}</p>
                      <p className="text-xs text-muted-foreground">
                        טלפון: {lead.customer_phone}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={lead.urgency_level === 'high' ? 'destructive' : 'secondary'}>
                        {lead.urgency_level === 'high' ? 'דחוף' : 'רגיל'}
                      </Badge>
                      <CreateMeetingDialog 
                        leadId={lead.id}
                        lawyerId="lawyer-id"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  אין לידים חדשים כרגע
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              פגישות קרובות
            </CardTitle>
            <CardDescription>הפגישות הקרובות שלך</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {meeting.meeting_type === 'phone_call' ? 'שיחת טלפון' : 
                         meeting.meeting_type === 'video_call' ? 'שיחת וידאו' : 'פגישה פרונטלית'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meeting.scheduled_at).toLocaleDateString('he-IL')} בשעה{' '}
                        {new Date(meeting.scheduled_at).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {meeting.location && (
                        <p className="text-xs text-muted-foreground">{meeting.location}</p>
                      )}
                    </div>
                    <Badge variant="outline">{meeting.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  אין פגישות קרובות
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            תיקים פעילים
          </CardTitle>
          <CardDescription>תיקים שדורשים המשך טיפול</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myCases.slice(0, 5).map((case_) => (
              <div key={case_.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{case_.title}</h4>
                  <p className="text-sm text-muted-foreground">{case_.legal_category}</p>
                  <p className="text-xs text-muted-foreground">
                    נפתח: {new Date(case_.opened_at).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={case_.status === 'open' ? 'default' : 'secondary'}>
                    {case_.status === 'open' ? 'פעיל' : 'סגור'}
                  </Badge>
                  {case_.estimated_budget && (
                    <span className="text-xs text-muted-foreground">
                      ₪{case_.estimated_budget.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}