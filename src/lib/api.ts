import { supabase } from "@/integrations/supabase/client";

export const api = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
};

export const addCourtReminder = async (payload: { caseId: string; remindAt: string; notes?: string }) => {
  const { data, error } = await supabase.functions.invoke("court-reminder", { body: payload });
  if (error) throw error;
  return data;
};

export const uploadCourtDocument = async (payload: { caseId: string; documentUrl: string; description?: string }) => {
  const { data, error } = await supabase.functions.invoke("court-document-upload", { body: payload });
  if (error) throw error;
  return data;
};
