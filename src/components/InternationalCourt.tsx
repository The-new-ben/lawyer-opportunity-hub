import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCaseDraft } from '@/hooks/useCaseDraft';
import { supabase } from '@/integrations/supabase/client';
import { 
  Scale, 
  MessageSquare, 
  Users, 
  FileText, 
  Gavel, 
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  BookOpen,
  UserCheck
} from 'lucide-react';

interface ChatMessage {
  user: string;
  ai: string;
  timestamp: Date;
  extracted_fields?: Record<string, any>;
}

interface CaseField {
  key: string;
  label: string;
  value: any;
  status: 'empty' | 'partial' | 'complete';
  icon: React.ReactNode;
  required: boolean;
}

const InternationalCourt = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const { toast } = useToast();
  const { draft, update } = useCaseDraft();

  // Welcome message on first load
  useEffect(() => {
    if (history.length === 0) {
      const welcomeMessage: ChatMessage = {
        user: '',
        ai: `Welcome to the International AI Court System! 🏛️

I'm here to help you build a comprehensive legal case through intelligent conversation.

**How this works:**
• Describe your legal situation in natural language
• I'll extract key information and populate case fields automatically  
• Choose between Simulation (practice) or Real Proceedings
• Get matched with appropriate legal professionals
• Track your case through completion

**Legal Categories Supported:**
• Civil Disputes • Commercial Law • International Treaties
• Contract Disputes • Property Rights • Employment Law
• Family Law • Intellectual Property • Human Rights

**Let's begin:**
Please describe your legal situation, dispute, or question. Be as detailed as you're comfortable sharing.`,
        timestamp: new Date()
      };
      setHistory([welcomeMessage]);
    }
  }, []);

  // Define case fields with their properties
  const caseFields: CaseField[] = [
    {
      key: 'title',
      label: 'Case Title',
      value: draft.title,
      status: draft.title ? (draft.title.length > 10 ? 'complete' : 'partial') : 'empty',
      icon: <FileText className="w-4 h-4" />,
      required: true
    },
    {
      key: 'summary', 
      label: 'Case Summary',
      value: draft.summary,
      status: draft.summary ? (draft.summary.length > 50 ? 'complete' : 'partial') : 'empty',
      icon: <BookOpen className="w-4 h-4" />,
      required: true
    },
    {
      key: 'jurisdiction',
      label: 'Jurisdiction',
      value: draft.jurisdiction,
      status: draft.jurisdiction ? 'complete' : 'empty',
      icon: <Globe className="w-4 h-4" />,
      required: true
    },
    {
      key: 'category',
      label: 'Legal Category', 
      value: draft.category,
      status: draft.category ? 'complete' : 'empty',
      icon: <Scale className="w-4 h-4" />,
      required: true
    },
    {
      key: 'goal',
      label: 'Desired Outcome',
      value: draft.goal,
      status: draft.goal ? (draft.goal.length > 20 ? 'complete' : 'partial') : 'empty',
      icon: <Target className="w-4 h-4" />,
      required: true
    },
    {
      key: 'parties',
      label: 'Parties Involved',
      value: draft.parties,
      status: Array.isArray(draft.parties) && draft.parties.length > 0 ? 'complete' : 'empty',
      icon: <Users className="w-4 h-4" />,
      required: true
    },
    {
      key: 'evidence',
      label: 'Evidence & Documentation',
      value: draft.evidence,
      status: Array.isArray(draft.evidence) && draft.evidence.length > 0 ? 'complete' : 'empty',
      icon: <CheckCircle className="w-4 h-4" />,
      required: false
    },
    {
      key: 'timeline',
      label: 'Case Timeline',
      value: draft.startDate,
      status: draft.startDate ? 'complete' : 'empty',
      icon: <Clock className="w-4 h-4" />,
      required: false
    }
  ];

  // Calculate readiness score
  const readinessScore = React.useMemo(() => {
    const requiredFields = caseFields.filter(f => f.required);
    const completedRequired = requiredFields.filter(f => f.status === 'complete').length;
    const partialRequired = requiredFields.filter(f => f.status === 'partial').length;
    
    const optionalFields = caseFields.filter(f => !f.required);
    const completedOptional = optionalFields.filter(f => f.status === 'complete').length;
    
    const baseScore = (completedRequired / requiredFields.length) * 70;
    const partialScore = (partialRequired / requiredFields.length) * 20;
    const optionalScore = (completedOptional / optionalFields.length) * 10;
    
    return Math.round(baseScore + partialScore + optionalScore);
  }, [draft]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      // Advanced legal prompting
      const legalPrompt = `You are an expert legal assistant specialized in international law and case preparation.

Current Case Context:
- Title: ${draft.title || 'Not set'}
- Summary: ${draft.summary || 'Not set'}  
- Jurisdiction: ${draft.jurisdiction || 'Not determined'}
- Category: ${draft.category || 'Not classified'}
- Goal: ${draft.goal || 'Not defined'}

User Query: "${userMessage}"

Instructions:
1. Analyze the legal context and identify the primary legal issues
2. Ask ONE focused follow-up question to gather the most critical missing information
3. Provide brief legal context where helpful (1-2 sentences)
4. Suggest practical next steps if appropriate
5. Maintain a professional but approachable tone
6. If this appears to be an international dispute, highlight jurisdictional considerations

Respond concisely and professionally.`;

      // Send to OpenAI
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [
            { role: 'system', content: legalPrompt },
            { role: 'user', content: userMessage }
          ],
          model: 'gpt-4.1-2025-04-14',
          temperature: 0.7,
          max_tokens: 500
        }
      });

      if (error) throw error;

      // Extract fields automatically
      const extractResponse = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'intake_extract',
          locale: 'en',
          context: {
            history: [...history.map(h => ({ role: 'user', content: h.user })), { role: 'user', content: userMessage }],
            required_fields: ['title', 'summary', 'jurisdiction', 'legal_category', 'goal', 'parties', 'evidence'],
            current_fields: draft
          }
        }
      });

      let extractedFields = {};
      if (extractResponse.data?.updated_fields) {
        extractedFields = extractResponse.data.updated_fields;
        update(extractedFields);
        
        const updatedFieldNames = Object.keys(extractedFields);
        if (updatedFieldNames.length > 0) {
          toast({
            title: 'Case Fields Updated',
            description: `Updated: ${updatedFieldNames.join(', ')}`
          });
        }
      }

      // Add to history
      const newMessage: ChatMessage = {
        user: userMessage,
        ai: data.text,
        timestamp: new Date(),
        extracted_fields: extractedFields
      };
      
      setHistory(prev => [...prev, newMessage]);

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCase = async () => {
    if (readinessScore < 70) {
      toast({
        title: 'Case Incomplete',
        description: 'Please provide more details before generating the case (minimum 70% complete)',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'case_builder',
          locale: 'en',
          context: {
            summary: draft.summary,
            goal: draft.goal,
            jurisdiction: draft.jurisdiction || 'International',
            category: draft.category || 'Civil'
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: 'Case Generated Successfully!',
        description: 'Your legal case structure is ready. Choose your next step below.'
      });

    } catch (err: any) {
      toast({
        title: 'Case Generation Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFieldStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-50 border-green-200';
      case 'partial': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getFieldStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-3xl">
            <Scale className="w-8 h-8 text-blue-600" />
            International AI Court
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            Intelligent Legal Case Preparation & Professional Matching
          </p>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Legal Consultation Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat History */}
              <div className="max-h-96 overflow-y-auto space-y-4 border rounded-lg p-4 bg-gray-50">
                {history.map((msg, idx) => (
                  <div key={idx} className="space-y-3">
                    {msg.user && (
                      <div className="bg-blue-100 p-3 rounded-lg ml-8">
                        <div className="font-semibold text-blue-800">You:</div>
                        <div className="text-blue-700">{msg.user}</div>
                      </div>
                    )}
                    <div className="bg-white p-3 rounded-lg mr-8 border">
                      <div className="font-semibold text-green-800 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Legal Assistant:
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap">{msg.ai}</div>
                      {msg.extracted_fields && Object.keys(msg.extracted_fields).length > 0 && (
                        <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                          <div className="text-xs text-green-600 font-medium">
                            Auto-extracted: {Object.keys(msg.extracted_fields).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Describe your legal situation in detail... (e.g., 'I have a contract dispute with my business partner who violated our agreement terms')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[100px]"
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={sendMessage} 
                    disabled={loading || !input.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Send Message'}
                  </Button>
                  <Button 
                    onClick={generateCase}
                    disabled={loading || readinessScore < 70}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Gavel className="w-4 h-4" />
                    Generate Case
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {readinessScore >= 70 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Path</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <div className="text-2xl">🎭</div>
                    <div className="font-semibold">Start Simulation</div>
                    <div className="text-sm text-muted-foreground text-center">
                      Practice with AI judge and opposing counsel. Risk-free environment to test your case.
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <div className="text-2xl">⚖️</div>
                    <div className="font-semibold">Real Proceeding</div>
                    <div className="text-sm text-muted-foreground text-center">
                      Connect with verified legal professionals and initiate actual legal proceedings.
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Case Fields & Status - Right Column */}
        <div className="space-y-4">
          {/* Readiness Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Case Readiness
                <Badge variant={readinessScore >= 80 ? 'default' : readinessScore >= 50 ? 'secondary' : 'destructive'}>
                  {readinessScore}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={readinessScore} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {readinessScore >= 80 ? 'Ready for case generation!' :
                 readinessScore >= 50 ? 'Almost ready - provide more details' :
                 'Requires additional information'}
              </p>
            </CardContent>
          </Card>

          {/* Case Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {field.icon}
                      <span className="font-medium">{field.label}</span>
                      {field.required && <span className="text-red-500">*</span>}
                    </div>
                    {getFieldStatusIcon(field.status)}
                  </div>
                  <div className={`p-2 rounded border text-sm ${getFieldStatusColor(field.status)}`}>
                    {field.value ? (
                      typeof field.value === 'object' ? 
                        `${Array.isArray(field.value) ? field.value.length : Object.keys(field.value).length} items` :
                        String(field.value).slice(0, 100) + (String(field.value).length > 100 ? '...' : '')
                    ) : (
                      'Not provided'
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Professional Services */}
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Find Legal Professionals
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Document Templates
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Globe className="w-4 h-4 mr-2" />
                Jurisdiction Research
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InternationalCourt;