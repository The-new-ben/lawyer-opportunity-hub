// Main exports for the FloatingAssistant module
export { FloatingAssistant } from './FloatingAssistant';
export { FloatingAIProvider, useFloatingAIContext } from './FloatingAIProvider';

// Types
export type { 
  AIMessage,
  QuickAction,
  FloatingAssistantConfig,
  FloatingAssistantState
} from './types';

// Hooks
export { useContextAwareness } from './useContextAwareness';
export { useFloatingAI } from './useFloatingAI';
export { useSmartPrompts } from './useSmartPrompts';

// Components
export { TypingAnimation } from './TypingAnimation';
export { QuickActions } from './QuickActions';