import { useRef, useState } from 'react';
import { useFormWithAI } from '@/lib/aiFieldBridge';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AIChat({ formCtl }: { formCtl: ReturnType<typeof useFormWithAI> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef('');

  async function sendMessage(text: string) {
    setMessages(prev => [...prev, { role: 'user', text }]);
    const nextTranscript = transcriptRef.current + `\nUser: ${text}`;
    transcriptRef.current = nextTranscript;

    const r = await fetch('/.netlify/functions/ai-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: nextTranscript,
        currentCase: formCtl.form.getValues(),
      }),
    });
    const { patches = [], reply = '' } = await r.json();
    formCtl.applyPatches(patches);

    if (reply) setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
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