import type { Event } from '@/hooks/useCalendar'
import { supabase } from '@/integrations/supabase/client'

// Method 1: Edge Function with googleapis (Recommended)
export async function syncEventToGoogleViaEdgeFunction(event: Event, accessToken: string) {
  const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
    body: {
      action: 'create',
      event,
      accessToken
    }
  });

  if (error) {
    throw new Error(`Edge function error: ${error.message}`);
  }

  return data;
}

// Method 2: Direct Browser API Call (for simple cases)
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
      start: { 
        dateTime: event.start_time,
        timeZone: 'Asia/Jerusalem'
      },
      end: { 
        dateTime: event.end_time,
        timeZone: 'Asia/Jerusalem'
      },
      location: undefined
    })
  })
  
  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.statusText}`)
  }
  
  return response.json()
}

// Method 3: Public API Key for read-only access
export async function getGoogleCalendarEvents(apiKey: string, calendarId: string = 'primary') {
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
  );

  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.statusText}`);
  }

  return response.json();
}

// Comprehensive Google Calendar operations via Edge Function
export async function googleCalendarOperation(
  action: 'create' | 'update' | 'delete' | 'list',
  event: Event & { id?: string },
  accessToken: string
) {
  const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
    body: {
      action,
      event,
      accessToken
    }
  });

  if (error) {
    throw new Error(`Google Calendar operation failed: ${error.message}`);
  }

  return data;
}
