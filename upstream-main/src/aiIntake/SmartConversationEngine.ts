// Smart Conversation Engine - Lovable-level conversational AI
import { EnhancedAIParser, ConversationContext } from './EnhancedAIParser';

export interface ConversationTurn {
  userInput: string;
  aiResponse: string;
  fieldUpdates: Record<string, any>;
  dynamicFields: Array<any>;
  nextActions: Array<{
    id: string;
    label: string;
    action: string;
    icon: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  progressUpdate: {
    score: number;
    message: string;
    completedFields: string[];
  };
}

export interface ActionSuggestion {
  id: string;
  label: string;
  description: string;
  action: string;
  icon: string;
  category: 'legal' | 'procedural' | 'professional' | 'system';
  priority: 'high' | 'medium' | 'low';
  requiresAuth?: boolean;
  estimatedTime?: string;
}

export class SmartConversationEngine {
  private context: ConversationContext;
  private sessionMemory: Record<string, any> = {};

  constructor(initialContext: ConversationContext) {
    this.context = initialContext;
    this.sessionMemory = initialContext.sessionMemory || {};
  }

  async processUserInput(input: string): Promise<ConversationTurn> {
    // Parse the input for direct commands and conversation
    const parseResult = EnhancedAIParser.parseInput(input, this.context);
    
    // Update session memory with new information
    this.updateSessionMemory(parseResult);
    
    // Generate AI response based on context and parse result
    const aiResponse = this.generateAIResponse(parseResult);
    
    // Generate dynamic fields based on detected case type
    const dynamicFields = this.generateDynamicFields();
    
    // Generate next action suggestions
    const nextActions = this.generateActionSuggestions();
    
    // Calculate progress
    const progressUpdate = this.calculateProgress();
    
    // Update context for next turn
    this.context.previousMessages.push(
      { role: 'user', content: input },
      { role: 'assistant', content: aiResponse }
    );
    
    return {
      userInput: input,
      aiResponse,
      fieldUpdates: parseResult.fieldUpdates,
      dynamicFields,
      nextActions,
      progressUpdate
    };
  }

  private updateSessionMemory(parseResult: any): void {
    // Detect case type
    const detectedCaseType = EnhancedAIParser.detectCaseType(
      parseResult.conversationText, 
      this.context
    );
    
    if (detectedCaseType && !this.sessionMemory.detectedCaseType) {
      this.sessionMemory.detectedCaseType = detectedCaseType;
      this.sessionMemory.caseTypeConfidence = 0.8;
    }
    
    // Update field completion tracking
    for (const [field, value] of Object.entries(parseResult.fieldUpdates)) {
      this.sessionMemory.completedFields = this.sessionMemory.completedFields || [];
      if (!this.sessionMemory.completedFields.includes(field)) {
        this.sessionMemory.completedFields.push(field);
      }
    }
    
    // Track conversation patterns
    this.sessionMemory.turnCount = (this.sessionMemory.turnCount || 0) + 1;
    this.sessionMemory.lastUpdateTime = new Date().toISOString();
  }

  private generateAIResponse(parseResult: any): string {
    const responses = {
      command: this.generateCommandResponse(parseResult),
      conversation: this.generateConversationalResponse(parseResult),
      mixed: this.generateMixedResponse(parseResult)
    };
    
    return responses[parseResult.type];
  }

