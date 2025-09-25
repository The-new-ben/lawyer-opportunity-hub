import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Chrome } from 'lucide-react';
import { FaGoogle, FaFacebook, FaLinkedin } from 'react-icons/fa';

interface SocialLoginProps {
  onSuccess?: () => void;
  mode?: 'compact' | 'full';
}

export function SocialLogin({ onSuccess, mode = 'full' }: SocialLoginProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'linkedin_oidc') => {
    try {
      setLoading(provider);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // OAuth flow initiated successfully
      toast({
        title: 'Redirecting...',
        description: `Connecting with ${provider}`,
      });

      onSuccess?.();
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast({
        title: 'Login Error',
        description: error instanceof Error ? error.message : `Failed to login with ${provider}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const socialProviders = [
    {
      id: 'google' as const,
      name: 'Google',
      icon: FaGoogle,
      color: 'text-red-600',
      bgColor: 'hover:bg-red-50',
    },
    {
      id: 'facebook' as const,
      name: 'Facebook',
      icon: FaFacebook,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
    },
    {
      id: 'linkedin_oidc' as const,
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'text-blue-700',
      bgColor: 'hover:bg-blue-50',
    },
  ];

  if (mode === 'compact') {
    return (
      <div className="flex gap-2">
        {socialProviders.map((provider) => {
          const IconComponent = provider.icon;
          return (
            <Button
              key={provider.id}
              variant="outline"
              size="sm"
              onClick={() => handleSocialLogin(provider.id)}
              disabled={loading !== null}
              className={`${provider.bgColor} border-border`}
            >
              {loading === provider.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <IconComponent className={`w-4 h-4 ${provider.color}`} />
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md border border-border shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
          <Chrome className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Quick Access</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect with your social account
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialProviders.map((provider, index) => {
          const IconComponent = provider.icon;
          return (
            <div key={provider.id}>
              <Button
                variant="outline"
                className={`w-full ${provider.bgColor} border-border transition-colors`}
                onClick={() => handleSocialLogin(provider.id)}
                disabled={loading !== null}
              >
                {loading === provider.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <IconComponent className={`w-4 h-4 mr-2 ${provider.color}`} />
                )}
                Continue with {provider.name}
              </Button>
              {index < socialProviders.length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          );
        })}
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
}