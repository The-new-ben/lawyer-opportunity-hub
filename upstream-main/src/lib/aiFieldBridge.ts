import { useForm } from 'react-hook-form';
import type { AIPatch, FieldDef } from '../aiIntake/patch';

export interface AIFieldPatch {
  path: string;
  value: any;
  confidence: number;
}

export interface AIFieldRegistry {
  [key: string]: {
    type: string;
    label: string;
    description?: string;
    validation?: any;
    options?: Array<{ value: string; label: string; }>;
  };
}

export function useFormWithAI(defaults: Partial<Record<string, any>>) {
  const form = useForm({ defaultValues: defaults });

  function applyPatch(p: AIPatch) {
    if (p.op === 'set') {
      form.setValue(p.path as any, p.value, { shouldDirty: true, shouldValidate: true });
      const el = document.querySelector(`[name="${p.path}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (p.op === 'addFields') {
      // Dynamic fields injection - TODO: Implement
    }
  }

  function applyPatches(patches: AIPatch[]) {
    patches.forEach(applyPatch);
  }

  return { form, applyPatches };
}

export function applyAIPatches(form: any, patches: AIFieldPatch[], registry: AIFieldRegistry) {
  patches.forEach(patch => {
    if (patch.confidence > 0.7) {
      form.setValue(patch.path, patch.value);
    }
  });
}

export function applySingleAIPatch(form: any, path: string, value: any, confidence: number = 1.0) {
  if (confidence > 0.5) {
    form.setValue(path, value);
    return { success: true, message: 'Field updated successfully' };
  }
  return { success: false, message: 'Low confidence, field not updated' };
}