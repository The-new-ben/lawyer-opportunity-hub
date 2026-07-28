import { supabase } from "@/integrations/supabase/client";

export const addCourtReminder = async (payload: { caseId: string; remindAt: string; notes?: string }) => {
  const { data, error } = await supabase.functions.invoke('court-reminder', { body: payload });
  if (error) throw error;
  return data;
};

export const uploadCourtDocument = async (payload: { caseId: string; file: File; description?: string }) => {
  const array = await payload.file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(array)));
  const { data, error } = await supabase.functions.invoke('court-document-upload', {
    body: {
      caseId: payload.caseId,
      fileName: payload.file.name,
      fileContent: base64,
      contentType: payload.file.type,
      description: payload.description
    }
  });
  if (error) throw error;
  return data;
};

export const searchEvidence = async (query: string) => {
  const { data, error } = await supabase.functions.invoke('evidence-search', { body: { query } });
  if (error) throw error;
  return data;
};

export const intakeExtract = async (text: string) => {
  const { data, error } = await supabase.functions.invoke('ai-court-orchestrator', { 
    body: { action: 'intake_extract', context: { text } } 
  });
  if (error) throw error;
  return data;
};

export const transcribeVoice = async (audioBlob: Blob) => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const { data, error } = await supabase.functions.invoke('transcribe-voice', { 
          body: { audio: base64 } 
        });
        if (error) throw error;
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(audioBlob);
  });
};
