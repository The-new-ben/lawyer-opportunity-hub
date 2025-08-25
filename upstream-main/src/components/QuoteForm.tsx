import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, FileText, Clock } from 'lucide-react';
import { NewQuote } from '@/hooks/useQuotes';

interface QuoteFormProps {
  leadId: string;
  lawyerId: string;
  lawyerName: string;
  onSubmit: (data: NewQuote) => void;
  onCancel: () => void;
}

export function QuoteForm({ leadId, lawyerId, lawyerName, onSubmit, onCancel }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    service_description: '',
    quote_amount: '',
    estimated_duration_days: '',
    payment_terms: '',
    terms_and_conditions: '',
    valid_until: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quoteData: NewQuote = {
      lead_id: leadId,
      lawyer_id: lawyerId,
      service_description: formData.service_description,
      quote_amount: parseFloat(formData.quote_amount),
      estimated_duration_days: formData.estimated_duration_days ? parseInt(formData.estimated_duration_days) : undefined,
      payment_terms: formData.payment_terms || undefined,
      terms_and_conditions: formData.terms_and_conditions || undefined,
      valid_until: formData.valid_until || undefined,
      status: 'pending'
    };

    onSubmit(quoteData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          הצעת מחיר עבור {lawyerName}
        </CardTitle>
        <CardDescription>
          מלא את פרטי ההצעה עבור הליד
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote_amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                סכום ההצעה (₪)
              </Label>
              <Input
                id="quote_amount"
                type="number"
                placeholder="5000"
                value={formData.quote_amount}
                onChange={(e) => setFormData({...formData, quote_amount: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration_days" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                זמן ביצוע משוער (ימים)
              </Label>
              <Input
                id="estimated_duration_days"
                type="number"
                placeholder="30"
                value={formData.estimated_duration_days}
                onChange={(e) => setFormData({...formData, estimated_duration_days: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_description">תיאור השירות</Label>
            <Textarea
              id="service_description"
              placeholder="תאר את השירותים שתספק ללקוח..."
              value={formData.service_description}
              onChange={(e) => setFormData({...formData, service_description: e.target.value})}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">תנאי תשלום</Label>
            <Textarea
              id="payment_terms"
              placeholder="50% מקדמה, יתרה בסיום העבודה..."
              value={formData.payment_terms}
              onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms_and_conditions">תנאים והגבלות</Label>
            <Textarea
              id="terms_and_conditions"
              placeholder="תנאים נוספים..."
              value={formData.terms_and_conditions}
              onChange={(e) => setFormData({...formData, terms_and_conditions: e.target.value})}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              תוקף ההצעה עד
            </Label>
            <Input
              id="valid_until"
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              שלח הצעת מחיר
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              ביטול
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}