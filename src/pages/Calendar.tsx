import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Users, Video } from "lucide-react"

const mockEvents = [
  {
    id: "1",
    title: "פגישה עם יוסף כהן",
    type: "פגישת לקוח",
    date: "29/01/2025",
    time: "10:00",
    duration: "60 דקות",
    location: "המשרד",
    status: "מתוכנן",
    priority: "גבוה"
  },
  {
    id: "2",
    title: "דיון בבית משפט",
    type: "בית משפט",
    date: "29/01/2025",
    time: "14:00",
    duration: "120 דקות",
    location: "בית משפט שלום תל אביב",
    status: "מתוכנן",
    priority: "גבוה"
  },
  {
    id: "3",
    title: "הכנת מסמכים - תיק אברהם",
    type: "עבודה פנימית",
    date: "30/01/2025",
    time: "09:00",
    duration: "180 דקות",
    location: "המשרד",
    status: "מתוכנן",
    priority: "בינוני"
  },
  {
    id: "4",
    title: "פגישת זום עם שרה לוי",
    type: "פגישת לקוח",
    date: "30/01/2025",
    time: "16:00",
    duration: "45 דקות",
    location: "זום",
    status: "מתוכנן",
    priority: "בינוני"
  }
]

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState("29/01/2025")
  
  const todayEvents = mockEvents.filter(event => event.date === selectedDate)
  
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "פגישת לקוח":
        return <Users className="h-4 w-4" />
      case "בית משפט":
        return <CalendarIcon className="h-4 w-4" />
      case "עבודה פנימית":
        return <Clock className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "מתוכנן":
        return <Badge variant="default">מתוכנן</Badge>
      case "בביצוע":
        return <Badge variant="secondary">בביצוע</Badge>
      case "הושלם":
        return <Badge variant="outline">הושלם</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "גבוה":
        return <Badge variant="destructive">גבוה</Badge>
      case "בינוני":
        return <Badge variant="secondary">בינוני</Badge>
      case "נמוך":
        return <Badge variant="outline">נמוך</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">לוח זמנים</h1>
          <p className="text-muted-foreground">ניהול פגישות ואירועים</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          הוסף אירוע
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אירועים היום</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פגישות לקוחות</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEvents.filter(e => e.type === "פגישת לקוח").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">דיונים בבית משפט</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEvents.filter(e => e.type === "בית משפט").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שעות עבודה השבוע</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>היום - {selectedDate}</CardTitle>
            <CardDescription>האירועים שלך להיום</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    {getEventTypeIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{event.title}</h3>
                      {getPriorityBadge(event.priority)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {event.time} ({event.duration})
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(event.status)}
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>השבוע הקרוב</CardTitle>
            <CardDescription>סקירה כללית של האירועים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                <div className="font-medium">א'</div>
                <div className="font-medium">ב'</div>
                <div className="font-medium">ג'</div>
                <div className="font-medium">ד'</div>
                <div className="font-medium">ה'</div>
                <div className="font-medium">ו'</div>
                <div className="font-medium">ש'</div>
                
                <div className="p-2 bg-primary text-primary-foreground rounded text-xs">
                  29
                  <div className="mt-1 text-xs opacity-80">{todayEvents.length} אירועים</div>
                </div>
                <div className="p-2 border rounded text-xs">
                  30
                  <div className="mt-1 text-xs opacity-60">2 אירועים</div>
                </div>
                <div className="p-2 border rounded text-xs">31</div>
                <div className="p-2 border rounded text-xs">1</div>
                <div className="p-2 border rounded text-xs">2</div>
                <div className="p-2 border rounded text-xs">3</div>
                <div className="p-2 border rounded text-xs">4</div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">פגישות קרובות</h4>
                <div className="space-y-2">
                  {mockEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="flex-1">{event.title}</span>
                      <span className="text-muted-foreground">{event.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

export default Calendar;