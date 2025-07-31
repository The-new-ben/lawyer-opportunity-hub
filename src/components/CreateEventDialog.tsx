import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, MapPin } from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import { useToast } from '@/hooks/use-toast';

interface CreateEventDialogProps {
  lawyerId?: string;
  clientId?: string;
  caseId?: string;
}

export function CreateEventDialog({ lawyerId, clientId, caseId }: CreateEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    lawyer_id: lawyerId || '',
    client_id: clientId || '',
    case_id: caseId || ''
  });

  const { addEvent } = useCalendar();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventData.title || !eventData.start_time || !eventData.end_time) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    try {
      await addEvent.mutateAsync({
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        lawyer_id: eventData.lawyer_id || null,
        client_id: eventData.client_id || null,
        case_id: eventData.case_id || null,
      });

      setEventData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        lawyer_id: lawyerId || '',
        client_id: clientId || '',
        case_id: caseId || ''
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          אירוע חדש
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            יצירת אירוע חדש
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת האירוע *</Label>
            <Input
              id="title"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              placeholder="פגישה עם לקוח, דיון בבית משפט..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">תאריך ושעת התחלה *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={eventData.start_time}
                onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">תאריך ושעת סיום *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={eventData.end_time}
                onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור ומיקום</Label>
            <Textarea
              id="description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              placeholder="פרטים נוספים, מיקום, נושאים לדיון..."
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
              disabled={addEvent.isPending}
              className="flex-1"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {addEvent.isPending ? 'יוצר...' : 'צור אירוע'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}