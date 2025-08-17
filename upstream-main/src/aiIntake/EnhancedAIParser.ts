// Enhanced AI Parser - Smart input parsing with direct command recognition
export interface ParseResult {
  type: 'command' | 'conversation' | 'mixed';
  commands: Array<{
    field: string;
    value: any;
    confidence: number;
  }>;
  conversationText: string;
  fieldUpdates: Record<string, any>;
}

export interface ConversationContext {
  previousMessages: Array<{ role: string; content: string }>;
  extractedFields: Record<string, any>;
  caseType?: string;
  sessionMemory: Record<string, any>;
}

export class EnhancedAIParser {
  // Pattern matchers for direct commands
  private static readonly DIRECT_PATTERNS = [
    // Field=value patterns
    { pattern: /(\w+)\s*=\s*([^,\n]+)/gi, type: 'assignment' },
    // Set field to value patterns
    { pattern: /set\s+(\w+)\s+to\s+([^,\n]+)/gi, type: 'setter' },
    // Update field patterns
    { pattern: /update\s+(\w+)\s+([^,\n]+)/gi, type: 'update' },
    // Hebrew patterns
    { pattern: /(תחום שיפוט|בית משפט|בית דין)\s*[:=]\s*([^,\n]+)/gi, type: 'jurisdiction_he' },
    { pattern: /(קטגוריה|סוג תיק)\s*[:=]\s*([^,\n]+)/gi, type: 'category_he' },
    { pattern: /(מיקום|כתובת)\s*[:=]\s*([^,\n]+)/gi, type: 'location_he' },
  ];

  // Field mappings
  private static readonly FIELD_MAPPINGS = {
    // English
    'jurisdiction': 'jurisdiction',
    'court': 'jurisdiction',
    'category': 'category',
    'type': 'category',
    'location': 'location',
    'address': 'location',
    'title': 'title',
    'summary': 'summary',
    'goal': 'goal',
    'parties': 'parties',
    'evidence': 'evidence',
    'timeline': 'timeline',
    // Hebrew
    'תחום שיפוט': 'jurisdiction',
    'בית משפט': 'jurisdiction',
    'בית דין': 'jurisdiction',
    'קטגוריה': 'category',
    'סוג תיק': 'category',
    'מיקום': 'location',
    'כתובת': 'location',
    'כותרת': 'title',
    'תקציר': 'summary',
    'מטרה': 'goal',
    'צדדים': 'parties',
    'ראיות': 'evidence',
    'זמנים': 'timeline'
  };

  // Smart case type detection
  private static readonly CASE_TYPE_PATTERNS = {
    'contract': ['חוזה', 'contract', 'agreement', 'breach', 'הפרת חוזה'],
    'tort': ['נזיקין', 'tort', 'negligence', 'injury', 'פגיעה', 'רשלנות'],
    'family': ['משפחה', 'family', 'divorce', 'custody', 'גירושין', 'משמורת'],
    'employment': ['עבודה', 'employment', 'labor', 'workplace', 'פיטורין', 'שכר'],
    'criminal': ['פלילי', 'criminal', 'crime', 'prosecution', 'עבירה'],
    'property': ['נדלן', 'property', 'real estate', 'rent', 'שכירות', 'דירה']
  };

  static parseInput(input: string, context: ConversationContext): ParseResult {
    const result: ParseResult = {
      type: 'conversation',
      commands: [],
      conversationText: input,
      fieldUpdates: {}
    };

    // Extract direct commands
    let hasCommands = false;
    let cleanedText = input;

    for (const patternDef of this.DIRECT_PATTERNS) {
      const matches = Array.from(input.matchAll(patternDef.pattern));
      
      for (const match of matches) {
        hasCommands = true;
        const [fullMatch, field, value] = match;
        
        // Map field to standard form field
        const mappedField = this.FIELD_MAPPINGS[field.toLowerCase()] || field.toLowerCase();
        const cleanValue = value.trim();
        
        result.commands.push({
          field: mappedField,
          value: cleanValue,
          confidence: 0.95 // High confidence for direct commands
        });
        
        result.fieldUpdates[mappedField] = cleanValue;
        
        // Remove command from conversation text
        cleanedText = cleanedText.replace(fullMatch, '').trim();
      }
    }

    // Update result based on what we found
    if (hasCommands) {
      result.type = cleanedText.length > 10 ? 'mixed' : 'command';
      result.conversationText = cleanedText;
    }

    return result;
  }

