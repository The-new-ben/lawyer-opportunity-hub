import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { fetchAdminMetrics } from "@/lib/api"
import { Users, FileText, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ["admin-metrics"], queryFn: fetchAdminMetrics })
  const metrics = data ?? {
    leads: { totalLeads: 0, newLeads: 0, highPriorityLeads: 0, convertedLeads: 0 },
    clients: { totalClients: 0, newThisMonth: 0 },
    cases: { totalCases: 0, openCases: 0 },
    meetings: { today: 0, completed: 0 },
    deposits: { paidDeposits: 0, pendingDeposits: 0, totalAmount: 0 },
  }
  const chartData = [
    { name: "Leads", value: metrics.leads.totalLeads },
    { name: "Clients", value: metrics.clients.totalClients },
    { name: "Cases", value: metrics.cases.openCases },
  ]
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leads.totalLeads}</div>
            <p className="text-xs text-muted-foreground">{metrics.leads.newLeads} new</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clients.totalClients}</div>
            <p className="text-xs text-muted-foreground">{metrics.clients.newThisMonth} new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cases.openCases}</div>
            <p className="text-xs text-muted-foreground">out of {metrics.cases.totalCases} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{metrics.deposits.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{metrics.deposits.paidDeposits} deposits paid</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "Count", color: "hsl(var(--primary))" } }}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <CartesianGrid vertical={false} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[4,4,0,0]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
