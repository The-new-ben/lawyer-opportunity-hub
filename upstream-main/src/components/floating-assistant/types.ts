export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
  isError?: boolean;
  isProactive?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: string;
}

export interface FloatingAssistantConfig {
  // Basic settings
  assistantName?: string;
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  // Behavior settings
  enableProactiveSuggestions?: boolean;
  enableContextAwareness?: boolean;
  enableSessionMemory?: boolean;
  
  // UI settings
  showQuickActions?: boolean;
  enableTypingAnimation?: boolean;
  autoMinimizeAfter?: number; // minutes
  
  // AI settings
  maxHistoryMessages?: number;
  responseStyle?: 'concise' | 'detailed' | 'conversational';
  defaultLanguage?: 'en' | 'he' | 'auto';
  
  // Custom prompts
  systemPromptOverride?: string;
  welcomeMessage?: string;
  
  // Integration settings
  apiEndpoint?: string;
  enableAnalytics?: boolean;
  
  // Access control
  enabledForRoles?: string[];
  enabledForRoutes?: string[];
  disabledForRoutes?: string[];
}

export interface FloatingAssistantState {
  isOpen: boolean;
  isMinimized: boolean;
  currentSession: string;
  messageHistory: AIMessage[];
  sessionData: Record<string, any>;
}