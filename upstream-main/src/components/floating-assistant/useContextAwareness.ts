import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface ContextAwareness {
  currentRoute: string;
  pageTitle: string;
  pageType: 'dashboard' | 'form' | 'list' | 'detail' | 'auth' | 'public' | 'unknown';
  userRole: string | null;
  formFields?: string[];
  contextualGreeting: string;
  contextualPlaceholder: string;
  suggestedActions: Array<{
    id: string;
    label: string;
    description: string;
    prompt: string;
  }>;
}

export function useContextAwareness(): ContextAwareness {
  let location;
  try {
    location = useLocation();
  } catch (error) {
    // Fallback when not inside Router context
    location = { pathname: '/' };
  }
  const [context, setContext] = useState<ContextAwareness>({
    currentRoute: '/',
    pageTitle: '',
    pageType: 'unknown',
    userRole: null,
    contextualGreeting: "Hi! I'm your AI assistant. How can I help you today?",
    contextualPlaceholder: "Type your message...",
    suggestedActions: []
  });

  useEffect(() => {
    const analyzeCurrentPage = () => {
      const route = location.pathname;
      const pageTitle = document.title || '';
      
      // Detect page type based on route
      let pageType: ContextAwareness['pageType'] = 'unknown';
      let contextualGreeting = "Hi! I'm your AI assistant. How can I help you today?";
      let contextualPlaceholder = "Type your message...";
      let suggestedActions: ContextAwareness['suggestedActions'] = [];

      // Route analysis
      if (route === '/' || route === '/landing') {
        pageType = 'public';
        contextualGreeting = "Welcome! I can help you understand our legal services and guide you through getting started.";
        contextualPlaceholder = "Ask about our services, pricing, or how to get started...";
        suggestedActions = [
          {
            id: 'services_info',
            label: 'Learn about services',
            description: 'Get information about our legal services',
            prompt: 'What services do you offer and how do they work?'
          },
          {
            id: 'get_started',
            label: 'Get started',
            description: 'Learn how to begin using our platform',
            prompt: 'How do I get started with your legal services?'
          }
        ];
      } else if (route === '/dashboard') {
        pageType = 'dashboard';
        contextualGreeting = "Welcome to your dashboard! I can help you navigate, create new cases, or explain any features.";
        contextualPlaceholder = "Ask about creating cases, managing leads, scheduling...";
        suggestedActions = [
          {
            id: 'create_case',
            label: 'Create new case',
            description: 'Start a new legal case',
            prompt: 'Help me create a new legal case'
          },
          {
            id: 'view_analytics',
            label: 'View analytics',
            description: 'Show me dashboard insights',
            prompt: 'Explain my dashboard analytics and what they mean'
          }
        ];
      } else if (route.includes('/intake')) {
        pageType = 'form';
        contextualGreeting = "I'm here to help you complete your legal intake form efficiently and accurately.";
        contextualPlaceholder = "Describe your legal situation or ask for help with the form...";
        suggestedActions = [
          {
            id: 'form_help',
            label: 'Form assistance',
            description: 'Get help filling out the form',
            prompt: 'Help me understand what information I need to provide'
          },
          {
            id: 'legal_category',
            label: 'Legal category',
            description: 'Identify the type of legal issue',
            prompt: 'What type of legal case do I have based on my situation?'
          }
        ];
      } else if (route.includes('/cases')) {
        pageType = route.includes('/cases/') ? 'detail' : 'list';
        contextualGreeting = pageType === 'detail' 
          ? "I can help you understand this case details, suggest next steps, or answer questions."
          : "I can help you manage your cases, create new ones, or explain case statuses.";
        contextualPlaceholder = pageType === 'detail'
          ? "Ask about this case, next steps, or legal advice..."
          : "Ask about case management, creating cases, or case status...";
      } else if (route.includes('/leads')) {
        pageType = 'list';
        contextualGreeting = "I can help you manage leads, convert them to cases, or explain the lead process.";
        contextualPlaceholder = "Ask about lead management, conversion, or follow-up...";
      } else if (route.includes('/calendar')) {
        pageType = 'dashboard';
        contextualGreeting = "I can help you schedule meetings, manage appointments, or explain calendar features.";
        contextualPlaceholder = "Ask about scheduling, appointments, or calendar management...";
      } else if (route.includes('/auth') || route.includes('/login')) {
        pageType = 'auth';
        contextualGreeting = "Having trouble with authentication? I can guide you through the login process.";
        contextualPlaceholder = "Ask about login issues, password reset, or account creation...";
      }

      // Detect form fields if on a form page
      const formFields = pageType === 'form' ? detectFormFields() : undefined;

      setContext({
        currentRoute: route,
        pageTitle,
        pageType,
        userRole: detectUserRole(),
        formFields,
        contextualGreeting,
        contextualPlaceholder,
        suggestedActions
      });
    };

    analyzeCurrentPage();
    
    // Re-analyze when route changes or page content updates
    const observer = new MutationObserver(analyzeCurrentPage);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['title']
    });

    return () => observer.disconnect();
  }, [location]);

  return context;
}

function detectFormFields(): string[] {
  const fields: string[] = [];
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const label = input.getAttribute('placeholder') || 
                  input.getAttribute('aria-label') || 
                  input.getAttribute('name') || 
                  '';
    if (label) fields.push(label);
  });
  
  return fields;
}

function detectUserRole(): string | null {
  // Try to detect user role from localStorage, context, or DOM
  try {
    const userRole = localStorage.getItem('userRole') || 
                     sessionStorage.getItem('userRole');
    return userRole;
  } catch {
    return null;
  }
}