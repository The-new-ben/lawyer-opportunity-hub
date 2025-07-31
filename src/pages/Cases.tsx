import { useState } from "react"
import { useCases } from "@/hooks/useCases"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Calendar, FileText, Clock, DollarSign, UserPlus } from "lucide-react"
import { MeetingScheduler } from "@/components/MeetingScheduler"
import { RatingDialog } from "@/components/RatingDialog"

const Cases = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("הכל")
  const [priorityFilter, setPriorityFilter] = useState("הכל")
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    legal_category: "",
    priority: "medium",
    notes: "",
    estimated_budget: ""
  })
  
  const { cases, isLoading, error, addCase, getCaseStats } = useCases();
  const stats = getCaseStats();
  
  const handleSaveCase = async () => {
    if (!formData.title || !formData.legal_category) {
      alert("אנא מלא את כל השדות הנדרשים")
      return
    }

    try {
      await addCase.mutateAsync({
        title: formData.title,
        client_id: formData.client_id || null,
        legal_category: formData.legal_category,
        priority: formData.priority,
        notes: formData.notes || null,
        estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : null,
        status: 'open',
        opened_at: new Date().toISOString()
      })
      setFormData({
        title: "",
        client_id: "",
        legal_category: "",
        priority: "medium",
        notes: "",
        estimated_budget: ""
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Error adding case:", error)
    }
  }

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "הכל" || case_.status === statusFilter
    const matchesPriority = priorityFilter === "הכל" || case_.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default">פתוח</Badge>
      case "in_progress":
        return <Badge variant="secondary">בתהליך</Badge>
      case "closed":
        return <Badge variant="outline">סגור</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">גבוה</Badge>
      case "medium":
        return <Badge variant="secondary">בינוני</Badge>
      case "low":
        return <Badge variant="outline">נמוך</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  if (isLoading) return <div className="p-6">טוען תיקים...</div>
  if (error) return <div className="p-6 text-destructive">שגיאה בטעינת תיקים: {error.message}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">תיקים</h1>
          <p className="text-muted-foreground">ניהול ומעקב אחר כל התיקים המשפטיים</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              פתח תיק חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>תיק חדש</DialogTitle>
              <DialogDescription>
                פתח תיק משפטי חדש במערכת
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">כותרת התיק *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="הזן כותרת התיק"
                  required
                />
              </div>
              <div>
                <Label htmlFor="legal_category">תחום משפטי *</Label>
                <Select value={formData.legal_category} onValueChange={(value) => setFormData({ ...formData, legal_category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תחום משפטי" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="אזרחי">משפט אזרחי</SelectItem>
                    <SelectItem value="פלילי">משפט פלילי</SelectItem>
                    <SelectItem value="משפחה">דיני משפחה</SelectItem>
                    <SelectItem value="עבודה">דיני עבודה</SelectItem>
                    <SelectItem value="נדלן">דיני נדלן</SelectItem>
                    <SelectItem value="מסחרי">משפט מסחרי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">עדיפות</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
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
              <div>
                <Label htmlFor="estimated_budget">תקציב משוער</Label>
                <Input
                  id="estimated_budget"
                  type="number"
                  value={formData.estimated_budget}
                  onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                  placeholder="הזן תקציב משוער"
                />
              </div>
              <div>
                <Label htmlFor="notes">הערות</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="הזן פרטים נוספים"
                />
              </div>
              <Button 
                onClick={handleSaveCase} 
                disabled={addCase.isPending}
                className="w-full"
              >
                {addCase.isPending ? 'שומר...' : 'שמור תיק'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכל תיקים</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תיקים פתוחים</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תיקים בעדיפות גבוהה</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ערך כולל</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>רשימת תיקים</CardTitle>
              <CardDescription>מעקב וניהול כל התיקים המשפטיים</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש תיקים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full md:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="סטטוס" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הכל">כל הסטטוסים</SelectItem>
                    <SelectItem value="open">פתוח</SelectItem>
                    <SelectItem value="in_progress">בתהליך</SelectItem>
                    <SelectItem value="closed">סגור</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="עדיפות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הכל">כל העדיפויות</SelectItem>
                    <SelectItem value="high">גבוה</SelectItem>
                    <SelectItem value="medium">בינוני</SelectItem>
                    <SelectItem value="low">נמוך</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מספר תיק</TableHead>
                  <TableHead className="text-right">כותרת</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">עדיפות</TableHead>
                  <TableHead className="text-right">תאריך פתיחה</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((case_) => (
                  <TableRow 
                    key={case_.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => window.location.hash = `/cases/${case_.id}`}
                  >
                    <TableCell className="font-medium">{case_.id.slice(0, 8)}</TableCell>
                    <TableCell>{case_.title}</TableCell>
                    <TableCell>{getStatusBadge(case_.status)}</TableCell>
                    <TableCell>{getPriorityBadge(case_.priority)}</TableCell>
                    <TableCell>{new Date(case_.opened_at).toLocaleDateString('he-IL')}</TableCell>
                    <TableCell>₪{case_.estimated_budget ? case_.estimated_budget.toLocaleString() : 'לא צוין'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <MeetingScheduler 
                          caseId={case_.id}
                          lawyerId={case_.assigned_lawyer_id || "default-lawyer"}
                          clientId={case_.client_id}
                        />
                        {case_.status === 'closed' && (
                          <RatingDialog 
                            caseId={case_.id}
                            lawyerId={case_.assigned_lawyer_id || "default-lawyer"}
                            clientId={case_.client_id}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
};

export default Cases;