import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare, Scale, Users, Gavel, Star, Award, TrendingUp, Target, Zap,
  UserCheck, Heart, DollarSign, Sparkles, Building, MapPin,
  FileText, Calendar, AlertCircle, Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCaseDraft } from '@/hooks/useCaseDraft';
import { useMatching } from '@/hooks/useMatching';
import { useRatings } from '@/hooks/useRatings';
import { supabase } from '@/integrations/supabase/client';
import SimulationArena from './court/SimulationArena';
import ProfessionalsCatalog from './court/ProfessionalsCatalog';
import { ProfessionalMarketplace } from './professionals/ProfessionalMarketplace';
import { InviteManager } from './social/InviteManager';
import { SocialLogin } from './auth/SocialLogin';
import AIChat from './AIChat';
import { useFormWithAI } from '@/aiIntake/useFormWithAI';

const InternationalCourt: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('ai-chat');
  const [userPoints, setUserPoints] = useState(1250);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Hooks
  const { toast } = useToast();
  const { update } = useCaseDraft();
  const matchingHooks = useMatching();
  const ratingsHooks = useRatings();

  // Create the AI‑integrated form control
  const formCtl = useFormWithAI({});

  // Define case fields (label, key, icon, required)
  const caseFields = [
    { key: 'title', label: 'Case Title', formKey: 'title', icon: FileText, required: true },
    { key: 'summary', label: 'Case Summary', formKey: 'summary', icon: MessageSquare, required: true },
    { key: 'jurisdiction', label: 'Jurisdiction', formKey: 'jurisdiction', icon: MapPin, required: true },
    { key: 'category', label: 'Legal Category', formKey: 'category', icon: Scale, required: true },
    { key: 'parties', label: 'Parties Involved', formKey: 'parties', icon: Users, required: false },
    { key: 'evidence', label: 'Evidence', formKey: 'evidence', icon: FileText, required: false },
    { key: 'timeline', label: 'Timeline', formKey: 'timeline', icon: Calendar, required: false },
    { key: 'goal', label: 'Desired Outcome', formKey: 'goal', icon: Target, required: false }
  ];

  // Compute readiness score based on filled fields
  const readinessScore = () => {
    const values = formCtl.form.getValues();
    const requiredFields = caseFields.filter(f => f.required);
    const optionalFields = caseFields.filter(f => !f.required);

    const completedRequired = requiredFields.filter(f => {
      const val = values[f.formKey];
      return val && val.toString().trim().length > 0;
    });
    const completedOptional = optionalFields.filter(f => {
      const val = values[f.formKey];
      return val && val.toString().trim().length > 0;
    });

    const reqScore = (completedRequired.length / requiredFields.length) * 70;
    const optScore = optionalFields.length
      ? (completedOptional.length / optionalFields.length) * 30
      : 0;

    return Math.round(reqScore + optScore);
  };

  // Check authentication
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session || localStorage.getItem('demo_auth') === 'true');
    })();
  }, []);

  // Generate case
  const generateCase = async () => {
    const score = readinessScore();
    if (score < 60) {
      toast({
        title: 'Insufficient Information',
        description: 'Please provide more case details before proceeding. Minimum 60% completion required.',
        variant: 'destructive'
      });
      return;
    }
    try {
      // Access form values
      const caseData = formCtl.form.getValues();
      // Use update() or Supabase insert here if needed
      setActiveTab('professionals');
      toast({
        title: 'Case Generated Successfully',
        description: 'Your case has been processed and professional matches have been found!'
      });
    } catch (err) {
      toast({
        title: 'Generation Error',
        description: 'Failed to generate case. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Authentication gate
  const AuthenticationGate = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-4">
      <Card className="max-w-md w-full space-y-6 border-blue-200 shadow-xl">
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
            <Zap className="w-4 h-4 mr-2" />
            Quick Demo Access
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
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
        </CardContent>
      </Card>
    </div>
  );

  if (!isAuthenticated) return <AuthenticationGate />;

  // Main interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <Card className="mb-6 border-primary/20 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Scale className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">International AI Court</CardTitle>
                  <p className="text-muted-foreground">Global Legal Platform</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{userPoints} Points</span>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  Readiness: {readinessScore()}%
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="ai-chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="simulation" className="flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  Simulation
                </TabsTrigger>
                <TabsTrigger value="professionals" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Professionals
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="monetization" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Earning
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai-chat" className="space-y-6">
                <AIChat formCtl={formCtl} />
              </TabsContent>
              <TabsContent value="simulation" className="space-y-6">
                <SimulationArena />
              </TabsContent>
              <TabsContent value="professionals" className="space-y-6">
                <ProfessionalsCatalog />
              </TabsContent>
              <TabsContent value="marketplace" className="space-y-6">
                <ProfessionalMarketplace />
              </TabsContent>
              <TabsContent value="social" className="space-y-6">
                <InviteManager />
              </TabsContent>
              <TabsContent value="monetization" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      Earning & Reputation System
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700">Total Points</p>
                            <p className="text-2xl font-bold text-blue-900">{userPoints}</p>
                          </div>
                          <Star className="h-8 w-8 text-blue-600" />
                        </div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">Reputation Score</p>
                            <p className="text-2xl font-bold text-green-900">4.8/5.0</p>
                          </div>
                          <Trophy className="h-8 w-8 text-green-600" />
                        </div>
                      </Card>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold">Ways to Earn Points:</h3>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span>Complete case information</span>
                          <Badge variant="secondary">+10 points</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span>Participate in simulation</span>
                          <Badge variant="secondary">+15 points</Badge>
                        </div>
                        <div className="flex justify בין items-center p-3 bg-muted rounded-lg">
                          <span>Professional engagement</span>
                          <Badge variant="secondary">+20 points</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span>Social sharing</span>
                          <Badge variant="secondary">+5 points</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Case Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{readinessScore()}%</span>
                  </div>
                  <Progress value={readinessScore()} className="h-2" />
                </div>
                <div className="grid gap-4">
                  {caseFields.map((field) => {
                    const Icon = field.icon;
                    const value = formCtl.form.getValues()[field.formKey] || '';
                    const isComplete = value && value.toString().trim().length > 20;
                    const isPartial = value && value.toString().trim().length > 0 && !isComplete;

                    return (
                      <Card key={field.key} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{field.label}</span>
                            {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                          <Badge variant={
                            isComplete ? 'default' :
                              isPartial ? 'secondary' : 'outline'
                          }>
                            {isComplete ? 'Complete' :
                              isPartial ? 'Partial' : 'Empty'}
                          </Badge>
                        </div>
                        <Textarea
                          {...formCtl.form.register(field.formKey as any)}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className="min-h-[80px]"
                        />
                      </Card>
                    );
                  })}
                </div>
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={generateCase}
                    disabled={readinessScore() < 60}
                    className="w-full"
                    size="lg"
                  >
                    {readinessScore() >= 60 ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Case & Find Professionals
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Complete More Details ({readinessScore()}%)
                      </>
                    )}
                  </Button>
                  {readinessScore() >= 80 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab('simulation')}
                    >
                      <Gavel className="h-4 w-4 mr-2" />
                      Start Simulation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalCourt;
