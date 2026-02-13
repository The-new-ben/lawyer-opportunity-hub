import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  MessageSquare, Mic, Send, Bot, User, CheckCircle, 
  AlertCircle, Clock, MapPin, Scale, Users, FileText,
  Sparkles, Volume2, VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';

interface ExtractedFields {
  jurisdiction?: string;
  parties?: Array<{ name: string; role: 'plaintiff' | 'defendant' }>;
  location?: string;
  claimAmount?: number;
  category?: string;
  confidence?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

export const LiveIntake = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'ברוכים הבאים למערכת Live Intake 2.0! אני כאן לעזור לכם ליצור תיק משפטי בצורה חכמה ויעילה. ספרו לי על המצב המשפטי שלכם והמערכת תזהה אוטומטית את השדות הרלוונטיים.',
      timestamp: new Date()
    }
  ]);
  
  const [currentInput, setCurrentInput] = useState('');
  const [extractedFields, setExtractedFields] = useState<ExtractedFields>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(true);
  const [readinessScore, setReadinessScore] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Debounce for AI extraction
  const debouncedInput = useDebounce(currentInput, 600);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Extraction when input changes
  useEffect(() => {
    if (debouncedInput.trim().length > 10) {
      extractFields(debouncedInput);
    }
  }, [debouncedInput]);

  // Calculate readiness score
  useEffect(() => {
    const fields = extractedFields;
    let score = 0;
    if (fields.jurisdiction) score += 25;
    if (fields.parties?.length) score += 25;
    if (fields.location) score += 20;
    if (fields.category) score += 20;
    if (fields.claimAmount) score += 10;
    setReadinessScore(score);
  }, [extractedFields]);

  const extractFields = async (text: string) => {
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-intake-extract', {
        body: { 
          action: 'intake_extract', 
          text: text 
        }
      });

      if (error) throw error;

      if (data?.fields) {
        setExtractedFields(prev => ({
          ...prev,
          ...data.fields,
          confidence: data.confidence || 0.8
        }));
      }
    } catch (error) {
      console.error('Extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const typewriterEffect = (text: string, callback?: () => void) => {
    setIsTyping(true);
    const messageId = Date.now().toString();
    
    // Add typing indicator
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      typing: true
    }]);

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: text.slice(0, index), typing: index < text.length }
            : msg
        ));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        callback?.();
      }
    }, 30);
  };

  const sendMessage = async () => {
    if (!currentInput.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    // Get AI response
    try {
      const { data, error } = await supabase.functions.invoke('ai-intake-extract', {
        body: { 
          action: 'chat_response', 
          context: { 
            message: currentInput,
            extractedFields: extractedFields,
            simulationMode: isSimulationMode
          } 
        }
      });

      if (error) throw error;

      const response = data?.response || 'מצטער, נתקלתי בבעיה. בואנו ננסה שוב.';
      
      setTimeout(() => {
        typewriterEffect(response);
      }, 800);
      
    } catch (error) {
      console.error('Chat error:', error);
      setTimeout(() => {
        typewriterEffect('מצטער, נתקלתי בבעיה טכנית. בואנו ננסה שוב.');
      }, 800);
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'זיהוי קול לא נתמך',
        description: 'הדפדפן שלך לא תומך בזיהוי קול',
        variant: 'destructive'
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'he-IL';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentInput(prev => prev + ' ' + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: 'שגיאת זיהוי קול',
        description: 'נסה שוב',
        variant: 'destructive'
      });
    };

    recognition.start();
  };

  const stopVoiceRecognition = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const approveField = (field: keyof ExtractedFields) => {
    toast({
      title: 'שדה אושר',
      description: `${field} נשמר בהצלחה`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Live Intake 2.0</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">מצב סימולציה</span>
                <Switch 
                  checked={isSimulationMode}
                  onCheckedChange={setIsSimulationMode}
                />
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                <span className="text-sm font-medium">{readinessScore}% מוכן</span>
              </div>
            </div>
          </div>
          <Progress value={readinessScore} className="mt-2" />
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Panel */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                שיחה עם מערכת ה-AI
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`flex-1 p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary'
                    }`}>
                      <p className="text-sm">
                        {message.content}
                        {message.typing && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="כתוב את הודעתך כאן..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  {isExtracting && (
                    <div className="absolute top-2 right-2">
                      <Sparkles className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                    size="sm"
                    variant={isListening ? "destructive" : "outline"}
                  >
                    {isListening ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={sendMessage}
                    disabled={!currentInput.trim() || isTyping}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Form Panel */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                טופס חכם - שדות מזוהים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Jurisdiction */}
              <div className="space-y-2">
                <label className="text-sm font-medium">תחום שיפוט</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={extractedFields.jurisdiction || ''} 
                    placeholder="בית משפט..."
                    readOnly
                  />
                  {extractedFields.jurisdiction && (
                    <Button
                      size="sm"
                      onClick={() => approveField('jurisdiction')}
                      className="shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {extractedFields.jurisdiction && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    זוהה אוטומטית
                  </Badge>
                )}
              </div>

              {/* Parties */}
              <div className="space-y-2">
                <label className="text-sm font-medium">הצדדים</label>
                <div className="space-y-2">
                  {extractedFields.parties?.map((party, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Users className="w-4 h-4" />
                      <span className="flex-1">{party.name}</span>
                      <Badge variant={party.role === 'plaintiff' ? 'default' : 'secondary'}>
                        {party.role === 'plaintiff' ? 'תובע' : 'נתבע'}
                      </Badge>
                      <Button size="sm" onClick={() => approveField('parties')}>
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )) || (
                    <Input placeholder="עדיין לא זוהו צדדים..." readOnly />
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">מיקום</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={extractedFields.location || ''} 
                    placeholder="מיקום האירוע..."
                    readOnly
                  />
                  {extractedFields.location && (
                    <Button
                      size="sm"
                      onClick={() => approveField('location')}
                      className="shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">קטגוריה משפטית</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={extractedFields.category || ''} 
                    placeholder="סוג התיק..."
                    readOnly
                  />
                  {extractedFields.category && (
                    <Button
                      size="sm"
                      onClick={() => approveField('category')}
                      className="shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Claim Amount */}
              {extractedFields.claimAmount && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">סכום התביעה</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={`₪${extractedFields.claimAmount.toLocaleString()}`} 
                      readOnly
                    />
                    <Button
                      size="sm"
                      onClick={() => approveField('claimAmount')}
                      className="shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              {extractedFields.confidence && (
                <div className="mt-4 p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      רמת ביטחון AI: {Math.round(extractedFields.confidence * 100)}%
                    </span>
                  </div>
                  <Progress value={extractedFields.confidence * 100} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveIntake;