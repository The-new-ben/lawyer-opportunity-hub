import React, { createContext, useContext, useState, useCallback } from 'react';
import { FloatingAssistantConfig, AIMessage } from './types';

interface FloatingAIContextType {
  isEnabled: boolean;
  config: FloatingAssistantConfig;
  globalMessages: AIMessage[];
  sessionMemory: Record<string, any>;
  updateConfig: (config: Partial<FloatingAssistantConfig>) => void;
  addGlobalMessage: (message: AIMessage) => void;
  updateSessionMemory: (key: string, value: any) => void;
  clearSession: () => void;
}

const FloatingAIContext = createContext<FloatingAIContextType | undefined>(undefined);

export const useFloatingAIContext = () => {
  const context = useContext(FloatingAIContext);
  if (!context) {
    throw new Error('useFloatingAIContext must be used within FloatingAIProvider');
  }
  return context;
};

interface FloatingAIProviderProps {
  children: React.ReactNode;
  config?: FloatingAssistantConfig;
  enabled?: boolean;
}

export function FloatingAIProvider({ 
  children, 
  config = {}, 
  enabled = true 
}: FloatingAIProviderProps) {
  const [isEnabled] = useState(enabled);
  const [currentConfig, setCurrentConfig] = useState<FloatingAssistantConfig>(config);
  const [globalMessages, setGlobalMessages] = useState<AIMessage[]>([]);
  const [sessionMemory, setSessionMemory] = useState<Record<string, any>>({});

  const updateConfig = useCallback((newConfig: Partial<FloatingAssistantConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const addGlobalMessage = useCallback((message: AIMessage) => {
    setGlobalMessages(prev => [...prev.slice(-20), message]); // Keep last 20 messages
  }, []);

  const updateSessionMemory = useCallback((key: string, value: any) => {
    setSessionMemory(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearSession = useCallback(() => {
    setGlobalMessages([]);
    setSessionMemory({});
  }, []);

  const contextValue: FloatingAIContextType = {
    isEnabled,
    config: currentConfig,
    globalMessages,
    sessionMemory,
    updateConfig,
    addGlobalMessage,
    updateSessionMemory,
    clearSession
  };

  return (
    <FloatingAIContext.Provider value={contextValue}>
      {children}
    </FloatingAIContext.Provider>
  );
}