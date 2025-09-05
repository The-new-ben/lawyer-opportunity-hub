import { useState, useCallback, useEffect } from 'react';
import { runIntake } from '@/aiIntake/openaiIntakeClient';
import { useSmartPrompts } from './useSmartPrompts';
import { ContextAwareness } from './useContextAwareness';
import { AIMessage, FloatingAssistantConfig, QuickAction } from './types';

interface UseFloatingAIProps {
  context: ContextAwareness;
  config: FloatingAssistantConfig;
}

export function useFloatingAI({ context, config }: UseFloatingAIProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<Record<string, any>>({});

  const { systemPrompt, buildUserPrompt, generateProactivePrompt } = useSmartPrompts(context, messages);

  // Generate quick actions based on context
  const quickActions: QuickAction[] = context.suggestedActions.map(action => ({
    id: action.id,
    label: action.label,
    description: action.description,
    prompt: action.prompt,
    icon: getActionIcon(action.id)
  }));

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation for API
      const conversationMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.slice(-8).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user' as const, content: buildUserPrompt(content) }
      ];

      // Call the existing AI intake function
      const response = await runIntake(conversationMessages);
      
      // Extract text response (use caseSummary as the main response)
      let aiResponseText = response.caseSummary || 
                          response.nextQuestion || 
                          "I understand. How can I help you further?";

      // If we have structured data, incorporate it into the response
      if (response.caseTitle || response.legalCategory) {
        const structuredInfo = [];
        if (response.caseTitle) structuredInfo.push(`Case: ${response.caseTitle}`);
        if (response.legalCategory) structuredInfo.push(`Category: ${response.legalCategory}`);
        if (response.jurisdiction) structuredInfo.push(`Jurisdiction: ${response.jurisdiction}`);
        
        if (structuredInfo.length > 0) {
          aiResponseText += `\n\n📋 Extracted Information:\n${structuredInfo.join('\n')}`;
        }
      }

      // Add next steps if available
      if (response.nextQuestion && response.nextQuestion !== response.caseSummary) {
        aiResponseText += `\n\n❓ ${response.nextQuestion}`;
      }

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date(),
        metadata: response
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update session data with extracted information
      if (response) {
        setSessionData(prev => ({ ...prev, ...response }));
      }

    } catch (error) {
      console.error('AI response error:', error);
      
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to contact support if the issue persists.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, systemPrompt, buildUserPrompt]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setSessionData({});
  }, []);

  // Show proactive suggestions when appropriate
  useEffect(() => {
    if (config.enableProactiveSuggestions !== false && messages.length === 0) {
      const proactivePrompt = generateProactivePrompt();
      if (proactivePrompt) {
        setTimeout(() => {
          const welcomeMessage: AIMessage = {
            id: 'welcome',
            role: 'assistant',
            content: proactivePrompt,
            timestamp: new Date(),
            isProactive: true
          };
          setMessages([welcomeMessage]);
        }, 2000);
      }
    }
  }, [context.currentRoute, config.enableProactiveSuggestions]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    quickActions,
    sessionData
  };
}

function getActionIcon(actionId: string): string {
  const iconMap: Record<string, string> = {
    'create_case': 'FileText',
    'services_info': 'Info',
    'get_started': 'Play',
    'form_help': 'HelpCircle',
    'legal_category': 'Tag',
    'view_analytics': 'BarChart3'
  };
  
  return iconMap[actionId] || 'MessageCircle';
}