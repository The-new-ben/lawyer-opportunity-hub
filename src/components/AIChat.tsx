import { useRef, useState } from 'react';
import type { useFormWithAI } from '@/aiIntake/useFormWithAI';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AIChat({ formCtl }: { formCtl: ReturnType<typeof useFormWithAI> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef('');

  // Function to clean markdown formatting from AI responses
  function cleanMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
      .replace(/`(.*?)`/g, '$1')       // Remove code `text`
      .replace(/#{1,6}\s*/g, '')       // Remove headers # ## ###
      .trim();
  }

  async function sendMessage(text: string) {
    setMessages(prev => [...prev, { role: 'user', text }]);
    
    try {
      const messages = [
        { role: 'system', content: 'You are a legal assistant helping with case intake. Respond in Hebrew and provide clear, helpful guidance.' },
        { role: 'user', content: text }
      ];

      const { data, error } = await supabase.functions.invoke('ai-intake-openai', {
        body: { messages }
      });

      if (error) {
        console.error('Supabase function error:', error);
        setMessages(prev => [...prev, { role: 'assistant', text: 'מצטער, יש בעיה בשרת. נסה שוב.' }]);
        return;
      }

      // Clean the AI response from markdown formatting
      const cleanedResponse = cleanMarkdown(data?.caseTitle || data?.caseSummary || 'תודה על המידע. אוכל לעזור לך להמשיך.');
      
      if (cleanedResponse) {
        setMessages(prev => [...prev, { role: 'assistant', text: cleanedResponse }]);
      }

      // Apply field updates using the new form structure
      if (data && typeof data === 'object') {
        formCtl.applyAIToForm(data);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'מצטער, יש בעיה בחיבור. נסה שוב.' }]);
    }

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