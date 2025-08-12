import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Globe, Users, Scale, Gavel } from 'lucide-react';
import SmartIntakePortal from './SmartIntakePortal';
import { SocialLogin } from '@/components/auth/SocialLogin';

const GlobalCourt = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    document.title = 'Global AI Court - International Legal System';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Advanced AI-powered international court system for global legal disputes and professional collaboration');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Advanced AI-powered international court system for global legal disputes and professional collaboration';
      document.head.appendChild(meta);
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.href);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = window.location.href;
      document.head.appendChild(link);
    }
  }, []);

  const handleLogin = () => {
    if (password === 'demo2024' || password === 'court@global') {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <Card className="w-full max-w-md backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Global AI Court
            </CardTitle>
            <p className="text-blue-100 text-sm">
              International Legal System Portal
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
              />
              <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Shield className="w-4 h-4 mr-2" />
                Access Portal
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/60">Or continue with</span>
              </div>
            </div>

            <SocialLogin />

            <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/70">
              <div className="flex flex-col items-center space-y-1">
                <Globe className="w-4 h-4" />
                <span>Global Access</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Users className="w-4 h-4" />
                <span>Professional Network</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Gavel className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <SmartIntakePortal />;
};

export default GlobalCourt;