import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Percent, TrendingUp, Users } from "lucide-react"

const mockCommissions = [
  {
    id: "1",
    referrerName: "סוכנות שמעון",
    leadCount: 12,
    convertedLeads: 8,
    totalValue: 45000,
    commission: 4500,
    rate: 10,
    status: "שולם",
    period: "ינואר 2025"
  },
  {
    id: "2", 
    referrerName: "רחל כהן - שיווק",
    leadCount: 7,
    convertedLeads: 5,
    totalValue: 28000,
    commission: 2800,
    rate: 10,
    status: "ממתין",
    period: "ינואר 2025"
  },
  {
    id: "3",
    referrerName: "משרד פרסום ABC",
    leadCount: 15,
    convertedLeads: 9,
    totalValue: 62000,
    commission: 6200,
    rate: 10,
    status: "שולם",
    period: "דצמבר 2024"
  }
]

const Commissions = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "שולם":
        return <Badge variant="default" className="bg-green-500">שולם</Badge>
      case "ממתין":
        return <Badge variant="secondary">ממתין לתשלום</Badge>
      case "מעובד":
        return <Badge variant="outline">מעובד</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const totalCommissions = mockCommissions.reduce((sum, c) => sum + c.commission, 0)
  const pendingCommissions = mockCommissions
    .filter(c => c.status === "ממתין")
    .reduce((sum, c) => sum + c.commission, 0)
  const totalLeads = mockCommissions.reduce((sum, c) => sum + c.leadCount, 0)
  const totalConverted = mockCommissions.reduce((sum, c) => sum + c.convertedLeads, 0)
  const conversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">עמלות</h1>
          <p className="text-muted-foreground">ניהול ומעקב אחר עמלות שותפים ומפנים</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך עמלות החודש</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15% מהחודש הקודם
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עמלות ממתינות</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{pendingCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              לתשלום השבוע
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שותפים פעילים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCommissions.length}</div>
            <p className="text-xs text-muted-foreground">
              מפנים לידים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אחוז המרה</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              מלידים לעסקאות
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ביצועי שותפים</CardTitle>
            <CardDescription>מעקב אחר ביצועי המפנים השונים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCommissions.map((partner) => {
                const partnerConversionRate = Math.round((partner.convertedLeads / partner.leadCount) * 100)
                return (
                  <div key={partner.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{partner.referrerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {partner.convertedLeads}/{partner.leadCount} לידים הומרו
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">₪{partner.commission.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{partner.rate}% עמלה</p>
                      </div>
                    </div>
                    <Progress value={partnerConversionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">אחוז המרה: {partnerConversionRate}%</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>סיכום תקופתי</CardTitle>
            <CardDescription>התפלגות עמלות לפי תקופות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">₪{(totalCommissions * 0.8).toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">ינואר 2025</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">₪{(totalCommissions * 0.7).toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">דצמבר 2024</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">מגמות</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">צמיחה חודשית</span>
                    <span className="text-sm font-medium text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">שותפים חדשים</span>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ממוצע עמלה</span>
                    <span className="text-sm font-medium">₪{Math.round(totalCommissions / mockCommissions.length).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פירוט עמלות</CardTitle>
          <CardDescription>רשימה מפורטת של כל העמלות</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם המפנה</TableHead>
                <TableHead className="text-right">תקופה</TableHead>
                <TableHead className="text-right">לידים</TableHead>
                <TableHead className="text-right">הומרו</TableHead>
                <TableHead className="text-right">ערך כולל</TableHead>
                <TableHead className="text-right">אחוז עמלה</TableHead>
                <TableHead className="text-right">סכום עמלה</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">{commission.referrerName}</TableCell>
                  <TableCell>{commission.period}</TableCell>
                  <TableCell>{commission.leadCount}</TableCell>
                  <TableCell>{commission.convertedLeads}</TableCell>
                  <TableCell>₪{commission.totalValue.toLocaleString()}</TableCell>
                  <TableCell>{commission.rate}%</TableCell>
                  <TableCell className="font-medium">₪{commission.commission.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(commission.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
};

export default Commissions;