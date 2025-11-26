import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMeetings } from "@/hooks/useMeetings";
import { useLeads } from "@/hooks/useLeads";
import { useCases } from "@/hooks/useCases";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus } from "lucide-react";

const meetingSchema = z.object({
  scheduled_at: z.string().min(1, "תאריך ושעה הם שדות חובה"),
  meeting_type: z.string().min(1, "סוג פגישה הוא שדה חובה"),
  location: z.string().optional(),
  notes: z.string().optional(),
  lead_id: z.string().optional(),
  case_id: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

interface CreateMeetingDialogProps {
  leadId?: string;
  caseId?: string;
  lawyerId: string;
  clientId?: string;
}

export function CreateMeetingDialog({ leadId, caseId, lawyerId, clientId }: CreateMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const { addMeeting } = useMeetings();
  const { leads } = useLeads();
  const { cases } = useCases();

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      meeting_type: "phone_call",
      lead_id: leadId,
      case_id: caseId,
    },
  });

  const onSubmit = async (values: MeetingFormValues) => {
    try {
      await addMeeting.mutateAsync({
        scheduled_at: values.scheduled_at,
        meeting_type: values.meeting_type || 'phone_call',
        location: values.location,
        notes: values.notes,
        lead_id: values.lead_id,
        case_id: values.case_id,
        lawyer_id: lawyerId,
        client_id: clientId,
        status: 'scheduled',
      });
      
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          קבע פגישה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>פגישה חדשה</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תאריך ושעה</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סוג פגישה</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג פגישה" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phone_call">שיחת טלפון</SelectItem>
                      <SelectItem value="video_call">שיחת וידאו</SelectItem>
                      <SelectItem value="in_person">פגישה פרונטלית</SelectItem>
                      <SelectItem value="consultation">ייעוץ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מיקום/קישור</FormLabel>
                  <FormControl>
                    <Input placeholder="כתובת או קישור לפגישה" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!leadId && !caseId && (
              <>
                <FormField
                  control={form.control}
                  name="lead_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ליד (אופציונלי)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="בחר ליד" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leads?.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.customer_name} - {lead.legal_category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="case_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>תיק (אופציונלי)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="בחר תיק" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cases?.map((case_) => (
                            <SelectItem key={case_.id} value={case_.id}>
                              {case_.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הערות</FormLabel>
                  <FormControl>
                    <Textarea placeholder="הערות נוספות לפגישה" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={addMeeting.isPending} className="w-full">
              {addMeeting.isPending ? "קובע פגישה..." : "קבע פגישה"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}