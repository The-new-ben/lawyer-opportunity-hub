import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Shield, Users, ChartBar } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">LegalCRM Pro</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">התחברות</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">הרשמה</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          מערכת ניהול משרד עורכי דין מתקדמת
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          נהל לקוחות, תיקים, תשלומים ועמלות במקום אחד. מערכת שנבנתה במיוחד למשרדי עורכי דין בישראל
        </p>
        <Button size="lg" asChild>
          <Link to="/auth">התחל עכשיו בחינם</Link>
        </Button>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>ניהול לקוחות</CardTitle>
              <CardDescription>
                מעקב אחר פרטי לקוחות, היסטוריית קשר וסטטוס תיקים
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Scale className="h-10 w-10 text-primary mb-2" />
              <CardTitle>ניהול תיקים</CardTitle>
              <CardDescription>
                ארגון תיקים משפטיים, מעקב סטטוס ותזמון דיונים
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>ניהול תשלומים</CardTitle>
              <CardDescription>
                מעקב אחר חשבוניות, תשלומים ויתרות חובה
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ChartBar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>דוחות ואנליטיקס</CardTitle>
              <CardDescription>
                דוחות מפורטים על ביצועים ורווחיות המשרד
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;