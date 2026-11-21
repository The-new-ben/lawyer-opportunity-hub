import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  Scale, 
  MapPin, 
  Users, 
  Calendar, 
  Target, 
  Star,
  Share2,
  Copy,
  ExternalLink,
  Lightbulb,
  Zap,
  TrendingUp,
  Award,
  Heart,
  Shield
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfessionalSuggestions } from '@/components/professionals/ProfessionalSuggestions';
import { InviteManager } from '@/components/social/InviteManager';
import { Separator } from '@/components/ui/separator';
import AIChat from '@/components/AIChat';
import { useFormWithAI } from '@/aiIntake/useFormWithAI';

const SmartIntakePortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('intake');
  const [shareUrl, setShareUrl] = useState('');
  const [casePoints, setCasePoints] = useState(0);
  const [socialShares, setSocialShares] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const formCtl = useFormWithAI();

  // Calculate readiness score from form
  const calculateReadinessScore = () => {
    return formCtl.calculateProgress();
  };

  // Simplified readiness calculation
  const readinessScore = calculateReadinessScore();

  // Authentication check
  const handleLogin = () => {
    if (accessCode === "0584444595") {
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

  const generateCase = async () => {
    if (readinessScore < 80) {
      toast({
        title: 'Not Ready Yet',
        description: 'Please complete all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formValues = formCtl.values;
      console.log('[AI] generateCase ->', formValues);
      
      toast({
        title: 'Case Created Successfully!',
        description: 'You can now start the discussion',
      });

      // Start case simulation
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
    toast({
      title: 'Starting Simulation',
      description: 'Your case simulation is now ready',
    });
  };

  const shareToSocial = (platform: string) => {
    const formValues = formCtl.values;
    const text = `Join legal discussion: ${formValues.title || 'Legal Discussion'}`;
    const urls = {
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
    };
    
    window.open((urls as any)[platform], '_blank');
    setSocialShares(prev => prev + 1);
    toast({
      title: 'Shared Successfully',
      description: `Content shared to ${platform}`,
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'Share link copied to clipboard',
    });
  };

  const ReadinessCard = () => {
    const score = readinessScore;
    let color = 'red';
    let message = 'Additional details required';
    
    if (score >= 80) {
      color = 'green';
      message = 'Ready to generate trial!';
    } else if (score >= 50) {
      color = 'orange';
      message = 'Almost ready - minor details missing';
    }

    return (
      <Card className={`border-l-4 ${
        color === 'green' ? 'border-l-green-500 bg-green-50' :
        color === 'orange' ? 'border-l-orange-500 bg-orange-50' :
        'border-l-red-500 bg-red-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Case Readiness</span>
            <Badge variant={color === 'green' ? 'default' : color === 'orange' ? 'secondary' : 'destructive'}>
              {score}%
            </Badge>
          </div>
          <Progress value={score} className="mb-2" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    );
  };

  // Authentication Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Smart Intake Portal</CardTitle>
            <p className="text-muted-foreground">Enter access code to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Access Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button onClick={handleLogin} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Access Portal
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <SocialLogin 
              mode="compact"
              onSuccess={() => setIsAuthenticated(true)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Portal Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Smart Legal Intake Portal</CardTitle>
                  <p className="text-muted-foreground">AI-Powered Case Preparation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {casePoints} Points
                </Badge>
                <Badge variant="secondary">
                  {user ? 'Premium' : 'Demo'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - AI Chat */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="intake">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Intake
                </TabsTrigger>
                <TabsTrigger value="professionals">
                  <Users className="w-4 h-4 mr-2" />
                  Professionals
                </TabsTrigger>
                <TabsTrigger value="social">
                  <Heart className="w-4 h-4 mr-2" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="marketplace">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <Award className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="intake" className="space-y-6">
                <AIChat formCtl={formCtl} />
              </TabsContent>

              <TabsContent value="professionals" className="space-y-6">
                <ProfessionalSuggestions 
                  caseId="draft"
                  jurisdiction={formCtl.values.jurisdiction || ""}
                  specialization={formCtl.values.category || ""}
                  role="lawyer"
                />
              </TabsContent>

              <TabsContent value="social" className="space-y-6">
                <InviteManager />
              </TabsContent>

              <TabsContent value="marketplace" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Marketplace</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Connect with verified legal professionals worldwide.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{casePoints}</p>
                        <p className="text-sm text-blue-700">Total Points</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{socialShares}</p>
                        <p className="text-sm text-green-700">Social Shares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Readiness Status */}
            <ReadinessCard />

            {/* Case Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={generateCase}
                  disabled={readinessScore < 80}
                  className="w-full"
                  size="lg"
                >
                  {readinessScore >= 80 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Generate Case
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Complete Details ({readinessScore}%)
                    </>
                  )}
                </Button>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Share Case</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => shareToSocial('linkedin')}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shareToSocial('facebook')}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shareToSocial('twitter')}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Earned Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {earnedBadges.map((badge, index) => (
                      <Badge key={index} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartIntakePortal;