import React, { useState, useEffect, useRef } from 'react';
import { FormProvider } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { InviteManager } from '@/components/social/InviteManager';
import { PollManager } from '@/components/polls/PollManager';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { ProfessionalMarketplace } from '@/components/professionals/ProfessionalMarketplace';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import AIConnectionTest from './AIConnectionTest';
import { useAIAssistedIntake } from '@/aiIntake/useAIAssistedIntake';
import { AIFieldsDisplay } from '@/aiIntake/AIFieldsDisplay';
import AIBridge from '@/aiIntake/AIBridge';
import { useFormWithAI } from '@/aiIntake/useFormWithAI';
import {
  MessageSquare,
  Users,
  Globe,
  FileText, 
  Calendar, 
  CreditCard, 
  Phone, 
  Mail, 
  Linkedin, 
  Facebook, 
  Twitter,
  CheckCircle,
  AlertCircle,
  Clock,
  Bot,
  Sparkles,
  Zap,
  Scale,
  Video,
  UserCheck,
  Gavel,
  Lock,
  Shield,
  Target,
  Eye,
  Mic,
  Square
} from 'lucide-react';

interface ReadinessStatus {
  color: 'red' | 'orange' | 'green';
  message: string;
  score: number;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  typing?: boolean;
}

interface FieldStatus {
  status: 'incomplete' | 'partial' | 'complete';
  message: string;
}

const fieldsConfig = [
  { id: 'caseTitle', label: 'Case Title', type: 'text', required: true, allowAttachments: false, options: [], dependsOn: null },
  { id: 'jurisdiction', label: 'Jurisdiction', type: 'text', required: true, allowAttachments: false, options: [], dependsOn: null },
  { id: 'category', label: 'Category', type: 'select', required: true, allowAttachments: false, options: ['Criminal', 'Civil', 'Family', 'Labor'], dependsOn: null },
  { id: 'caseSummary', label: 'Case Summary', type: 'textarea', required: true, allowAttachments: true, options: [], dependsOn: null },
  { id: 'goal', label: 'Goal', type: 'text', required: false, allowAttachments: false, options: [], dependsOn: null },
  { id: 'parties', label: 'Parties', type: 'text', required: true, allowAttachments: false, options: [], dependsOn: null },
  { id: 'evidence', label: 'Evidence', type: 'textarea', required: false, allowAttachments: true, options: [], dependsOn: null },
  { id: 'timeline', label: 'Timeline', type: 'textarea', required: false, allowAttachments: false, options: [], dependsOn: null }
];

