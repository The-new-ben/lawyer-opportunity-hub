import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, event, accessToken } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

    if (!GOOGLE_API_KEY) {
      throw new Error('Google API Key not configured');
    }

    let response;
    let data;

    switch (action) {
      case 'create':
        response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.title,
            description: event.description || '',
            start: { 
              dateTime: event.start_time,
              timeZone: 'Asia/Jerusalem'
            },
            end: { 
              dateTime: event.end_time,
              timeZone: 'Asia/Jerusalem'
            },
            location: event.location || ''
          })
        });
        break;

      case 'list': {
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          }
        );
        break;
      }

      case 'update':
        if (!event.id) throw new Error('Event ID required for update');
        
        response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.title,
            description: event.description || '',
            start: { 
              dateTime: event.start_time,
              timeZone: 'Asia/Jerusalem'
            },
            end: { 
              dateTime: event.end_time,
              timeZone: 'Asia/Jerusalem'
            },
            location: event.location || ''
          })
        });
        break;

      case 'delete':
        if (!event.id) throw new Error('Event ID required for delete');
        
        response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });
        break;

      default:
        throw new Error('Invalid action');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar API error:', response.status, errorText);
      throw new Error(`Google Calendar API error: ${response.status} ${errorText}`);
    }

    // Handle empty response for delete operations
    if (response.status === 204 || action === 'delete') {
      data = { success: true };
    } else {
      data = await response.json();
    }

    console.log(`Google Calendar ${action} successful:`, data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-calendar-sync function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});