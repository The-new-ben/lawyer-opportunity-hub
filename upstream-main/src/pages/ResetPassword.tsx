import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "שגיאה",
        description: "אנא הזן כתובת אימייל",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast({
        title: "שגיאה בשליחת איפוס סיסמה",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSent(true);
    }
    
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-x-hidden">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">בדוק את האימייל שלך</CardTitle>
            <CardDescription>
              נשלחה אליך הודעה עם קישור לאיפוס סיסמה
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => navigate('/auth')}>
              חזור להתחברות
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-x-hidden">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">איפוס סיסמה</CardTitle>
          <CardDescription>
            הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס סיסמה
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="example@email.com"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              שלח קישור איפוס
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/auth')}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            חזור להתחברות
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}