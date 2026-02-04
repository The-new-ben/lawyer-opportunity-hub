import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Clock, 
  Gavel,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  CreditCard,
  Gift,
  Award,
  Sparkles
} from 'lucide-react';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    cases: number;
    hearings: number;
    professionals: number;
    storage: string;
    priority: 'basic' | 'high' | 'premium';
  };
  popular?: boolean;
  color: string;
  icon: any;
}

interface UserSubscription {
  tier: string;
  status: 'active' | 'expired' | 'cancelled';
  expiresAt: Date;
  autoRenew: boolean;
  usage: {
    casesUsed: number;
    hearingsUsed: number;
    professionalsUsed: number;
    storageUsed: number;
  };
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Community',
    price: 0,
    interval: 'monthly',
    features: [
      'Public case discussions',
      'Basic AI assistance',
      'Community polls',
      'Standard video quality',
      'Community support'
    ],
    limits: {
      cases: 3,
      hearings: 10,
      professionals: 5,
      storage: '1GB',
      priority: 'basic'
    },
    color: 'text-gray-600',
    icon: Users
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29,
    interval: 'monthly',
    features: [
      'Private cases & hearings',
      'Advanced AI legal analysis',
      'Professional network access',
      'HD video & recording',
      'Priority scheduling',
      'Evidence management',
      'Custom polls & surveys',
      'Email support'
    ],
    limits: {
      cases: 50,
      hearings: 100,
      professionals: 50,
      storage: '50GB',
      priority: 'high'
    },
    popular: true,
    color: 'text-blue-600',
    icon: Gavel
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'monthly',
    features: [
      'Unlimited cases & hearings',
      'Expert AI recommendations',
      'Verified professional network',
      '4K video & live streaming',
      'Instant scheduling',
      'Advanced evidence tools',
      'Custom branding',
      'API access',
      'Dedicated support',
      'White-label options'
    ],
    limits: {
      cases: -1, // unlimited
      hearings: -1,
      professionals: -1,
      storage: 'Unlimited',
      priority: 'premium'
    },
    color: 'text-purple-600',
    icon: Crown
  }
];

interface SubscriptionManagerProps {
  currentSubscription?: UserSubscription;
  onSubscriptionChange?: (tier: string) => void;
}

