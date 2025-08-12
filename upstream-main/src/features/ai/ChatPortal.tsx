// src/features/ai/ChatPortal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '@/services/gptClient';
import { chat } from '@/services/gptClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Models
const MODELS = [
  { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B (Server)' },
  { value: 'mistralai/mixtral-8x7b-instruct', label: 'Mixtral 8x7B (Server)' },
  { value: 'qwen/qwen2.5-72b-instruct', label: 'Qwen2.5 72B (Server)' },
  { value: 'openai/gpt-oss-20b:fireworks-ai', label: 'gpt-oss-20b (HF Router)' },
  { value: 'openai/gpt-oss-120b:cerebras', label: 'gpt-oss-120b (HF Router)' },
];

type Thread = { question: string; answer: string; timestamp: string };

export default function ChatPortal() {
  const [mode, setMode] = useState<'server' | 'huggingface'>('server');
  const [hfToken, setHfToken] = useState('');
  const [model, setModel] = useState(MODELS[0].value);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Thread[]>(() => {
    try {
      const raw = localStorage.getItem('gptoss_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const sendBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.title = 'GPT-OSS Portal | Legal AI Chat';
    const meta = document.querySelector('meta[name="description"]');
    const desc = 'Chat with open-source GPT models via secure server or direct HF token.';
    if (meta) meta.setAttribute('content', desc);
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [...history].reverse();
    return [...history]
      .reverse()
      .filter(t => t.question.toLowerCase().includes(term) || t.answer.toLowerCase().includes(term));
  }, [history, search]);

  const onSend = async () => {
    setError(null);
    if (!query.trim()) {
      setError('נא להזין שאלה.');
      return;
    }
    if (mode === 'huggingface' && !hfToken.trim()) {
      setError('הדבק/י טוקן Hugging Face או עבר/י למצב שרת.');
      return;
    }
    setLoading(true);
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful legal assistant.' },
        { role: 'user', content: query.trim() },
      ];

      const resp = await chat({
        // In server mode, call via Supabase (provider undefined). In direct mode, call HF Router.
        provider: mode === 'server' ? undefined : 'huggingface',
        model,
        messages,
        max_tokens: 1024,
        temperature: mode === 'server' ? 0.3 : 0.7,
        hfToken: mode === 'huggingface' ? hfToken.trim() : undefined,
      });

      const thread: Thread = {
        question: query.trim(),
        answer: sanitize(resp.text),
        timestamp: new Date().toLocaleString('he-IL'),
      };
      const next = [...history, thread];
      setHistory(next);
      localStorage.setItem('gptoss_history', JSON.stringify(next));
      setQuery('');
    } catch (e: any) {
      setError(e?.message || 'שגיאה לא ידועה');
    } finally {
      setLoading(false);
      sendBtnRef.current?.focus();
    }
  };

  const clearHistory = () => {
    if (confirm('למחוק היסטוריה?')) {
      setHistory([]);
      localStorage.removeItem('gptoss_history');
    }
  };

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-center">GPT-OSS Portal</h1>
      </header>

      <main className="space-y-4">
        <Card>
          <CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-medium">מצב</label>
                <select
                  className="border rounded p-2 w-full"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                >
                  <option value="server">Server (Supabase Edge)</option>
                  <option value="huggingface">Direct (HF Router + Token)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">מודל</label>
                <select
                  className="border rounded p-2 w-full"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {mode === 'huggingface' && (
              <div className="space-y-2 mb-4">
                <label className="font-medium">Hugging Face Token (לא נשמר)</label>
                <Input
                  type="password"
                  placeholder="Paste HF token…"
                  value={hfToken}
                  onChange={(e) => setHfToken(e.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="font-medium">Prompt</label>
              <textarea
                className="border rounded p-2 w-full min-h-[120px]"
                placeholder="Ask anything…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button ref={sendBtnRef} onClick={onSend} disabled={loading}>
                {loading ? 'טוען…' : 'שליחה'}
              </Button>
              {error && <div className="text-destructive text-sm mt-1">{error}</div>}
            </div>
          </CardContent>
        </Card>

        <section aria-label="Search and history">
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder="חיפוש בהיסטוריה…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={clearHistory}>ניקוי</Button>
          </div>

          <div className="space-y-2">
            {filtered.map((t, idx) => (
              <details key={idx} className="border rounded">
                <summary className="cursor-pointer px-3 py-2 bg-muted flex justify-between">
                  <span className="font-medium">{t.timestamp}</span>
                  <span className="truncate max-w-[60%]">{truncate(t.question, 60)}</span>
                </summary>
                <div className="px-3 py-2">
                  <div className="whitespace-pre-wrap"><b>Question:</b> {t.question}</div>
                  <div className="whitespace-pre-wrap mt-1"><b>Answer:</b> {t.answer}</div>
                </div>
              </details>
            ))}
            {filtered.length === 0 && <div className="text-sm text-muted-foreground">אין תוצאות.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}

function sanitize(s: string) {
  return s.replace(/\*/g, '');
}
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
