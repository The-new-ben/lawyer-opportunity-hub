import { useRef, useState, useCallback } from "react";
import { runIntake, IntakeJson } from "./openaiIntakeClient";
import { toast } from "@/components/ui/use-toast";

const SYSTEM_PROMPT = `You are a court intake assistant for a legal-tech app. 
Extract STRUCTURED JSON ONLY (no prose) with keys:
caseTitle, caseSummary, jurisdiction, legalCategory, reliefSought,
parties (array of {role, name?}), evidence (array of strings), timeline,
nextQuestion (one short follow-up question if a critical field is missing),
confidence (object with 0..1 per field).

Rules:
- Ask for missing critical fields via nextQuestion only (one at a time).
- Do NOT provide legal advice or citations.
- Keep values concise. Jurisdiction as "City/State/Country" if known.
- Output valid JSON. Nothing else.
- legalCategory should be one of: civil, criminal, family, labor, corporate, property, tax, immigration, other
- parties roles can be: plaintiff, defendant, employer, employee, landlord, tenant, buyer, seller, other`;

export type FieldState = {
  value: string;
  status: "approved" | "pending" | "missing";
  confidence: number
  dirty?: boolean
};

export function useAIAssistedIntake() {
  const [aiFields, setAiFields] = useState<Record<string, FieldState>>({});
  const [nextQuestion, setNextQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const makeState = useCallback((value?: string, confidence?: number): FieldState => {
    if (!value) return { value: "", status: "missing", confidence: 0 };
    const conf = confidence ?? 0.6;
    const status = conf >= 0.8 ? "approved" : conf >= 0.5 ? "pending" : "missing";
    return { value, status, confidence: conf };
  }, []);

  const addDynamicField = useCallback((key: string, value?: string, confidence?: number) => {
    setAiFields(prev => {
      if (prev[key]?.dirty) return prev;
      return { ...prev, [key]: makeState(value, confidence) };
    });
  }, [makeState]);

  const updateFromJson = useCallback((json: IntakeJson) => {
    const baseFields: Record<string, FieldState> = {
      caseTitle: makeState(json.caseTitle, json.confidence?.caseTitle),
      caseSummary: makeState(json.caseSummary, json.confidence?.caseSummary),
      jurisdiction: makeState(json.jurisdiction, json.confidence?.jurisdiction),
      legalCategory: makeState(json.legalCategory, json.confidence?.legalCategory),
      reliefSought: makeState(json.reliefSought, json.confidence?.reliefSought),
      parties: makeState(
        json.parties?.map(p => `${p.role}:${p.name ?? ""}`).join("; "),
        json.confidence?.parties
      ),
      evidence: makeState(json.evidence?.join(", "), json.confidence?.evidence),
      timeline: makeState(json.timeline, json.confidence?.timeline),
    };
    setAiFields(prev => {
      const merged = { ...prev };
      Object.entries(baseFields).forEach(([k, v]) => {
        if (!prev[k]?.dirty) merged[k] = v;
      });
      return merged;
    });
    if (json.additionalFields) {
      Object.entries(json.additionalFields).forEach(([k, v]) => {
        if (typeof v === "string") addDynamicField(k, v);
        else addDynamicField(k, v.value, v.confidence);
      });
    }
    setNextQuestion(json.nextQuestion ?? null);
    const approvedFields = Object.entries(baseFields)
      .filter(([_, field]) => field.status === "approved" && field.value)
      .length;
    if (approvedFields > 0) {
      toast({
        title: "AI Analysis Complete",
        description: `${approvedFields} fields identified with high confidence`,
      });
    }
  }, [addDynamicField, makeState]);

  const onUserInput = useCallback(async (text: string) => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    
    if (!text.trim()) return;

    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const messages = [
          { role: "system" as const, content: SYSTEM_PROMPT },
          { role: "user" as const, content: text },
        ];
        
        const result = await runIntake(messages);
        updateFromJson(result);
        
      } catch (error) {
        console.error('AI intake error:', error);
        toast({
          title: "AI Analysis Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce של חצי שנייה
  }, [updateFromJson]);

  const approveField = useCallback((key: string) => {
    setAiFields(state => {
      if (!state[key]) return state;
      return {
        ...state,
        [key]: { ...state[key], status: "approved" }
      };
    });
  }, []);

  const editField = useCallback((key: string, value: string) => {
    setAiFields(state => ({
      ...state,
      [key]: { value, status: "approved", confidence: 1.0, dirty: true }
    }));
  }, []);

  const resetFields = useCallback(() => {
    setAiFields({});
    setNextQuestion(null);
  }, []);

  return { 
    aiFields, 
    nextQuestion, 
    loading, 
    onUserInput, 
    approveField, 
    editField,
    resetFields
  };
}