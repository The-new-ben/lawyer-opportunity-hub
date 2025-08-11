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
  Gavel
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

const SmartIntakePortal = () => {
  const { toast } = useToast();
  const { draft, update } = useCaseDraft();
  const [isAIActive, setIsAIActive] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'ai', 
      content: 'שלום! אני כאן לעזור לכם להכין את התיק לדיון. בואו נתחיל בתיאור קצר של הסכסוך שלכם.' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>({ 
    color: 'red', 
    message: 'נדרשים פרטים נוספים', 
    score: 0 
  });

  // Simulation options
  const [simulationType, setSimulationType] = useState<'impression' | 'practice' | 'public' | 'paid'>('impression');
  const [hasAudience, setHasAudience] = useState(false);
  const [needsDeposit, setNeedsDeposit] = useState(false);
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Calculate readiness score based on draft fields
  useEffect(() => {
    const requiredFields = ['title', 'summary', 'jurisdiction', 'category', 'goal', 'parties'];
    const filledFields = requiredFields.filter(field => {
      const value = draft[field as keyof typeof draft];
      return value && (Array.isArray(value) ? value.length > 0 : String(value).trim().length > 0);
    });
    
    const score = Math.round((filledFields.length / requiredFields.length) * 100);
    
    let status: ReadinessStatus;
    if (score >= 80) {
      status = { color: 'green', message: 'מוכן ליצירת משפט!', score };
    } else if (score >= 50) {
      status = { color: 'orange', message: 'כמעט מוכן - חסרים פרטים קלים', score };
    } else {
      status = { color: 'red', message: 'נדרשים פרטים נוספים', score };
    }
    
    setReadinessStatus(status);
  }, [draft]);

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
          locale: 'he',
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
              case 'title': return 'כותרת התיק';
              case 'summary': return 'תיאור הסכסוך';
              case 'jurisdiction': return 'תחום שיפוט';
              case 'category': return 'סוג משפטי';
              case 'goal': return 'מטרת הדיון';
              case 'parties': return 'צדדים';
              case 'evidence': return 'ראיות';
              default: return key;
            }
          }).join(', ');
          
          setTimeout(() => {
            typewriterEffect(`מעולה! עדכנתי את השדות: ${fieldsText}. ${aiResponse.next_question || 'איך אוכל לעזור עוד?'}`);
          }, 500);
        } else {
          setTimeout(() => {
            typewriterEffect(aiResponse.next_question || 'תודה על המידע. איך אוכל לעזור עוד?');
          }, 500);
        }
      } else {
        setTimeout(() => {
          typewriterEffect('תודה על המידע. איך אוכל לעזור עוד?');
        }, 500);
      }

    } catch (error) {
      console.error('AI Error:', error);
      setTimeout(() => {
        typewriterEffect('מצטער, נתקלתי בבעיה. בואו ננסה שוב.');
      }, 500);
      
      toast({
        title: 'שגיאה בחיבור ל-AI',
        description: 'נא לנסות שוב',
        variant: 'destructive'
      });
    } finally {
      setIsAIActive(false);
    }
  };

  const generateCase = async () => {
    if (readinessStatus.score < 80) {
      toast({
        title: 'לא מוכן עדיין',
        description: 'נא להשלים את כל השדות הנדרשים',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'case_builder',
          locale: 'he',
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
        title: 'התיק נוצר בהצלחה!',
        description: 'עכשיו ניתן להתחיל את הדיון',
      });

      // Start case simulation based on selected type
      startSimulation();

    } catch (error) {
      console.error('Case generation error:', error);
      toast({
        title: 'שגיאה ביצירת התיק',
        description: 'נא לנסות שוב',
        variant: 'destructive'
      });
    }
  };

  const startSimulation = () => {
    let message = '';
    switch (simulationType) {
      case 'impression':
        message = 'מתחיל סימולציה להתרשמות...';
        break;
      case 'practice':
        message = 'מתחיל אימון מעשי...';
        break;
      case 'public':
        message = 'מפרסם קריאה לציבור להשתתפות...';
        break;
      case 'paid':
        message = 'מכין דיון בתשלום עם מקצועני משפט...';
        break;
    }
    
    typewriterEffect(message);
  };

  const shareToSocial = (platform: string) => {
    const text = `הצטרפו לדיון משפטי: ${draft.title || 'דיון משפטי'}`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Readiness Status */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Scale className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">פורטל המשפט החכם</CardTitle>
                  <p className="text-muted-foreground">מונע על ידי בינה מלאכותית מתקדמת</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getStatusColor()}`}>
                {getStatusIcon()}
                <div className="text-sm font-medium">
                  <div>{readinessStatus.message}</div>
                  <div className="text-xs opacity-75">{readinessStatus.score}% שלם</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* AI Connection Test */}
        <AIConnectionTest />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AI Chat Interface */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <CardTitle>ראיון AI אינטראקטיבי</CardTitle>
                {isAIActive && <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />}
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
                    placeholder="תארו את הסכסוך שלכם..."
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
                פרטי התיק
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">כותרת התיק</label>
                  <div className="mt-1 p-2 bg-muted rounded min-h-[36px] flex items-center">
                    {draft.title || 'לא הוגדר'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">תחום שיפוט</label>
                  <div className="mt-1 p-2 bg-muted rounded min-h-[36px] flex items-center">
                    {draft.jurisdiction || 'לא הוגדר'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">תיאור הסכסוך</label>
                <div className="mt-1 p-2 bg-muted rounded min-h-[60px]">
                  {draft.summary || 'לא הוגדר'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">קטגוריה</label>
                  <div className="mt-1 p-2 bg-muted rounded min-h-[36px] flex items-center">
                    {draft.category || 'לא הוגדר'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">מטרה</label>
                  <div className="mt-1 p-2 bg-muted rounded min-h-[36px] flex items-center">
                    {draft.goal || 'לא הוגדר'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">צדדים</label>
                <div className="mt-1 space-y-2">
                  {draft.parties?.length ? draft.parties.map((party, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{party.role}: {party.name}</span>
                    </div>
                  )) : (
                    <div className="p-2 bg-muted rounded">לא הוגדרו צדדים</div>
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
              אפשרויות סימולציה
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              <Card className={`cursor-pointer border-2 transition-all ${
                simulationType === 'impression' ? 'border-primary bg-primary/5' : 'border-muted'
              }`} onClick={() => setSimulationType('impression')}>
                <CardContent className="p-4 text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold mb-1">להתרשמות</h3>
                  <p className="text-xs text-muted-foreground">דיון בסיסי ללא צופים</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 transition-all ${
                simulationType === 'practice' ? 'border-primary bg-primary/5' : 'border-muted'
              }`} onClick={() => setSimulationType('practice')}>
                <CardContent className="p-4 text-center">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold mb-1">אימון</h3>
                  <p className="text-xs text-muted-foreground">עם/בלי קהל</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 transition-all ${
                simulationType === 'public' ? 'border-primary bg-primary/5' : 'border-muted'
              }`} onClick={() => setSimulationType('public')}>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold mb-1">ציבורי</h3>
                  <p className="text-xs text-muted-foreground">קריאה לציבור</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 transition-all ${
                simulationType === 'paid' ? 'border-primary bg-primary/5' : 'border-muted'
              }`} onClick={() => setSimulationType('paid')}>
                <CardContent className="p-4 text-center">
                  <Gavel className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <h3 className="font-semibold mb-1">מקצועי</h3>
                  <p className="text-xs text-muted-foreground">עם מומחים בתשלום</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>עם קהל צופים</span>
                </div>
                <Switch checked={hasAudience} onCheckedChange={setHasAudience} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>דרוש פיקדון לאכיפה</span>
                </div>
                <Switch checked={needsDeposit} onCheckedChange={setNeedsDeposit} />
              </div>

              <Separator />

              {/* Professional Selection */}
              <div>
                <h4 className="font-semibold mb-3">זימון מקצועיים</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'lawyer', label: 'עורכי דין', icon: Scale },
                    { id: 'judge', label: 'שופטים', icon: Gavel },
                    { id: 'mediator', label: 'מגשרים', icon: Users },
                    { id: 'expert', label: 'מומחים', icon: UserCheck }
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
                <h4 className="font-semibold mb-3">שיתוף ברשתות חברתיות</h4>
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
              יצירת משפט והתחלת דיון
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {readinessStatus.score < 80 
                ? 'השלימו את כל הפרטים הנדרשים כדי להתחיל' 
                : 'הכל מוכן! לחצו כדי להתחיל את הדיון'
              }
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default SmartIntakePortal;