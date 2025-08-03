import type { Event } from '@/hooks/useCalendar'

export async function syncEventToGoogle(event: Event, token: string) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.title,
      description: event.description || undefined,
      start: { dateTime: event.start_time },
      end: { dateTime: event.end_time }
    })
  })
  
  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.statusText}`)
  }
  
  return response.json()
}
