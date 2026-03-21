// Field mapping between AI output and form state
export const FIELD_MAP = {
  caseTitle: { formPath: 'title' },
  caseSummary: { formPath: 'summary' },
  jurisdiction: { formPath: 'jurisdiction' },
  legalCategory: { formPath: 'category' },
  reliefSought: { formPath: 'goal' },
  parties: { formPath: 'parties' },
  evidence: { formPath: 'evidence' },
  timeline: { formPath: 'timeline' },
} as const;

// Required fields for completion
export const REQUIRED_FIELDS = ['caseTitle', 'caseSummary', 'jurisdiction', 'legalCategory', 'reliefSought'];

export type FieldMapKey = keyof typeof FIELD_MAP;
export type FormPath = typeof FIELD_MAP[FieldMapKey]['formPath'];