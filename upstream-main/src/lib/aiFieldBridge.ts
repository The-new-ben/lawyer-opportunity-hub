import { useForm } from 'react-hook-form';
import type { AIPatch, FieldDef } from '../aiIntake/patch';

/** מאגר שדות דינמיים – נשמר בזיכרון בלבד */
let dynamicStore: FieldDef[] = [];

/** הוספת שדות דינמיים ללא כפילויות */
export function addDynamicFields(defs: FieldDef[]) {
  const seen = new Set<string>();
  dynamicStore = [...dynamicStore, ...defs].filter(f => {
    if (seen.has(f.path)) return false;
    seen.add(f.path);
    return true;
  });
}

/** אחזור השדות הדינמיים */
export function useDynamicFields(): FieldDef[] {
  return dynamicStore;
}

export type CaseForm = Record<string, any>;

/**
 * hook שמגשר בין ה‑AI ל‑react‑hook‑form:
 * מיישם פאטצ’ים, מדגיש שדות ומדפיס לשדות חדשים.
 */
export function useFormWithAI(defaults: Partial<CaseForm>) {
  const form = useForm<CaseForm>({ defaultValues: defaults });

  /** הדגשה וגלילה לשדה שעודכן */
  function highlightAndScroll(path: string) {
    const el = document.querySelector(`[name="${path}"]`) as HTMLElement | null;
    if (el) {
      el.classList.add('ring', 'ring-blue-400');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => el.classList.remove('ring', 'ring-blue-400'), 2000);
    }
  }

  /** החלת פאטצ’ בודד */
  function applyPatch(p: AIPatch) {
    if (p.op === 'set') {
      form.setValue(p.path as any, p.value, { shouldDirty: true, shouldValidate: true });
      highlightAndScroll(p.path);
    } else if (p.op === 'append') {
      const prev = form.getValues(p.path as any) ?? [];
      form.setValue(p.path as any, [...prev, p.value], { shouldDirty: true, shouldValidate: true });
      highlightAndScroll(p.path);
    } else if (p.op === 'addFields' && p.fields) {
      // הזרקת שדות חדשים
      addDynamicFields(p.fields);
    }
  }

  /** החלת מערך פאטצ’ים */
  function applyPatches(patches: AIPatch[]) {
    patches.forEach(applyPatch);
  }

  return { form, applyPatches };
}
