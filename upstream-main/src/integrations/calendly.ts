import axios from 'axios'
import type { Event } from '@/hooks/useCalendar'

export async function createCalendlyEvent(event: Event, token: string) {
  const data = {
    name: event.title,
    description: event.description,
    start_time: event.start_time,
    end_time: event.end_time
  }
  const res = await axios.post('https://api.calendly.com/scheduled_events', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  return res.data
}
