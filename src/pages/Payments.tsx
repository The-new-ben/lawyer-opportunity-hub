import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, DollarSign, CreditCard, Clock, CheckCircle } from "lucide-react"

const mockPayments = [
  {
    id: "P001",
    client: "יוסף כהן",
    caseTitle: "תביעת נזיקין",
    amount: 15000,
    method: "העברה בנקאית",
    status: "שולם",
    date: "22/01/2025",
    dueDate: "20/01/2025",
    invoiceNumber: "INV-2025-001"
  },
  {
    id: "P002",
    client: "שרה לוי",
    caseTitle: "ייעוץ משפטי",
    amount: 5000,
    method: "כרטיס אשראי",
    status: "ממתין",
    date: "25/01/2025",
    dueDate: "25/01/2025",
    invoiceNumber: "INV-2025-002"
  },
  {
    id: "P003",
    client: "דוד אברהם",
    caseTitle: "גירושין",
    amount: 8000,
    method: "מזומן",
    status: "בוטל",
    date: "18/01/2025",
    dueDate: "15/01/2025",
    invoiceNumber: "INV-2025-003"
  }
]

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("הכל")
  const [methodFilter, setMethodFilter] = useState("הכל")
  
  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "הכל" || payment.status === statusFilter
    const matchesMethod = methodFilter === "הכל" || payment.method === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "שולם":
        return <Badge variant="default" className="bg-green-500">שולם</Badge>
      case "ממתין":
        return <Badge variant="secondary">ממתין</Badge>
      case "בוטל":
        return <Badge variant="destructive">בוטל</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const totalRevenue = mockPayments
    .filter(p => p.status === "שולם")
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = mockPayments
    .filter(p => p.status === "ממתין")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">תשלומים</h1>
          <p className="text-muted-foreground">ניהול ומעקב אחר תשלומים ולקוחות</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          הוסף תשלום
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכנסות</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% מהחודש הקודם
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תשלומים ממתינים</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {mockPayments.filter(p => p.status === "ממתין").length} תשלומים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תשלומים החודש</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 מהחודش הקודם
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אחוז גביה</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              מתוך כל החשבוניות
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>רשימת תשלומים</CardTitle>
              <CardDescription>מעקב וניהול כל התשלומים</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש תשלומים..."
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
                  <SelectItem value="שולם">שולם</SelectItem>
                  <SelectItem value="ממתין">ממתין</SelectItem>
                  <SelectItem value="בוטל">בוטל</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="אמצעי תשלום" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="הכל">כל האמצעים</SelectItem>
                  <SelectItem value="העברה בנקאית">העברה בנקאית</SelectItem>
                  <SelectItem value="כרטיס אשראי">כרטיס אשראי</SelectItem>
                  <SelectItem value="מזומן">מזומן</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">מספר חשבונית</TableHead>
                <TableHead className="text-right">לקוח</TableHead>
                <TableHead className="text-right">תיק</TableHead>
                <TableHead className="text-right">סכום</TableHead>
                <TableHead className="text-right">אמצעי תשלום</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">תאריך תשלום</TableHead>
                <TableHead className="text-right">תאריך יעד</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                  <TableCell>{payment.client}</TableCell>
                  <TableCell>{payment.caseTitle}</TableCell>
                  <TableCell className="font-medium">₪{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        הצג
                      </Button>
                      {payment.status === "ממתין" && (
                        <Button variant="outline" size="sm">
                          סמן כשולם
                        </Button>
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

export default Payments;