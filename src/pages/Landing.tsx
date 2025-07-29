import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { 
  Scale, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle, 
  Star, 
  ArrowLeft,
  Phone,
  Mail,
  MapPin
} from "lucide-react"

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Scale,
      title: "ניהול תיקים מקצועי",
      description: "מערכת מתקדמת לניהול תיקים משפטיים עם מעקב מלא אחר כל שלב"
    },
    {
      icon: Users,
      title: "ניהול לקוחות",
      description: "מאגר לקוחות מקצועי עם היסטוריה מלאה ומעקב אחר התקשרויות"
    },
    {
      icon: Shield,
      title: "אבטחה מתקדמת",
      description: "הצפנה ברמה בנקאית ותאימות מלאה לתקני לשכת עורכי הדין"
    },
    {
      icon: Clock,
      title: "ניהול זמנים",
      description: "מעקב אחר שעות עבודה, פגישות ותזכורות אוטומטיות"
    }
  ]

  const stats = [
    { number: "500+", label: "עורכי דין" },
    { number: "5,000+", label: "תיקים פעילים" },
    { number: "98%", label: "שביעות רצון" },
    { number: "24/7", label: "תמיכה" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="mb-4">
              מערכת CRM משפטית מתקדמת
            </Badge>
            <h1 className="text-5xl font-bold text-primary mb-6">
              LegalCRM Pro
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              המערכת המתקדמת ביותר לניהול משרדי עורכי דין בישראל. 
              כל מה שצריך לניהול מקצועי ויעיל של המשרד שלך.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                התחל עכשיו
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                לפרטים נוספים
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-4">
            תכונות מתקדמות למשרד המודרני
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            כל הכלים שצריך לניהול יעיל ומקצועי של משרד עורכי דין
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">
              מה אומרים עלינו
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "עו\"ד דינה כהן",
                role: "משרד כהן ושות'",
                content: "המערכת שינתה לנו את האופן שבו אנחנו עובדים. הכל מרוכז ונגיש.",
                rating: 5
              },
              {
                name: "עו\"ד יוסי לוי",
                role: "משרד לוי ופרטנרים",
                content: "יעילות מדהימה וחיסכון משמעותי בזמן. ממליץ בחום!",
                rating: 5
              },
              {
                name: "עו\"ד שרה אברהם",
                role: "משרד עורכי דין אברהם",
                content: "התמיכה מעולה והמערכת אינטואיטיבית וקלה לשימוש.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription>
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            מוכנים להתחיל?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            הצטרפו לאלפי עורכי הדין שכבר משתמשים במערכת
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            הרשמה חינמית
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <Phone className="h-6 w-6 text-primary" />
              <div className="font-semibold">טלפון</div>
              <div className="text-muted-foreground">03-1234567</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <div className="font-semibold">אימייל</div>
              <div className="text-muted-foreground">info@legalcrm.co.il</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <div className="font-semibold">כתובת</div>
              <div className="text-muted-foreground">תל אביב, ישראל</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}