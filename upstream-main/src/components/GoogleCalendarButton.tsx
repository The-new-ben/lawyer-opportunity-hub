import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, RefreshCw, ExternalLink } from 'lucide-react';
import { googleAuth } from '@/integrations/googleOAuth';
import { syncEventToGoogleViaEdgeFunction, getGoogleCalendarEvents } from '@/integrations/googleCalendar';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/hooks/useCalendar';

type GoogleEvent = {
  summary?: string;
  start?: { dateTime?: string };
};

interface GoogleCalendarButtonProps {
  event?: Event;
  onSync?: () => void;
}

export const GoogleCalendarButton: React.FC<GoogleCalendarButtonProps> = ({ event, onSync }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setIsAuthenticated(googleAuth.isAuthenticated());
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await googleAuth.initializeGoogleSignIn();
      await googleAuth.showOneTap();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להתחבר ל-Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthFlow = () => {
    googleAuth.initiateOAuth();
  };

  const handleSyncEvent = async () => {
    if (!event) return;
    
    const accessToken = googleAuth.getStoredAccessToken();
    if (!accessToken) {
      toast({
        title: "שגיאה",
        description: "נדרש להתחבר ל-Google Calendar תחילה",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await syncEventToGoogleViaEdgeFunction(event, accessToken);
      toast({
        title: "הצלחה",
        description: "האירוע נוסף ל-Google Calendar",
      });
      onSync?.();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לסנכרן עם Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadEvents = async () => {
    try {
      setIsLoading(true);
      // This would use a public API key for read-only access
      const publicApiKey = 'YOUR_PUBLIC_API_KEY'; // Replace with actual key
      const calendarEvents = await getGoogleCalendarEvents(publicApiKey);
      setEvents(calendarEvents.items || []);
      toast({
        title: "הצלחה",
        description: `נטענו ${calendarEvents.items?.length || 0} אירועים`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון אירועים מ-Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    googleAuth.clearStoredTokens();
    setIsAuthenticated(false);
    setEvents([]);
    toast({
      title: "התנתקות",
      description: "התנתקת מ-Google Calendar",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar
        </CardTitle>
        <CardDescription>
          סנכרון עם Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <div className="space-y-2">
            <Button 
              onClick={handleGoogleSignIn} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              התחבר עם Google (One-Tap)
            </Button>
            <Button 
              onClick={handleOAuthFlow} 
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              התחבר עם OAuth2
            </Button>
            <Button 
              onClick={handleLoadEvents} 
              variant="secondary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              טען אירועים (API Key)
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {event && (
              <Button 
                onClick={handleSyncEvent} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                סנכרן אירוע
              </Button>
            )}
            <Button 
              onClick={handleSignOut} 
              variant="outline"
              className="w-full"
            >
              התנתק
            </Button>
          </div>
        )}
        
        {events.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">אירועים מ-Google Calendar:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {events.slice(0, 5).map((event: GoogleEvent, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  <div className="font-medium">{event.summary}</div>
                  <div className="text-muted-foreground">
                    {event.start?.dateTime && new Date(event.start.dateTime).toLocaleDateString('he-IL')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};