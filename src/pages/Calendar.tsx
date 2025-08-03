import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { he } from 'date-fns/locale'
import { useMeetings } from '@/hooks/useMeetings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { he }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
})

const CalendarPage = () => {
  const { meetings = [], getMeetingStats } = useMeetings()
  const stats = getMeetingStats()

  const events = meetings.map(m => ({
    id: m.id,
    title: m.notes || 'פגישה',
    start: new Date(m.scheduled_at),
    end: new Date(new Date(m.scheduled_at).getTime() + 60 * 60 * 1000),
  }))

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">כל הפגישות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">פגישות היום</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">מתוכננות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הושלמו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            culture="he"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default CalendarPage