  // Detect case type from text
  static detectCaseType(text: string, context: ConversationContext): string | null {
    const lowerText = text.toLowerCase();
    
    for (const [caseType, keywords] of Object.entries(this.CASE_TYPE_PATTERNS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return caseType;
        }
      }
    }
    
    return null;
  }

  // Generate smart follow-up questions based on context
  static generateSmartQuestion(context: ConversationContext): string | null {
    const fields = context.extractedFields;
    const caseType = context.sessionMemory.detectedCaseType;

    // Priority-based questioning
    if (!fields.title) {
      return "אני רואה שאתה מתחיל לבנות תיק. איך תרצה לקרוא לתיק הזה? (למשל: 'תיק הפרת חוזה מול חברת XYZ')";
    }

    if (!fields.jurisdiction) {
      return "באיזה בית משפט תרצה להגיש את התיק? (למשל: בית משפט השלום תל אביב, בית דין רבני, וכו')";
    }

    if (!fields.category && !caseType) {
      return "איזה סוג תיק משפטי זה? (למשל: חוזים, נזיקין, משפחה, עבודה, פלילי)";
    }

    if (caseType === 'contract' && !fields.contractDetails) {
      return "כיוון שזה תיק חוזה, תוכל לספר לי על החוזה - מתי נחתם, מה התנאים העיקריים שהופרו?";
    }

    if (caseType === 'employment' && !fields.employmentDetails) {
      return "ברור שזה קשור לעבודה. תוכל לספר מה המצב - פיטורין? בעיות שכר? הטרדה?";
    }

    if (!fields.parties) {
      return "מי הצדדים המעורבים בתיק? (למשל: אני נגד חברת ABC בע\"מ)";
    }

    if (!fields.timeline) {
      return "מתי התרחש האירוع? תוכל לתת לי ציר זמן של האירועים העיקריים?";
    }

    return null;
  }

  // Generate dynamic fields based on case type (default English)
  static generateDynamicFields(caseType: string): Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }> {
    const fieldSets = {
      contract: [
        { id: 'contractDate', label: 'Contract Date', type: 'date', required: true },
        { id: 'contractType', label: 'Contract Type', type: 'select', required: true, 
          options: ['Sale', 'Rental', 'Employment', 'Services', 'Construction'] },
        { id: 'breachDetails', label: 'Breach Details', type: 'textarea', required: true },
        { id: 'damages', label: 'Financial Damages', type: 'number', required: false }
      ],
      employment: [
        { id: 'employmentStart', label: 'Employment Start', type: 'date', required: true },
        { id: 'employmentEnd', label: 'Employment End', type: 'date', required: false },
        { id: 'position', label: 'Position', type: 'text', required: true },
        { id: 'issueType', label: 'Issue Type', type: 'select', required: true,
          options: ['Termination', 'Harassment', 'Discrimination', 'Salary', 'Working Hours', 'Working Conditions'] },
        { id: 'salary', label: 'Monthly Salary', type: 'number', required: false }
      ],
      tort: [
        { id: 'incidentDate', label: 'Incident Date', type: 'date', required: true },
        { id: 'incidentLocation', label: 'Incident Location', type: 'text', required: true },
        { id: 'injuryType', label: 'Injury Type', type: 'select', required: true,
          options: ['Physical', 'Mental', 'Financial', 'Property', 'Reputation'] },
        { id: 'medicalTreatment', label: 'Medical Treatment', type: 'textarea', required: false },
        { id: 'witnesses', label: 'Witnesses', type: 'textarea', required: false }
      ],
      family: [
        { id: 'marriageDate', label: 'Marriage Date', type: 'date', required: false },
        { id: 'children', label: 'Children', type: 'textarea', required: false },
        { id: 'assets', label: 'Assets', type: 'textarea', required: false },
        { id: 'familyIssue', label: 'Family Issue', type: 'select', required: true,
          options: ['Divorce', 'Custody', 'Alimony', 'Property', 'Parent-Child Relations'] }
      ]
    };

    return fieldSets[caseType as keyof typeof fieldSets] || [];
  }
}