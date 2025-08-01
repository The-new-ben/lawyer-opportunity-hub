import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Target, DollarSign, Shield, Package } from "lucide-react";

export default function RoleDashboard() {
  const { role, isAdmin, isLawyer, isCustomer, isLeadProvider } = useRole();

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'lawyer': return 'default';
      case 'customer': return 'secondary';
      case 'lead_provider': return 'outline';
      default: return 'secondary';
    }
  };

  const getRoleDisplay = (role: string | null) => {
    switch (role) {
      case 'admin': return 'מנהל';
      case 'lawyer': return 'עורך דין';
      case 'customer': return 'לקוח';
      case 'lead_provider': return 'ספק לידים';
      default: return 'לא מוגדר';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Role Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ברוך הבא למערכת</h1>
          <p className="text-muted-foreground">ממשק מותאם לתפקיד שלך</p>
        </div>
        <Badge variant={getRoleBadgeColor(role)} className="text-lg px-4 py-2">
          {getRoleDisplay(role)}
        </Badge>
      </div>

      {/* Role-Specific Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ניהול מערכת</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">מנהל</div>
                <p className="text-xs text-muted-foreground">
                  גישה מלאה לכל המערכת
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">משתמשים</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ניהול משתמשים</div>
                <p className="text-xs text-muted-foreground">
                  עורכי דין, לקוחות וספקים
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">דוחות</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">דוחות כספיים</div>
                <p className="text-xs text-muted-foreground">
                  עמלות ותשלומים
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isLawyer && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ניהול לידים</div>
                <p className="text-xs text-muted-foreground">
                  קבלת לידים והתאמות
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">תיקים פעילים</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ניהול תיקים</div>
                <p className="text-xs text-muted-foreground">
                  מעקב אחר תיקים פעילים
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">הכנסות</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">מעקב הכנסות</div>
                <p className="text-xs text-muted-foreground">
                  תשלומים ועמלות
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isCustomer && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">התיקים שלי</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">מעקב תיקים</div>
                <p className="text-xs text-muted-foreground">
                  צפייה בסטטוס התיקים
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">פגישות</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">לוח זמנים</div>
                <p className="text-xs text-muted-foreground">
                  פגישות עם עורכי דין
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">תשלומים</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">חשבונות</div>
                <p className="text-xs text-muted-foreground">
                  מעקב תשלומים
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isLeadProvider && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ספקות לידים</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ניהול לידים</div>
                <p className="text-xs text-muted-foreground">
                  הכנסת לידים חדשים
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ביצועים</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">מעקב המרות</div>
                <p className="text-xs text-muted-foreground">
                  איכות הלידים
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">עמלות</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">הכנסות</div>
                <p className="text-xs text-muted-foreground">
                  עמלות מלידים מומרים
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>
            גישה מהירה לפעולות נפוצות בהתאם לתפקיד שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <>
                <Badge variant="outline">ניהול משתמשים</Badge>
                <Badge variant="outline">דוחות מערכת</Badge>
                <Badge variant="outline">הגדרות כלליות</Badge>
              </>
            )}
            {isLawyer && (
              <>
                <Badge variant="outline">קבלת לידים חדשים</Badge>
                <Badge variant="outline">יצירת הצעת מחיר</Badge>
                <Badge variant="outline">קביעת פגישה</Badge>
              </>
            )}
            {isCustomer && (
              <>
                <Badge variant="outline">צפייה בתיקים</Badge>
                <Badge variant="outline">קביעת פגישה</Badge>
                <Badge variant="outline">צפייה בחשבונות</Badge>
              </>
            )}
            {isLeadProvider && (
              <>
                <Badge variant="outline">הכנסת ליד חדש</Badge>
                <Badge variant="outline">מעקב ביצועים</Badge>
                <Badge variant="outline">דוח עמלות</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}