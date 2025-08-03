import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CreateDepositDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [depositData, setDepositData] = useState({
    lead_id: '',
    lawyer_id: '',
    amount: '',
    deposit_type: 'consultation',
    payment_method: 'bit'
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!depositData.lead_id || !depositData.lawyer_id || !depositData.amount) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: depositData.lead_id,
          lawyer_id: depositData.lawyer_id,
          amount: parseFloat(depositData.amount),
          deposit_type: depositData.deposit_type,
          payment_method: depositData.payment_method,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating deposit:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          הוסף פיקדון
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            הוספת פיקדון חדש
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead_id">מזהה ליד *</Label>
            <Input
              id="lead_id"
              value={depositData.lead_id}
              onChange={(e) => setDepositData({ ...depositData, lead_id: e.target.value })}
              placeholder="הזן מזהה הליד"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lawyer_id">מזהה עורך דין *</Label>
            <Input
              id="lawyer_id"
              value={depositData.lawyer_id}
              onChange={(e) => setDepositData({ ...depositData, lawyer_id: e.target.value })}
              placeholder="הזן מזהה עורך הדין"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">סכום *</Label>
            <Input
              id="amount"
              type="number"
              value={depositData.amount}
              onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit_type">סוג פיקדון</Label>
            <Select 
              value={depositData.deposit_type} 
              onValueChange={(value) => setDepositData({ ...depositData, deposit_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג פיקדון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">ייעוץ</SelectItem>
                <SelectItem value="representation">ייצוג</SelectItem>
                <SelectItem value="document_preparation">הכנת מסמכים</SelectItem>
                <SelectItem value="court_appearance">הופעה בבית משפט</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">אמצעי תשלום</Label>
            <Select 
              value={depositData.payment_method} 
              onValueChange={(value) => setDepositData({ ...depositData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר אמצעי תשלום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bit">ביט</SelectItem>
                <SelectItem value="paypal">פייפאל</SelectItem>
                <SelectItem value="bank_transfer">העברה בנקאית</SelectItem>
                <SelectItem value="credit_card">כרטיס אשראי</SelectItem>
                <SelectItem value="cash">מזומן</SelectItem>
              </SelectContent>
            </Select>
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
              className="flex-1"
            >
              {'שמור פיקדון'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}