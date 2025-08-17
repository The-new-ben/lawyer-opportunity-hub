import { useForm } from 'react-hook-form';
import type { AIPatch, FieldDef } from './patch';

export function useFormWithAI(defaults: Partial<Record<string, any>>) {
  const form = useForm({ defaultValues: defaults });

  function applyPatch(p: AIPatch) {
    if (p.op === 'set') {
      // החלת ערך ללא בדיקת confidence או רישום מראש
      form.setValue(p.path as any, p.value, { shouldDirty: true, shouldValidate: true });
      // גלילה לשדה המעודכן – אם קיים אלמנט בשם מתאים
      const el = document.querySelector(`[name="${p.path}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (p.op === 'addFields') {
      // אם AI מזריק שדות חדשים – הוסף אותם למאגר הדינמי
      addDynamicFields(p.fields);
    }
    // טיפול ב־append וכו'… לפי הצורך
  }

  function applyPatches(patches: AIPatch[]) {
    patches.forEach(applyPatch);
  }

  return { form, applyPatches };
}
