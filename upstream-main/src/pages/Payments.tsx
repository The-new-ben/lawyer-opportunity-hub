import { useState } from "react"
import { usePayments, useDeposits } from "@/hooks/usePayments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, CreditCard, DollarSign, TrendingUp, Clock } from "lucide-react"
import { CreatePaymentDialog } from "@/components/CreatePaymentDialog"
import { CreateDepositDialog } from "@/components/CreateDepositDialog"

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("הכל")
  
  const { payments, isLoading: paymentsLoading, error: paymentsError } = usePayments()
  const { deposits, isLoading: depositsLoading, error: depositsError } = useDeposits()
  
  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "הכל" || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const filteredDeposits = deposits?.filter(deposit => {
    const matchesSearch = deposit.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "הכל" || deposit.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return <Badge variant="success">שולם</Badge>
      case "pending":
        return <Badge variant="warning">ממתין לתשלום</Badge>
      case "failed":
        return <Badge variant="destructive">נכשל</Badge>
      case "overdue":
        return <Badge variant="destructive">באיחור</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Calculate statistics
  const totalPayments = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const totalDeposits = deposits?.reduce((sum, d) => sum + d.amount, 0) || 0
  const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0
  const pendingDeposits = deposits?.filter(d => d.status === 'pending').length || 0

  if (paymentsLoading || depositsLoading) return <div className="p-6">טוען תשלומים...</div>
  if (paymentsError || depositsError) return <div className="p-6 text-destructive">שגיאה בטעינת תשלומים</div>

  return (
    <div className="p-6 space-y-6 flex flex-col overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">תשלומים</h1>
          <p className="text-muted-foreground">ניהול ומעקב אחר תשלומים ופיקדונות</p>
        </div>
        <div className="flex gap-2">
          <CreatePaymentDialog />
          <CreateDepositDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכל תשלומים</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalPayments.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכל פיקדונות</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalDeposits.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תשלומים ממתינים</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פיקדונות ממתינים</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeposits}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">תשלומים</TabsTrigger>
          <TabsTrigger value="deposits">פיקדונות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>רשימת תשלומים</CardTitle>
                  <CardDescription>מעקב וניהול כל התשלומים</CardDescription>
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="חיפוש תשלומים..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="סטטוס" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="הכל">כל הסטטוסים</SelectItem>
                      <SelectItem value="completed">שולם</SelectItem>
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="failed">נכשל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">מספר תשלום</TableHead>
                    <TableHead className="text-right">חוזה</TableHead>
                    <TableHead className="text-right">סכום</TableHead>
                    <TableHead className="text-right">סוג תשלום</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">תאריך תשלום</TableHead>
                    <TableHead className="text-right">נוצר</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id.slice(0, 8)}</TableCell>
                      <TableCell>{payment.contract_id.slice(0, 8)}</TableCell>
                      <TableCell>₪{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.payment_type}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('he-IL') : '-'}</TableCell>
                      <TableCell>{new Date(payment.created_at).toLocaleDateString('he-IL')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  לא נמצאו תשלומים
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>רשימת פיקדונות</CardTitle>
                  <CardDescription>מעקב וניהול כל הפיקדונות</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">מספר פיקדון</TableHead>
                    <TableHead className="text-right">ליד</TableHead>
                    <TableHead className="text-right">עורך דין</TableHead>
                    <TableHead className="text-right">סכום</TableHead>
                    <TableHead className="text-right">סוג</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">אמצעי תשלום</TableHead>
                    <TableHead className="text-right">תאריך תשלום</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-medium">{deposit.id.slice(0, 8)}</TableCell>
                      <TableCell>{deposit.lead_id.slice(0, 8)}</TableCell>
                      <TableCell>{deposit.lawyer_id.slice(0, 8)}</TableCell>
                      <TableCell>₪{deposit.amount.toLocaleString()}</TableCell>
                      <TableCell>{deposit.deposit_type}</TableCell>
                      <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                      <TableCell>{deposit.payment_method}</TableCell>
                      <TableCell>{deposit.paid_at ? new Date(deposit.paid_at).toLocaleDateString('he-IL') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredDeposits.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  לא נמצאו פיקדונות
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
};

export default Payments;