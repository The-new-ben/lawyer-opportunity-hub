import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Phone, Mail, FileText, Calendar } from "lucide-react"

const mockClients = [
  {
    id: "1",
    name: "יוסף כהן",
    email: "yosef@example.com",
    phone: "050-1234567",
    status: "פעיל",
    cases: 3,
    joinDate: "15/03/2024",
    lastContact: "22/01/2025"
  },
  {
    id: "2", 
    name: "שרה לוי",
    email: "sarah@example.com",
    phone: "052-7654321",
    status: "פעיל",
    cases: 1,
    joinDate: "02/01/2025",
    lastContact: "20/01/2025"
  },
  {
    id: "3",
    name: "דוד אברהם",
    email: "david@example.com",
    phone: "053-9876543",
    status: "לא פעיל",
    cases: 5,
    joinDate: "10/12/2023",
    lastContact: "05/01/2025"
  }
]

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    return status === "פעיל" ? (
      <Badge variant="default">פעיל</Badge>
    ) : (
      <Badge variant="secondary">לא פעיל</Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">לקוחות</h1>
          <p className="text-muted-foreground">ניהול לקוחות ומעקב אחר פרטי קשר</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          הוסף לקוח חדש
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכל לקוחות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות פעילים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClients.filter(c => c.status === "פעיל").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תיקים פתוחים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClients.reduce((sum, c) => sum + c.cases, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות חדשים החודש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>רשימת לקוחות</CardTitle>
              <CardDescription>מעקב וניהול כל הלקוחות שלך</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לקוחות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם הלקוח</TableHead>
                <TableHead className="text-right">פרטי קשר</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">תיקים</TableHead>
                <TableHead className="text-right">תאריך הצטרפות</TableHead>
                <TableHead className="text-right">קשר אחרון</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell>{client.cases}</TableCell>
                  <TableCell>{client.joinDate}</TableCell>
                  <TableCell>{client.lastContact}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
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

export default Clients;