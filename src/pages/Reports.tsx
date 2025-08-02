import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Download, FileText, TrendingUp, Users, DollarSign, Clock, Target } from "lucide-react"

const Reports = () => {
  return (
    <div className="p-6 space-y-6 flex flex-col overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">דוחות</h1>
          <p className="text-muted-foreground">דוחות מקיפים וניתוח נתונים עסקיים</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="בחר תקופה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">השבוע</SelectItem>
              <SelectItem value="month">החודש</SelectItem>
              <SelectItem value="quarter">הרבעון</SelectItem>
              <SelectItem value="year">השנה</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            ייצא דוח
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הכנסות החודש</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪128,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> מהחודש הקודם
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות חדשים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> מהחודש הקודם
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תיקים פעילים</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+5</span> תיקים חדשים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שעות עבודה</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              השבוע הנוכחי
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">דוח פיננסי</CardTitle>
            </div>
            <CardDescription>הכנסות, הוצאות ורווחיות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">הכנסות החודש</span>
                <span className="font-medium">₪128,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">הוצאות החודש</span>
                <span className="font-medium">₪42,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">רווח נקי</span>
                <span className="font-medium text-green-600">₪86,000</span>
              </div>
              <Progress value={67} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>רווחיות: 67%</span>
                <Badge variant="outline" className="text-green-600">יעד הושג</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <BarChart3 className="h-4 w-4 mr-2" />
              הצג דוח מפורט
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">דוח לקוחות</CardTitle>
            </div>
            <CardDescription>פעילות לקוחות ושביעות רצון</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">לקוחות פעילים</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">לקוחות חדשים</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">שביעות רצון</span>
                <span className="font-medium">4.7/5</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>שימור לקוחות: 85%</span>
                <Badge variant="outline" className="text-blue-600">מעולה</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Users className="h-4 w-4 mr-2" />
              הצג דוח מפורט
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">דוח תיקים</CardTitle>
            </div>
            <CardDescription>ניהול תיקים וביצועים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">תיקים פתוחים</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">תיקים שנסגרו</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">אחוז זכייה</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>ביצועי תיקים</span>
                <Badge variant="outline" className="text-green-600">טוב מאוד</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <FileText className="h-4 w-4 mr-2" />
              הצג דוח מפורט
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">דוח לידים</CardTitle>
            </div>
            <CardDescription>מקורות לידים וקצב המרה</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">לידים החודש</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">הומרו ללקוחות</span>
                <span className="font-medium">34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">אחוז המרה</span>
                <span className="font-medium">22%</span>
              </div>
              <Progress value={22} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>ביצועי מכירות</span>
                <Badge variant="outline" className="text-orange-600">טעון שיפור</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Target className="h-4 w-4 mr-2" />
              הצג דוח מפורט
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">דוח ביצועים</CardTitle>
            </div>
            <CardDescription>מדדי ביצועים ויעדים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">יעד חודשי</span>
                <span className="font-medium">₪150,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">הושג עד כה</span>
                <span className="font-medium">₪128,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">אחוז השגה</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>עד סוף החודש</span>
                <Badge variant="outline" className="text-green-600">על המסלול</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              הצג דוח מפורט
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">דוח זמנים</CardTitle>
            </div>
            <CardDescription>מעקב שעות עבודה ויעילות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">שעות השבוע</span>
                <span className="font-medium">42 שעות</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">שעות החודש</span>
                <span className="font-medium">156 שעות</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">ממוצע יומי</span>
                <span className="font-medium">8.4 שעות</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>יעילות: 75%</span>
                <Badge variant="outline" className="text-blue-600">טוב</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Clock className="h-4 w-4 mr-2" />
              הצג דוח מפורט
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

export default Reports;