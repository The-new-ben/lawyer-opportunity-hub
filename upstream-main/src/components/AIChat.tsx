import { useRef, useState } from 'react';
import type { useFormWithAI } from '@/aiIntake/useFormWithAI';
import { supabase } from '@/integrations/supabase/client';

/** טיפוס בסיסי לאובייקט שה־AI מחזיר */
interface AIResponse {
  caseTitle?: string;
  caseSummary?: string;
  jurisdiction?: string;
  legalCategory?: string;
  reliefSought?: string;
  // שדות נוספים במידת הצורך...
  [key: string]: any;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AIChat({ formCtl }: { formCtl: ReturnType<typeof useFormWithAI> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /** פונקציה להסרת סימוני Markdown פשוטים */
  function cleanMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')   // **מודגש**
      .replace(/\*(.*?)\*/g, '$1')       // *נטוי*
      .replace(/`([^`]*)`/g, '$1')       // `קוד`
      .replace(/#{1,6}\s+/g, '')         // כותרות #
      .trim();
  }

  async function sendMessage(text: string) {
    setMessages(prev => [...prev, { role: 'user', text }]);

    try {
      // בניית ההיסטוריה לשיחה – כאן ניתן להוסיף הודעות קודמות במידת הצורך
      const payload = [
        { role: 'system', content: 'You are a legal assistant helping with case intake. Respond in Hebrew and provide clear, helpful guidance.' },
        { role: 'user',   content: text }
      ];

      // קריאה לפונקציית Edge של Supabase
      const { data, error } = await supabase.functions.invoke<AIResponse>('ai-intake-openai', {
        body: { messages: payload }
      });

      if (error) {
        console.error('Supabase function error:', error);
        setMessages(prev => [...prev, { role: 'assistant', text: 'מצטער, יש בעיה בשרת. נסה שוב.' }]);
        return;
      }

      // הצגת תגובת ה־AI בצ'אט
      const reply = cleanMarkdown(
        data?.caseTitle ??
        data?.caseSummary ??
        'תודה על המידע. אוכל לעזור לך להמשיך.'
      );
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);

      // עדכון הטופס – תמיכה בשתי המתודות האפשריות
      if (data && typeof data === 'object') {
        // אם ההוק מחזיר applyAIToForm – נעדכן בעזרתו
        if (typeof (formCtl as any).applyAIToForm === 'function') {
          (formCtl as any).applyAIToForm(data);
        }
        // אחרת נבנה רשימת פאצ'ים ונקרא ל‑applyPatches
        else if (typeof (formCtl as any).applyPatches === 'function') {
          const patches = [];
          if (data.caseTitle)   patches.push({ op: 'set', path: 'title',        value: cleanMarkdown(data.caseTitle) });
          if (data.caseSummary) patches.push({ op: 'set', path: 'summary',      value: cleanMarkdown(data.caseSummary) });
          if (data.jurisdiction)patches.push({ op: 'set', path: 'jurisdiction', value: cleanMarkdown(data.jurisdiction) });
          if (data.legalCategory)patches.push({ op: 'set', path: 'category',    value: cleanMarkdown(data.legalCategory) });
          if (data.reliefSought)patches.push({ op: 'set', path: 'goal',         value: cleanMarkdown(data.reliefSought) });
          // הוספת שדות נוספים לפי הצורך...

          if (patches.length > 0) {
            (formCtl as any).applyPatches(patches);
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'מצטער, יש בעיה בחיבור. נסה שוב.' }]);
    }

    // גלילה לתחתית הצ'אט כדי לראות את ההודעה החדשה
    setTimeout(() => {
      const chatList = document.getElementById('chat-list');
      chatList?.scrollTo({ top: chatList.scrollHeight, behavior: 'smooth' });
    }, 50);
  }

  return (
    <div className="h-full flex flex-col border border-border rounded-lg">
      <div id="chat-list" className="flex-1 overflow-y-auto space-y-2 p-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              m.role === 'user'
                ? 'bg-primary/10 text-primary-foreground rounded-lg p-3 self-end max-w-[70%] ml-auto'
                : 'bg-muted text-muted-foreground rounded-lg p-3 self-start max-w-[70%]'
            }
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <input
          ref={inputRef}
          type="text"
          placeholder="Describe your legal issue..."
          className="w-full border border-input bg-background px-3 py-2 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={e => {
            if (e.key === 'Enter' && inputRef.current?.value.trim()) {
              e.preventDefault();
              const value = inputRef.current.value.trim();
              inputRef.current.value = '';
              sendMessage(value);
            }
          }}
        />
      </div>
    </div>
  );
}
