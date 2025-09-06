import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCaseDraft } from '@/hooks/useCaseDraft';
import { supabase } from '@/integrations/supabase/client';

const SimpleChatPortal = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{user: string, ai: string}>>([]);
  const { toast } = useToast();
  const { draft, update } = useCaseDraft();

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      // Call OpenAI via edge function
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [
            { 
              role: 'system', 
              content: 'אתה עוזר משפטי. תנתח את הטקסט ותחלץ מידע לשדות: title, summary, jurisdiction, category, goal, parties, evidence. השב בעברית ובקצרה.'
            },
            { role: 'user', content: userMessage }
          ],
          model: 'gpt-4.1-2025-04-14',
          temperature: 0.7
        }
      });

      if (error) throw error;

      const aiResponse = data.text;
      
      // Update history
      setHistory(prev => [...prev, { user: userMessage, ai: aiResponse }]);

      // Try to extract fields automatically
      const extractResponse = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'intake_extract',
          locale: 'he',
          context: {
            history: [{ role: 'user', content: userMessage }],
            required_fields: ['title', 'summary', 'jurisdiction', 'category', 'goal', 'parties', 'evidence'],
            current_fields: draft
          }
        }
      });

      if (extractResponse.data?.updated_fields) {
        update(extractResponse.data.updated_fields);
        toast({
          title: 'שדות עודכנו',
          description: `עודכנו: ${Object.keys(extractResponse.data.updated_fields).join(', ')}`
        });
      }

    } catch (err: any) {
      toast({
        title: 'שגיאה',
        description: err.message || 'משהו השתבש',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCase = async () => {
    if (!draft.summary || !draft.goal) {
      toast({
        title: 'חסרים פרטים',
        description: 'נדרש תיאור התיק ומטרה',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'case_builder',
          locale: 'he',
          context: {
            summary: draft.summary,
            goal: draft.goal,
            jurisdiction: draft.jurisdiction || 'ישראל',
            category: draft.category || 'אזרחי'
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: 'התיק נוצר בהצלחה!',
        description: 'ניתן להתחיל בדיון'
      });

    } catch (err: any) {
      toast({
        title: 'שגיאה ביצירת התיק',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🏛️ מערכת המשפט החכמה</CardTitle>
          <p className="text-center text-muted-foreground">
            ספר לי על התיק המשפטי שלך ואני אעזור לך לבנות אותו
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="תאר את התיק המשפטי שלך כאן... (למשל: חבר לקח ממני הלוואה ולא מחזיר, רוצה להגיש תביעה)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button 
                onClick={sendMessage} 
                disabled={loading || !input.trim()}
                className="flex-1"
              >
                {loading ? 'שולח...' : 'שלח הודעה 💬'}
              </Button>
              <Button 
                onClick={generateCase}
                disabled={loading || !draft.summary}
                variant="secondary"
              >
                צור תיק 📋
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* שדות התיק */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>פרטי התיק</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><strong>כותרת:</strong> {draft.title || 'לא הוגדר'}</div>
          <div><strong>תיאור:</strong> {draft.summary || 'לא הוגדר'}</div>
          <div><strong>סמכות שיפוט:</strong> {draft.jurisdiction || 'לא הוגדר'}</div>
          <div><strong>קטגוריה:</strong> {draft.category || 'לא הוגדר'}</div>
          <div><strong>מטרה:</strong> {draft.goal || 'לא הוגדר'}</div>
        </CardContent>
      </Card>

      {/* היסטוריית שיחה */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>היסטוריית שיחה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong>אתה:</strong> {msg.user}
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <strong>עוזר משפטי:</strong> {msg.ai}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleChatPortal;