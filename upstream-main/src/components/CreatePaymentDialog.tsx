import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function CreatePaymentDialog() {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState('bronze');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { action: 'subscription', tier }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'שגיאה',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { action: 'billing_portal' }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'שגיאה',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>ניהול מנוי</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>בחירת מסלול</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>מסלול</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue placeholder="בחר מסלול" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">ברונזה</SelectItem>
                <SelectItem value="silver">כסף</SelectItem>
                <SelectItem value="gold">זהב</SelectItem>
                <SelectItem value="platinum">פלטינום</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubscribe} disabled={loading} className="flex-1">
              הרשמה
            </Button>
            <Button variant="outline" onClick={handleBillingPortal} disabled={loading} className="flex-1">
              ניהול חיוב
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

