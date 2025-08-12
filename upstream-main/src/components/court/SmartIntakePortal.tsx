import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCaseDraft } from '@/hooks/useCaseDraft';
import { supabase } from '@/integrations/supabase/client';
import AIConnectionTest from './AIConnectionTest';
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

const SmartIntakePortal = () => {
  const { toast } = useToast();
  const { draft, update } = useCaseDraft();
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

  // Field status tracking
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({
    title: { status: 'incomplete', message: 'Case title required' },
    summary: { status: 'incomplete', message: 'Dispute description required' },
    jurisdiction: { status: 'incomplete', message: 'Jurisdiction required' },
    category: { status: 'incomplete', message: 'Legal category required' },
    goal: { status: 'incomplete', message: 'Discussion goal required' },
    parties: { status: 'incomplete', message: 'Parties information required' },
    evidence: { status: 'incomplete', message: 'Evidence details required' },
    timeline: { status: 'incomplete', message: 'Timeline information required' }
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

// Voice input
const [listening, setListening] = useState(false);
const recognitionRef = useRef<any>(null);

const chatEndRef = useRef<HTMLDivElement>(null);
const typingTimeoutRef = useRef<NodeJS.Timeout>();
const liveDebounceRef = useRef<NodeJS.Timeout>();

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

  // Update field statuses based on draft
  useEffect(() => {
    const newStatuses = { ...fieldStatuses };
    
    Object.keys(newStatuses).forEach(field => {
      const value = draft[field as keyof typeof draft];
      let status: FieldStatus['status'] = 'incomplete';
      let message = '';
      
      if (field === 'parties' && Array.isArray(value)) {
        if (value.length >= 2) {
          status = 'complete';
          message = 'All parties defined';
        } else if (value.length === 1) {
          status = 'partial';
          message = 'At least one more party needed';
        } else {
          status = 'incomplete';
          message = 'Parties information required';
        }
      } else if (value && String(value).trim().length > 0) {
        if (String(value).trim().length > 50) {
          status = 'complete';
          message = 'Complete information provided';
        } else if (String(value).trim().length > 10) {
          status = 'partial';
          message = 'More details recommended';
        } else {
          status = 'partial';
          message = 'Basic information provided';
        }
      }
      
      newStatuses[field] = { status, message };
    });
    
    setFieldStatuses(newStatuses);
  }, [draft]);

  // Calculate readiness score based on field statuses
  useEffect(() => {
    const totalFields = Object.keys(fieldStatuses).length;
    const completeFields = Object.values(fieldStatuses).filter(f => f.status === 'complete').length;
    const partialFields = Object.values(fieldStatuses).filter(f => f.status === 'partial').length;
    
    const score = Math.round(((completeFields * 100) + (partialFields * 50)) / (totalFields * 100) * 100);
    
    let status: ReadinessStatus;
    if (score >= 80) {
      status = { color: 'green', message: 'Ready to generate trial!', score };
    } else if (score >= 50) {
      status = { color: 'orange', message: 'Almost ready - minor details missing', score };
    } else {
      status = { color: 'red', message: 'Additional details required', score };
    }
    
    setReadinessStatus(status);
  }, [fieldStatuses]);

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
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'intake_extract',
          locale: 'en',
          context: {
            history: [...chatHistory, { role: 'user', content: text }],
            required_fields: ['title', 'summary', 'jurisdiction', 'category', 'goal', 'parties', 'evidence'],
            current_fields: draft
          }
        }
      });
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
    update({ [key]: value } as any);
    setApprovedFields((prev) => ({ ...prev, [key]: true }));
    setLiveSuggestions((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    toast({ title: 'Field updated', description: `${key} approved from AI suggestion` });
  };

  const sendToAI = async () => {
    if (!currentInput.trim() || isTyping) return;

    const userMessage = currentInput.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setCurrentInput('');

    try {
      setIsAIActive(true);
      
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'intake_extract',
          locale: 'en',
          context: {
            history: [...chatHistory, { role: 'user', content: userMessage }],
            required_fields: ['title', 'summary', 'jurisdiction', 'category', 'goal', 'parties', 'evidence'],
            current_fields: draft
          }
        }
      });

      if (response.error) throw response.error;

      const aiResponse = response.data;
      
      // Update draft with extracted fields
      if (aiResponse.updated_fields) {
        update(aiResponse.updated_fields);
        
        // Create a summary of what was updated
        const updatedKeys = Object.keys(aiResponse.updated_fields);
        if (updatedKeys.length > 0) {
          const fieldsText = updatedKeys.map(key => {
            switch(key) {
              case 'title': return 'Case Title';
              case 'summary': return 'Dispute Description';
              case 'jurisdiction': return 'Jurisdiction';
              case 'category': return 'Legal Category';
              case 'goal': return 'Discussion Goal';
              case 'parties': return 'Parties';
              case 'evidence': return 'Evidence';
              default: return key;
            }
          }).join(', ');
          
          setTimeout(() => {
            typewriterEffect(`Excellent! I've updated the fields: ${fieldsText}. ${aiResponse.next_question || 'How else can I help you?'}`);
          }, 500);
        } else {
          setTimeout(() => {
            typewriterEffect(aiResponse.next_question || 'Thank you for the information. How else can I help you?');
          }, 500);
        }
      } else {
        setTimeout(() => {
          typewriterEffect('Thank you for the information. How else can I help you?');
        }, 500);
      }

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
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'case_builder',
          locale: 'en',
          context: {
            summary: draft.summary,
            goal: draft.goal,
            jurisdiction: draft.jurisdiction,
            category: draft.category
          }
        }
      });

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
    const text = `Join legal discussion: ${draft.title || 'Legal Discussion'}`;
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

  const getFieldStatusColor = (status: FieldStatus['status']) => {
    switch (status) {
      case 'complete': return 'text-green-500';
      case 'partial': return 'text-orange-500';
      case 'incomplete': return 'text-red-500';
    }
  };

  const getFieldStatusIcon = (status: FieldStatus['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'incomplete': return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Access Required</CardTitle>
            <p className="text-muted-foreground">Password required</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Access Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Instructions Infographic */}
        <Card className="border-2 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="pb-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Scale className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl">Smart Legal Portal</CardTitle>
                  <p className="text-muted-foreground">Powered by Advanced AI</p>
                </div>
              </div>
              
              {/* Usage Instructions Infographic */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center space-y-2">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm">1. Chat with AI</h3>
                  <p className="text-xs text-muted-foreground">Describe your dispute in natural language</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-sm">2. Auto-Fill Forms</h3>
                  <p className="text-xs text-muted-foreground">AI extracts and organizes information</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto">
                    <Video className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-sm">3. Choose Options</h3>
                  <p className="text-xs text-muted-foreground">Select simulation type and professionals</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
                    <Gavel className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-sm">4. Generate Trial</h3>
                  <p className="text-xs text-muted-foreground">Start your legal proceeding</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Readiness Status */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <div className="text-sm font-medium">
                    <div>{readinessStatus.message}</div>
                    <div className="text-xs opacity-75">{readinessStatus.score}% Complete</div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AI Chat Interface */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <CardTitle>Interactive AI Interview</CardTitle>
                {isAIActive && <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />}
                {isLiveExtracting && (
                  <Badge variant="outline" className="ml-2 animate-fade-in">Live</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="text-sm">
                        {message.content}
                        {message.typing && <span className="animate-pulse">|</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Describe your dispute..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendToAI();
                      }
                    }}
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={sendToAI} 
                    disabled={!currentInput.trim() || isTyping || isAIActive}
                    className="h-[60px] px-6"
                  >
                    {isAIActive ? <Zap className="w-4 h-4 animate-pulse" /> : <MessageSquare className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Information Panel */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Case Details
                {showDetails && (
                  <Badge variant="outline" className="ml-auto">
                    Live Updates
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-muted-foreground">Case Title</label>
                    {showDetails && (
                      <div className={`flex items-center gap-1 ${getFieldStatusColor(fieldStatuses.title?.status || 'incomplete')}`}>
                        {getFieldStatusIcon(fieldStatuses.title?.status || 'incomplete')}
                        <span className="text-xs">{fieldStatuses.title?.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 p-2 bg-muted rounded min-h-[36px] flex items-center">
                    {draft.title || 'Not defined'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-muted-foreground">Jurisdiction</label>
                    {showDetails && (
                      <div className={`flex items-center gap-1 ${getFieldStatusColor(fieldStatuses.jurisdiction?.status || 'incomplete')}`}>
                        {getFieldStatusIcon(fieldStatuses.jurisdiction?.status || 'incomplete')}
                        <span className="text-xs">{fieldStatuses.jurisdiction?.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 p-2 bg-muted rounded min-h-[36px] flex items-center">
                    {draft.jurisdiction || 'Not defined'}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium text-muted-foreground">Dispute Description</label>
                  {showDetails && (
                    <div className={`flex items-center gap-1 ${getFieldStatusColor(fieldStatuses.summary?.status || 'incomplete')}`}>
                      {getFieldStatusIcon(fieldStatuses.summary?.status || 'incomplete')}
                      <span className="text-xs">{fieldStatuses.summary?.message}</span>
                    </div>
                  )}
                </div>
                <div className="mt-1 p-2 bg-muted rounded min-h-[60px]">
                  {draft.summary || 'Not defined'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    {showDetails && (
                      <div className={`flex items-center gap-1 ${getFieldStatusColor(fieldStatuses.category?.status || 'incomplete')}`}>
                        {getFieldStatusIcon(fieldStatuses.category?.status || 'incomplete')}
                        <span className="text-xs">{fieldStatuses.category?.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 p-2 bg-muted rounded min-h-[36px] flex items-center">
                    {draft.category || 'Not defined'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-muted-foreground">Goal</label>
                    {showDetails && (
                      <div className={`flex items-center gap-1 ${getFieldStatusColor(fieldStatuses.goal?.status || 'incomplete')}`}>
                        {getFieldStatusIcon(fieldStatuses.goal?.status || 'incomplete')}
                        <span className="text-xs">{fieldStatuses.goal?.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 p-2 bg-muted rounded min-h-[36px] flex items-center">
                    {draft.goal || 'Not defined'}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium text-muted-foreground">Parties</label>
                  {showDetails && (
                    <div className={`flex items-center gap-1 ${getFieldStatusColor(fieldStatuses.parties?.status || 'incomplete')}`}>
                      {getFieldStatusIcon(fieldStatuses.parties?.status || 'incomplete')}
                      <span className="text-xs">{fieldStatuses.parties?.message}</span>
                    </div>
                  )}
                </div>
                <div className="mt-1 space-y-2">
                  {draft.parties?.length ? draft.parties.map((party, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{party.role}: {party.name}</span>
                    </div>
                  )) : (
                    <div className="p-2 bg-muted rounded">No parties defined</div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Simulation Options */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Simulation Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              <Card className={`cursor-pointer border-2 transition-all ${
                simulationType === 'impression' ? 'border-primary bg-primary/5' : 'border-muted'
              }`} onClick={() => setSimulationType('impression')}>
                <CardContent className="p-4 text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold mb-1">For Impression</h3>
                  <p className="text-xs text-muted-foreground">Basic discussion without audience</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 transition-all ${
                simulationType === 'practice' ? 'border-primary bg-primary/5' : 'border-muted'
              }`} onClick={() => setSimulationType('practice')}>
                <CardContent className="p-4 text-center">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold mb-1">Practice</h3>
                  <p className="text-xs text-muted-foreground">With/without audience</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 transition-all ${
                simulationType === 'public' ? 'border-primary bg-primary/5' : 'border-muted'
              }`} onClick={() => setSimulationType('public')}>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold mb-1">Public</h3>
                  <p className="text-xs text-muted-foreground">Call for public participation</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 transition-all ${
                simulationType === 'paid' ? 'border-primary bg-primary/5' : 'border-muted'
              }`} onClick={() => setSimulationType('paid')}>
                <CardContent className="p-4 text-center">
                  <Gavel className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <h3 className="font-semibold mb-1">Professional</h3>
                  <p className="text-xs text-muted-foreground">With paid experts</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>With audience</span>
                </div>
                <Switch checked={hasAudience} onCheckedChange={setHasAudience} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Require deposit for enforcement</span>
                </div>
                <Switch checked={needsDeposit} onCheckedChange={setNeedsDeposit} />
              </div>

              <Separator />

              {/* Professional Selection */}
              <div>
                <h4 className="font-semibold mb-3">Invite Professionals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'lawyer', label: 'Lawyers', icon: Scale },
                    { id: 'judge', label: 'Judges', icon: Gavel },
                    { id: 'mediator', label: 'Mediators', icon: Users },
                    { id: 'expert', label: 'Experts', icon: UserCheck }
                  ].map((prof) => (
                    <Button
                      key={prof.id}
                      variant={selectedProfessionals.includes(prof.id) ? 'default' : 'outline'}
                      className="h-auto p-3 flex-col gap-1"
                      onClick={() => {
                        setSelectedProfessionals(prev => 
                          prev.includes(prof.id) 
                            ? prev.filter(p => p !== prof.id)
                            : [...prev, prof.id]
                        );
                      }}
                    >
                      <prof.icon className="w-4 h-4" />
                      <span className="text-xs">{prof.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Social Media Sharing */}
              <div>
                <h4 className="font-semibold mb-3">Share on Social Media</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('linkedin')}
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('facebook')}
                    className="flex items-center gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('twitter')}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Card className="border-2 shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6 text-center">
            <Button
              onClick={generateCase}
              disabled={readinessStatus.score < 80}
              size="lg"
              className="h-16 px-12 text-lg font-semibold"
            >
              <Scale className="w-6 h-6 mr-2" />
              Generate Trial & Start Discussion
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {readinessStatus.score < 80 
                ? 'Complete all required details to begin' 
                : 'All set! Click to start the discussion'
              }
            </p>
          </CardContent>
        </Card>

        {/* AI Connection Test - Moved to bottom */}
        <AIConnectionTest />

        {/* Footer */}
        <Card className="border-2 shadow-lg bg-slate-900 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-sm">
              © 2024 All Rights Reserved - <strong>jus-tice.com</strong>
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default SmartIntakePortal;