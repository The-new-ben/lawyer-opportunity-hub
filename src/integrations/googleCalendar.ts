import { google } from 'googleapis'
import type { Event } from '@/hooks/useCalendar'

const api = google.calendar('v3')

export async function syncEventToGoogle(event: Event, token: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: token })
  await api.events.insert({
    auth,
    calendarId: 'primary',
    requestBody: {
      summary: event.title,
      description: event.description || undefined,
      start: { dateTime: event.start_time },
      end: { dateTime: event.end_time }
    }
  })
}
