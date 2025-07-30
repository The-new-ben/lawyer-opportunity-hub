import { useState } from "react"
import { useCases } from "@/hooks/useCases"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, FileText, Clock, DollarSign } from "lucide-react"

const mockCases = [
  {
    id: "C001",
    title: "תביעת נזיקין - תאונת דרכים",
    client: "יוסף כהן",
    status: "פתוח",
    priority: "גבוה",
    startDate: "15/03/2024",
    lastUpdate: "22/01/2025",
    amount: "₪50,000",
    progress: 65
  },
  {
    id: "C002",
    title: "ייעוץ משפטי - הקמת חברה",
    client: "שרה לוי",
    status: "בתהליך",
    priority: "בינוני",
    startDate: "02/01/2025",
    lastUpdate: "20/01/2025",
    amount: "₪15,000",
    progress: 30
  },
  {
    id: "C003",
    title: "גירושין - חלוקת רכוש",
    client: "דוד אברהם",
    status: "סגור",
    priority: "נמוך",
    startDate: "10/12/2023",
    lastUpdate: "05/01/2025",
    amount: "₪25,000",
    progress: 100
  }
]

const Cases = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("הכל")
  const [priorityFilter, setPriorityFilter] = useState("הכל")
  
  const { cases, isLoading, error, getCaseStats } = useCases();
  const stats = getCaseStats();
  
  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "הכל" || case_.status === statusFilter
    const matchesPriority = priorityFilter === "הכל" || case_.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "פתוח":
        return <Badge variant="default">פתוח</Badge>
      case "בתהליך":
        return <Badge variant="secondary">בתהליך</Badge>
      case "סגור":
        return <Badge variant="outline">סגור</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "גבוה":
        return <Badge variant="destructive">גבוה</Badge>
      case "בינוני":
        return <Badge variant="secondary">בינוני</Badge>
      case "נמוך":
        return <Badge variant="outline">נמוך</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">תיקים</h1>
          <p className="text-muted-foreground">ניהול ומעקב אחר כל התיקים המשפטיים</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          פתח תיק חדש
        </Button>
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
                  <SelectItem value="פתוח">פתוח</SelectItem>
                  <SelectItem value="בתהליך">בתהליך</SelectItem>
                  <SelectItem value="סגור">סגור</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="עדיפות" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="הכל">כל העדיפויות</SelectItem>
                  <SelectItem value="גבוה">גבוה</SelectItem>
                  <SelectItem value="בינוני">בינוני</SelectItem>
                  <SelectItem value="נמוך">נמוך</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">טוען תיקים...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">שגיאה בטעינת תיקים</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מספר תיק</TableHead>
                  <TableHead className="text-right">כותרת</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">עדיפות</TableHead>
                  <TableHead className="text-right">תאריך פתיחה</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((case_) => (
                  <TableRow key={case_.id}>
                    <TableCell className="font-medium">{case_.id.slice(0, 8)}</TableCell>
                    <TableCell>{case_.title}</TableCell>
                    <TableCell>{getStatusBadge(case_.status)}</TableCell>
                    <TableCell>{getPriorityBadge(case_.priority)}</TableCell>
                    <TableCell>{new Date(case_.opened_at).toLocaleDateString('he-IL')}</TableCell>
                    <TableCell>₪{case_.estimated_budget ? case_.estimated_budget.toLocaleString() : 'לא צוין'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
};

export default Cases;