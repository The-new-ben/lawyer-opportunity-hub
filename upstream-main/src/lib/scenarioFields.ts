/**
 * Scenario Field Registry - Dynamic field definitions based on case scenarios
 */

import type { FieldDef } from '../aiIntake/patch';

export const scenarioFieldRegistry: Record<string, Record<string, FieldDef>> = {
  // Personal Injury Cases
  personal_injury: {
    incident_date: {
      path: 'incident_date',
      type: 'date',
      label: 'תאריך האירוע',
      description: 'מתי התרחש האירוע?',
      validation: { required: true }
    },
    incident_location: {
      path: 'incident_location',
      type: 'text',
      label: 'מקום האירוע',
      description: 'היכן התרחש האירוע?',
      validation: { required: true }
    },
    injury_description: {
      path: 'injury_description',
      type: 'textarea',
      label: 'תיאור הפציעה',
      description: 'תאר את הפציעות שנגרמו',
      validation: { required: true, minLength: 10 }
    },
    medical_treatment: {
      path: 'medical_treatment',
      type: 'select',
      label: 'טיפול רפואי',
      description: 'האם קיבלת טיפול רפואי?',
      options: [
        { value: 'emergency', label: 'טיפול חירום' },
        { value: 'hospitalization', label: 'אישפוז' },
        { value: 'outpatient', label: 'טיפול אמבולטורי' },
        { value: 'none', label: 'ללא טיפול' }
      ]
    },
    insurance_involved: {
      path: 'insurance_involved',
      type: 'checkbox',
      label: 'מעורבות ביטוח',
      description: 'האם חברת ביטוח מעורבת?'
    },
    injury_type: {
      path: 'injury_type',
      type: 'select',
      label: 'סוג הפציעה',
      description: 'בחרו את סוג הפציעה',
      options: [
        { value: 'car_accident', label: 'תאונת דרכים' },
        { value: 'slip_and_fall', label: 'נפילה' },
        { value: 'medical_malpractice', label: 'רשלנות רפואית' },
        { value: 'work_accident', label: 'תאונת עבודה' },
        { value: 'other', label: 'אחר' }
      ]
    },
    medical_records: {
      path: 'medical_records',
      type: 'file',
      label: 'תיעוד רפואי',
      description: 'העלאת מסמכים רפואיים'
    },
    witness_info: {
      path: 'witness_info',
      type: 'textarea',
      label: 'פרטי עדים',
      description: 'פרטי עדים שראו את האירוע'
    },
    insurance_details: {
      path: 'insurance_details',
      type: 'textarea',
      label: 'פרטי ביטוח',
      description: 'חברת הביטוח ומספר פוליסה'
    },
    medical_cost: {
      path: 'medical_cost',
      type: 'text',
      label: 'עלות טיפול רפואי',
      description: 'אומדן עלות הטיפול הרפואי'
    }
  },

  // Family Law Cases
  family_law: {
    marriage_date: {
      path: 'marriage_date',
      type: 'date',
      label: 'תאריך נישואין',
      description: 'מתי נישאתם?'
    },
    separation_date: {
      path: 'separation_date',
      type: 'date',
      label: 'תאריך פרידה',
      description: 'מתי נפרדתם?'
    },
    children_count: {
      path: 'children_count',
      type: 'select',
      label: 'מספר ילדים',
      description: 'כמה ילדים יש לכם?',
      options: [
        { value: '0', label: 'ללא ילדים' },
        { value: '1', label: 'ילד אחד' },
        { value: '2', label: 'שני ילדים' },
        { value: '3', label: 'שלושה ילדים' },
        { value: '4+', label: 'ארבעה ילדים או יותר' }
      ]
    },
    custody_arrangement: {
      path: 'custody_arrangement',
      type: 'select',
      label: 'הסדר משמורת',
      description: 'מה ההסדר הרצוי למשמורת?',
      options: [
        { value: 'joint', label: 'משמורת משותפת' },
        { value: 'sole_mother', label: 'משמורת יחידה לאם' },
        { value: 'sole_father', label: 'משמורת יחידה לאב' },
        { value: 'undecided', label: 'עדיין לא הוחלט' }
      ]
    },
    property_dispute: {
      path: 'property_dispute',
      type: 'checkbox',
      label: 'חלוקת רכוש',
      description: 'האם יש מחלוקת על חלוקת הרכוש?'
    },
    children_ages: {
      path: 'children_ages',
      type: 'text',
      label: 'גילאי הילדים',
      description: 'פרט את גילאי הילדים'
    },
    support_amount: {
      path: 'support_amount',
      type: 'text',
      label: 'גובה מזונות',
      description: 'גובה המזונות המבוקש'
    },
    prenup_exists: {
      path: 'prenup_exists',
      type: 'checkbox',
      label: 'הסכם ממון קיים?',
      description: 'האם קיים הסכם ממון?'
    },
    violence_involved: {
      path: 'violence_involved',
      type: 'checkbox',
      label: 'אלימות במשפחה',
      description: 'האם קיימת אלימות במשפחה?'
    }
  },

  // Criminal Law Cases
  criminal_law: {
    charges_description: {
      path: 'charges_description',
      type: 'textarea',
      label: 'תיאור האישומים',
      description: 'תאר את האישומים שמוגשים נגדך',
      validation: { required: true, minLength: 10 }
    },
    arrest_date: {
      path: 'arrest_date',
      type: 'date',
      label: 'תאריך מעצר',
      description: 'מתי נעצרת? (אם רלוונטי)'
    },
    police_station: {
      path: 'police_station',
      type: 'text',
      label: 'תחנת משטרה',
      description: 'איזו תחנת משטרה מטפלת בתיק?'
    },
    lawyer_present: {
      path: 'lawyer_present',
      type: 'checkbox',
      label: 'נוכחות עורך דין',
      description: 'האם היה עורך דין נוכח בחקירה?'
    },
    previous_convictions: {
      path: 'previous_convictions',
      type: 'checkbox',
      label: 'הרשעות קודמות',
      description: 'האם יש הרשעות קודמות?'
    },
    charges_type: {
      path: 'charges_type',
      type: 'select',
      label: 'סוג עבירה',
      description: 'בחרו את סוג העבירה',
      options: [
        { value: 'felony', label: 'פשע' },
        { value: 'misdemeanor', label: 'עוון' },
        { value: 'infraction', label: 'עבירת קנס' },
        { value: 'other', label: 'אחר' }
      ]
    },
    lawyer_name: {
      path: 'lawyer_name',
      type: 'text',
      label: 'שם עורך הדין',
      description: 'שם עורך הדין או הסנגור'
    },
    court_date: {
      path: 'court_date',
      type: 'date',
      label: 'תאריך דיון',
      description: 'מועד הדיון הבא בבית המשפט'
    },
    bail_amount: {
      path: 'bail_amount',
      type: 'text',
      label: 'סכום ערבות',
      description: 'סכום הערבות (אם נדרש)'
    },
    victim_info: {
      path: 'victim_info',
      type: 'textarea',
      label: 'פרטי הקורבן',
      description: 'מידע על הקורבן במידת הצורך'
    }
  },

  // Contract Disputes
  contract_dispute: {
    contract_date: {
      path: 'contract_date',
      type: 'date',
      label: 'תאריך החוזה',
      description: 'מתי נחתם החוזה?',
      validation: { required: true }
    },
    contract_type: {
      path: 'contract_type',
      type: 'select',
      label: 'סוג החוזה',
      description: 'איזה סוג חוזה זה?',
      options: [
        { value: 'sale', label: 'חוזה מכר' },
        { value: 'service', label: 'חוזה שירות' },
        { value: 'employment', label: 'חוזה עבודה' },
        { value: 'rental', label: 'חוזה שכירות' },
        { value: 'partnership', label: 'חוזה שותפות' },
        { value: 'other', label: 'אחר' }
      ]
    },
    breach_description: {
      path: 'breach_description',
      type: 'textarea',
      label: 'תיאור ההפרה',
      description: 'תאר כיצד הופר החוזה',
      validation: { required: true, minLength: 20 }
    },
    damages_amount: {
      path: 'damages_amount',
      type: 'text',
      label: 'סכום הנזק',
      description: 'מה סכום הנזק הכספי? (בשקלים)'
    },
    attempts_resolution: {
      path: 'attempts_resolution',
      type: 'checkbox',
      label: 'ניסיונות פתרון',
      description: 'האם ניסיתם לפתור את הסכסוך מחוץ לבית המשפט?'
    },
    breach_date: {
      path: 'breach_date',
      type: 'date',
      label: 'תאריך ההפרה',
      description: 'מתי התרחשה ההפרה?'
    },
    contract_name: {
      path: 'contract_name',
      type: 'text',
      label: 'שם/מספר החוזה',
      description: 'זיהוי החוזה'
    },
    contract_value: {
      path: 'contract_value',
      type: 'text',
      label: 'שווי החוזה',
      description: 'סכום או שווי החוזה'
    },
    governing_law: {
      path: 'governing_law',
      type: 'text',
      label: 'חוק חל / סמכות שיפוט',
      description: 'איזה חוק או סמכות חלה על החוזה'
    },
    contract_file: {
      path: 'contract_file',
      type: 'file',
      label: 'העלאת חוזה',
      description: 'העלאת קובץ החוזה'
    }
  },

  // Employment – Contract Breach
  employment_contract_breach: {
    contract_exists: {
      path: 'contract_exists',
      type: 'checkbox',
      label: 'האם קיים חוזה?',
      description: 'סמן אם קיים חוזה העסקה',
      validation: { required: true }
    },
    contract_date: {
      path: 'contract_date',
      type: 'date',
      label: 'תאריך החוזה',
      description: 'מתי נחתם החוזה?',
      validation: { required: true }
    },
    breach_date: {
      path: 'breach_date',
      type: 'date',
      label: 'תאריך ההפרה',
      description: 'מתי אירעה ההפרה?'
    },
    breach_description: {
      path: 'breach_description',
      type: 'textarea',
      label: 'תיאור ההפרה',
      description: 'תאר את אופי ההפרה'
    },
    damages_estimate: {
      path: 'damages_estimate',
      type: 'text',
      label: 'הערכת נזק',
      description: 'אומדן הנזק הכספי'
    },
    contract_file: {
      path: 'contract_file',
      type: 'file',
      label: 'העלאת חוזה',
      description: 'העלאת עותק של החוזה'
    }
  },

  // Employment – Wage Claim
  employment_wage_claim: {
    amount_owed: {
      path: 'amount_owed',
      type: 'text',
      label: 'סכום החוב',
      description: 'סכום שכר שלא שולם'
    },
    pay_period: {
      path: 'pay_period',
      type: 'select',
      label: 'מחזור שכר',
      description: 'בחר מחזור תשלום',
      options: [
        { value: 'weekly', label: 'שבועי' },
        { value: 'biweekly', label: 'דו-שבועי' },
        { value: 'monthly', label: 'חודשי' },
        { value: 'other', label: 'אחר' }
      ]
    },
    employment_start_date: {
      path: 'employment_start_date',
      type: 'date',
      label: 'תאריך תחילת עבודה',
      description: 'מתי התחילה העבודה'
    },
    employment_end_date: {
      path: 'employment_end_date',
      type: 'date',
      label: 'תאריך סיום עבודה',
      description: 'מתי הסתיימה העבודה (אם הסתיימה)'
    },
    claim_description: {
      path: 'claim_description',
      type: 'textarea',
      label: 'תיאור התביעה',
      description: 'פרט את פרטי התביעה'
    },
    payslips_upload: {
      path: 'payslips_upload',
      type: 'file',
      label: 'העלאת תלושי שכר',
      description: 'העלה תלושי שכר כתמיכה'
    }
  }
};

/**
 * Get field registry for a specific scenario
 */
export function getScenarioFields(scenario: string): Record<string, FieldDef> {
  return scenarioFieldRegistry[scenario] || {};
}

/**
 * Get all available scenarios
 */
export function getAvailableScenarios(): Array<{ key: string; label: string; }> {
  return [
    { key: 'personal_injury', label: 'תאונות ופציעות אישיות' },
    { key: 'family_law', label: 'דיני משפחה' },
    { key: 'criminal_law', label: 'דיני פלילים' },
    { key: 'contract_dispute', label: 'מחלוקות חוזים' },
    { key: 'employment_contract_breach', label: 'הפרת חוזה עבודה' },
    { key: 'employment_wage_claim', label: 'תביעת שכר עבודה' }
  ];
}

export const ScenarioFieldRegistry = scenarioFieldRegistry;