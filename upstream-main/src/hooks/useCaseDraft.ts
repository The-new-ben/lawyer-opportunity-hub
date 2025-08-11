// useCaseDraft.ts
// Centralized case draft shared via localStorage + broadcast events
import { useEffect, useState } from "react";

export type Party = { role: string; name: string; email?: string; phone?: string };
export type Evidence = { title: string; url?: string; notes?: string; category?: string };

export type CaseDraft = {
  title?: string;
  summary?: string;
  jurisdiction?: string;
  category?: string;
  goal?: string;
  parties?: Party[];
  evidence?: Evidence[];
  startDate?: string; // ISO string
  hearingTitle?: string;
  timezone?: string;
};

const STORAGE_KEY = "caseDraft";

export function readCaseDraft(): CaseDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CaseDraft) : {};
  } catch {
    return {};
  }
}

export function writeCaseDraft(draft: CaseDraft) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  window.dispatchEvent(new CustomEvent("caseDraftUpdated", { detail: draft }));
}

export function mergeCaseDraft(patch: Partial<CaseDraft>) {
  const current = readCaseDraft();
  const next = { ...current, ...patch } as CaseDraft;
  writeCaseDraft(next);
  return next;
}

export function useCaseDraft() {
  const [draft, setDraft] = useState<CaseDraft>(() => readCaseDraft());

  useEffect(() => {
    const onUpdate = (e: Event) => {
      // @ts-ignore detail exists
      const next = (e as CustomEvent).detail as CaseDraft | undefined;
      setDraft(next ?? readCaseDraft());
    };
    window.addEventListener("caseDraftUpdated", onUpdate);
    return () => window.removeEventListener("caseDraftUpdated", onUpdate);
  }, []);

  const update = (patch: Partial<CaseDraft>) => setDraft(mergeCaseDraft(patch));
  const reset = () => writeCaseDraft({});

  return { draft, update, reset } as const;
}
