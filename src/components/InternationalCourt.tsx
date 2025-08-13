import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCaseDraft } from '@/hooks/useCaseDraft';
import { useMatching } from '@/hooks/useMatching';
import { useRatings } from '@/hooks/useRatings';
import { supabase } from '@/integrations/supabase/client';
import { SocialLogin } from '@/components/auth/SocialLogin';
import SimulationArena from './court/SimulationArena';
import ProfessionalsCatalog from './court/ProfessionalsCatalog';
import { ProfessionalMarketplace } from './professionals/ProfessionalMarketplace';
import { InviteManager } from './social/InviteManager';
import { MatchingEngine } from './MatchingEngine';
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
  Zap,
  Plus,
  Eye,
  Heart,
  TrendingUp,
  Award,
  Coins,
  Crown,
  Sparkles,
  Facebook,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Calendar,
  Video,
  ShoppingCart,
  Gift,
  Rocket
} from 'lucide-react';
import { FaGoogle, FaWhatsapp, FaTelegram } from 'react-icons/fa';

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
  
  // Additional state for authentication and enhanced features
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMatchingEngine, setShowMatchingEngine] = useState(false);
  const [legalCategory, setLegalCategory] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<'simulation' | 'real' | null>(null);
  const [socialShares, setSocialShares] = useState(0);
  const [engagementLevel, setEngagementLevel] = useState(1);

  const { toast } = useToast();
  const { draft, update } = useCaseDraft();
  const { useMatchedLawyers } = useMatching();
  const { addRating, getRatingStats } = useRatings();

  // Enhanced authentication check
  useEffect(() => {
    // Simple demo authentication - in production this would check actual auth
    const demoAuth = localStorage.getItem('demo_auth');
    if (demoAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  // Welcome message on first load
  useEffect(() => {
    if (history.length === 0 && isAuthenticated) {
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
  }, [isAuthenticated]);

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
  const readinessScore = useMemo(() => {
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
2. Extract any new case information (title, summary, jurisdiction, category, goal, parties, evidence, timeline)
3. Ask ONE focused follow-up question to gather the most critical missing information
4. Provide brief legal context where helpful (1-2 sentences)
5. Suggest practical next steps if appropriate
6. Maintain a professional but approachable tone
7. If this appears to be an international dispute, highlight jurisdictional considerations

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

      // Extract fields automatically using AI
      const extractResponse = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'intake_extract',
          locale: 'en',
          context: {
            history: [...history.map(h => ({ role: 'user', content: h.user })), { role: 'user', content: userMessage }],
            required_fields: ['title', 'summary', 'jurisdiction', 'category', 'goal', 'parties', 'evidence', 'timeline'],
            current_fields: draft
          }
        }
      });

      let extractedFields = {};
      if (extractResponse.data?.updated_fields) {
        extractedFields = extractResponse.data.updated_fields;
        
        // Update case draft with extracted fields
        update(extractedFields);
        
        // Set legal category for matching
        if (extractedFields && 'category' in extractedFields && extractedFields.category) {
          setLegalCategory(extractedFields.category as string);
        }
        
        const updatedFieldNames = Object.keys(extractedFields);
        if (updatedFieldNames.length > 0) {
          setUserPoints(prev => prev + updatedFieldNames.length * 2); // Reward for progress
          toast({
            title: 'Case Fields Updated Successfully',
            description: `Updated: ${updatedFieldNames.join(', ')} (+${updatedFieldNames.length * 2} points)`
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

      setUserPoints(prev => prev + 25); // Major reward for case generation
      setShowMatchingEngine(true);

      toast({
        title: 'Case Generated Successfully!',
        description: 'Your legal case structure is ready. +25 points earned! Professional matching is now available.'
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

  // Enhanced professional selection with monetization
  const handleProfessionalSelectedEnhanced = (professional: any) => {
    setSelectedProfessional(professional);
    setUserPoints(prev => prev + 15); // Higher reward for professional engagement
    setEngagementLevel(prev => Math.min(prev + 1, 5));
    
    toast({
      title: 'Professional Connected Successfully',
      description: `Connected with ${professional.name}. +15 points earned! Engagement level increased.`
    });
  };

  // Enhanced social sharing with rewards
  const handleSocialEngagement = (platform: string, details: any) => {
    setSocialShares(prev => prev + 1);
    setUserPoints(prev => prev + 8); // Reward for social engagement
    
    // Bonus for reaching milestones
    if (socialShares > 0 && socialShares % 5 === 0) {
      setUserPoints(prev => prev + 20);
      toast({
        title: 'Social Milestone Reached!',
        description: `Great networking! +20 bonus points for ${socialShares + 1} social interactions.`
      });
    } else {
      toast({
        title: 'Social Engagement Reward',
        description: `Shared to ${platform}. +8 points earned!`
      });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'simulation') {
      setUserPoints(prev => prev + 2); // Small reward for engaging with simulation
    }
  };

  // Tier management
  useEffect(() => {
    if (userPoints >= 200) setCurrentTier('platinum');
    else if (userPoints >= 120) setCurrentTier('gold');
    else if (userPoints >= 60) setCurrentTier('silver');
    else setCurrentTier('bronze');
  }, [userPoints]);

  // Authentication component
  const AuthenticationGate = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="border-blue-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-4 bg-blue-100 rounded-full w-fit">
              <Scale className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">International AI Court</CardTitle>
            <p className="text-muted-foreground">
              Access the world's first AI-powered legal platform for international justice
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Access */}
            <Button 
              className="w-full"
              onClick={() => {
                localStorage.setItem('demo_auth', 'true');
                setIsAuthenticated(true);
                toast({
                  title: 'Welcome to International AI Court!',
                  description: 'You now have access to all platform features.'
                });
              }}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Quick Demo Access
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <SocialLogin 
              mode="full"
              onSuccess={() => {
                setIsAuthenticated(true);
                toast({
                  title: 'Authentication Successful',
                  description: 'Welcome to the International AI Court platform!'
                });
              }}
            />

            {/* Feature highlights */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Global Access</p>
                  <p className="text-blue-600">Connect across borders and jurisdictions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                <Network className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Professional Network</p>
                  <p className="text-purple-600">Verified lawyers, judges, and mediators</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
                <Zap className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">AI-Powered</p>
                  <p className="text-green-600">Intelligent case building and analysis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Main authenticated interface
  if (!isAuthenticated) {
    return <AuthenticationGate />;
  }

  return (
    <div className="container mx-auto p-2 md:p-4 max-w-7xl space-y-4 md:space-y-6">
      {/* Enhanced Header with User Stats - Mobile Responsive */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <ReputationBadge points={userPoints} />
              <LawyerTierBadge tier={currentTier as any} />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-yellow-600">
                <Trophy className="w-4 h-4" />
                <span>{userPoints} Points</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Share2 className="w-4 h-4" />
                <span>{socialShares} Shares</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Heart className="w-4 h-4" />
                <span>Level {engagementLevel}</span>
              </div>
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl md:text-3xl">
            <Scale className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            International AI Court
          </CardTitle>
          <p className="text-sm md:text-lg text-muted-foreground">
            Intelligent Legal Case Preparation • Professional Matching • Global Networking
          </p>
        </CardHeader>
      </Card>

      {/* Main Tabs Interface - Mobile Responsive */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
          <TabsTrigger value="chat" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">AI Chat</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <GamepadIcon className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Simulation</span>
            <span className="sm:hidden">Sim</span>
          </TabsTrigger>
          <TabsTrigger value="professionals" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Professionals</span>
            <span className="sm:hidden">Pro</span>
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Marketplace</span>
            <span className="sm:hidden">Market</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Share2 className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Social</span>
            <span className="sm:hidden">Share</span>
          </TabsTrigger>
          <TabsTrigger value="monetization" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Earnings</span>
            <span className="sm:hidden">$$$</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4 md:space-y-6">
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Chat Interface - Left Column */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                  <div className="max-h-80 md:max-h-96 overflow-y-auto space-y-4 border rounded-lg p-3 md:p-4 bg-gray-50">
                    {history.map((msg, idx) => (
                      <div key={idx} className="space-y-3">
                        {msg.user && (
                          <div className="bg-blue-100 p-3 rounded-lg ml-4 md:ml-8">
                            <div className="font-semibold text-blue-800 text-sm">You:</div>
                            <div className="text-blue-700 text-sm">{msg.user}</div>
                          </div>
                        )}
                        <div className="bg-white p-3 rounded-lg mr-4 md:mr-8 border">
                          <div className="font-semibold text-green-800 flex items-center gap-2 text-sm">
                            <UserCheck className="w-4 h-4" />
                            Legal AI Assistant:
                          </div>
                          <div className="text-gray-700 whitespace-pre-wrap text-sm">{msg.ai}</div>
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
                      className="min-h-[80px] md:min-h-[100px] text-sm"
                      disabled={loading}
                    />
                    <div className="flex flex-col md:flex-row gap-2">
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
                        Generate Case ({readinessScore}%)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Case Information - Right Column */}
            <div className="space-y-4">
              {/* Readiness Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5" />
                    Case Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span className="font-semibold">{readinessScore}%</span>
                    </div>
                    <Progress value={readinessScore} className="h-3" />
                  </div>
                  
                  {readinessScore >= 70 && (
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Ready for Processing
                      </div>
                      <p className="text-green-600 text-xs mt-1">
                        Your case is ready for generation and professional matching!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Case Fields Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Case Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {caseFields.map(field => (
                      <div key={field.key} className={`p-2 rounded border text-xs ${getFieldStatusColor(field.status)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {field.icon}
                            <span className="font-medium">{field.label}</span>
                            {field.required && <span className="text-red-500">*</span>}
                          </div>
                          {getFieldStatusIcon(field.status)}
                        </div>
                        {field.value && (
                          <div className="mt-1 text-xs opacity-80 truncate">
                            {typeof field.value === 'string' ? field.value : 
                             Array.isArray(field.value) ? `${field.value.length} items` : 
                             field.value.toString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedScenario('simulation')}
                  >
                    <GamepadIcon className="w-4 h-4 mr-2" />
                    Practice Mode
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedScenario('real')}
                    disabled={readinessScore < 70}
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    Real Proceedings
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('professionals')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Professionals
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Matching Engine - Shown when case is ready */}
          {showMatchingEngine && legalCategory && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Professional Matching Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MatchingEngine 
                  leadId="demo-lead" 
                  legalCategory={legalCategory}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GamepadIcon className="w-5 h-5" />
                  Legal Simulation Arena
                </CardTitle>
                <p className="text-muted-foreground">
                  Practice your case in a simulated environment with AI-powered feedback
                </p>
              </CardHeader>
              <CardContent>
                <SimulationArena />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Professionals Tab */}
        <TabsContent value="professionals" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Legal Professionals Catalog
                </CardTitle>
                <p className="text-muted-foreground">
                  Connect with verified lawyers, judges, mediators, and legal experts worldwide
                </p>
              </CardHeader>
              <CardContent>
                <ProfessionalsCatalog />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Services Marketplace
                </CardTitle>
                <p className="text-muted-foreground">
                  Discover and purchase professional legal services, consultations, and expertise
                </p>
              </CardHeader>
              <CardContent>
                <ProfessionalMarketplace />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Social Engagement & Invitations
                </CardTitle>
                <p className="text-muted-foreground">
                  Share your case, invite participants, and engage with the legal community
                </p>
              </CardHeader>
              <CardContent>
                <InviteManager 
                  caseId={draft.title || 'demo-case'}
                  caseTitle={draft.title || 'Legal Discussion'}
                  caseDescription={draft.summary || ''}
                  onInviteSent={(details: any) => handleSocialEngagement('social', details)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monetization/Earnings Tab */}
        <TabsContent value="monetization" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Earning Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Earning Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Case Completion</p>
                        <p className="text-xs text-green-600">Earn $25-100 per case</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+$50</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Professional Referrals</p>
                        <p className="text-xs text-blue-600">5% commission on matches</p>
                      </div>
                    </div>
                    <Badge variant="secondary">5%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200">
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-800">Social Engagement</p>
                        <p className="text-xs text-purple-600">$1-5 per quality share</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+$3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reputation & Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Reputation System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userPoints}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bronze (0-59)</span>
                    <Badge variant={currentTier === 'bronze' ? 'default' : 'outline'}>
                      {currentTier === 'bronze' ? 'Current' : 'Passed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Silver (60-119)</span>
                    <Badge variant={currentTier === 'silver' ? 'default' : 'outline'}>
                      {currentTier === 'silver' ? 'Current' : userPoints >= 60 ? 'Passed' : 'Locked'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gold (120-199)</span>
                    <Badge variant={currentTier === 'gold' ? 'default' : 'outline'}>
                      {currentTier === 'gold' ? 'Current' : userPoints >= 120 ? 'Passed' : 'Locked'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platinum (200+)</span>
                    <Badge variant={currentTier === 'platinum' ? 'default' : 'outline'}>
                      {currentTier === 'platinum' ? 'Current' : 'Locked'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Next Tier Progress</p>
                    <Progress 
                      value={userPoints >= 200 ? 100 : 
                             userPoints >= 120 ? ((userPoints - 120) / 80) * 100 :
                             userPoints >= 60 ? ((userPoints - 60) / 60) * 100 :
                             (userPoints / 60) * 100} 
                      className="h-2"
                    />
                  </div>
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