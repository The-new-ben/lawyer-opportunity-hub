import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Calendar, DollarSign, Settings, UserCheck, AlertTriangle } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { useMeetings } from "@/hooks/useMeetings";
import { useLeadDeposits } from "@/hooks/useDeposits";

export default function AdminDashboard() {
  const { getLeadStats } = useLeads();
  const { getClientStats } = useClients();
  const { getCaseStats } = useCases();
  const { getMeetingStats } = useMeetings();
  const { getDepositStats } = useLeadDeposits();

  const leadStats = getLeadStats();
  const clientStats = getClientStats();
  const caseStats = getCaseStats();
  const meetingStats = getMeetingStats();
  const depositStats = getDepositStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">פאנל ניהול</h1>
          <p className="text-muted-foreground">מבט כולל על פעילות המערכת</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          הגדרות מערכת
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים פעילים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {leadStats.newLeads} חדשים השבוע
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {clientStats.newThisMonth} חדשים החודש
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תיקים פתוחים</CardTitle>
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
            <CardTitle className="text-sm font-medium">הכנסות חודשיות</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{depositStats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {depositStats.paidDeposits} פיקדונות שולמו
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פעולות מהירות</CardTitle>
            <CardDescription>ניהול יומיומי של המערכת</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              ניהול עורכי דין
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              הגדרות עמלות
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              דוחות מתקדמים
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">התראות מערכת</CardTitle>
            <CardDescription>נושאים הדורשים תשומת לב</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm">{leadStats.highPriorityLeads} לידים בדחיפות גבוהה</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">{meetingStats.today} פגישות היום</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-sm">{depositStats.pendingDeposits} פיקדונות בהמתנה</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ביצועים השבוע</CardTitle>
            <CardDescription>סטטיסטיקות עדכניות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">שיעור המרה</span>
              <Badge variant="secondary">
                {leadStats.totalLeads > 0 
                  ? `${Math.round((leadStats.convertedLeads / leadStats.totalLeads) * 100)}%`
                  : '0%'
                }
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">פגישות שהושלמו</span>
              <Badge variant="secondary">{meetingStats.completed}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">לקוחות פעילים</span>
              <Badge variant="secondary">{clientStats.activeClients}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>פעילות אחרונה</CardTitle>
          <CardDescription>עדכונים אחרונים במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">ליד חדש נוצר: לקוח פוטנציאלי בתחום דיני משפחה</span>
              <span className="text-xs text-muted-foreground">לפני 5 דקות</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm">פגישה הושלמה: ליד הומר ללקוח משלם</span>
              <span className="text-xs text-muted-foreground">לפני 23 דקות</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm">פיקדון התקבל: ₪5,000 עבור תיק משפט מסחרי</span>
              <span className="text-xs text-muted-foreground">לפני שעה</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}