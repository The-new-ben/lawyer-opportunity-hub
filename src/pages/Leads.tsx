import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLeads } from "@/hooks/useLeads"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
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

  const { leads, isLoading, addLead, convertLeadToClient } = useLeads()
  const { toast } = useToast()
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const handleSaveLead = async () => {
    try {
      await addLead.mutateAsync({
        customer_name: newName,
        customer_email: newEmail,
        customer_phone: newPhone,
        case_description: newDescription,
        status: "new",
      })
      toast({ title: "ליד נוסף בהצלחה" })
      setNewName("")
      setNewEmail("")
      setNewPhone("")
      setNewDescription("")
    } catch (e: unknown) {
      const err = e as Error
      toast({
        title: "שגיאה בשמירת ליד",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-warning-foreground"
      case "low":
        return "bg-success text-success-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-accent text-accent-foreground"
      case "contacted":
        return "bg-primary text-primary-foreground"
      case "meeting":
        return "bg-warning text-warning-foreground"
      case "converted":
        return "bg-success text-success-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const filteredLeads = (leads || []).filter((lead) => {
    const matchesSearch =
      lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.legal_category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesPriority =
      priorityFilter === "all" ||
      (lead.urgency_level || '') === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (isLoading) {
    return <div className="p-6">טוען נתונים...</div>
  }

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
                <Input
                  id="name"
                  placeholder="הזן שם מלא"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון *</Label>
                <Input
                  id="phone"
                  placeholder="050-1234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
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
                <Textarea
                  id="notes"
                  placeholder="הערות נוספות על הליד"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSaveLead} disabled={addLead.isPending}>
                  שמור ליד
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setNewName('');
                    setNewEmail('');
                    setNewPhone('');
                    setNewDescription('');
                  }}
                >
                  ביטול
                </Button>
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
                  <Badge className={getPriorityColor(lead.urgency_level || '')} variant="secondary">
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
                  {lead.customer_email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {lead.customer_phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  נוצר: {lead.created_at?.slice(0, 10)}
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