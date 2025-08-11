import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resourceState = req.headers.get('x-goog-resource-state');
    if (resourceState) {
      const body = await req.json().catch(() => ({}));
      const evt = body.event || body;
      const eventId = evt.id;
      if (eventId) {
        if (resourceState === 'exists') {
          await supabase
            .from('hearings')
            .update({
              scheduled_at: evt.start_time,
              location: evt.location ?? null,
            })
            .eq('google_event_id', eventId);
        }
        if (resourceState === 'not_exists') {
          await supabase
            .from('hearings')
            .update({ google_event_id: null })
            .eq('google_event_id', eventId);
        }
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, event, accessToken, hearingId } = await req.json();
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
        const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

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
      throw new Error(`Google Calendar API error: ${response.status} ${errorText}`);
    }

    if (response.status === 204 || action === 'delete') {
      data = { success: true };
    } else {
      data = await response.json();
    }

    if (action === 'create' && hearingId && data.id) {
      await supabase
        .from('hearings')
        .update({ google_event_id: data.id })
        .eq('id', hearingId);
    }

    if (action === 'delete' && hearingId) {
      await supabase
        .from('hearings')
        .update({ google_event_id: null })
        .eq('id', hearingId);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
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
