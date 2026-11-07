import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/hooks/useLeads";
import { useCases } from "@/hooks/useCases";
import { useMeetings } from "@/hooks/useMeetings";
import { useClients } from "@/hooks/useClients";
import { 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  UserPlus,
  MessageSquare,
  Settings,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

export function RoleDashboard() {
  const { role, loading } = useRole();
  const { user } = useAuth();
  const { getLeadStats } = useLeads();
  const { getCaseStats } = useCases();
  const { getMeetingStats } = useMeetings();
  const { getClientStats } = useClients();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const leadStats = getLeadStats();
  const caseStats = getCaseStats();
  const meetingStats = getMeetingStats();
  const clientStats = getClientStats();

  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'lawyer': return 'bg-primary text-primary-foreground';
      case 'client': return 'bg-success text-success-foreground';
      case 'supplier': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleDisplay = (userRole: string) => {
    switch (userRole) {
      case 'admin': return 'מנהל מערכת';
      case 'lawyer': return 'עורך דין';
      case 'client': return 'לקוח';
      case 'supplier': return 'ספק';
      case 'customer': return 'לקוח פוטנציאלי';
      default: return userRole;
    }
  };

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכל לידים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">חדשים: {leadStats.newLeads}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תיקים פעילים</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseStats.openCases}</div>
            <p className="text-xs text-muted-foreground">סה"כ: {caseStats.totalCases}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פגישות היום</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingStats.today}</div>
            <p className="text-xs text-muted-foreground">מתוכננות: {meetingStats.scheduled}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות פעילים</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.activeClients}</div>
            <p className="text-xs text-muted-foreground">חדשים החודש: {clientStats.newThisMonth}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>פעולות מנהל</CardTitle>
            <CardDescription>כלים לניהול המערכת</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/leads">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                ניהול לידים
              </Button>
            </Link>
            <Link to="/clients">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                ניהול לקוחות
              </Button>
            </Link>
            <Link to="/cases">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                ניהול תיקים
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                דוחות ואנליטיקס
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>הגדרות מערכת</CardTitle>
            <CardDescription>תצורה וניהול משתמשים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                הגדרות כלליות
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLawyerDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הלידים שלי</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.newLeads}</div>
            <p className="text-xs text-muted-foreground">חדשים שטרם טופלו</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">התיקים שלי</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseStats.openCases}</div>
            <p className="text-xs text-muted-foreground">פעילים כרגע</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פגישות היום</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingStats.today}</div>
            <p className="text-xs text-muted-foreground">מתוכננות לי היום</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">דירוג שלי</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">מתוך 5 כוכבים</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>הפעולות שלי</CardTitle>
            <CardDescription>ניהול העבודה היומית</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/leads">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                הלידים שלי
              </Button>
            </Link>
            <Link to="/cases">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                התיקים שלי
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                היומן שלי
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>סטטיסטיקות</CardTitle>
            <CardDescription>ביצועים והישגים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">תיקים שהושלמו החודש</span>
              <Badge variant="secondary">12</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">שביעות רצון ממוצעת</span>
              <Badge variant="secondary">4.8/5</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">זמן תגובה ממוצע</span>
              <Badge variant="secondary">2 שעות</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderClientDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">התיקים שלי</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">פעילים כרגע</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פגישות קרובות</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">מתוכננות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תשלומים</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪15,000</div>
            <p className="text-xs text-muted-foreground">סה"כ השקעה</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>הפעולות שלי</CardTitle>
            <CardDescription>ניהול התיקים והפגישות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/cases">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                התיקים שלי
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                הפגישות שלי
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                תשלומים
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>עורכי הדין שלי</CardTitle>
            <CardDescription>צוות המטפל בתיקים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                  ד
                </div>
                <div>
                  <p className="text-sm font-medium">ד"ר יונתן כהן</p>
                  <p className="text-xs text-muted-foreground">משפט אזרחי</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSupplierDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הזמנות חדשות</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">ממתינות לטיפול</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פרויקטים פעילים</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">בביצוע כרגע</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הכנסות החודש</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪8,500</div>
            <p className="text-xs text-muted-foreground">+12% מהחודש הקודם</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>הפעולות שלי</CardTitle>
          <CardDescription>ניהול הזמנות ופרויקטים</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link to="/supplier-leads">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              הזמנות חדשות
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              לוח הזמנים
            </Button>
          </Link>
          <Link to="/payments">
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              תשלומים והכנסות
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">דשבורד</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">שלום, {user?.email}</p>
            <Badge className={getRoleColor(role || '')}>
              {getRoleDisplay(role || '')}
            </Badge>
          </div>
        </div>
      </div>

      {role === 'admin' && renderAdminDashboard()}
      {role === 'lawyer' && renderLawyerDashboard()}
      {role === 'client' && renderClientDashboard()}
      {role === 'supplier' && renderSupplierDashboard()}
      {(!role || role === 'customer') && (
        <Card>
          <CardHeader>
            <CardTitle>ברוך הבא למערכת</CardTitle>
            <CardDescription>אנא פנה למנהל המערכת להגדרת הרשאות</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              התפקיד שלך במערכת טרם הוגדר. אנא צור קשר עם מנהל המערכת לקבלת הרשאות מתאימות.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}