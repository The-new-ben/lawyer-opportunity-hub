// src/features/ai/i18n.ts
export type Lang = 'en' | 'he';

export const detectLanguage = (): Lang => {
  try {
    const nav = navigator?.language || (Array.isArray((navigator as any)?.languages) && (navigator as any).languages[0]);
    const l = String(nav || '').toLowerCase();
    return l.startsWith('he') ? 'he' : 'en';
  } catch {
    return 'en';
  }
};

export const dirFor = (lang: Lang) => (lang === 'he' ? 'rtl' : 'ltr');
export const localeFor = (lang: Lang) => (lang === 'he' ? 'he-IL' : 'en-US');

const translations: Record<Lang, Record<string, string>> = {
  en: {
    title: 'GPT-OSS Portal',
    metaDesc: 'Chat with open-source GPT models via secure server or direct HF token.',
    modeLabel: 'Mode',
    modelLabel: 'Model',
    hfTokenLabel: 'Hugging Face Token (not stored)',
    hfTokenPlaceholder: 'Paste HF token…',
    promptLabel: 'Prompt',
    promptPlaceholder: 'Ask anything…',
    send: 'Send',
    sending: 'Loading…',
    errorEnterQuestion: 'Please enter a question.',
    errorNeedToken: 'Paste a Hugging Face token or switch to Server mode.',
    searchPlaceholder: 'Search history…',
    clear: 'Clear',
    noResults: 'No results.',
    question: 'Question:',
    answer: 'Answer:',
    confirmClear: 'Delete history?',
    unknownError: 'Unknown error',
  },
  he: {
    title: 'GPT-OSS פורטל',
    metaDesc: 'שוחח/י עם מודלי GPT בקוד פתוח דרך שרת מאובטח או טוקן HF ישיר.',
    modeLabel: 'מצב',
    modelLabel: 'מודל',
    hfTokenLabel: 'Hugging Face Token (לא נשמר)',
    hfTokenPlaceholder: 'הדבק/י טוקן HF…',
    promptLabel: 'Prompt',
    promptPlaceholder: 'שאל/י כל דבר…',
    send: 'שליחה',
    sending: 'טוען…',
    errorEnterQuestion: 'נא להזין שאלה.',
    errorNeedToken: 'הדבק/י טוקן Hugging Face או עבר/י למצב שרת.',
    searchPlaceholder: 'חיפוש בהיסטוריה…',
    clear: 'ניקוי',
    noResults: 'אין תוצאות.',
    question: 'שאלה:',
    answer: 'תשובה:',
    confirmClear: 'למחוק היסטוריה?',
    unknownError: 'שגיאה לא ידועה',
  },
};

export const t = (lang: Lang, key: keyof typeof translations['en'] | string) => {
  const dict = translations[lang] || translations.en;
  return (dict as any)[key] ?? key;
};
