import { supabase } from "@/integrations/supabase/client";

export type IntakeJson = {
  caseTitle?: string;
  caseSummary?: string;
  jurisdiction?: string;
  legalCategory?: string;
  reliefSought?: string;
  parties?: { role: string; name?: string }[];
  evidence?: string[];
  timeline?: string;
  nextQuestion?: string;
  confidence?: Record<string, number>;
};

export async function runIntake(messages: {role:"system"|"user"|"assistant";content:string}[]): Promise<IntakeJson> {
  try {
    console.log('Calling AI intake with messages:', messages.length);
    
    const { data, error } = await supabase.functions.invoke("ai-intake-openai", { 
      body: { messages }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`AI intake failed: ${error.message}`);
    }
    
    // אם הפונקציה מחזירה JSON גולמי, ננסה לפרש אותו
    let result: IntakeJson;
    if (typeof data === 'string') {
      try {
        result = JSON.parse(data);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Invalid AI response format');
      }
    } else {
      result = data as IntakeJson;
    }
    
    console.log('AI intake result:', result);
    return result;
    
  } catch (error) {
    console.error('runIntake error:', error);
    throw error;
  }
}