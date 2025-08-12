import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Shield, Users, ChartBar } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Justice.com</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          Advanced Law Firm Management System
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Manage clients, cases, payments, and commissions in one place. Built specifically for law firms in Israel.
        </p>
        <Button size="lg" asChild>
          <Link to="/auth">Start for Free</Link>
        </Button>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                Track client details, contact history and case status
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Scale className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Case Management</CardTitle>
              <CardDescription>
                Organize legal cases, track status and schedule hearings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Track invoices, payments and balances
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ChartBar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Detailed reports on performance and profitability
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;