  private generateCommandResponse(parseResult: any): string {
    const commandCount = parseResult.commands.length;
    const fields = parseResult.commands.map(cmd => cmd.field).join(', ');
    
    const responses = [
      `✅ מעולה! עדכנתי ${commandCount} שדות: ${fields}. `,
      `🎯 הבנתי בדיוק מה שרצית! עדכנתי: ${fields}. `,
      `⚡ ביצעתי את העדכונים: ${fields}. `,
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    const nextQuestion = EnhancedAIParser.generateSmartQuestion(this.context);
    
    return baseResponse + (nextQuestion ? `\n\n${nextQuestion}` : 'איך אוכל לעזור עוד?');
  }

  private generateConversationalResponse(parseResult: any): string {
    const caseType = this.sessionMemory.detectedCaseType;
    const turnCount = this.sessionMemory.turnCount || 1;
    
    if (caseType && turnCount === 1) {
      const caseTypeResponses = {
        contract: "🤝 אני רואה שזה תיק הפרת חוזה. אני אכין עבורך שדות מיוחדים לסוג תיק הזה.",
        employment: "💼 זה נשמע כמו תיק עבודה. אני אוסיף שדות רלוונטיים לתחום העבודה.",
        tort: "⚖️ נראה שזה תיק נזיקין. אני אכין שדות מותאמים לסוג תיק הזה.",
        family: "👨‍👩‍👧‍👦 זה תיק משפחה. אני אוסיף שדות רלוונטיים לדיני משפחה.",
        criminal: "🚨 זה נראה כמו תיק פלילי. אני אכין שדות מיוחדים לתחום הפלילי.",
        property: "🏠 זה קשור לנדלן. אני אוסיף שדות רלוונטיים לעולם הנדלן."
      };
      
      const response = caseTypeResponses[caseType as keyof typeof caseTypeResponses];
      if (response) {
        const nextQuestion = EnhancedAIParser.generateSmartQuestion(this.context);
        return response + (nextQuestion ? `\n\n${nextQuestion}` : '');
      }
    }
    
    // General conversational response
    const nextQuestion = EnhancedAIParser.generateSmartQuestion(this.context);
    return nextQuestion || this.generateContextualResponse();
  }

  private generateMixedResponse(parseResult: any): string {
    const commandResponse = this.generateCommandResponse(parseResult);
    const conversationalPart = parseResult.conversationText.length > 10 
      ? this.generateContextualResponse()
      : '';
    
    return commandResponse + (conversationalPart ? `\n\n${conversationalPart}` : '');
  }

  private generateContextualResponse(): string {
    const responses = [
      "אני כאן לעזור לך לבנות את התיק הכי חזק שאפשר. ספר לי עוד פרטים.",
      "ממשיכים לבנות את התיק שלך. מה עוד חשוב שאדע?",
      "אני רושם ומנתח את כל המידע. תמשיך לספר לי על המצב.",
      "זה נשמע מעניין. אני צריך עוד פרטים כדי לעזור לך הכי טוב.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateDynamicFields(): Array<any> {
    const caseType = this.sessionMemory.detectedCaseType;
    if (!caseType) return [];
    
    return EnhancedAIParser.generateDynamicFields(caseType);
  }

  private generateActionSuggestions(): Array<ActionSuggestion> {
    const suggestions: Array<ActionSuggestion> = [];
    const progress = this.calculateProgress().score;
    const caseType = this.sessionMemory.detectedCaseType;
    
    // Progress-based suggestions
    if (progress < 50) {
      suggestions.push({
        id: 'complete-basic-info',
        label: 'השלם מידע בסיסי',
        description: 'בואנו נשלים את השדות החיוניים לתיק',
        action: 'guided-completion',
        icon: '📝',
        category: 'system',
        priority: 'high'
      });
    }
    
    if (progress >= 50 && progress < 80) {
      suggestions.push({
        id: 'add-evidence',
        label: 'הוסף ראיות',
        description: 'עלה מסמכים ותמונות תומכות',
        action: 'upload-evidence',
        icon: '📎',
        category: 'legal',
        priority: 'high'
      });
    }
    
    if (progress >= 80) {
      suggestions.push(
        {
          id: 'find-lawyer',
          label: 'מצא עורך דין מומחה',
          description: `מומחים ל${this.getCaseTypeHebrew(caseType)} באזור שלך`,
          action: 'find-professionals',
          icon: '⚖️',
          category: 'professional',
          priority: 'high',
          estimatedTime: '5 דקות'
        },
        {
          id: 'schedule-consultation',
          label: 'קבע ייעוץ',
          description: 'ייעוץ ראשוני עם מומחה משפטי',
          action: 'schedule-meeting',
          icon: '📅',
          category: 'professional',
          priority: 'medium',
          requiresAuth: true
        },
        {
          id: 'generate-documents',
          label: 'הכן מסמכים',
          description: 'יצירה אוטומטית של טיוטת כתב טענות',
          action: 'generate-pleading',
          icon: '📄',
          category: 'legal',
          priority: 'medium'
        }
      );
    }
    
    // Case-type specific suggestions
    if (caseType === 'contract') {
      suggestions.push({
        id: 'breach-analysis',
        label: 'ניתוח הפרת החוזה',
        description: 'בדיקה משפטית מעמיקה של ההפרה',
        action: 'analyze-breach',
        icon: '🔍',
        category: 'legal',
        priority: 'medium'
      });
    }
    
    if (caseType === 'employment') {
      suggestions.push({
        id: 'labor-rights',
        label: 'בדיקת זכויות עובד',
        description: 'וידוא שכל הזכויות נמצאות במקום',
        action: 'check-rights',
        icon: '🛡️',
        category: 'legal',
        priority: 'high'
      });
    }
    
    // Always available suggestions
    suggestions.push(
      {
        id: 'invite-parties',
        label: 'זמן צדדים נוספים',
        description: 'הזמן את הצד השני או עדים לתהליך',
        action: 'invite-parties',
        icon: '👥',
        category: 'procedural',
        priority: 'low',
        requiresAuth: true
      },
      {
        id: 'register-account',
        label: 'הירשם למעקב מלא',
        description: 'נהל את התיק עם כלים מתקדמים',
        action: 'register',
        icon: '🔐',
        category: 'system',
        priority: 'low'
      }
    );
    
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private calculateProgress(): { score: number; message: string; completedFields: string[] } {
    const requiredFields = ['title', 'summary', 'jurisdiction', 'category'];
    const optionalFields = ['goal', 'parties', 'evidence', 'timeline'];
    const allFields = [...requiredFields, ...optionalFields];
    
    const completedRequired = requiredFields.filter(field => 
      this.context.extractedFields[field]
    ).length;
    
    const completedOptional = optionalFields.filter(field => 
      this.context.extractedFields[field]
    ).length;
    
    const score = Math.round(
      (completedRequired / requiredFields.length) * 70 + 
      (completedOptional / optionalFields.length) * 30
    );
    
    let message = '';
    if (score >= 90) message = 'התיק מוכן להגשה! 🎉';
    else if (score >= 70) message = 'התיק כמעט מוכן - עוד פרט קטן 🔥';
    else if (score >= 50) message = 'אנחנו בדרך הנכונה! 📈';
    else if (score >= 30) message = 'בואנו נמשיך לבנות 🏗️';
    else message = 'רק התחלנו - יש לנו הרבה עבודה 🚀';
    
    return {
      score,
      message,
      completedFields: allFields.filter(field => this.context.extractedFields[field])
    };
  }

  private getCaseTypeHebrew(caseType?: string): string {
    const translations = {
      contract: 'חוזים',
      employment: 'דיני עבודה',
      tort: 'נזיקין',
      family: 'דיני משפחה',
      criminal: 'דין פלילי',
      property: 'דיני נדלן'
    };
    
    return translations[caseType as keyof typeof translations] || 'תחום כללי';
  }

  // Public method to get current session state
  getSessionState() {
    return {
      context: this.context,
      memory: this.sessionMemory,
      progress: this.calculateProgress()
    };
  }
}