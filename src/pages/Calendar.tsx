import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Users, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { CreateEventDialog } from "@/components/CreateEventDialog";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, isLoading, error } = useCalendar();
  
  // Filter events for today
  const todayEvents = events.filter(event => 
    new Date(event.start_time).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">לוח זמנים</h1>
          <p className="text-muted-foreground">ניהול ומעקב אחר כל האירועים והפגישות</p>
        </div>
        <CreateEventDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אירועי היום</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך כל אירועים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">השבוע הקרוב</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => {
                const eventDate = new Date(e.start_time);
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return eventDate <= nextWeek && eventDate >= new Date();
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שעות עבודה</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>אירועי היום - {selectedDate.toLocaleDateString('he-IL')}</CardTitle>
          <CardDescription>רשימת האירועים המתוכננים להיום</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center py-8">טוען אירועים...</p>
          ) : error ? (
            <p className="text-center py-8 text-destructive">שגיאה בטעינת אירועים</p>
          ) : todayEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              אין אירועים מתוכננים להיום
            </p>
          ) : (
            todayEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    📅
                  </div>
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.description && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant="outline">אירוע</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>השבוע הקרוב</CardTitle>
            <CardDescription>לוח זמנים שבועי</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["א", "ב", "ג", "ד", "ה", "ו", "ש"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayEvents = events.filter(e => 
                  new Date(e.start_time).toDateString() === date.toDateString()
                );
                
                return (
                  <div 
                    key={i} 
                    className={`p-2 text-center rounded cursor-pointer hover:bg-accent ${
                      date.toDateString() === selectedDate.toDateString() ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-sm">{date.getDate()}</div>
                    {dayEvents.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {dayEvents.length} אירועים
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>אירועים קרובים</CardTitle>
            <CardDescription>האירועים הקרובים בתוכנית</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events
              .filter(e => new Date(e.start_time) >= new Date())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h5 className="font-medium">{event.title}</h5>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.start_time).toLocaleDateString('he-IL')} ב-
                      {new Date(event.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {Math.ceil((new Date(event.start_time).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ימים
                  </Badge>
                </div>
              ))}
            
            {events.filter(e => new Date(e.start_time) >= new Date()).length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                אין אירועים קרובים
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

export default Calendar;