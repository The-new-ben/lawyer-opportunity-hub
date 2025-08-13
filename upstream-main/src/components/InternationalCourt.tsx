import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCaseDraft } from '@/hooks/useCaseDraft';
import { useMatching } from '@/hooks/useMatching';
import { useRatings } from '@/hooks/useRatings';
import { supabase } from '@/integrations/supabase/client';
import SimulationArena from './court/SimulationArena';
import ProfessionalsCatalog from './court/ProfessionalsCatalog';
import { ProfessionalMarketplace } from './professionals/ProfessionalMarketplace';
import { InviteManager } from './social/InviteManager';
import ReputationBadge from './court/ReputationBadge';
import { LawyerTierBadge } from './LawyerTierBadge';
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
  UserCheck,
  Trophy,
  Share2,
  DollarSign,
  Star,
  Briefcase,
  GamepadIcon,
  Network,
  Zap
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
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [userPoints, setUserPoints] = useState(45);
  const [currentTier, setCurrentTier] = useState('bronze');
  const { toast } = useToast();
  const { draft, update } = useCaseDraft();
  const { useMatchedLawyers } = useMatching();
  const { addRating, getRatingStats } = useRatings();

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

  const handleProfessionalSelected = (professional: any) => {
    setSelectedProfessional(professional);
    setUserPoints(prev => prev + 10); // Gamification: reward for engaging with professionals
    toast({
      title: 'Professional Connected',
      description: `Connected with ${professional.name}. +10 points earned!`
    });
  };

  const handleInviteSent = (details: any) => {
    setUserPoints(prev => prev + 5); // Gamification: reward for social engagement
    toast({
      title: 'Social Engagement Bonus',
      description: '+5 points for sharing and inviting participants!'
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'simulation') {
      setUserPoints(prev => prev + 2); // Small reward for engaging with simulation
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      {/* Enhanced Header with User Stats */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ReputationBadge points={userPoints} />
              <LawyerTierBadge tier={currentTier as any} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>{userPoints} Points</span>
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-3xl">
            <Scale className="w-8 h-8 text-blue-600" />
            International AI Court
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            Intelligent Legal Case Preparation • Professional Matching • Social Engagement
          </p>
        </CardHeader>
      </Card>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-2">
            <GamepadIcon className="w-4 h-4" />
            Simulation
          </TabsTrigger>
          <TabsTrigger value="professionals" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Professionals
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="monetization" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Earnings
          </TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Interface - Left Column */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Legal Consultation Chat
                    <Badge variant="secondary" className="ml-auto">
                      <Zap className="w-3 h-3 mr-1" />
                      AI Powered
                    </Badge>
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
                            Legal AI Assistant:
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

              {/* Enhanced Action Buttons */}
              {readinessScore >= 70 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Choose Your Path
                      <Badge variant="default" className="ml-auto">
                        Ready to Proceed
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setActiveTab('simulation')}
                      >
                        <div className="text-2xl">🎭</div>
                        <div className="font-semibold">Start Simulation</div>
                        <div className="text-sm text-muted-foreground text-center">
                          Practice with AI judge and opposing counsel. Risk-free environment to test your case.
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          <Star className="w-3 h-3 mr-1" />
                          Earn 15 Points
                        </Badge>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setActiveTab('professionals')}
                      >
                        <div className="text-2xl">⚖️</div>
                        <div className="font-semibold">Real Proceeding</div>
                        <div className="text-sm text-muted-foreground text-center">
                          Connect with verified legal professionals and initiate actual legal proceedings.
                        </div>
                        <Badge variant="default" className="mt-2">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Paid Service
                        </Badge>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Enhanced Right Column */}
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

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('professionals')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Legal Professionals
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('social')}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share & Invite Experts
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('simulation')}
                  >
                    <GamepadIcon className="w-4 h-4 mr-2" />
                    Practice Simulation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GamepadIcon className="w-5 h-5" />
                Legal Simulation Arena
                <Badge variant="secondary" className="ml-auto">
                  <Trophy className="w-3 h-3 mr-1" />
                  Gamified Experience
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimulationArena />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professionals Tab */}
        <TabsContent value="professionals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Professional Directory
                <Badge variant="secondary" className="ml-auto">
                  Verified Experts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfessionalsCatalog />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <ProfessionalMarketplace
            caseId="current-case"
            specialty={draft.category}
            budget={1000}
            onProfessionalSelected={handleProfessionalSelected}
          />
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <InviteManager
            caseId="current-case"
            caseTitle={draft.title || 'Legal Discussion'}
            caseDescription={draft.summary || ''}
            onInviteSent={handleInviteSent}
          />
        </TabsContent>

        {/* Monetization Tab */}
        <TabsContent value="monetization" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Earning Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Current Points: {userPoints}</h4>
                  <p className="text-sm text-green-700">
                    Earn points by engaging with the platform, helping others, and participating in simulations.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Professional Consultation</p>
                      <p className="text-sm text-muted-foreground">Offer paid legal advice</p>
                    </div>
                    <Badge variant="default">$50-500/hr</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Case Review</p>
                      <p className="text-sm text-muted-foreground">Review and rate cases</p>
                    </div>
                    <Badge variant="secondary">$25-100</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Simulation Judge</p>
                      <p className="text-sm text-muted-foreground">Moderate practice sessions</p>
                    </div>
                    <Badge variant="outline">$20-80/session</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Reputation System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <LawyerTierBadge tier={currentTier as any} className="text-lg" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Current Tier: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Next Tier Progress</span>
                    <span>{userPoints}/100</span>
                  </div>
                  <Progress value={userPoints} className="w-full" />
                </div>
                
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-1">Benefits of Higher Tiers:</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Higher visibility in marketplace</li>
                    <li>• Increased earning rates</li>
                    <li>• Priority case assignments</li>
                    <li>• Exclusive networking events</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InternationalCourt;