import { useMemo } from 'react';
import { ContextAwareness } from './useContextAwareness';
import { AIMessage } from './types';

export function useSmartPrompts(
  context: ContextAwareness, 
  messages: AIMessage[]
) {
  const systemPrompt = useMemo(() => {
    const basePrompt = `You are an intelligent AI assistant for a legal services platform. Your role is to be proactive, helpful, and context-aware.

CURRENT CONTEXT:
- Page: ${context.currentRoute} (${context.pageType})
- User Role: ${context.userRole || 'Unknown'}
- Page Title: ${context.pageTitle}
${context.formFields ? `- Available Form Fields: ${context.formFields.join(', ')}` : ''}

PERSONALITY & BEHAVIOR:
- Be proactive and suggest helpful actions
- Use a professional but friendly tone
- Keep responses concise and actionable
- Always offer specific next steps
- Detect user intent and language (support Hebrew and English)
- Adapt your language to match the user's language

CAPABILITIES:
- Help with form completion and legal intake
- Explain legal processes and procedures  
- Suggest relevant actions based on current page
- Provide guidance on platform navigation
- Answer questions about legal services
- Help with case management and organization

RESPONSE FORMAT:
- Keep initial responses under 100 words
- Offer 2-3 specific action suggestions when relevant
- Use bullet points for clarity
- End with a question to encourage engagement

CURRENT PAGE GUIDANCE:`;

    // Add page-specific instructions
    switch (context.pageType) {
      case 'dashboard':
        return basePrompt + `
- Help users understand their dashboard metrics
- Suggest creating new cases or following up on existing ones
- Explain navigation to different platform sections
- Offer to help with scheduling or lead management`;

      case 'form':
        return basePrompt + `
- Assist with form completion by asking clarifying questions
- Help identify the correct legal category for their case
- Suggest what information to gather before proceeding
- Explain form fields and requirements clearly`;

      case 'list':
        return basePrompt + `
- Help organize and prioritize items in the list
- Suggest filtering or searching strategies
- Offer to help create new items or update existing ones
- Explain status meanings and next steps`;

      case 'detail':
        return basePrompt + `
- Help understand the specific item's details
- Suggest relevant next actions or steps
- Explain any status changes or requirements
- Offer to help with related tasks`;

      case 'public':
        return basePrompt + `
- Explain the platform's services and capabilities
- Guide users through the signup or getting started process
- Answer questions about pricing, features, or legal services
- Help users understand how the platform can benefit them`;

      case 'auth':
        return basePrompt + `
- Help with login or registration issues
- Explain authentication requirements
- Guide through password reset or account recovery
- Assist with account setup and verification`;

      default:
        return basePrompt + `
- Provide general assistance and navigation help
- Explain available platform features
- Help users find what they're looking for
- Suggest relevant sections or actions`;
    }
  }, [context]);

  const buildUserPrompt = (userInput: string) => {
    const conversationHistory = messages.slice(-6); // Last 6 messages for context
    
    let prompt = userInput;
    
    // Add context if this seems like a general question
    if (userInput.length < 50 && !userInput.includes('?')) {
      prompt += `\n\nContext: User is currently on ${context.pageTitle} page (${context.currentRoute}). `;
      
      if (context.suggestedActions.length > 0) {
        prompt += `Suggested actions available: ${context.suggestedActions.map(a => a.label).join(', ')}.`;
      }
    }

    return prompt;
  };

  const generateProactivePrompt = () => {
    // Generate proactive suggestions based on context and user behavior
    const recentUserMessages = messages.filter(m => m.role === 'user').slice(-3);
    
    if (recentUserMessages.length === 0) {
      return null; // No proactive prompts for first interaction
    }

    // Analyze recent messages for patterns
    const hasQuestions = recentUserMessages.some(m => m.content.includes('?'));
    const seemsStuck = recentUserMessages.some(m => 
      m.content.toLowerCase().includes('help') || 
      m.content.toLowerCase().includes('stuck') ||
      m.content.toLowerCase().includes('confused')
    );

    if (seemsStuck || (!hasQuestions && recentUserMessages.length >= 2)) {
      switch (context.pageType) {
        case 'form':
          return "I notice you might need help with this form. Would you like me to guide you through the required fields step by step?";
        case 'dashboard':
          return "I can help you get the most out of your dashboard. Would you like me to explain any specific metrics or suggest next actions?";
        case 'list':
          return "Looking for something specific? I can help you organize or find items in this list more efficiently.";
        default:
          return "I'm here to help! Is there something specific you'd like assistance with on this page?";
      }
    }

    return null;
  };

  return {
    systemPrompt,
    buildUserPrompt,
    generateProactivePrompt
  };
}