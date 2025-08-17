import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
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

  // Autosave to localStorage (using existing case_drafts structure)
  useEffect(() => {
    const saveData = () => {
      try {
        localStorage.setItem('caseDraft', JSON.stringify(watchedValues));
        console.log('Draft saved to localStorage:', watchedValues);
      } catch (error) {
        console.error('LocalStorage save error:', error);
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

      const el = document.querySelector(`[name="${formPath}"]`) as HTMLElement | null;
      if (el) {
        el.classList.add('ring', 'ring-blue-400');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.classList.remove('ring', 'ring-blue-400'), 2000);
      }
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

  // Load draft on init from localStorage (compatible with existing system)
  useEffect(() => {
    const loadDraft = () => {
      try {
        const saved = localStorage.getItem('caseDraft');
        if (saved) {
          const data = JSON.parse(saved);
          
          // Map existing caseDraft structure to our form fields
          const formData = {
            title: data.title || '',
            summary: data.summary || '',
            jurisdiction: data.jurisdiction || '',
            category: data.category || '',
            goal: data.goal || '',
            parties: Array.isArray(data.parties) 
              ? data.parties.map(p => `${p.role}:${p.name || ''}`).join('; ')
              : (data.parties || ''),
            evidence: Array.isArray(data.evidence) 
              ? data.evidence.map(e => e.title || e).join(', ')
              : (data.evidence || ''),
            timeline: data.timeline || ''
          };
          
          // Load saved values without marking as dirty
          Object.entries(formData).forEach(([key, value]) => {
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