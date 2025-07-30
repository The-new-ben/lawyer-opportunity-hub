import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Clock, 
  DollarSign, 
  MapPin, 
  Phone,
  Mail,
  Eye,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  Filter,
  Search,
  ArrowLeft
} from "lucide-react"

interface Lead {
  id: string
  customer_name: string
  legal_category: string
  case_description: string
  urgency_level: string
  estimated_budget: number
  preferred_location: string
  created_at: string
  status: string
  visibility_level: string
}

interface Registration {
  fullName: string
  email: string
  phone: string
  licenseNumber: string
  specializations: string[]
  experience: number
  hourlyRate: number
  bio: string
}

export default function LeadsPortal() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [registrationStep, setRegistrationStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedUrgency, setSelectedUrgency] = useState("all")
  const [registration, setRegistration] = useState<Registration>({
    fullName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    specializations: [],
    experience: 0,
    hourlyRate: 0,
    bio: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    filterLeads()
  }, [leads, searchTerm, selectedCategory, selectedUrgency])

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('visibility_level', 'public')
        .or('visibility_level.eq.restricted,visibility_level.is.null')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הלידים",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterLeads = () => {
    let filtered = leads

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.legal_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.case_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.preferred_location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(lead => lead.legal_category === selectedCategory)
    }

    if (selectedUrgency !== "all") {
      filtered = filtered.filter(lead => lead.urgency_level === selectedUrgency)
    }

    setFilteredLeads(filtered)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive'
      case 'medium': return 'warning' 
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'דחוף'
      case 'medium': return 'בינוני'
      case 'low': return 'רגיל'
      default: return 'לא צוין'
    }
  }

  const formatBudget = (budget: number) => {
    if (!budget) return "לא צוין"
    return `₪${budget.toLocaleString()}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL')
  }

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead)
  }

  const handleStartRegistration = () => {
    setShowRegistration(true)
    setRegistrationStep(1)
  }

  const handleRegistrationNext = () => {
    if (registrationStep < 3) {
      setRegistrationStep(registrationStep + 1)
    }
  }

  const handleRegistrationPrev = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1)
    }
  }

  const handleRegistrationSubmit = async () => {
    try {
      // Here you would typically create the lawyer profile
      toast({
        title: "הרשמה הושלמה בהצלחה!",
        description: "נציג יצור איתך קשר בקרוב לאימות הפרטים",
      })
      setShowRegistration(false)
      setRegistrationStep(1)
    } catch (error) {
      toast({
        title: "שגיאה בהרשמה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    }
  }

  const categories = [...new Set(leads.map(lead => lead.legal_category))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען נתונים...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">פורטל לידים משפטיים</h1>
                <p className="text-sm text-muted-foreground">מערכת התאמת עורכי דין ללקוחות</p>
              </div>
            </div>
            <Button onClick={handleStartRegistration} size="lg" className="gap-2">
              <Users className="h-4 w-4" />
              הרשמה כעורך דין
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{leads.length}</p>
                  <p className="text-sm text-muted-foreground">לידים פעילים</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{leads.filter(l => l.urgency_level === 'high').length}</p>
                  <p className="text-sm text-muted-foreground">דחופים</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">₪{leads.reduce((sum, l) => sum + (l.estimated_budget || 0), 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">סך תקציבים</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-info" />
                <div>
                  <p className="text-2xl font-bold">{leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 24*60*60*1000)).length}</p>
                  <p className="text-sm text-muted-foreground">חדשים היום</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>חיפוש</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="חפש לפי תחום או תיאור..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>תחום משפטי</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תחום" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל התחומים</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>רמת דחיפות</Label>
                <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר דחיפות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הרמות</SelectItem>
                    <SelectItem value="high">דחוף</SelectItem>
                    <SelectItem value="medium">בינוני</SelectItem>
                    <SelectItem value="low">רגיל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full gap-2">
                  <Filter className="h-4 w-4" />
                  נקה מסננים
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Grid */}
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={getUrgencyColor(lead.urgency_level) as any}>
                        {getUrgencyText(lead.urgency_level)}
                      </Badge>
                      <Badge variant="outline">{lead.legal_category}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">תיק: {lead.legal_category}</h3>
                      <p className="text-muted-foreground line-clamp-2">{lead.case_description}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatBudget(lead.estimated_budget)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{lead.preferred_location || "לא צוין"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewLead(lead)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      פרטים נוספים
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">לא נמצאו לידים</h3>
              <p className="text-muted-foreground">נסה לשנות את המסננים או לחפש במונחים אחרים</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  פרטי הליד
                </DialogTitle>
                <DialogDescription>
                  לקבלת פרטי הקשר המלאים נדרשת הרשמה כעורך דין במערכת
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">תחום משפטי</Label>
                    <p className="text-lg">{selectedLead.legal_category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">רמת דחיפות</Label>
                    <Badge variant={getUrgencyColor(selectedLead.urgency_level) as any} className="mt-1">
                      {getUrgencyText(selectedLead.urgency_level)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">תיאור התיק</Label>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{selectedLead.case_description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">תקציב משוער</Label>
                    <p className="text-lg font-semibold">{formatBudget(selectedLead.estimated_budget)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">מיקום מועדף</Label>
                    <p className="text-lg">{selectedLead.preferred_location || "לא צוין"}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">תאריך יצירה</Label>
                  <p>{formatDate(selectedLead.created_at)}</p>
                </div>

                <Separator />

                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    פרטי הקשר של הלקוח יוצגו לאחר הרשמה והתחברות למערכת
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleStartRegistration}>
                    הירשם לקבלת פרטי קשר
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedLead(null)}>
                    סגור
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              הרשמה כעורך דין
            </DialogTitle>
            <DialogDescription>
              שלב {registrationStep} מתוך 3 - מלא את הפרטים הנדרשים
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>התקדמות הרשמה</span>
                <span>{Math.round((registrationStep / 3) * 100)}%</span>
              </div>
              <Progress value={(registrationStep / 3) * 100} />
            </div>

            {/* Step 1: Personal Info */}
            {registrationStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">פרטים אישיים</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם מלא</Label>
                    <Input
                      value={registration.fullName}
                      onChange={(e) => setRegistration({...registration, fullName: e.target.value})}
                      placeholder="שם פרטי ומשפחה"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>אימייל</Label>
                    <Input
                      type="email"
                      value={registration.email}
                      onChange={(e) => setRegistration({...registration, email: e.target.value})}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>טלפון</Label>
                    <Input
                      value={registration.phone}
                      onChange={(e) => setRegistration({...registration, phone: e.target.value})}
                      placeholder="050-1234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מספר רישיון</Label>
                    <Input
                      value={registration.licenseNumber}
                      onChange={(e) => setRegistration({...registration, licenseNumber: e.target.value})}
                      placeholder="מספר רישיון לשכת עורכי דין"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Info */}
            {registrationStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">פרטים מקצועיים</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שנות ניסיון</Label>
                    <Input
                      type="number"
                      value={registration.experience}
                      onChange={(e) => setRegistration({...registration, experience: parseInt(e.target.value)})}
                      placeholder="מספר שנות ניסיון"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>תעריף שעתי (₪)</Label>
                    <Input
                      type="number"
                      value={registration.hourlyRate}
                      onChange={(e) => setRegistration({...registration, hourlyRate: parseInt(e.target.value)})}
                      placeholder="תעריף שעתי"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>התמחויות</Label>
                  <Textarea
                    value={registration.specializations.join(', ')}
                    onChange={(e) => setRegistration({...registration, specializations: e.target.value.split(', ')})}
                    placeholder="דיני משפחה, דיני עבודה, דיני מקרקעין..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>אודות</Label>
                  <Textarea
                    value={registration.bio}
                    onChange={(e) => setRegistration({...registration, bio: e.target.value})}
                    placeholder="ספר על עצמך, הניסיון שלך והתחומים בהם אתה מתמחה..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Summary */}
            {registrationStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">סיכום והשלמת הרשמה</h3>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    אנא וודא שהפרטים נכונים לפני השלמת ההרשמה
                  </AlertDescription>
                </Alert>
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div><strong>שם:</strong> {registration.fullName}</div>
                  <div><strong>אימייל:</strong> {registration.email}</div>
                  <div><strong>טלפון:</strong> {registration.phone}</div>
                  <div><strong>מספר רישיון:</strong> {registration.licenseNumber}</div>
                  <div><strong>שנות ניסיון:</strong> {registration.experience}</div>
                  <div><strong>תעריף שעתי:</strong> ₪{registration.hourlyRate}</div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={handleRegistrationPrev}
                disabled={registrationStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                הקודם
              </Button>
              
              {registrationStep < 3 ? (
                <Button onClick={handleRegistrationNext}>
                  הבא
                </Button>
              ) : (
                <Button onClick={handleRegistrationSubmit} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  השלם הרשמה
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}