export function SubscriptionManager({ 
  currentSubscription, 
  onSubscriptionChange 
}: SubscriptionManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showUsage, setShowUsage] = useState(false);
  const [autoRenew, setAutoRenew] = useState(currentSubscription?.autoRenew ?? true);
  const { toast } = useToast();

  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'free') {
      // Handle free tier
      toast({
        title: 'Switched to Community',
        description: 'You now have access to community features',
      });
      onSubscriptionChange?.(tierId);
      return;
    }

    try {
      setLoading(tierId);
      
      // This would integrate with Stripe or payment provider
      const tier = subscriptionTiers.find(t => t.id === tierId);
      if (!tier) return;

      // Simulate payment flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Subscription Activated',
        description: `Welcome to ${tier.name}! Your features are now active.`,
      });
      
      onSubscriptionChange?.(tierId);
    } catch (error) {
      toast({
        title: 'Subscription Error',
        description: 'Please try again or contact support',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading('cancel');
      
      // Call cancellation API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will expire at the end of the billing period',
      });
    } catch (error) {
      toast({
        title: 'Cancellation Error',
        description: 'Please contact support for assistance',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatLimit = (limit: number | string) => {
    if (typeof limit === 'string') return limit;
    return limit === -1 ? 'Unlimited' : limit.toString();
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Current Subscription</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionTiers.find(t => t.id === currentSubscription.tier)?.name || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={currentSubscription.status === 'active' ? 'default' : 'destructive'}
                  className="mb-2"
                >
                  {currentSubscription.status.toUpperCase()}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {currentSubscription.status === 'active' 
                    ? `Expires ${currentSubscription.expiresAt.toLocaleDateString()}`
                    : 'Subscription inactive'
                  }
                </p>
              </div>
            </div>
          </CardHeader>
          
          {currentSubscription.status === 'active' && (
            <CardContent className="space-y-4">
              {/* Usage Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show usage details</Label>
                <Switch checked={showUsage} onCheckedChange={setShowUsage} />
              </div>

              {/* Usage Statistics */}
              {showUsage && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm">Usage This Month</h4>
                  
                  {Object.entries({
                    'Cases': { 
                      used: currentSubscription.usage.casesUsed, 
                      limit: subscriptionTiers.find(t => t.id === currentSubscription.tier)?.limits.cases || 0,
                      icon: Gavel 
                    },
                    'Hearings': { 
                      used: currentSubscription.usage.hearingsUsed, 
                      limit: subscriptionTiers.find(t => t.id === currentSubscription.tier)?.limits.hearings || 0,
                      icon: Users 
                    },
                    'Professionals': { 
                      used: currentSubscription.usage.professionalsUsed, 
                      limit: subscriptionTiers.find(t => t.id === currentSubscription.tier)?.limits.professionals || 0,
                      icon: Award 
                    }
                  }).map(([label, data]) => {
                    const IconComponent = data.icon;
                    const percentage = getUsagePercentage(data.used, data.limit);
                    const colorClass = getUsageColor(percentage);
                    
                    return (
                      <div key={label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{label}</span>
                          </div>
                          <span className={`text-xs ${colorClass}`}>
                            {data.used} / {formatLimit(data.limit)}
                          </span>
                        </div>
                        {data.limit !== -1 && (
                          <Progress value={percentage} className="h-2" />
                        )}
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Storage</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(currentSubscription.usage.storageUsed / 1024).toFixed(1)}GB / {
                        subscriptionTiers.find(t => t.id === currentSubscription.tier)?.limits.storage
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Auto-renewal */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-renewal</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically renew your subscription
                  </p>
                </div>
                <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing Details
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleCancelSubscription}
                  disabled={loading === 'cancel'}
                >
                  {loading === 'cancel' ? 'Cancelling...' : 'Cancel'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionTiers.map((tier) => {
          const IconComponent = tier.icon;
          const isCurrentTier = currentSubscription?.tier === tier.id;
          const isUpgrade = !currentSubscription || 
            (subscriptionTiers.findIndex(t => t.id === currentSubscription.tier) < 
             subscriptionTiers.findIndex(t => t.id === tier.id));

          return (
            <Card 
              key={tier.id} 
              className={`relative border transition-all ${
                tier.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : isCurrentTier 
                    ? 'border-green-500 bg-green-50/50' 
                    : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className={`mx-auto p-3 rounded-full w-fit bg-background ${tier.color}`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                
                <div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">
                      {tier.price > 0 ? `/${tier.interval}` : ' forever'}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Limits */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Usage Limits</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Cases: {formatLimit(tier.limits.cases)}</div>
                    <div>Hearings: {formatLimit(tier.limits.hearings)}</div>
                    <div>Professionals: {formatLimit(tier.limits.professionals)}</div>
                    <div>Storage: {tier.limits.storage}</div>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {tier.limits.priority} priority
                  </Badge>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentTier ? (
                    <Button disabled className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(tier.id)}
                      disabled={loading === tier.id}
                      className="w-full"
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {loading === tier.id ? (
                        'Processing...'
                      ) : (
                        <>
                          {isUpgrade ? (
                            <>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              {tier.price > 0 ? 'Upgrade' : 'Downgrade'}
                            </>
                          ) : (
                            <>
                              <Gift className="w-4 h-4 mr-2" />
                              Get Started
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Benefits */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Why Upgrade?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Zap,
                title: 'Priority Support',
                description: 'Get faster response times and dedicated assistance'
              },
              {
                icon: Shield,
                title: 'Enhanced Security',
                description: 'Advanced encryption and privacy protection'
              },
              {
                icon: Target,
                title: 'Expert Network',
                description: 'Access to verified legal professionals'
              },
              {
                icon: Award,
                title: 'Advanced Analytics',
                description: 'Detailed insights and case performance metrics'
              }
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center space-y-2">
                  <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}