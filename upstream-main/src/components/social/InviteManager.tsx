import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Users, 
  MessageSquare, 
  Phone, 
  Mail, 
  Linkedin, 
  Facebook, 
  Twitter,
  Copy,
  Send,
  UserPlus,
  Star,
  DollarSign,
  Clock,
  Globe
} from 'lucide-react';
import { FaWhatsapp, FaTelegram, FaDiscord } from 'react-icons/fa';

interface InviteManagerProps {
  caseId?: string;
  caseTitle?: string;
  caseDescription?: string;
  onInviteSent?: (details: any) => void;
}

export function InviteManager({ 
  caseId, 
  caseTitle = "Legal Discussion", 
  caseDescription = "",
  onInviteSent 
}: InviteManagerProps) {
  const [inviteMode, setInviteMode] = useState<'public' | 'professional' | 'specific'>('public');
  const [isPaid, setIsPaid] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('100');
  const [duration, setDuration] = useState('60');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [audienceSize, setAudienceSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  
  const { toast } = useToast();

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      case: caseId || 'demo',
      invite: 'true',
      mode: inviteMode,
      ...(isPaid && { paid: 'true', rate: hourlyRate }),
    });
    return `${baseUrl}/join?${params.toString()}`;
  };

  const shareToSocial = (platform: string) => {
    const link = generateInviteLink();
    const text = customMessage || `Join legal discussion: "${caseTitle}" - Your expertise needed!`;
    
    const urls = {
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(text)}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
    };
    
    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
      
      toast({
        title: 'Shared Successfully',
        description: `Invitation shared to ${platform}`,
      });
      
      onInviteSent?.({
        platform,
        mode: inviteMode,
        isPaid,
        link,
        message: text
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateInviteLink());
      toast({
        title: 'Link Copied',
        description: 'Invitation link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Please copy the link manually',
        variant: 'destructive'
      });
    }
  };

  const sendDirectInvite = async () => {
    // This would integrate with communication services
    toast({
      title: 'Invitations Sent',
      description: `Direct invitations sent to ${inviteMode} participants`,
    });
    
    onInviteSent?.({
      mode: inviteMode,
      isPaid,
      specialtyFilter,
      urgency,
      audienceSize
    });
  };

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: 'text-green-600' },
    { id: 'telegram', name: 'Telegram', icon: FaTelegram, color: 'text-blue-500' },
  ];

  const urgencyColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-orange-600 bg-orange-50',
    high: 'text-red-600 bg-red-50'
  };

  return (
    <Card className="w-full border border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          <CardTitle>Invite Professionals & Participants</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Get expert opinions and public participation for: "{caseTitle}"
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Invitation Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Invitation Mode</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'public', label: 'Public Call', icon: Globe, desc: 'Open invitation to community' },
              { id: 'professional', label: 'Legal Experts', icon: UserCheck, desc: 'Verified professionals only' },
              { id: 'specific', label: 'Targeted Invite', icon: Users, desc: 'Specific individuals/groups' }
            ].map((mode) => {
              const IconComponent = mode.icon;
              return (
                <Card 
                  key={mode.id}
                  className={`cursor-pointer transition-all ${
                    inviteMode === mode.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setInviteMode(mode.id as any)}
                >
                  <CardContent className="p-4 text-center">
                    <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium text-sm">{mode.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{mode.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Paid Professional Services */}
        {inviteMode === 'professional' && (
          <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <Label className="font-medium">Professional Services</Label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Offer paid consultation</p>
                <p className="text-xs text-muted-foreground">Attract top-tier legal experts</p>
              </div>
              <Switch checked={isPaid} onCheckedChange={setIsPaid} />
            </div>

            {isPaid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Hourly Rate ($)</Label>
                  <Input 
                    type="number" 
                    value={hourlyRate} 
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label className="text-xs">Session Duration (min)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs">Required Specialty (optional)</Label>
              <Input 
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                placeholder="e.g., Corporate Law, Family Law, IP Law"
              />
            </div>
          </div>
        )}

        {/* Urgency & Audience Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-2 block">Urgency Level</Label>
            <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Low - Response within 24h
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Medium - Response within 12h
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    High - Response within 2h
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs mb-2 block">Target Audience Size</Label>
            <Select value={audienceSize} onValueChange={(value: any) => setAudienceSize(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (5-15 participants)</SelectItem>
                <SelectItem value="medium">Medium (15-50 participants)</SelectItem>
                <SelectItem value="large">Large (50+ participants)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Message */}
        <div>
          <Label className="text-xs mb-2 block">Custom Invitation Message</Label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personal message to attract the right participants..."
            rows={3}
          />
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={urgencyColors[urgency]}>
            {urgency.toUpperCase()} Priority
          </Badge>
          {isPaid && (
            <Badge variant="secondary" className="text-green-600 bg-green-50">
              <DollarSign className="w-3 h-3 mr-1" />
              ${hourlyRate}/hr
            </Badge>
          )}
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            {audienceSize} audience
          </Badge>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Share Invitation</h4>
          
          {/* Social Platforms */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <Button
                  key={platform.id}
                  variant="outline"
                  onClick={() => shareToSocial(platform.id)}
                  className="h-auto p-3 flex flex-col gap-2 hover:bg-muted/50"
                >
                  <IconComponent className={`w-5 h-5 ${platform.color}`} />
                  <span className="text-xs">{platform.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Direct Actions */}
          <div className="flex gap-3">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button onClick={sendDirectInvite} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Send Invites
            </Button>
          </div>
        </div>

        {/* Invite Link Display */}
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-xs text-muted-foreground">Generated Link:</Label>
          <p className="text-xs font-mono break-all mt-1 text-primary">
            {generateInviteLink()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}