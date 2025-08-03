import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { User, Bell, Shield, Globe, CreditCard, Database, MessageSquare, Bot, Settings as SettingsIcon, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { useRole } from "@/hooks/useRole"
import { WhatsAppConfigManager, ROLE_WHATSAPP_FEATURES, type WhatsAppSettings } from "@/lib/whatsappConfig"

const Settings = () => {
  const { role } = useRole();
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>(WhatsAppConfigManager.loadSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const roleFeatures = WhatsAppConfigManager.getRoleFeatures(role || 'customer');

  useEffect(() => {
    // Load saved WhatsApp settings
    setWhatsappSettings(WhatsAppConfigManager.loadSettings());
  }, []);

  const saveWhatsAppSettings = async () => {
    setIsSaving(true);
    
    try {
      console.log('שומר הגדרות WhatsApp:', whatsappSettings);
      
      const validation = WhatsAppConfigManager.validateSettings(whatsappSettings);
      
      if (!validation.valid) {
        toast({
          title: "❌ שגיאות בהגדרות",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      WhatsAppConfigManager.saveSettings(whatsappSettings);
      console.log('הגדרות WhatsApp נשמרו בהצלחה');
      
      toast({
        title: "✅ הגדרות WhatsApp נשמרו בהצלחה!",
        description: "ההגדרות החדשות יחולו מיידית ונשמרו בזיכרון המקומי",
      });
    } catch (error) {
      console.error('שגיאה בשמירת הגדרות WhatsApp:', error);
      toast({
        title: "❌ שגיאה בשמירה",
        description: "לא ניתן לשמור את ההגדרות. נסה שוב.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testWhatsAppConnection = async () => {
    if (!whatsappSettings.token || !whatsappSettings.phoneId) {
      toast({
        title: "❌ חסרים פרטים",
        description: "אנא הזן את Token ו-Phone ID לפני בדיקת החיבור",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    console.log('בודק חיבור WhatsApp...');
    
    try {
      const isConnected = await WhatsAppConfigManager.testConnection(
        whatsappSettings.token, 
        whatsappSettings.phoneId
      );

      if (isConnected) {
        console.log('חיבור WhatsApp הצליח');
        toast({
          title: "✅ חיבור WhatsApp תקין!",
          description: "החיבור לשירות WhatsApp Business הצליח בהצלחה",
        });
      } else {
        console.log('חיבור WhatsApp נכשל');
        toast({
          title: "❌ שגיאה בחיבור WhatsApp",
          description: "אנא בדוק את הפרטים שהזנת. ייתכן שה-Token או Phone ID אינם תקינים.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('שגיאה בבדיקת חיבור WhatsApp:', error);
      toast({
        title: "❌ שגיאה בבדיקת החיבור",
        description: "אירעה שגיאה בעת ביצוע בדיקת החיבור. נסה שוב.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 flex flex-col overflow-x-hidden">
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

        {/* WhatsApp Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>אינטגרציית WhatsApp Business</CardTitle>
            </div>
            <CardDescription>
              הגדרת חיבור לשירות WhatsApp Business עבור {role === 'admin' ? 'אדמינים' : role === 'lawyer' ? 'עורכי דין' : 'לקוחות'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">הגדרות בסיס</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsappToken">WhatsApp API Token</Label>
                  <Input 
                    id="whatsappToken" 
                    type="password" 
                    placeholder="הכנס את ה-token שלך"
                    value={whatsappSettings.token}
                    onChange={(e) => setWhatsappSettings(prev => ({ ...prev, token: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    ניתן לקבל מ-Meta Business Manager
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappPhoneId">Phone Number ID</Label>
                  <Input 
                    id="whatsappPhoneId" 
                    placeholder="הכנס את ה-Phone ID"
                    value={whatsappSettings.phoneId}
                    onChange={(e) => setWhatsappSettings(prev => ({ ...prev, phoneId: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    מזהה מספר הטלפון במטא
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={saveWhatsAppSettings} 
                  disabled={isSaving}
                  className="min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    '💾 שמור הגדרות WhatsApp'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testWhatsAppConnection}
                  disabled={isTesting}
                  className="min-w-[120px]"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      בודק...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      🔍 בדוק חיבור
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Advanced Settings for Admins and Lawyers */}
            {(role === 'admin' || role === 'lawyer') && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">הגדרות מתקדמות</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="whatsappEnabled">הפעל שירות WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">הפעל/השבת שליחת הודעות אוטומטיות</p>
                    </div>
                    <Switch 
                      id="whatsappEnabled" 
                      checked={whatsappSettings.enabled}
                      onCheckedChange={(checked) => setWhatsappSettings(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoRespond">מענה אוטומטי</Label>
                      <p className="text-sm text-muted-foreground">השב אוטומטית להודעות נכנסות</p>
                    </div>
                    <Switch 
                      id="autoRespond" 
                      checked={whatsappSettings.autoRespond}
                      onCheckedChange={(checked) => setWhatsappSettings(prev => ({ ...prev, autoRespond: checked }))}
                    />
                  </div>

                  {role === 'admin' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoAssignLeads">השמה אוטומטית של לידים</Label>
                        <p className="text-sm text-muted-foreground">הקצה לידים חדשים מווטצאפ לעורכי דין זמינים</p>
                      </div>
                      <Switch 
                        id="autoAssignLeads" 
                        checked={whatsappSettings.autoAssignLeads}
                        onCheckedChange={(checked) => setWhatsappSettings(prev => ({ ...prev, autoAssignLeads: checked }))}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Message Templates */}
            {(role === 'admin' || role === 'lawyer') && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">תבניות הודעות</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newLeadTemplate">תבנית ללקוח חדש</Label>
                    <Textarea 
                      id="newLeadTemplate"
                      placeholder="הודעה שתישלח ללקוח חדש שפנה דרך WhatsApp"
                      value={whatsappSettings.templates.newLead}
                      onChange={(e) => setWhatsappSettings(prev => ({
                        ...prev,
                        templates: { ...prev.templates, newLead: e.target.value }
                      }))}
                      rows={3}
                    />
                  </div>

                  {role === 'admin' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="leadAssignedTemplate">תבנית להשמת לקוח לעורך דין</Label>
                        <Textarea 
                          id="leadAssignedTemplate"
                          placeholder="הודעה שתישלח כשלקוח מושם לעורך דין. משתנים זמינים: {customerName}, {lawyerName}, {lawyerPhone}"
                          value={whatsappSettings.templates.leadAssigned}
                          onChange={(e) => setWhatsappSettings(prev => ({
                            ...prev,
                            templates: { ...prev.templates, leadAssigned: e.target.value }
                          }))}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meetingTemplate">תבנית לקביעת פגישה</Label>
                        <Textarea 
                          id="meetingTemplate"
                          placeholder="הודעה שתישלח כשפגישה נקבעת. משתנים זמינים: {date}, {time}, {location}"
                          value={whatsappSettings.templates.meetingScheduled}
                          onChange={(e) => setWhatsappSettings(prev => ({
                            ...prev,
                            templates: { ...prev.templates, meetingScheduled: e.target.value }
                          }))}
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Customer View */}
            {role === 'customer' && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">WhatsApp עבור לקוחות</h4>
                <p className="text-sm text-muted-foreground">
                  כלקוח, תוכל לקבל הודעות עדכון דרך WhatsApp על מצב התיק שלך, פגישות שנקבעו ועדכונים חשובים אחרים.
                  ההגדרות מתנהלות על ידי עורך הדין או המשרד.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">קבלת הודעות עדכון</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">תזכורות לפגישות</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle>אינטגרציית AI</CardTitle>
            </div>
            <CardDescription>הגדרת חיבור לשירותי בינה מלאכותית</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="openaiToken">OpenAI API Key</Label>
                <Input id="openaiToken" type="password" placeholder="הכנס את ה-API Key שלך" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiModel">מודל AI</Label>
                <Select defaultValue="gpt-4">
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מודל" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="aiEnabled">הפעל AI</Label>
                <p className="text-sm text-muted-foreground">ניתוח אוטומטי של לידים וחיזוי המרות</p>
              </div>
              <Switch id="aiEnabled" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoClassify">סיווג אוטומטי</Label>
                <p className="text-sm text-muted-foreground">סווג לידים חדשים באופן אוטומטי</p>
              </div>
              <Switch id="autoClassify" defaultChecked />
            </div>
            <Button>שמור הגדרות AI</Button>
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