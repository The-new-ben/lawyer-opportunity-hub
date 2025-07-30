import { useState } from "react"
import { useLeads } from "@/hooks/useLeads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Calendar,
  Eye,
  Edit,
  UserPlus
} from "lucide-react"

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  
  const { leads, isLoading, error, addLead, convertLeadToClient } = useLeads()

  if (isLoading) return <div className="p-6">טוען לידים...</div>
  if (error) return <div className="p-6 text-destructive">שגיאה בטעינת לידים: {error.message}</div>

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "גבוה": return "bg-destructive text-destructive-foreground"
      case "בינוני": return "bg-warning text-warning-foreground"
      case "נמוך": return "bg-success text-success-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "חדש": return "bg-accent text-accent-foreground"
      case "פניה ראשונית": return "bg-primary text-primary-foreground"
      case "ממתין לפגישה": return "bg-warning text-warning-foreground"
      case "הפך ללקוח": return "bg-success text-success-foreground"
      case "לא רלוונטי": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.legal_category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesPriority = priorityFilter === "all" || lead.urgency_level === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">ניהול לידים</h1>
          <p className="text-muted-foreground">ניהול ומעקב לידים ופניות פוטנציאליות</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              ליד חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>הוספת ליד חדש</DialogTitle>
              <DialogDescription>
                הזן פרטי הליד החדש במערכת
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם מלא *</Label>
                <Input id="name" placeholder="הזן שם מלא" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input id="email" type="email" placeholder="example@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון *</Label>
                <Input id="phone" placeholder="050-1234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalArea">תחום משפטי</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תחום משפטי" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">דיני משפחה</SelectItem>
                    <SelectItem value="labor">דיני עבודה</SelectItem>
                    <SelectItem value="tort">דיני נזיקין</SelectItem>
                    <SelectItem value="real-estate">דיני מקרקעין</SelectItem>
                    <SelectItem value="commercial">דיני מסחר</SelectItem>
                    <SelectItem value="criminal">דיני פלילי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">עדיפות</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עדיפות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">גבוה</SelectItem>
                    <SelectItem value="medium">בינוני</SelectItem>
                    <SelectItem value="low">נמוך</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea id="notes" placeholder="הערות נוספות על הליד" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">שמור ליד</Button>
                <Button variant="outline" className="flex-1">ביטול</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          {/* Use flex-col on mobile and flex-row on larger screens */}
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            {/* Expand input to full width on mobile */}
            <div className="flex-1 min-w-full md:min-w-64">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש לפי שם, אימייל או תחום משפטי..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="חדש">חדש</SelectItem>
                <SelectItem value="פניה ראשונית">פניה ראשונית</SelectItem>
                <SelectItem value="ממתין לפגישה">ממתין לפגישה</SelectItem>
                <SelectItem value="הפך ללקוח">הפך ללקוח</SelectItem>
                <SelectItem value="לא רלוונטי">לא רלוונטי</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="עדיפות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העדיפויות</SelectItem>
                <SelectItem value="גבוה">גבוה</SelectItem>
                <SelectItem value="בינוני">בינוני</SelectItem>
                <SelectItem value="נמוך">נמוך</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{lead.customer_name}</CardTitle>
                  <CardDescription>{lead.legal_category}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge className={getPriorityColor(lead.urgency_level)} variant="secondary">
                    {lead.urgency_level}
                  </Badge>
                  <Badge className={getStatusColor(lead.status)} variant="outline">
                    {lead.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {lead.customer_email || 'אין אימייל'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {lead.customer_phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  נוצר: {new Date(lead.created_at).toLocaleDateString('he-IL')}
                </div>
              </div>
              
              {lead.case_description && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {lead.case_description}
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Eye className="h-4 w-4" />
                  צפייה
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Edit className="h-4 w-4" />
                  עריכה
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={() => convertLeadToClient.mutate(lead)}
                  disabled={convertLeadToClient.isPending}
                >
                  <UserPlus className="h-4 w-4" />
                  הפוך ללקוח
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">לא נמצאו לידים</h3>
              <p className="text-muted-foreground mb-4">
                נסה לשנות את קריטריוני החיפוש או הוסף ליד חדש
              </p>
              <Button>הוסף ליד חדש</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}