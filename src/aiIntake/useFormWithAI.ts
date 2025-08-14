import { useForm, UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FIELD_MAP, REQUIRED_FIELDS } from './fieldMap';
import type { IntakeJson } from './openaiIntakeClient';

interface CaseFormData {
  title: string;
  summary: string;
  jurisdiction: string;
  category: string;
  goal: string;
  parties: string;
  evidence: string;
  timeline: string;
}

const defaultValues: CaseFormData = {
  title: '',
  summary: '',
  jurisdiction: '',
  category: '',
  goal: '',
  parties: '',
  evidence: '',
  timeline: ''
};

export function useFormWithAI(caseId: string = 'draft') {
  const { toast } = useToast();
  const form = useForm<CaseFormData>({ defaultValues });
  const { setValue, formState, getValues, trigger } = form;
  
  // Watch all form values for autosave
  const watchedValues = useDebounce(useWatch({ control: form.control }), 1200);

  // Autosave to Supabase
  useEffect(() => {
    const saveData = async () => {
      try {
        const payload = { 
          case_id: caseId, 
          data: watchedValues,
          updated_at: new Date().toISOString()
        };
        
        await supabase
          .from('case_drafts')
          .upsert(payload, { onConflict: 'case_id' });
        
        console.log('Draft saved:', payload);
      } catch (error) {
        console.error('Autosave error:', error);
      }
    };

    if (watchedValues && Object.values(watchedValues).some(v => v?.toString().trim())) {
      saveData();
    }
  }, [watchedValues, caseId]);

  // Apply AI fields to form (respects dirty fields)
  const applyAIToForm = (ai: IntakeJson) => {
    const { dirtyFields } = formState;
    
    const write = (aiKey: keyof IntakeJson, val?: any) => {
      const fieldMap = (FIELD_MAP as any)[aiKey];
      if (!fieldMap || val == null) return;
      
      const formPath = fieldMap.formPath as keyof CaseFormData;
      
      // Don't overwrite if user has manually edited this field
      if (dirtyFields[formPath]) return;
      
      setValue(formPath, val, { 
        shouldDirty: false, 
        shouldTouch: false, 
        shouldValidate: true 
      });
    };

    write('caseTitle', ai.caseTitle);
    write('caseSummary', ai.caseSummary);
    write('jurisdiction', ai.jurisdiction);
    write('legalCategory', ai.legalCategory);
    write('reliefSought', ai.reliefSought);
    write('timeline', ai.timeline);

    // Handle complex field mappings
    if (ai.parties && Array.isArray(ai.parties)) {
      const partiesText = ai.parties
        .map(p => `${p.role}:${p.name ?? ''}`)
        .join('; ');
      write('parties', partiesText);
    }
    
    if (ai.evidence && Array.isArray(ai.evidence)) {
      write('evidence', ai.evidence.join(', '));
    }
  };

  // Apply single field (for one-click apply from chips)
  const applyOneField = (aiKey: string, value: any) => {
    const fieldMap = (FIELD_MAP as any)[aiKey];
    if (!fieldMap) return;
    
    const formPath = fieldMap.formPath as keyof CaseFormData;
    setValue(formPath, value, { 
      shouldDirty: true, 
      shouldTouch: true, 
      shouldValidate: true 
    });
    
    toast({
      title: `✨ ${aiKey} Updated!`,
      description: 'Field applied from AI suggestion',
    });
  };

  // Calculate progress based on required fields
  const calculateProgress = () => {
    const values = getValues();
    const completed = REQUIRED_FIELDS.filter(key => {
      const fieldMap = (FIELD_MAP as any)[key];
      if (!fieldMap) return false;
      
      const formPath = fieldMap.formPath as keyof CaseFormData;
      const value = values[formPath];
      return value && value.toString().trim().length > 0;
    });
    
    return Math.round((completed.length / REQUIRED_FIELDS.length) * 100);
  };

  // Load draft on init
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const { data } = await supabase
          .from('case_drafts')
          .select('data')
          .eq('case_id', caseId)
          .single();
        
        if (data?.data) {
          // Load saved values without marking as dirty
          Object.entries(data.data).forEach(([key, value]) => {
            if (value) {
              setValue(key as keyof CaseFormData, value as string, {
                shouldDirty: false,
                shouldTouch: false
              });
            }
          });
        }
      } catch (error) {
        console.log('No draft found, starting fresh');
      }
    };

    loadDraft();
  }, [caseId, setValue]);

  return {
    form,
    applyAIToForm,
    applyOneField,
    calculateProgress,
    values: getValues()
  };
}