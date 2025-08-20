import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Shield, Users, MessageSquare, Gavel, Calendar, FileText, Bot, UserCheck, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Justice.com - מערכת ניהול משרד עורכי דין מתקדמת";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'מערכת ניהול מתקדמת למשרדי עורכי דין - ניהול לקוחות, תיקים, תשלומים ובית משפט דיגיטלי עם בינה מלאכותית';
      document.head.appendChild(m);
    } else {
      metaDesc.setAttribute('content', 'מערכת ניהול מתקדמת למשרדי עורכי דין - ניהול לקוחות, תיקים, תשלומים ובית משפט דיגיטלי עם בינה מלאכותית');
    }
  }, []);

  const services = [
    {
      title: "בית משפט דיגיטלי",
      description: "בית משפט עם בינה מלאכותית לניהול תיקים וקבלת החלטות",
      icon: Gavel,
      path: "/global-court",
      color: "bg-primary",
      public: true
    },
    {
      title: "קליטת תיקים חכמה",
      description: "מערכת קליטה אוטומטית של תיקים עם עיבוד טקסט בבינה מלאכותית",
      icon: FileText,
      path: "/intake",
      color: "bg-accent",
      public: true
    },
    {
      title: "ספריית אנשי מקצוע",
      description: "מאגר מקיף של עורכי דין, שופטים ויועצים משפטיים",
      icon: UserCheck,
      path: "/professionals",
      color: "bg-secondary",
      public: true
    },
    {
      title: "פורטל AI מתקדם",
      description: "צ'אט בוט משפטי מתקדם לייעוץ וטיפול בתיקים",
      icon: Bot,
      path: "/ai-portal",
      color: "bg-success",
      public: true
    },
    {
      title: "דף בקרה למנהלים",
      description: "ממשק ניהול מלא למשרד עורכי דין",
      icon: Shield,
      path: "/dashboard",
      color: "bg-warning",
      public: false
    },
    {
      title: "ניהול לקוחות",
      description: "מעקב אחר לקוחות, הזמנות ותיקים פעילים",
      icon: Users,
      path: "/clients",
      color: "bg-muted",
      public: false
    },
    {
      title: "יומן ופגישות",
      description: "ניהול זמנים, פגישות ודיונים",
      icon: Calendar,
      path: "/calendar",
      color: "bg-primary-muted",
      public: false
    },
    {
      title: "מערכת תשלומים",
      description: "ניהול חשבוניות, תשלומים ועמלות",
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
              <p className="text-sm text-muted-foreground">מערכת ניהול משפטית מתקדמת</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  מחובר: {user.email}
                </Badge>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">דף בקרה</Link>
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">התחברות</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">הרשמה</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          מערכת ניהול משפטית מתקדמת
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
          פלטפורמה מקיפה לניהול משרדי עורכי דין הכוללת בית משפט דיגיטלי, קליטת תיקים אוטומטית, 
          ניהול לקוחות ומערכת AI מתקדמת לטיפול משפטי מקצועי
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => handleServiceClick(services[0])}>
            <Gavel className="ml-2 h-5 w-5" />
            כניסה לבית המשפט הדיגיטלי
          </Button>
          {!user && (
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">התחל חינם</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 text-foreground">השירותים שלנו</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            כל הכלים הדרושים לניהול משרד עורכי דין מודרני ויעיל
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
                        {user ? "זמין" : "נדרש חשבון"}
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
                    {service.public ? "כניסה חופשית" : user ? "כניסה למערכת" : "נדרשת הרשמה"}
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
            <h3 className="text-3xl font-bold mb-4 text-foreground">מה כולל המערכת?</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Scale className="h-10 w-10 text-primary mb-2 mx-auto" />
                <CardTitle>ניהול תיקים</CardTitle>
                <CardDescription>
                  מעקב מלא אחר סטטוס תיקים ודיונים
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2 mx-auto" />
                <CardTitle>בינה מלאכותית</CardTitle>
                <CardDescription>
                  עיבוד אוטומטי של מסמכים ויעוץ משפטי
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2 mx-auto" />
                <CardTitle>ספרייה משפטית</CardTitle>
                <CardDescription>
                  מאגר מקיף של חוקים ופסיקות
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2 mx-auto" />
                <CardTitle>אבטחת מידע</CardTitle>
                <CardDescription>
                  הגנה מלאה על מידע רגיש ופרטיות לקוחות
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
            © 2024 Justice.com - כל הזכויות שמורות | מערכת ניהול משפטית מתקדמת
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
