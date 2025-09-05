import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// חוויית Lovable - המערכת קוראת את המחשבות
interface ConversationContext {
  sessionId: string;
  userId?: string;
  legalDomain?: string;
  extractedFields: Record<string, any>;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    intent?: string;
    confidence?: number;
  }>;
  currentProgress: number;
  nextSteps: string[];
  suggestedActions: Array<{
    id: string;
    label: string;
    action: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    icon: string;
  }>;
}

interface SmartResponse {
  text: string;
  intent: string;
  confidence: number;
  extractedFields: Record<string, any>;
  suggestedActions: Array<any>;
  progressUpdate: number;
  autoRoute?: string;
  formFields?: Array<{
    id: string;
    label: string;
    type: 'text' | 'select' | 'textarea';
    value?: string;
    required: boolean;
    options?: string[];
  }>;
}

export function useSmartConversation() {
  const [context, setContext] = useState<ConversationContext>(() => ({
    sessionId: `session_${Date.now()}`,
    extractedFields: {},
    conversationHistory: [],
    currentProgress: 0,
    nextSteps: [],
    suggestedActions: []
  }));

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<SmartResponse | null>(null);
  const [autoConnectedAI, setAutoConnectedAI] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Auto-connect AI on mount (Lovable experience)
  useEffect(() => {
    if (!autoConnectedAI) {
      setAutoConnectedAI(true);
      toast({
        title: "🤖 AI מחובר",
        description: "המערכת מוכנה לקרוא את המחשבות שלך",
        duration: 2000
      });
    }
  }, [autoConnectedAI]);

  // Intent detection patterns
  const intentPatterns = {
    legal_case: /(?:תביעה|תיק|משפט|בית משפט|עורך דין|חוזה|הפרה)/i,
    employment: /(?:עבודה|מעביד|פיטורין|משכורת|זכויות עובד)/i,
    family: /(?:גירושין|משמורת|מזונות|נישואין|ילדים)/i,
    contract: /(?:חוזה|הסכם|התחייבות|הפרה|נזק)/i,
    property: /(?:דירה|בית|שכירות|מכירה|נכס)/i,
    immediate_help: /(?:דחוף|מיידי|עזרה|חירום|מה עושים)/i,
    document_needed: /(?:מסמך|טופס|מכתב|תביעה|בקשה)/i,
  };

  // Progressive question patterns based on legal process
  const generateProgressiveQuestions = (intent: string, progress: number): string[] => {
    const questionSets = {
      legal_case: [
        "בואו נתחיל: מה קרה בקצרה?",
        "מי מעורב בסיטואציה? (שמות או תיאור)",
        "מתי זה התרחש?",
        "איפה זה קרה? (עיר/מקום)",
        "מה אתה רוצה שיקרה? (הפתרון שאתה מחפש)",
        "יש לך מסמכים או ראיות?"
      ],
      employment: [
        "איך התחילה הבעיה בעבודה?",
        "מה השם של המעביד/החברה?",
        "כמה זמן עבדת שם?",
        "יש לך חוזה עבודה?",
        "דיברת עם מישהו על זה?"
      ],
      family: [
        "מה המצב המשפחתי?",
        "יש ילדים? (גילאים)",
        "מה הבעיה הראשית?",
        "ניסיתם לפתור ביניכם?",
        "מה החשוב לך ביותר?"
      ]
    };

    const questions = questionSets[intent as keyof typeof questionSets] || questionSets.legal_case;
    const currentStage = Math.floor((progress / 100) * questions.length);
    return questions.slice(currentStage, currentStage + 2);
  };

  // Smart response with Lovable-like intelligence
  const processUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsProcessing(true);

    // Immediate response feel (like Lovable)
    debounceRef.current = setTimeout(async () => {
      try {
        // 1. Intent detection
        let detectedIntent = 'general';
        let confidence = 0.5;
        
        for (const [intent, pattern] of Object.entries(intentPatterns)) {
          if (pattern.test(input)) {
            detectedIntent = intent;
            confidence = 0.8;
            break;
          }
        }

        // 2. Extract key information from text
        const extractedInfo = extractKeyInformation(input);

        // 3. Update conversation context
        const updatedHistory = [
          ...context.conversationHistory,
          {
            role: 'user' as const,
            content: input,
            timestamp: new Date(),
            intent: detectedIntent,
            confidence
          }
        ];

        // 4. Calculate progress
        const newProgress = calculateProgress(extractedInfo, context.extractedFields);

        // 5. Generate smart response
        const smartResponse = await generateSmartResponse(
          input,
          detectedIntent,
          newProgress,
          extractedInfo
        );

        // 6. Update context
        setContext(prev => ({
          ...prev,
          conversationHistory: updatedHistory,
          extractedFields: { ...prev.extractedFields, ...extractedInfo },
          currentProgress: newProgress,
          suggestedActions: smartResponse.suggestedActions
        }));

        setLastResponse(smartResponse);

        // 7. Auto-route if confidence is high
        if (smartResponse.autoRoute && confidence > 0.7) {
          setTimeout(() => {
            // Auto navigation logic would go here
            console.log('Auto-routing to:', smartResponse.autoRoute);
          }, 2000);
        }

      } catch (error) {
        console.error('Smart conversation error:', error);
        toast({
          title: "שגיאה בעיבוד",
          description: "נסה שוב בעוד רגע",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }, 150); // Very fast response like Lovable

  }, [context]);

  // Extract information from user input
  const extractKeyInformation = (text: string): Record<string, any> => {
    const extracted: Record<string, any> = {};
    
    // Extract names (simple pattern)
    const namePattern = /(?:שמי|קוראים לי|אני)\s+([א-ת\s]+)/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      extracted.userName = nameMatch[1].trim();
    }

    // Extract company names
    const companyPattern = /(?:בחברה|עובד ב|מעביד)\s+([א-ת\s"']+)/i;
    const companyMatch = text.match(companyPattern);
    if (companyMatch) {
      extracted.companyName = companyMatch[1].trim();
    }

    // Extract dates
    const datePattern = /(?:ב|תאריך|מתאריך)\s*(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4})/;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      extracted.eventDate = dateMatch[1];
    }

    // Extract amounts
    const amountPattern = /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:שקל|₪|דולר|\$)/;
    const amountMatch = text.match(amountPattern);
    if (amountMatch) {
      extracted.amount = amountMatch[1];
    }

    return extracted;
  };

  // Calculate progress based on extracted information
  const calculateProgress = (newInfo: Record<string, any>, existingInfo: Record<string, any>): number => {
    const allInfo = { ...existingInfo, ...newInfo };
    const keyFields = ['userName', 'summary', 'eventDate', 'companyName', 'amount', 'goal'];
    const completedFields = keyFields.filter(field => allInfo[field]).length;
    return Math.round((completedFields / keyFields.length) * 100);
  };

  // Generate intelligent response
  const generateSmartResponse = async (
    input: string,
    intent: string,
    progress: number,
    extractedInfo: Record<string, any>
  ): Promise<SmartResponse> => {
    
    // Very short, focused responses (Lovable style)
    const responseTemplates = {
      legal_case: {
        opening: "📋 זיהיתי שמדובר בבעיה משפטית.",
        followUp: generateProgressiveQuestions(intent, progress)[0] || "ספר לי עוד פרטים"
      },
      employment: {
        opening: "💼 בעיה בעבודה - אני כאן לעזור.",
        followUp: "מה בדיוק קרה עם המעביד?"
      },
      immediate_help: {
        opening: "🚨 אני רואה שזה דחוף!",
        followUp: "בואו נטפל בזה מיד - מה הבעיה?"
      }
    };

    const template = responseTemplates[intent as keyof typeof responseTemplates] || {
      opening: "👋 הבנתי.",
      followUp: "איך אני יכול לעזור?"
    };

    let responseText = template.opening;
    
    // Add extracted info acknowledgment
    if (extractedInfo.userName) {
      responseText += ` שלום ${extractedInfo.userName}!`;
    }
    
    responseText += `\n\n${template.followUp}`;

    // Generate suggested actions based on intent and progress
    const suggestedActions = generateSuggestedActions(intent, progress);

    // Auto-fill form fields if possible
    const formFields = generateFormFields(intent, extractedInfo);

    return {
      text: responseText,
      intent,
      confidence: 0.8,
      extractedFields: extractedInfo,
      suggestedActions,
      progressUpdate: progress,
      autoRoute: progress > 80 ? getAutoRoute(intent) : undefined,
      formFields
    };
  };

  // Generate contextual action suggestions
  const generateSuggestedActions = (intent: string, progress: number) => {
    const baseActions = [
      {
        id: 'continue_chat',
        label: 'המשך לספר',
        action: 'continue',
        priority: 'high' as const,
        icon: '💬'
      }
    ];

    if (progress > 30) {
      baseActions.push({
        id: 'start_case',
        label: 'פתח תיק',
        action: 'create_case',
        priority: 'high' as const,
        icon: '📁'
      });
    }

    if (progress > 60) {
      baseActions.push({
        id: 'find_lawyer',
        label: 'מצא עורך דין',
        action: 'find_professional',
        priority: 'high' as const,
        icon: '⚖️'
      });
    }

    return baseActions;
  };

  // Generate form fields based on intent
  const generateFormFields = (intent: string, extractedInfo: Record<string, any>) => {
    const fieldTemplates = {
      legal_case: [
        { id: 'summary', label: 'תיאור הבעיה', type: 'textarea' as const, required: true },
        { id: 'parties', label: 'מי מעורב', type: 'text' as const, required: true },
        { id: 'date', label: 'מתי זה קרה', type: 'text' as const, required: false }
      ],
      employment: [
        { id: 'company', label: 'שם המעביד', type: 'text' as const, required: true },
        { id: 'issue', label: 'הבעיה', type: 'textarea' as const, required: true },
        { id: 'duration', label: 'כמה זמן עבדת', type: 'text' as const, required: false }
      ]
    };

    return fieldTemplates[intent as keyof typeof fieldTemplates] || fieldTemplates.legal_case;
  };

  // Get auto-route suggestion
  const getAutoRoute = (intent: string): string => {
    const routes = {
      legal_case: '/intake',
      employment: '/intake?type=employment',
      family: '/intake?type=family',
      immediate_help: '/professionals'
    };
    return routes[intent as keyof typeof routes] || '/intake';
  };

  return {
    context,
    isProcessing,
    lastResponse,
    autoConnectedAI,
    processUserInput,
    // Utility functions
    getProgressPercentage: () => context.currentProgress,
    getNextSteps: () => generateProgressiveQuestions(lastResponse?.intent || 'legal_case', context.currentProgress),
    getSuggestedActions: () => context.suggestedActions,
    isReadyForNextStep: () => context.currentProgress > 70
  };
}