// Smart Conversation Engine - Lovable-level conversational AI
import { EnhancedAIParser, ConversationContext } from './EnhancedAIParser';
import { detectLanguage, t, type Lang } from '@/features/ai/i18n';

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
  private lang: Lang;

  constructor(initialContext: ConversationContext) {
    this.context = initialContext;
    this.sessionMemory = initialContext.sessionMemory || {};
    this.lang = detectLanguage();
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
      `✅ ${t(this.lang, 'commandUpdated').replace('{count}', commandCount.toString()).replace('{fields}', fields)} `,
      `🎯 ${t(this.lang, 'commandUnderstood').replace('{fields}', fields)} `,
      `⚡ ${t(this.lang, 'commandExecuted').replace('{fields}', fields)} `,
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    const nextQuestion = EnhancedAIParser.generateSmartQuestion(this.context);
    
    return baseResponse + (nextQuestion ? `\n\n${nextQuestion}` : t(this.lang, 'commandHowElse'));
  }

  private generateConversationalResponse(parseResult: any): string {
    const caseType = this.sessionMemory.detectedCaseType;
    const turnCount = this.sessionMemory.turnCount || 1;
    
    if (caseType && turnCount === 1) {
      const caseTypeResponses = {
        contract: `🤝 ${t(this.lang, 'contractCase')}`,
        employment: `💼 ${t(this.lang, 'employmentCase')}`,
        tort: `⚖️ ${t(this.lang, 'tortCase')}`,
        family: `👨‍👩‍👧‍👦 ${t(this.lang, 'familyCase')}`,
        criminal: `🚨 ${t(this.lang, 'criminalCase')}`,
        property: `🏠 ${t(this.lang, 'propertyCase')}`
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
      t(this.lang, 'aiGreeting'),
      t(this.lang, 'aiContinue'),
      t(this.lang, 'aiAnalyzing'),
      t(this.lang, 'aiInterested'),
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
        label: t(this.lang, 'completeBasicInfo'),
        description: t(this.lang, 'completeBasicInfoDesc'),
        action: 'guided-completion',
        icon: '📝',
        category: 'system',
        priority: 'high'
      });
    }
    
    if (progress >= 50 && progress < 80) {
      suggestions.push({
        id: 'add-evidence',
        label: t(this.lang, 'addEvidence'),
        description: t(this.lang, 'addEvidenceDesc'),
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
          label: t(this.lang, 'findLawyer'),
          description: t(this.lang, 'findLawyerDesc').replace('{caseType}', this.getCaseTypeTranslated(caseType)),
          action: 'find-professionals',
          icon: '⚖️',
          category: 'professional',
          priority: 'high',
          estimatedTime: '5 min'
        },
        {
          id: 'schedule-consultation',
          label: t(this.lang, 'scheduleConsultation'),
          description: t(this.lang, 'scheduleConsultationDesc'),
          action: 'schedule-meeting',
          icon: '📅',
          category: 'professional',
          priority: 'medium',
          requiresAuth: true
        },
        {
          id: 'generate-documents',
          label: t(this.lang, 'generateDocuments'),
          description: t(this.lang, 'generateDocumentsDesc'),
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
        label: t(this.lang, 'breachAnalysis'),
        description: t(this.lang, 'breachAnalysisDesc'),
        action: 'analyze-breach',
        icon: '🔍',
        category: 'legal',
        priority: 'medium'
      });
    }
    
    if (caseType === 'employment') {
      suggestions.push({
        id: 'labor-rights',
        label: t(this.lang, 'laborRights'),
        description: t(this.lang, 'laborRightsDesc'),
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
        label: t(this.lang, 'inviteParties'),
        description: t(this.lang, 'invitePartiesDesc'),
        action: 'invite-parties',
        icon: '👥',
        category: 'procedural',
        priority: 'low',
        requiresAuth: true
      },
      {
        id: 'register-account',
        label: t(this.lang, 'registerAccount'),
        description: t(this.lang, 'registerAccountDesc'),
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
    if (score >= 90) message = t(this.lang, 'progressReady');
    else if (score >= 70) message = t(this.lang, 'progressAlmostDone');
    else if (score >= 50) message = t(this.lang, 'progressOnTrack');
    else if (score >= 30) message = t(this.lang, 'progressContinue');
    else message = t(this.lang, 'progressStarted');
    
    return {
      score,
      message,
      completedFields: allFields.filter(field => this.context.extractedFields[field])
    };
  }

  private getCaseTypeTranslated(caseType?: string): string {
    const caseTypeKey = caseType || 'general';
    return t(this.lang, caseTypeKey) || t(this.lang, 'general');
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