import { useForm } from 'react-hook-form';
import type { AIPatch, FieldDef } from './patch';
import { ScenarioFieldRegistry } from../lib/scenarioFields;

export type CaseForm = Record<string, any>;

/**
 * Hook that bridges between AI patches and react-hook-form.
 * It applies patch operations, highlights updated fields and scrolls to them.
 */
export function useFormWithAI(defaults: Partial<CaseForm>) {
  const form = useForm<CaseForm>({ defaultValues: defaults });

  function applyPatch(p: AIPatch) {
    if (p.op === 'set') {
      // Set a value on the form
      form.setValue(p.path as any, p.value, { shouldDirty: true, shouldValidate: true });
      // Highlight and scroll to the updated field
      const el = document.querySelector(`[name="${p.path}"]`) as HTMLElement | null;
      if (el) {
        el.classList.add('ring', 'ring-blue-400');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.classList.remove('ring', 'ring-blue-400'), 2000);
      }
    }
    if (p.op === 'append') {
      // Append to an array field
      const prev = form.getValues(p.path as any) ?? [];
      form.setValue(p.path as any, [...prev, p.value], { shouldDirty: true, shouldValidate: true });
      const el = document.querySelector(`[name="${p.path}"]`) as HTMLElement | null;
      if (el) {
        el.classList.add('ring', 'ring-blue-400');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.classList.remove('ring', 'ring-blue-400'), 2000);
      }
    }
    if (p.op === 'addFields') {
      // Inject new dynamic fields
      const defs =
        (p as any).fields?.length && Array.isArray((p as any).fields)
          ? (p as any).fields
          : ScenarioFieldRegistry[(p as any).scenario] || [];
      addDynamicFields(defs);
    }
  }

  function applyPatches(patches: AIPatch[]) {
    patches.forEach(applyPatch);
  }

  return { form, applyPatches };
}

// Minimal dynamic-fields store (state or context)
let dynamicStore: FieldDef[] = [];

/** Add new field definitions and dedupe by path */
export function addDynamicFields(defs: FieldDef[]) {
  dynamicStore = dedupeByPath([...dynamicStore, ...defs]);
}

/** Dedupe fields by their path */
function dedupeByPath(xs: FieldDef[]) {
  const seen = new Set<string>();
  return xs.filter(f => {
    if (seen.has(f.path)) return false;
    seen.add(f.path);
    return true;
  });
}

/** Hook to access the current list of dynamic fields */
export function useDynamicFields(): FieldDef[] {
  return dynamicStore;
}
