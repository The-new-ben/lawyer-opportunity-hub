import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, MapPin, Video, Phone } from 'lucide-react';
import { useMeetings, type NewMeeting } from '@/hooks/useMeetings';
import { supabase } from '@/integrations/supabase/client';

interface MeetingSchedulerProps {
  leadId?: string;
  caseId?: string;
  lawyerId: string;
  clientId?: string;
}

export function MeetingScheduler({ leadId, caseId, lawyerId, clientId }: MeetingSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [meeting, setMeeting] = useState<Partial<NewMeeting>>({
    lead_id: leadId,
    case_id: caseId,
    lawyer_id: lawyerId,
    client_id: clientId,
    meeting_type: 'in_person',
    status: 'scheduled',
  });

  const { addMeeting } = useMeetings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meeting.scheduled_at || !meeting.lawyer_id) {
      return;
    }

    const created = await addMeeting.mutateAsync(meeting as NewMeeting);

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.provider_token;
      if (accessToken) {
        const start = new Date(meeting.scheduled_at);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        await supabase.functions.invoke('google-calendar-sync', {
          body: {
            action: 'create',
            hearingId: created.id,
            accessToken,
            event: {
              title: meeting.notes || 'Meeting',
              start_time: start.toISOString(),
              end_time: end.toISOString(),
              location: meeting.location || '',
            },
          },
        });
      }
    } catch (err) {
      console.error('google calendar sync failed', err);
    }

    setIsOpen(false);
    setMeeting({
      lead_id: leadId,
      case_id: caseId,
      lawyer_id: lawyerId,
      client_id: clientId,
      meeting_type: 'in_person',
      status: 'scheduled',
    });
  };

  const getMeetingIcon = () => {
    switch (meeting.meeting_type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="animate-fade-in hover-scale">
          <Calendar className="h-4 w-4 ml-2" />
          קבע פגישה
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            קביעת פגישה חדשה
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled_at">תאריך ושעה</Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              value={meeting.scheduled_at || ''}
              onChange={(e) => setMeeting({ ...meeting, scheduled_at: e.target.value })}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_type">סוג פגישה</Label>
            <Select
              value={meeting.meeting_type}
              onValueChange={(value: 'in_person' | 'video' | 'phone') => 
                setMeeting({ ...meeting, meeting_type: value })
              }
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    פגישה פרונטלית
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    פגישת וידאו
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    שיחת טלפון
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {meeting.meeting_type === 'in_person' && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="location">מיקום</Label>
              <Input
                id="location"
                value={meeting.location || ''}
                onChange={(e) => setMeeting({ ...meeting, location: e.target.value })}
                placeholder="כתובת המשרד או מיקום הפגישה"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={meeting.notes || ''}
              onChange={(e) => setMeeting({ ...meeting, notes: e.target.value })}
              placeholder="נושאים לדיון, הכנות נדרשות..."
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              disabled={addMeeting.isPending}
              className="flex-1 animate-pulse-subtle"
            >
              {getMeetingIcon()}
              {addMeeting.isPending ? 'קובע...' : 'קבע פגישה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}