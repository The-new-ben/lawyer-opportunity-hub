import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, CreditCard, Check, Video, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LawyerData {
  id: string;
  profiles: {
    full_name: string;
  };
}

interface LeadData {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  legal_category: string;
}

interface QuoteData {
  id: string;
  quote_amount: number;
  estimated_duration_days: number;
  leads: LeadData;
  lawyers: LawyerData;
}

const MeetingScheduler = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [lawyer, setLawyer] = useState<LawyerData | null>(null);
  const [step, setStep] = useState(1);
  
  const [meetingData, setMeetingData] = useState({
    date: '',
    time: '',
    type: 'video',
    location: '',
    notes: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const quoteId = searchParams.get('quote_id');
  const token = searchParams.get('token');

  useEffect(() => {
    if (quoteId && token) {
      fetchQuoteData();
    }
  }, [quoteId, token]);

  const fetchQuoteData = async () => {
    try {
      setLoading(true);
      
      // שליפת נתוני ההצעה
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          leads!inner(*),
          lawyers!inner(
            *,
            profiles!inner(*)
          )
        `)
        .eq('id', quoteId)
        .single();

      if (quoteError) {
        throw quoteError;
      }

      const typedQuote = quoteData as QuoteData;
      setQuote(typedQuote);
      setLawyer(typedQuote.lawyers);

      // מילוי נתוני הלקוח מהליד
      setMeetingData(prev => ({
        ...prev,
        customerName: typedQuote.leads.customer_name,
        customerPhone: typedQuote.leads.customer_phone,
        customerEmail: typedQuote.leads.customer_email || ''
      }));

    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני ההצעה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!meetingData.date || !meetingData.time) {
      toast({
        title: "שגיאה",
        description: "יש למלא תאריך ושעה לפגישה",
        variant: "destructive",
      });
      return;
    }

    if (!quote || !lawyer) {
      return;
    }

    try {
      setLoading(true);

      const scheduledAt = new Date(`${meetingData.date}T${meetingData.time}`);
      
      // יצירת הפגישה
      const { error: meetingError } = await supabase
        .from('meetings')
        .insert({
          lawyer_id: lawyer.id,
          lead_id: quote.leads.id,
          scheduled_at: scheduledAt.toISOString(),
          meeting_type: meetingData.type,
          location: meetingData.location,
          notes: meetingData.notes,
          status: 'scheduled'
        });

      if (meetingError) {
        throw meetingError;
      }

      // עדכון סטטוס ההצעה
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'meeting_scheduled' })
        .eq('id', quoteId);

      if (updateError) {
        throw updateError;
      }

      setStep(2);
      toast({
        title: "הפגישה נקבעה בהצלחה! 🎉",
        description: "תקבל אישור בווטסאפ עם פרטי הפגישה",
      });

      // שליחת הודעת אישור
      await sendConfirmationMessage();

    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לקבוע את הפגישה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationMessage = async () => {
    if (!quote || !lawyer) {
      return;
    }
    try {
      const meetingDateTime = new Date(`${meetingData.date}T${meetingData.time}`);
      const formattedDate = meetingDateTime.toLocaleDateString('he-IL');
      const formattedTime = meetingDateTime.toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const message = `✅ פגישתך נקבעה בהצלחה!

📅 תאריך: ${formattedDate}
🕐 שעה: ${formattedTime}
👨‍💼 עורך דין: ${lawyer.profiles.full_name}
${meetingData.type === 'video' ? '💻 פגישה וירטואלית' : 
  meetingData.type === 'phone' ? '📞 פגישה טלפונית' : 
  `📍 מיקום: ${meetingData.location}`}

💰 הצעת מחיר: ${quote.quote_amount}₪

הערות נוספות:
${meetingData.notes || 'אין הערות נוספות'}

נשמח לפגוש אותך! 🤝`;

      await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          phone: quote.leads.customer_phone,
          message
        }
      });

    } catch (error) {
      toast({
        title: 'Failed to send confirmation message',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
    }
  };

  const handlePayDeposit = async () => {
    if (!quote || !lawyer) {
      return;
    }
    try {
      setLoading(true);

      // יצירת deposit
      const depositAmount = Math.round(quote.quote_amount * 0.5); // 50% מקדמה
      
      const { data: deposit, error: depositError } = await supabase
        .from('deposits')
        .insert({
          lead_id: quote.leads.id,
          lawyer_id: lawyer.id,
          quote_id: quote.id,
          amount: depositAmount,
          deposit_type: 'initial',
          status: 'pending'
        })
        .select()
        .single();

      if (depositError) {
        throw depositError;
      }

      // כאן ניתן להוסיף אינטגרציה עם מערכת תשלומים (Stripe, PayPal וכו')
      toast({
        title: "מעבר לתשלום",
        description: `מקדמה של ${depositAmount}₪ - מערכת התשלומים תיפתח בקרוב`,
      });

      setStep(3);

    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעבור לתשלום",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!quote || !lawyer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">שגיאה</h2>
            <p className="mb-4">לא ניתן לטעון את נתוני ההצעה</p>
            <Button onClick={() => window.close()}>סגור</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex flex-col overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">קביעת פגישה משפטית</CardTitle>
            <div className="text-sm text-muted-foreground mt-2">
              הצעת מחיר מס׳ {quote.id.slice(0, 8)}...
            </div>
          </CardHeader>
        </Card>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${
                step >= stepNum ? 'bg-primary' : 'bg-muted'
              }`}>
                {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-16 h-1 ${step > stepNum ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                קביעת פגישה ראשונית
              </CardTitle>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">פרטי ההצעה:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>עורך דין:</strong> {lawyer.profiles.full_name}
                  </div>
                  <div>
                    <strong>תחום:</strong> {quote.leads.legal_category}
                  </div>
                  <div>
                    <strong>מחיר:</strong> {quote.quote_amount}₪
                  </div>
                  <div>
                    <strong>משך זמן:</strong> {quote.estimated_duration_days} ימים
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">תאריך</Label>
                  <Input
                    id="date"
                    type="date"
                    value={meetingData.date}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="time">שעה</Label>
                  <Input
                    id="time"
                    type="time"
                    value={meetingData.time}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">סוג פגישה</Label>
                <Select
                  value={meetingData.type}
                  onValueChange={(value) => setMeetingData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">פגישה וירטואלית (Zoom/Teams)</SelectItem>
                    <SelectItem value="phone">פגישה טלפונית</SelectItem>
                    <SelectItem value="in_person">פגישה פנים אל פנים</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {meetingData.type === 'in_person' && (
                <div>
                  <Label htmlFor="location">מיקום הפגישה</Label>
                  <Input
                    id="location"
                    placeholder="כתובת המשרד או מיקום מועדף"
                    value={meetingData.location}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">הערות נוספות (אופציונלי)</Label>
                <Textarea
                  id="notes"
                  placeholder="פרטים נוספים שחשוב שעורך הדין ידע..."
                  value={meetingData.notes}
                  onChange={(e) => setMeetingData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleScheduleMeeting} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'קובע פגישה...' : 'קבע פגישה (ללא עלות)'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                הפגישה נקבעה בהצלחה!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-2">פרטי הפגישה:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(`${meetingData.date}T${meetingData.time}`).toLocaleDateString('he-IL')} בשעה {new Date(`${meetingData.date}T${meetingData.time}`).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2">
                    {meetingData.type === 'video' ? <Video className="w-4 h-4" /> : 
                     meetingData.type === 'phone' ? <Phone className="w-4 h-4" /> : 
                     <MapPin className="w-4 h-4" />}
                    {meetingData.type === 'video' ? 'פגישה וירטואלית' : 
                     meetingData.type === 'phone' ? 'פגישה טלפונית' : 
                     meetingData.location}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="mb-4">💡 הפגישה הראשונית ללא עלות ותכלול הערכת התיק והסבר על התהליך</p>
                <p className="text-sm text-muted-foreground mb-6">
                  לביטוח מקום ותחילת עבודה, ניתן לשלם מקדמה של 50%
                </p>
                
                <Button 
                  onClick={handlePayDeposit}
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? 'מעבד...' : `שלם מקדמה - ${Math.round(quote.quote_amount * 0.5)}₪`}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={() => window.close()}
                >
                  סיום ללא תשלום
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                התהליך הושלם בהצלחה!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold">תודה רבה!</h3>
              <p className="text-muted-foreground">
                הפגישה נקבעה והמקדמה שולמה בהצלחה.<br />
                עורך הדין יצור איתך קשר לאישור סופי.
              </p>
              <Button 
                onClick={() => window.close()}
                className="w-full"
                size="lg"
              >
                סגור חלון
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MeetingScheduler;