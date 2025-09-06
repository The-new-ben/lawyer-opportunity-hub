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
    
    // AI Intake translations
    caseTitle: 'I see you\'re starting to build a case. What would you like to call this case? (e.g., "Breach of contract case against XYZ Company")',
    caseJurisdiction: 'Which court would you like to file this case in? (e.g., Tel Aviv District Court, Rabbinical Court, etc.)',
    caseCategory: 'What type of legal case is this? (e.g., contracts, torts, family, employment, criminal)',
    contractDetails: 'Since this is a contract case, can you tell me about the contract - when was it signed, what are the main terms that were breached?',
    employmentDetails: 'I understand this is related to employment. Can you tell me what the situation is - termination? Salary issues? Harassment?',
    caseParties: 'Who are the parties involved in this case? (e.g., Me vs. ABC Company Ltd.)',
    caseTimeline: 'When did the event occur? Can you give me a timeline of the main events?',
    
    // Smart questions
    aiGreeting: 'I\'m here to help you build the strongest possible case. Tell me more details.',
    aiContinue: 'Let\'s continue building your case. What else is important for me to know?',
    aiAnalyzing: 'I\'m recording and analyzing all the information. Keep telling me about the situation.',
    aiInterested: 'This sounds interesting. I need more details to help you best.',
    
    // Command responses
    commandUpdated: 'Great! I updated {count} fields: {fields}.',
    commandUnderstood: 'I understood exactly what you wanted! Updated: {fields}.',
    commandExecuted: 'I executed the updates: {fields}.',
    commandHowElse: 'How else can I help?',
    
    // Case type responses
    contractCase: 'I see this is a breach of contract case. I\'ll prepare special fields for this type of case.',
    employmentCase: 'This sounds like an employment case. I\'ll add relevant fields for employment law.',
    tortCase: 'It looks like this is a tort case. I\'ll prepare fields tailored for this type of case.',
    familyCase: 'This is a family case. I\'ll add relevant fields for family law.',
    criminalCase: 'This looks like a criminal case. I\'ll prepare special fields for criminal law.',
    propertyCase: 'This is related to real estate. I\'ll add relevant fields for real estate.',
    
    // Progress messages
    progressReady: 'Case is ready for filing! 🎉',
    progressAlmostDone: 'Case is almost ready - just one more detail 🔥',
    progressOnTrack: 'We\'re on the right track! 📈',
    progressContinue: 'Let\'s continue building 🏗️',
    progressStarted: 'We\'ve just started - we have a lot of work 🚀',
    
    // Action labels
    completeBasicInfo: 'Complete basic information',
    completeBasicInfoDesc: 'Let\'s complete the essential fields for the case',
    addEvidence: 'Add evidence',
    addEvidenceDesc: 'Upload supporting documents and images',
    findLawyer: 'Find specialist lawyer',
    findLawyerDesc: 'Specialists in {caseType} in your area',
    scheduleConsultation: 'Schedule consultation',
    scheduleConsultationDesc: 'Initial consultation with legal expert',
    generateDocuments: 'Prepare documents',
    generateDocumentsDesc: 'Automatic generation of pleading draft',
    breachAnalysis: 'Contract breach analysis',
    breachAnalysisDesc: 'In-depth legal examination of the breach',
    laborRights: 'Check employee rights',
    laborRightsDesc: 'Ensure all rights are in place',
    inviteParties: 'Invite additional parties',
    invitePartiesDesc: 'Invite the other party or witnesses to the process',
    registerAccount: 'Register for full tracking',
    registerAccountDesc: 'Manage the case with advanced tools',
    
    // Categories
    legalActions: 'Legal Actions',
    professionalExperts: 'Experts & Consultation',
    procedures: 'Procedures',
    system: 'System',
    
    // Progress indicators
    progressMessage90: '🎉 Case is ready! Let\'s proceed to the next steps',
    progressMessage70: '🔥 Almost finished! Just a few more details',
    progressMessage50: '📈 We\'re halfway there',
    progressMessage30: '🏗️ Continuing to build the case',
    progressMessage0: '🚀 Let\'s start building your case',
    
    // Other UI elements
    urgent: 'Urgent',
    requiresRegistration: '🔒 Registration required',
    tipText: '💡 Tip: These actions will help you progress with the case',
    totalActionsAvailable: '📊 Total available actions: {count}',
    urgentActions: '⚡ Urgent actions: {count}',
    noActionsAvailable: 'Once we add more information, I\'ll suggest smart actions for you',
    progressStatus: 'Progress: {progress}% • {highPriorityCount} high priority actions',
    
    // Dynamic field labels
    contractDate: 'Contract Date',
    contractType: 'Contract Type',
    breachDetails: 'Breach Details',
    damages: 'Financial Damages',
    employmentStart: 'Employment Start',
    employmentEnd: 'Employment End',
    position: 'Position',
    issueType: 'Issue Type',
    salary: 'Monthly Salary',
    incidentDate: 'Incident Date',
    incidentLocation: 'Incident Location',
    injuryType: 'Injury Type',
    medicalTreatment: 'Medical Treatment',
    witnesses: 'Witnesses',
    marriageDate: 'Marriage Date',
    children: 'Children',
    assets: 'Assets',
    familyIssue: 'Family Issue',
    
    // Case type translations
    contracts: 'Contracts',
    employment: 'Employment Law',
    torts: 'Torts',
    family: 'Family Law',
    criminal: 'Criminal Law',
    property: 'Real Estate Law',
    general: 'General Field'
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
    
    // AI Intake translations
    caseTitle: 'אני רואה שאתה מתחיל לבנות תיק. איך תרצה לקרוא לתיק הזה? (למשל: "תיק הפרת חוזה מול חברת XYZ")',
    caseJurisdiction: 'באיזה בית משפט תרצה להגיש את התיק? (למשל: בית משפט השלום תל אביב, בית דין רבני, וכו\')',
    caseCategory: 'איזה סוג תיק משפטי זה? (למשל: חוזים, נזיקין, משפחה, עבודה, פלילי)',
    contractDetails: 'כיוון שזה תיק חוזה, תוכל לספר לי על החוזה - מתי נחתם, מה התנאים העיקריים שהופרו?',
    employmentDetails: 'ברור שזה קשור לעבודה. תוכל לספר מה המצב - פיטורין? בעיות שכר? הטרדה?',
    caseParties: 'מי הצדדים המעורבים בתיק? (למשל: אני נגד חברת ABC בע"מ)',
    caseTimeline: 'מתי התרחש האירוע? תוכל לתת לי ציר זמן של האירועים העיקריים?',
    
    // Smart questions
    aiGreeting: 'אני כאן לעזור לך לבנות את התיק הכי חזק שאפשר. ספר לי עוד פרטים.',
    aiContinue: 'ממשיכים לבנות את התיק שלך. מה עוד חשוב שאדע?',
    aiAnalyzing: 'אני רושם ומנתח את כל המידע. תמשיך לספר לי על המצב.',
    aiInterested: 'זה נשמע מעניין. אני צריך עוד פרטים כדי לעזור לך הכי טוב.',
    
    // Command responses
    commandUpdated: 'מעולה! עדכנתי {count} שדות: {fields}.',
    commandUnderstood: 'הבנתי בדיוק מה שרצית! עדכנתי: {fields}.',
    commandExecuted: 'ביצעתי את העדכונים: {fields}.',
    commandHowElse: 'איך אוכל לעזור עוד?',
    
    // Case type responses
    contractCase: 'אני רואה שזה תיק הפרת חוזה. אני אכין עבורך שדות מיוחדים לסוג תיק הזה.',
    employmentCase: 'זה נשמע כמו תיק עבודה. אני אוסיף שדות רלוונטיים לתחום העבודה.',
    tortCase: 'נראה שזה תיק נזיקין. אני אכין שדות מותאמים לסוג תיק הזה.',
    familyCase: 'זה תיק משפחה. אני אוסיף שדות רלוונטיים לדיני משפחה.',
    criminalCase: 'זה נראה כמו תיק פלילי. אני אכין שדות מיוחדים לתחום הפלילי.',
    propertyCase: 'זה קשור לנדלן. אני אוסיף שדות רלוונטיים לעולם הנדלן.',
    
    // Progress messages
    progressReady: 'התיק מוכן להגשה! 🎉',
    progressAlmostDone: 'התיק כמעט מוכן - עוד פרט קטן 🔥',
    progressOnTrack: 'אנחנו בדרך הנכונה! 📈',
    progressContinue: 'בואנו נמשיך לבנות 🏗️',
    progressStarted: 'רק התחלנו - יש לנו הרבה עבודה 🚀',
    
    // Action labels
    completeBasicInfo: 'השלם מידע בסיסי',
    completeBasicInfoDesc: 'בואנו נשלים את השדות החיוניים לתיק',
    addEvidence: 'הוסף ראיות',
    addEvidenceDesc: 'עלה מסמכים ותמונות תומכות',
    findLawyer: 'מצא עורך דין מומחה',
    findLawyerDesc: 'מומחים ל{caseType} באזור שלך',
    scheduleConsultation: 'קבע ייעוץ',
    scheduleConsultationDesc: 'ייעוץ ראשוני עם מומחה משפטי',
    generateDocuments: 'הכן מסמכים',
    generateDocumentsDesc: 'יצירה אוטומטית של טיוטת כתב טענות',
    breachAnalysis: 'ניתוח הפרת החוזה',
    breachAnalysisDesc: 'בדיקה משפטית מעמיקה של ההפרה',
    laborRights: 'בדיקת זכויות עובד',
    laborRightsDesc: 'וידוא שכל הזכויות נמצאות במקום',
    inviteParties: 'זמן צדדים נוספים',
    invitePartiesDesc: 'הזמן את הצד השני או עדים לתהליך',
    registerAccount: 'הירשם למעקב מלא',
    registerAccountDesc: 'נהל את התיק עם כלים מתקדמים',
    
    // Categories
    legalActions: 'פעולות משפטיות',
    professionalExperts: 'מומחים ויעוץ',
    procedures: 'הליכים',
    system: 'מערכת',
    
    // Progress indicators
    progressMessage90: '🎉 התיק מוכן! בואו נתקדם לשלבים הבאים',
    progressMessage70: '🔥 כמעט סיימנו! עוד כמה פרטים',
    progressMessage50: '📈 אנחנו באמצע הדרך',
    progressMessage30: '🏗️ ממשיכים לבנות את התיק',
    progressMessage0: '🚀 בואו נתחיל לבנות את התיק שלך',
    
    // Other UI elements
    urgent: 'דחוף',
    requiresRegistration: '🔒 דרושה הרשמה',
    tipText: '💡 טיפ: פעולות אלו יעזרו לך להתקדם בתיק',
    totalActionsAvailable: '📊 סה״כ פעולות זמינות: {count}',
    urgentActions: '⚡ פעולות דחופות: {count}',
    noActionsAvailable: 'ברגע שנוסיף עוד מידע, אציע לך פעולות חכמות',
    progressStatus: 'התקדמות: {progress}% • {highPriorityCount} פעולות בעדיפות גבוהה',
    
    // Dynamic field labels
    contractDate: 'תאריך החוזה',
    contractType: 'סוג חוזה',
    breachDetails: 'פרטי ההפרה',
    damages: 'נזקים כספיים',
    employmentStart: 'תחילת עבודה',
    employmentEnd: 'סיום עבודה',
    position: 'תפקיד',
    issueType: 'סוג הבעיה',
    salary: 'שכר חודשי',
    incidentDate: 'תאריך האירוע',
    incidentLocation: 'מקום האירוע',
    injuryType: 'סוג הפגיעה',
    medicalTreatment: 'טיפול רפואי',
    witnesses: 'עדים',
    marriageDate: 'תאריך נישואין',
    children: 'ילדים',
    assets: 'נכסים',
    familyIssue: 'סוג הבעיה',
    
    // Case type translations
    contracts: 'חוזים',
    employment: 'דיני עבודה',
    torts: 'נזיקין',
    family: 'דיני משפחה',
    criminal: 'דין פלילי',
    property: 'דיני נדלן',
    general: 'תחום כללי'
  },
};

export const t = (lang: Lang, key: keyof typeof translations['en'] | string) => {
  const dict = translations[lang] || translations.en;
  return (dict as any)[key] ?? key;
};
