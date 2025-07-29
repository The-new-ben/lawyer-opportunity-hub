import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Globe, CreditCard, Database } from "lucide-react"

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">הגדרות</h1>
          <p className="text-muted-foreground">ניהול הגדרות המערכת והפרופיל האישי</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>פרופיל אישי</CardTitle>
            </div>
            <CardDescription>עדכן את פרטיך האישיים ופרטי המשרד</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">שם מלא</Label>
                <Input id="fullName" defaultValue="עורך דין יוסי כהן" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input id="email" type="email" defaultValue="yossi@lawfirm.co.il" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input id="phone" defaultValue="050-1234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">מספר רישיון</Label>
                <Input id="license" defaultValue="12345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lawFirm">שם המשרד</Label>
                <Input id="lawFirm" defaultValue="משרד עורכי דין כהן ושות'" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">התמחות</Label>
                <Select defaultValue="civil">
                  <SelectTrigger>
                    <SelectValue placeholder="בחר התמחות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civil">דיני אזרח</SelectItem>
                    <SelectItem value="criminal">דיני פלילים</SelectItem>
                    <SelectItem value="family">דיני משפחה</SelectItem>
                    <SelectItem value="commercial">דיני מסחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button>שמור שינויים</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>הודעות והתראות</CardTitle>
            </div>
            <CardDescription>התאם את העדפות ההודעות שלך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">הודעות במייל</Label>
                <p className="text-sm text-muted-foreground">קבל הודעות על לידים חדשים במייל</p>
              </div>
              <Switch id="emailNotifications" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsNotifications">הודעות SMS</Label>
                <p className="text-sm text-muted-foreground">קבל הודעות דחופות ב-SMS</p>
              </div>
              <Switch id="smsNotifications" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotifications">הודעות דחיפה</Label>
                <p className="text-sm text-muted-foreground">הודעות במערכת</p>
              </div>
              <Switch id="pushNotifications" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyReport">דוח שבועי</Label>
                <p className="text-sm text-muted-foreground">קבל סיכום שבועי במייל</p>
              </div>
              <Switch id="weeklyReport" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>אבטחה ופרטיות</CardTitle>
            </div>
            <CardDescription>ניהול הגדרות אבטחה וסיסמאות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">סיסמה נוכחית</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">סיסמה חדשה</Label>
                <Input id="newPassword" type="password" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactor">אימות דו-שלבי</Label>
                <p className="text-sm text-muted-foreground">הגברת אבטחת החשבון</p>
              </div>
              <Switch id="twoFactor" />
            </div>
            <Button variant="outline">עדכן סיסמה</Button>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>העדפות מערכת</CardTitle>
            </div>
            <CardDescription>התאם את המערכת לצרכיך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">שפת המערכת</Label>
                <Select defaultValue="he">
                  <SelectTrigger>
                    <SelectValue placeholder="בחר שפה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">אזור זמן</Label>
                <Select defaultValue="israel">
                  <SelectTrigger>
                    <SelectValue placeholder="בחר אזור זמן" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="israel">ישראל (GMT+2)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="darkMode">מצב כהה</Label>
                <p className="text-sm text-muted-foreground">החלף בין עיצוב בהיר לכהה</p>
              </div>
              <Switch id="darkMode" />
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>חיובים ותשלומים</CardTitle>
            </div>
            <CardDescription>ניהול מנוי ושיטות תשלום</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">תוכנית נוכחית</h4>
                <p className="text-2xl font-bold mt-2">Pro Plan</p>
                <p className="text-sm text-muted-foreground">₪299/חודש</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">התחדשות הבאה</h4>
                <p className="text-lg font-medium mt-2">15/02/2025</p>
                <p className="text-sm text-muted-foreground">חודש אחד מהיום</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">שדרג תוכנית</Button>
              <Button variant="outline">עדכן תשלום</Button>
              <Button variant="outline">הורד חשבונית</Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>ניהול נתונים</CardTitle>
            </div>
            <CardDescription>גיבוי וייצוא נתונים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                גבה נתונים
              </Button>
              <Button variant="outline">
                ייצא לאקסל
              </Button>
              <Button variant="destructive">
                מחק חשבון
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              גיבוי אחרון: 28/01/2025 09:30
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

export default Settings;