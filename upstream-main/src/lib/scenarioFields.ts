/**
 * Scenario Field Registry - Dynamic field definitions based on case scenarios
 */

import { AIFieldRegistry } from './aiFieldBridge';

export const scenarioFieldRegistry: Record<string, AIFieldRegistry> = {
  // Personal Injury Cases
  personal_injury: {
    incident_date: {
      type: 'date',
      label: 'תאריך האירוע',
      description: 'מתי התרחש האירוע?',
      validation: { required: true }
    },
    incident_location: {
      type: 'text',
      label: 'מקום האירוע',
      description: 'היכן התרחש האירוע?',
      validation: { required: true }
    },
    injury_description: {
      type: 'textarea',
      label: 'תיאור הפציעה',
      description: 'תאר את הפציעות שנגרמו',
      validation: { required: true, minLength: 10 }
    },
    medical_treatment: {
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
      type: 'checkbox',
      label: 'מעורבות ביטוח',
      description: 'האם חברת ביטוח מעורבת?'
    }
  },

  // Family Law Cases
  family_law: {
    marriage_date: {
      type: 'date',
      label: 'תאריך נישואין',
      description: 'מתי נישאתם?'
    },
    separation_date: {
      type: 'date',
      label: 'תאריך פרידה',
      description: 'מתי נפרדתם?'
    },
    children_count: {
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
      type: 'checkbox',
      label: 'חלוקת רכוש',
      description: 'האם יש מחלוקת על חלוקת הרכוש?'
    }
  },

  // Criminal Law Cases
  criminal_law: {
    charges_description: {
      type: 'textarea',
      label: 'תיאור האישומים',
      description: 'תאר את האישומים שמוגשים נגדך',
      validation: { required: true, minLength: 10 }
    },
    arrest_date: {
      type: 'date',
      label: 'תאריך מעצר',
      description: 'מתי נעצרת? (אם רלוונטי)'
    },
    police_station: {
      type: 'text',
      label: 'תחנת משטרה',
      description: 'איזו תחנת משטרה מטפלת בתיק?'
    },
    lawyer_present: {
      type: 'checkbox',
      label: 'נוכחות עורך דין',
      description: 'האם היה עורך דין נוכח בחקירה?'
    },
    previous_convictions: {
      type: 'checkbox',
      label: 'הרשעות קודמות',
      description: 'האם יש הרשעות קודמות?'
    }
  },

  // Contract Disputes
  contract_dispute: {
    contract_date: {
      type: 'date',
      label: 'תאריך החוזה',
      description: 'מתי נחתם החוזה?',
      validation: { required: true }
    },
    contract_type: {
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
      type: 'textarea',
      label: 'תיאור ההפרה',
      description: 'תאר כיצד הופר החוזה',
      validation: { required: true, minLength: 20 }
    },
    damages_amount: {
      type: 'text',
      label: 'סכום הנזק',
      description: 'מה סכום הנזק הכספי? (בשקלים)'
    },
    attempts_resolution: {
      type: 'checkbox',
      label: 'ניסיונות פתרון',
      description: 'האם ניסיתם לפתור את הסכסוך מחוץ לבית המשפט?'
    }
  }
};

/**
 * Get field registry for a specific scenario
 */
export function getScenarioFields(scenario: string): AIFieldRegistry {
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
    { key: 'contract_dispute', label: 'מחלוקות חוזים' }
  ];
}