const SmartIntakePortal = () => {
  const { toast } = useToast();
  const { form, applyAIToForm, applyOneField, calculateProgress } = useFormWithAI('draft');
  const { 
    aiFields, 
    nextQuestion, 
    loading: aiLoading, 
    onUserInput, 
    approveField, 
    editField,
    resetFields 
  } = useAIAssistedIntake();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isAIActive, setIsAIActive] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'ai', 
      content: 'Hello! I\'m here to help you prepare your case for discussion. Let\'s start with a brief description of your dispute.' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>({ 
    color: 'red', 
    message: 'Additional details required', 
    score: 0 
  });

  // Simulation options
  const [simulationType, setSimulationType] = useState<'impression' | 'practice' | 'public' | 'paid'>('impression');
  const [hasAudience, setHasAudience] = useState(false);
  const [needsDeposit, setNeedsDeposit] = useState(false);
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Live extraction & approvals
  const [liveSuggestions, setLiveSuggestions] = useState<Record<string, any>>({});
  const [approvedFields, setApprovedFields] = useState<Record<string, boolean>>({});
  const [isLiveExtracting, setIsLiveExtracting] = useState(false);
  const [fieldsConfig, setFieldsConfig] = useState<{ id: string }[]>([]);

  // HF token (memory-only)
  const [hfToken, setHfToken] = useState('');

  // Voice input
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const liveDebounceRef = useRef<NodeJS.Timeout>();

  // Calculate progress based on form values
  useEffect(() => {
    const progress = calculateProgress();
    
    let status: ReadinessStatus;
    if (progress >= 80) {
      status = { color: 'green', message: 'Ready to generate trial!', score: progress };
    } else if (progress >= 50) {
      status = { color: 'orange', message: 'Almost ready - minor details missing', score: progress };
    } else {
      status = { color: 'red', message: 'Additional details required', score: progress };
    }
    
    setReadinessStatus(status);
  }, [form.watch(), calculateProgress]);

  // Authentication check
  const handleLogin = () => {
    if (password === "0584444595") {
      setIsAuthenticated(true);
      toast({
        title: 'Access Granted',
        description: 'Welcome to the Smart Legal Portal',
      });
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid password',
        variant: 'destructive'
      });
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Debounced live extraction while typing
  useEffect(() => {
    if (!currentInput.trim() || isTyping) return;
    if (liveDebounceRef.current) clearTimeout(liveDebounceRef.current);
    liveDebounceRef.current = setTimeout(() => {
      extractLive(currentInput.trim());
    }, 600);
    return () => {
      if (liveDebounceRef.current) clearTimeout(liveDebounceRef.current);
    };
  }, [currentInput, isTyping]);

  const typewriterEffect = (text: string, callback?: () => void) => {
    setIsTyping(true);
    setChatHistory(prev => [...prev, { role: 'ai', content: '', typing: true }]);
    
    let i = 0;
    const typeChar = () => {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].content = text.slice(0, i + 1);
        return newHistory;
      });
      
      i++;
      if (i < text.length) {
        typingTimeoutRef.current = setTimeout(typeChar, Math.random() * 50 + 20);
      } else {
        setIsTyping(false);
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].typing = false;
          return newHistory;
        });
        callback?.();
      }
    };
    
    typeChar();
  };

  // Live extractor used by debounce
  const extractLive = async (text: string) => {
    try {
      setIsLiveExtracting(true);
      console.log('[AI] extractLive -> invoking ai-court-orchestrator', { text });
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'intake_extract',
          locale: 'en',
          hf_token: hfToken || undefined,
          context: {
            history: [...chatHistory, { role: 'user', content: text }],
            required_fields: ['title', 'summary', 'jurisdiction', 'category', 'goal', 'parties', 'evidence'],
            current_fields: form.getValues()
          }
        }
      });
      console.log('[AI] extractLive <- response', response);
      if (response.error) throw response.error;
      const aiResponse = response.data;
      if (aiResponse?.updated_fields) {
        setLiveSuggestions(aiResponse.updated_fields);
      }
    } catch (e) {
      console.error('Live extract error:', e);
    } finally {
      setIsLiveExtracting(false);
    }
  };

  // Voice controls
  const startListening = () => {
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) {
        toast({ title: 'Voice not supported', description: 'Browser missing SpeechRecognition', variant: 'destructive' });
        return;
      }
      const rec = new SR();
      recognitionRef.current = rec;
      rec.lang = 'he-IL';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setCurrentInput((prev) => (prev + ' ' + transcript).trim());
          }
        }
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      rec.start();
      setListening(true);
    } catch (e) {
      console.error('Mic start error', e);
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop?.(); } finally { setListening(false); }
  };

  const approveSuggestion = (key: string) => {
    const value = (liveSuggestions as any)[key];
    if (value === undefined) return;
    
    // Apply suggestion directly to form
    form.setValue(key as any, value, { shouldDirty: true, shouldTouch: true });
    
    setApprovedFields((prev) => ({ ...prev, [key]: true }));
    setLiveSuggestions((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    toast({ title: 'Field updated', description: `${key} approved from AI suggestion` });
  };

  const addDynamicField = (fieldConfig: { id: string }) => {
    setFieldsConfig(prev =>
      prev.some(field => field.id === fieldConfig.id)
        ? prev
        : [...prev, fieldConfig]
    );
  };

  const applyAIFields = (fieldsToApply: Record<string, any>) => {
    if (Object.keys(fieldsToApply).length > 0) {
      // Apply each field to the form using React Hook Form
      Object.entries(fieldsToApply).forEach(([key, value]) => {
        console.log(`Applying AI field: ${key} = ${value}`);
        form.setValue(key as any, value, { 
          shouldDirty: true, 
          shouldTouch: true, 
          shouldValidate: true 
        });
      });
      
      // Trigger validation for all applied fields
      Object.keys(fieldsToApply).forEach(key => {
        form.trigger(key as any);
      });
      
      // Show success with animated toast
      toast({
        title: '✨ Fields Applied Successfully!',
        description: `${Object.keys(fieldsToApply).length} fields updated with AI suggestions`,
      });
      
      // Don't reset fields immediately - let user see the applied values
      console.log('Form values after AI apply:', form.getValues());
    }
  };

  const sendToAI = async () => {
    if (!currentInput.trim() || isTyping) return;

    const userMessage = currentInput.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setCurrentInput('');

    try {
      setIsAIActive(true);
      
      // Trigger AI analysis with actual user input
      await onUserInput(userMessage);
      
      // Apply AI results to form automatically
      // This will happen through the AI bridge
      
      // Show typing effect with next question if available
      setTimeout(() => {
        const responseText = nextQuestion || 'Thank you for the information. I\'m analyzing your input now.';
        typewriterEffect(responseText);
      }, 1500);

    } catch (error) {
      console.error('AI Error:', error);
      setTimeout(() => {
        typewriterEffect('Sorry, I encountered an issue. Let\'s try again.');
      }, 500);
      
      toast({
        title: 'AI Connection Error',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsAIActive(false);
    }
  };

  const generateCase = async () => {
    if (readinessStatus.score < 80) {
      toast({
        title: 'Not Ready Yet',
        description: 'Please complete all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formValues = form.getValues();
      console.log('[AI] generateCase ->', formValues);
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'case_builder',
          locale: 'en',
          hf_token: hfToken || undefined,
          context: {
            summary: formValues.summary,
            goal: formValues.goal,
            jurisdiction: formValues.jurisdiction,
            category: formValues.category
          }
        }
      });
      console.log('[AI] generateCase <- response', response);

      if (response.error) throw response.error;

      toast({
        title: 'Case Created Successfully!',
        description: 'You can now start the discussion',
      });

      // Start case simulation based on selected type
      startSimulation();

    } catch (error) {
      console.error('Case generation error:', error);
      toast({
        title: 'Case Creation Error',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const startSimulation = () => {
    let message = '';
    switch (simulationType) {
      case 'impression':
        message = 'Starting impression simulation...';
        break;
      case 'practice':
        message = 'Starting practice session...';
        break;
      case 'public':
        message = 'Publishing public call for participation...';
        break;
      case 'paid':
        message = 'Setting up paid discussion with legal professionals...';
        break;
    }
    
    typewriterEffect(message);
  };

  const shareToSocial = (platform: string) => {
    const formValues = form.getValues();
    const text = `Join legal discussion: ${formValues.title || 'Legal Discussion'}`;
    const urls = {
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const getStatusColor = () => {
    switch (readinessStatus.color) {
      case 'green': return 'text-green-500 bg-green-50 border-green-200';
      case 'orange': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'red': return 'text-red-500 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = () => {
    switch (readinessStatus.color) {
      case 'green': return <CheckCircle className="w-5 h-5" />;
      case 'orange': return <Clock className="w-5 h-5" />;
      case 'red': return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Smart Legal Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter access code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Access Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Chat Interface */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-blue-600" />
                    <CardTitle>AI Legal Assistant</CardTitle>
                    {isAIActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.content}
                          {message.typing && (
                            <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-1" />
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* AI Bridge Component */}
                  <AIBridge 
                    aiFields={aiFields} 
                     onApplyFields={applyAIToForm}
                    onApplyOne={applyOneField}
                    isLocked={() => false}
                  />

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Describe your legal issue..."
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendToAI())}
                      className="flex-1 min-h-[50px]"
                      disabled={isTyping || isAIActive}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={listening ? stopListening : startListening}
                        variant="outline"
                        size="sm"
                        className={listening ? 'bg-red-100 text-red-600' : ''}
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={sendToAI} 
                        disabled={!currentInput.trim() || isTyping || isAIActive}
                        size="sm"
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Case Readiness Status */}
              <Card>
                <CardContent className="p-4">
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <div className="flex-1">
                      <div className="font-semibold">Case Readiness: {readinessStatus.score}%</div>
                      <div className="text-sm opacity-80">{readinessStatus.message}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{readinessStatus.score}%</div>
                      <div className="text-xs opacity-70">Complete</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {fieldsConfig.map(field => {
                    if (field.dependsOn && !form.watch(field.dependsOn)) return null
                    return (
                      <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="text-sm font-medium">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <Textarea id={field.id} {...form.register(field.id, { required: field.required })} />
                        ) : field.type === 'select' ? (
                          <Select value={form.watch(field.id)} onValueChange={value => form.setValue(field.id, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder={field.label} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input id={field.id} type="text" {...form.register(field.id, { required: field.required })} />
                        )}
                        {field.allowAttachments && <Input type="file" multiple />}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Button 
                      onClick={generateCase}
                      disabled={readinessStatus.score < 80}
                      className="flex-1"
                    >
                      <Scale className="w-4 h-4 mr-2" />
                      Generate Case Discussion
                    </Button>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default SmartIntakePortal;
