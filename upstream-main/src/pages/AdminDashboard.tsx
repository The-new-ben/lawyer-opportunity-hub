import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Calendar, DollarSign, Settings, UserCheck, AlertTriangle } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { useMeetings } from "@/hooks/useMeetings";
import { useLeadDeposits } from "@/hooks/useDeposits";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import type { UserRole } from "@/hooks/useRole";

export default function AdminDashboard() {
  const { getLeadStats } = useLeads();
  const { getClientStats } = useClients();
  const { getCaseStats } = useCases();
  const { getMeetingStats } = useMeetings();
  const { getDepositStats } = useLeadDeposits();

  const leadStats = getLeadStats();
  const clientStats = getClientStats();
  const caseStats = getCaseStats();
  const meetingStats = getMeetingStats();
  const depositStats = getDepositStats();

  return (
    <RoleBasedRoute allowedRoles={["admin"] as UserRole[]}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Overview of system activity</p>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {leadStats.newLeads} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {clientStats.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseStats.openCases}</div>
            <p className="text-xs text-muted-foreground">
              out of {caseStats.totalCases} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{depositStats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {depositStats.paidDeposits} deposits paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Daily system management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Lawyers
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Commission Settings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Advanced Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm">{leadStats.highPriorityLeads} high priority leads</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">{meetingStats.today} meetings today</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-sm">{depositStats.pendingDeposits} pending deposits</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week's Performance</CardTitle>
            <CardDescription>Updated statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Conversion Rate</span>
              <Badge variant="secondary">
                {leadStats.totalLeads > 0
                  ? `${Math.round((leadStats.convertedLeads / leadStats.totalLeads) * 100)}%`
                  : '0%'
                }
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Meetings Completed</span>
              <Badge variant="secondary">{meetingStats.completed}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Clients</span>
              <Badge variant="secondary">{clientStats.activeClients}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">New lead created: potential client in family law</span>
              <span className="text-xs text-muted-foreground">5 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm">Meeting completed: lead converted to paying client</span>
              <span className="text-xs text-muted-foreground">23 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm">Deposit received: ₪5,000 for commercial law case</span>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </RoleBasedRoute>
  );
}