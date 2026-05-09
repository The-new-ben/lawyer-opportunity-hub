import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Shield, Users, MessageSquare, Gavel, Calendar, FileText, Bot, UserCheck, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LovableStyleInput from "@/components/LovableStyleInput";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Justice.com - Advanced Legal Practice Management System";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Advanced legal practice management system - client management, cases, payments and digital court with artificial intelligence';
      document.head.appendChild(m);
    } else {
      metaDesc.setAttribute('content', 'Advanced legal practice management system - client management, cases, payments and digital court with artificial intelligence');
    }
  }, []);

  const services = [
    {
      title: "Digital Court",
      description: "AI-powered court for case management and legal decisions",
      icon: Gavel,
      path: "/global-court",
      color: "bg-primary",
      public: true
    },
    {
      title: "Smart Case Intake",
      description: "Automated case intake system with AI text processing",
      icon: FileText,
      path: "/intake",
      color: "bg-accent",
      public: true
    },
    {
      title: "Professional Directory",
      description: "Comprehensive database of lawyers, judges and legal consultants",
      icon: UserCheck,
      path: "/professionals",
      color: "bg-secondary",
      public: true
    },
    {
      title: "Advanced AI Portal",
      description: "Advanced legal chatbot for consultation and case handling",
      icon: Bot,
      path: "/ai-portal",
      color: "bg-success",
      public: true
    },
    {
      title: "Admin Dashboard",
      description: "Complete management interface for law firms",
      icon: Shield,
      path: "/dashboard",
      color: "bg-warning",
      public: false
    },
    {
      title: "Client Management",
      description: "Track clients, appointments and active cases",
      icon: Users,
      path: "/clients",
      color: "bg-muted",
      public: false
    },
    {
      title: "Calendar & Meetings",
      description: "Schedule management, meetings and hearings",
      icon: Calendar,
      path: "/calendar",
      color: "bg-primary-muted",
      public: false
    },
    {
      title: "Payment System",
      description: "Manage invoices, payments and commissions",
      icon: Scale,
      path: "/payments",
      color: "bg-destructive/20",
      public: false
    }
  ];

  const handleServiceClick = (service: any) => {
    if (!service.public && !user) {
      navigate('/auth');
      return;
    }
    navigate(service.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Justice.com</h1>
              <p className="text-sm text-muted-foreground">Advanced Legal Management System</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  Logged in: {user.email}
                </Badge>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Lovable-Style Input */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Advanced Legal Management System
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Comprehensive platform for law firm management including digital court, automated case intake, 
            client management and advanced AI system for professional legal handling
          </p>
        </div>
        
        {/* Lovable-Style Input Component */}
        <div className="mb-12">
          <LovableStyleInput />
        </div>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => handleServiceClick(services[0])}>
            <Gavel className="mr-2 h-5 w-5" />
            Enter Digital Court
          </Button>
          {!user && (
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Start Free</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 text-foreground">Our Services</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All the tools needed to manage a modern and efficient law firm
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={index} 
                className="relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-border/50"
                onClick={() => handleServiceClick(service)}
              >
                <CardHeader className="pb-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${service.color} mb-3`}>
                    <IconComponent className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">{service.title}</CardTitle>
                    {!service.public && (
                      <Badge variant="outline" className="text-xs mr-2">
                        {user ? "Available" : "Account Required"}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={service.public ? "default" : user ? "default" : "outline"} 
                    size="sm" 
                    className="w-full"
                  >
                    {service.public ? "Free Access" : user ? "Enter System" : "Registration Required"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-foreground">What Does the System Include?</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Scale className="h-10 w-10 text-primary mb-2 mx-auto" />
                <CardTitle>Case Management</CardTitle>
                <CardDescription>
                  Complete tracking of case status and hearings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2 mx-auto" />
                <CardTitle>Artificial Intelligence</CardTitle>
                <CardDescription>
                  Automatic document processing and legal consultation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2 mx-auto" />
                <CardTitle>Legal Library</CardTitle>
                <CardDescription>
                  Comprehensive database of laws and rulings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2 mx-auto" />
                <CardTitle>Data Security</CardTitle>
                <CardDescription>
                  Complete protection of sensitive information and client privacy
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/5 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-primary">Justice.com</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 Justice.com - All Rights Reserved | Advanced Legal Management System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
