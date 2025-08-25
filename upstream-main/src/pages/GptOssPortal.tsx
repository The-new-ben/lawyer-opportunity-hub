import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Simple helpers (kept local to avoid XSS when using innerHTML)
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function highlight(term: string, htmlText: string): string {
  if (!term) return htmlText;
  const regex = new RegExp(term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");
  return htmlText.replace(regex, (match) => `<mark>${match}</mark>`);
}

function sanitizeAnswer(text: string): string {
  // Keep behavior from the provided portal: remove asterisks
  return text.replace(/\*/g, "");
}

interface ThreadItem {
  question: string;
  answer: string;
  timestamp: string;
}

const STORAGE_KEY = "gptoss_history";
const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";

const MODEL_OPTIONS = [
  { value: "openai/gpt-oss-120b:cerebras", label: "gpt-oss-120b" }, // default stronger
  { value: "openai/gpt-oss-20b:fireworks-ai", label: "gpt-oss-20b" },
];

const GptOssPortal: React.FC = () => {
  // Token is kept only in memory (not persisted), matching the original portal behavior
  const [hfToken, setHfToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState<string>("");

  const [model, setModel] = useState<string>(MODEL_OPTIONS[0].value);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [threads, setThreads] = useState<ThreadItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ThreadItem[]) : [];
    } catch {
      return [];
    }
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "GPT-OSS Portal – Jus-tice";
  }, []);

  const filteredThreads = useMemo(() => {
    if (!search.trim()) return [...threads].reverse();
    const term = search.trim().toLowerCase();
    return [...threads]
      .filter((t) => t.question.toLowerCase().includes(term) || t.answer.toLowerCase().includes(term))
      .reverse();
  }, [threads, search]);

  const saveToken = () => {
    const token = tokenInput.trim();
    if (token) {
      setHfToken(token);
      setTokenInput(""); // clear visible field
    }
  };

  const addThread = (question: string, answer: string) => {
    const sanitizedAnswer = sanitizeAnswer(answer);
    const timestamp = new Date().toLocaleString("he-IL");
    const updated: ThreadItem[] = [...threads, { question, answer: sanitizedAnswer, timestamp }];
    setThreads(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { }
  };

  const clearHistory = () => {
    if (confirm("האם למחוק את כל ההיסטוריה?")) {
      setThreads([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch { }
    }
  };

  const send = async () => {
    try {
      if (!hfToken && tokenInput.trim()) {
        saveToken();
      }
      if (!hfToken && !tokenInput.trim()) {
        setError("יש להזין טוקן של Hugging Face.");
        return;
      }
      const effectiveToken = hfToken ?? tokenInput.trim();
      const q = prompt.trim();
      if (!q) {
        setError("יש להזין שאילתה.");
        return;
      }
      setError("");
      setLoading(true);

      const payload = {
        model,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: q },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      };

      const res = await fetch(HF_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`שגיאה מהשרת: ${res.status}\n${text}`);
      }

      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content as string | undefined;
      if (!answer) throw new Error("לא התקבלה תשובה.");

      addThread(q, answer);
      setPrompt("");
      if (!hfToken) {
        setHfToken(effectiveToken);
        setTokenInput("");
      }
    } catch (e: any) {
      setError(e?.message || "אירעה שגיאה לא צפויה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main ref={containerRef} dir="rtl" className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">פורטאל שאלות ותשובות GPT-OSS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            הכנס/י את טוקן Hugging Face שלך (מוסתר) כדי לאפשר גישה למודלים. הטוקן נשמר בזיכרון ולא נשמר מקומית.
          </p>

          <div className="grid gap-3">
            <label className="text-sm font-medium">HF Token</label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="הדבק/י כאן את ה-HF token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                autoComplete="off"
              />
              <Button variant="secondary" onClick={saveToken}>שמור</Button>
            </div>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">בחירת מודל</label>
            <select
              className="border border-input bg-background rounded-md px-3 py-2 text-sm"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">שאילתה</label>
            <Textarea
              placeholder="כתוב/י כאן שאלה מורכבת"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {error && <div className="text-destructive text-sm font-medium">{error}</div>}

          <div>
            <Button onClick={send} disabled={loading}>
              {loading ? "טוען..." : "שלח"}
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Input
              placeholder="חיפוש בשיחות..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={clearHistory}>
              נקה היסטוריה
            </Button>
          </div>

          <div className="mt-2 space-y-3">
            {filteredThreads.map((t, idx) => (
              <details key={idx} className="rounded-md border border-input">
                <summary className="cursor-pointer px-3 py-2 bg-muted flex items-center justify-between">
                  <span>{t.timestamp}</span>
                  <span dir="ltr" className="text-xs text-muted-foreground">
                    {t.question.length > 40 ? `${t.question.slice(0, 40)}…` : t.question}
                  </span>
                </summary>
                <div className="px-3 py-3 space-y-2">
                  <div className="text-sm">
                    <strong>שאלה:</strong>{" "}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlight(search.trim(), escapeHtml(t.question)),
                      }}
                    />
                  </div>
                  <div className="text-sm">
                    <strong>תשובה:</strong>{" "}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlight(search.trim(), escapeHtml(t.answer)),
                      }}
                    />
                  </div>
                </div>
              </details>
            ))}
            {!filteredThreads.length && (
              <div className="text-sm text-muted-foreground">אין שיחות להצגה.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default GptOssPortal;
