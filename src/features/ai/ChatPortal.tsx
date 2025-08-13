// src/features/ai/ChatPortal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '@/services/gptClient';
import { chat } from '@/services/gptClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HtmlPortalEmbed from './HtmlPortalEmbed';
import { detectLanguage, t, localeFor, dirFor, type Lang } from './i18n';

// Models (include both server/HF and OpenAI)
const MODELS = [
  { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B (Server)' },
  { value: 'mistralai/mixtral-8x7b-instruct', label: 'Mixtral 8x7B (Server)' },
  { value: 'qwen/qwen2.5-72b-instruct', label: 'Qwen2.5 72B (Server)' },
  { value: 'openai/gpt-oss-20b:fireworks-ai', label: 'gpt-oss-20b (HF Router)' },
  { value: 'openai/gpt-oss-120b:cerebras', label: 'gpt-oss-120b (HF Router)' },
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini (OpenAI)' },
  { value: 'gpt-4.1-2025-04-14', label: 'gpt-4.1 (OpenAI)' },
];

type Thread = { question: string; answer: string; timestamp: string };

export default function ChatPortal() {
  const [lang] = useState<Lang>(() => detectLanguage());
  const [mode, setMode] = useState<'server' | 'huggingface' | 'openai'>('openai');
  const [hfToken, setHfToken] = useState('');
  const [model, setModel] = useState('gpt-4.1-2025-04-14');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Thread[]>(() => {
    try {
      const raw = localStorage.getItem('gptoss_history');
      const existing = raw ? JSON.parse(raw) : [];
      
      // Add welcome message if history is empty
      if (existing.length === 0) {
        return [{
          question: '',
          answer: lang === 'he' ? 
            `ברוכים הבאים למערכת המשפט החכמה שלנו! 🏛️

אני כאן לעזור לכם להבין את המערכת המשפטית ולהכין תיק משפטי מובנה.

**איך המערכת עובדת:**
• אני אוסף מידע על התיק שלכם בשיחה טבעית
• מנתח את הפרטים ומכין תוכנית משפטית מובנית
• מציע אפשרויות: סימולציה (תרגול) או הליך אמיתי
• מחבר אתכם לאנשי מקצוע מתאימים לפי הצורך

**רקע משפטי חשוב:**
המערכת המשפטית מבוססת על עקרונות של צדק, שקיפות והליך הוגן. כל תיק דורש הכנה יסודית של ראיות, טיעונים משפטיים ותכנון אסטרטגי.

**בואו נתחיל:**
ספרו לי על המצב המשפטי שלכם - מה קרה ומה אתם מחפשים להשיג?` :
            `Welcome to our Smart Legal System! 🏛️

I'm here to help you understand the legal system and prepare a structured legal case.

**How the system works:**
• I collect information about your case through natural conversation
• Analyze the details and prepare a structured legal plan  
• Offer options: simulation (practice) or real proceedings
• Connect you to appropriate professionals as needed

**Important legal background:**
The legal system is based on principles of justice, transparency and due process. Every case requires thorough preparation of evidence, legal arguments and strategic planning.

**Let's begin:**
Tell me about your legal situation - what happened and what are you looking to achieve?`,
          timestamp: new Date().toLocaleString(localeFor(lang))
        }];
      }
      return existing;
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const sendBtnRef = useRef<HTMLButtonElement>(null);

  // Limit models by mode to avoid invalid selections
  const modelsForMode = useMemo(() => {
    if (mode === 'openai') return MODELS.filter(m => m.label.includes('(OpenAI)') || m.value.startsWith('gpt'));
    if (mode === 'huggingface') return MODELS.filter(m => m.label.includes('(HF Router)'));
    return MODELS.filter(m => m.label.includes('(Server)'));
  }, [mode]);

  useEffect(() => {
    // Ensure selected model is valid for the current mode
    if (!modelsForMode.some(m => m.value === model)) {
      const fallback = modelsForMode[0]?.value;
      if (fallback) setModel(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    document.title = `${t(lang, 'title')} | Legal AI Chat`;
    const meta = document.querySelector('meta[name="description"]');
    const desc = t(lang, 'metaDesc');
    if (meta) meta.setAttribute('content', desc);
    else {
      const m = document.createElement('meta');
      (m as any).name = 'description';
      (m as any).content = desc;
      document.head.appendChild(m);
    }
  }, [lang]);

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
      setError(t(lang, 'errorEnterQuestion'));
      return;
    }
    if (mode === 'huggingface' && !hfToken.trim()) {
      setError(t(lang, 'errorNeedToken'));
      return;
    }
    setLoading(true);
    try {
      const messages: ChatMessage[] = [
        { 
          role: 'system', 
          content: lang === 'he' ? 
            'אתה עוזר משפטי מקצועי העוזר למשתמשים להבין את המערכת המשפטית, לאסוף מידע לתיקים משפטיים ולהכין אסטרטגיות. השב בעברית בצורה ברורה ומקצועית. כלול המלצות מעשיות ושאל שאלות מבהירות לאיסוף מידע מלא.' :
            'You are a professional legal assistant helping users understand the legal system, collect information for legal cases, and prepare strategies. Respond clearly and professionally. Include practical recommendations and ask clarifying questions to collect complete information.'
        },
        { role: 'user', content: query.trim() },
      ];

      const resp = await chat({
        provider: 'openai',
        model,
        messages,
        max_tokens: 1024,
        temperature: 0.7
      });

      const thread: Thread = {
        question: query.trim(),
        answer: sanitize(resp.text),
        timestamp: new Date().toLocaleString(localeFor(lang)),
      };
      const next = [...history, thread];
      setHistory(next);
      localStorage.setItem('gptoss_history', JSON.stringify(next));
      setQuery('');
    } catch (e: any) {
      setError(e?.message || t(lang, 'unknownError'));
    } finally {
      setLoading(false);
      sendBtnRef.current?.focus();
    }
  };

  const clearHistory = () => {
    if (confirm(t(lang, 'confirmClear'))) {
      setHistory([]);
      localStorage.removeItem('gptoss_history');
    }
  };

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4" dir={dirFor(lang)}>
      <header>
        <h1 className="text-xl font-semibold text-center">{t(lang, 'title')}</h1>
      </header>

      {/* Legacy HTML portal embedded for testing */}
      <section aria-label="Legacy HTML Portal" className="mb-4">
        <HtmlPortalEmbed />
      </section>

      <main className="space-y-4">
        <Card>
          <CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-medium">{t(lang, 'modeLabel')}</label>
                <select
                  className="border rounded p-2 w-full"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                >
                  <option value="server">Server (Supabase Edge)</option>
                  <option value="huggingface">Direct (HF Router + Token)</option>
                  <option value="openai">OpenAI (Supabase Edge)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">{t(lang, 'modelLabel')}</label>
                <select
                  className="border rounded p-2 w-full"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {modelsForMode.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {mode === 'huggingface' && (
              <div className="space-y-2 mb-4">
                <label className="font-medium">{t(lang, 'hfTokenLabel')}</label>
                <Input
                  type="password"
                  placeholder={t(lang, 'hfTokenPlaceholder')}
                  value={hfToken}
                  onChange={(e) => setHfToken(e.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="font-medium">{t(lang, 'promptLabel')}</label>
              <textarea
                className="border rounded p-2 w-full min-h-[120px]"
                placeholder={t(lang, 'promptPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button ref={sendBtnRef} onClick={onSend} disabled={loading}>
                {loading ? t(lang, 'sending') : t(lang, 'send')}
              </Button>
              {error && <div className="text-destructive text-sm mt-1">{error}</div>}
            </div>
          </CardContent>
        </Card>

        <section aria-label="Search and history">
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder={t(lang, 'searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={clearHistory}>{t(lang, 'clear')}</Button>
          </div>

          <div className="space-y-2">
            {filtered.map((thread, idx) => (
              <details key={idx} className={`border rounded ${!thread.question ? 'border-primary/30 bg-primary/5' : ''}`}>
                <summary className="cursor-pointer px-3 py-2 bg-muted flex justify-between">
                  <span className="font-medium">{thread.timestamp}</span>
                  <span className="truncate max-w-[60%]">
                    {thread.question ? truncate(thread.question, 60) : (lang === 'he' ? '💬 הודעת מערכת' : '💬 System Message')}
                  </span>
                </summary>
                <div className="px-3 py-2">
                  {thread.question && (
                    <div className="whitespace-pre-wrap"><b>{t(lang, 'question')}</b> {thread.question}</div>
                  )}
                  <div className="whitespace-pre-wrap mt-1">
                    {thread.question && <b>{t(lang, 'answer')}</b>} {thread.answer}
                  </div>
                  {thread.question && (
                    <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                      <Button size="sm" variant="default" className="text-xs">
                        {lang === 'he' ? '🎭 התחל סימולציה' : '🎭 Start Simulation'}
                      </Button>
                      <Button size="sm" variant="secondary" className="text-xs">
                        {lang === 'he' ? '⚖️ הליך אמיתי' : '⚖️ Real Proceeding'}
                      </Button>
                    </div>
                  )}
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
