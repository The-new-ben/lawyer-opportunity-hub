import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function CreatePaymentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    contract_id: '',
    amount: '',
    payment_type: 'advance',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.contract_id || !paymentData.amount) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          contract_id: paymentData.contract_id,
          amount: parseFloat(paymentData.amount),
          payment_type: paymentData.payment_type,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "תשלום נוסף בהצלחה",
        description: "התשלום נוסף למערכת",
      });

      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      setPaymentData({
        contract_id: '',
        amount: '',
        payment_type: 'advance',
        notes: ''
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "שגיאה ביצירת תשלום",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          הוסף תשלום
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            הוספת תשלום חדש
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract_id">מזהה חוזה *</Label>
            <Input
              id="contract_id"
              value={paymentData.contract_id}
              onChange={(e) => setPaymentData({ ...paymentData, contract_id: e.target.value })}
              placeholder="הזן מזהה החוזה"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">סכום *</Label>
            <Input
              id="amount"
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_type">סוג תשלום</Label>
            <Select 
              value={paymentData.payment_type} 
              onValueChange={(value) => setPaymentData({ ...paymentData, payment_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג תשלום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advance">מקדמה</SelectItem>
                <SelectItem value="partial">תשלום חלקי</SelectItem>
                <SelectItem value="final">תשלום סופי</SelectItem>
                <SelectItem value="refund">החזר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              placeholder="הערות נוספות..."
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
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'שומר...' : 'שמור תשלום'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}