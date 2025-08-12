import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Award,
  Calendar,
  MessageSquare,
  Video,
  Phone,
  Mail,
  Linkedin,
  CheckCircle,
  Shield,
  Zap,
  TrendingUp,
  BookOpen,
  Briefcase
} from 'lucide-react';

interface Professional {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  specialties: string[];
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  responseTime: string;
  isOnline: boolean;
  isVerified: boolean;
  experienceYears: number;
  successRate: number;
  languages: string[];
  availability: 'immediate' | 'today' | 'this_week' | 'next_week';
  consultationTypes: ('video' | 'phone' | 'chat' | 'in_person')[];
  bio: string;
  education: string[];
  certifications: string[];
  recentCases: number;
  tier: 'standard' | 'premium' | 'elite';
}

const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar: '/placeholder-avatar.jpg',
    title: 'Senior Corporate Lawyer',
    specialties: ['Corporate Law', 'Mergers & Acquisitions', 'Securities'],
    location: 'New York, NY',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 450,
    responseTime: '< 1 hour',
    isOnline: true,
    isVerified: true,
    experienceYears: 15,
    successRate: 94,
    languages: ['English', 'Spanish'],
    availability: 'immediate',
    consultationTypes: ['video', 'phone', 'chat'],
    bio: 'Specialized in high-stakes corporate transactions with 15+ years experience.',
    education: ['Harvard Law School JD', 'Yale University BA'],
    certifications: ['Board Certified in Business Law', 'Certified M&A Advisor'],
    recentCases: 23,
    tier: 'elite'
  },
  {
    id: '2',
    name: 'David Chen',
    avatar: '/placeholder-avatar.jpg',
    title: 'Immigration Attorney',
    specialties: ['Immigration Law', 'Visa Applications', 'Citizenship'],
    location: 'San Francisco, CA',
    rating: 4.7,
    reviewCount: 89,
    hourlyRate: 280,
    responseTime: '< 2 hours',
    isOnline: false,
    isVerified: true,
    experienceYears: 8,
    successRate: 91,
    languages: ['English', 'Mandarin', 'Cantonese'],
    availability: 'today',
    consultationTypes: ['video', 'phone', 'in_person'],
    bio: 'Helping families and businesses navigate complex immigration processes.',
    education: ['Stanford Law School JD', 'UC Berkeley BA'],
    certifications: ['Immigration Law Specialist'],
    recentCases: 45,
    tier: 'premium'
  },
  // Add more mock professionals...
];

interface ProfessionalMarketplaceProps {
  caseId?: string;
  specialty?: string;
  budget?: number;
  onProfessionalSelected?: (professional: Professional) => void;
}

export function ProfessionalMarketplace({
  caseId,
  specialty,
  budget,
  onProfessionalSelected
}: ProfessionalMarketplaceProps) {
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>(mockProfessionals);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialty || '');
  const [maxRate, setMaxRate] = useState(budget || 1000);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'rate' | 'experience' | 'availability'>('rating');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    filterAndSortProfessionals();
  }, [searchQuery, selectedSpecialty, maxRate, onlineOnly, verifiedOnly, sortBy]);

  const filterAndSortProfessionals = () => {
    let filtered = [...professionals];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(prof => 
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(prof => 
        prof.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))
      );
    }

    // Rate filter
    filtered = filtered.filter(prof => prof.hourlyRate <= maxRate);

    // Online filter
    if (onlineOnly) {
      filtered = filtered.filter(prof => prof.isOnline);
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter(prof => prof.isVerified);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'rate':
          return a.hourlyRate - b.hourlyRate;
        case 'experience':
          return b.experienceYears - a.experienceYears;
        case 'availability':
          const availabilityOrder = { immediate: 0, today: 1, this_week: 2, next_week: 3 };
          return availabilityOrder[a.availability] - availabilityOrder[b.availability];
        default:
          return 0;
      }
    });

    setFilteredProfessionals(filtered);
  };

  const inviteProfessional = async (professional: Professional) => {
    try {
      toast({
        title: 'Invitation Sent',
        description: `${professional.name} has been invited to your case`,
      });
      
      onProfessionalSelected?.(professional);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive'
      });
    }
  };

  const scheduleConsultation = (professional: Professional) => {
    setSelectedProfessional(professional);
    toast({
      title: 'Opening Scheduler',
      description: `Scheduling consultation with ${professional.name}`,
    });
  };

  const getTierColor = (tier: Professional['tier']) => {
    switch (tier) {
      case 'elite': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'premium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'standard': return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTierIcon = (tier: Professional['tier']) => {
    switch (tier) {
      case 'elite': return Award;
      case 'premium': return Shield;
      case 'standard': return CheckCircle;
    }
  };

  const getAvailabilityColor = (availability: Professional['availability']) => {
    switch (availability) {
      case 'immediate': return 'text-green-600 bg-green-50';
      case 'today': return 'text-blue-600 bg-blue-50';
      case 'this_week': return 'text-orange-600 bg-orange-50';
      case 'next_week': return 'text-gray-600 bg-gray-50';
    }
  };

  const getAvailabilityText = (availability: Professional['availability']) => {
    switch (availability) {
      case 'immediate': return 'Available Now';
      case 'today': return 'Today';
      case 'this_week': return 'This Week';
      case 'next_week': return 'Next Week';
    }
  };

  const allSpecialties = Array.from(
    new Set(professionals.flatMap(p => p.specialties))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Find Legal Professionals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, title, or specialty..."
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All specialties</SelectItem>
                  {allSpecialties.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Max Hourly Rate</Label>
              <Select value={maxRate.toString()} onValueChange={(v) => setMaxRate(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200">Up to $200/hr</SelectItem>
                  <SelectItem value="300">Up to $300/hr</SelectItem>
                  <SelectItem value="500">Up to $500/hr</SelectItem>
                  <SelectItem value="1000">Up to $1000/hr</SelectItem>
                  <SelectItem value="10000">No limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Sort by</Label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="rate">Lowest rate</SelectItem>
                  <SelectItem value="experience">Most experienced</SelectItem>
                  <SelectItem value="availability">Available soonest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Online only</Label>
                <Switch checked={onlineOnly} onCheckedChange={setOnlineOnly} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Verified only</Label>
                <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} size="sm" />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredProfessionals.length} professionals found</span>
            <Badge variant="outline">
              <Filter className="w-3 h-3 mr-1" />
              {(searchQuery || selectedSpecialty || maxRate < 1000 || onlineOnly) ? 'Filtered' : 'All'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Professionals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProfessionals.map((professional) => {
          const TierIcon = getTierIcon(professional.tier);
          
          return (
            <Card key={professional.id} className="border border-border hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-4">
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={professional.avatar} alt={professional.name} />
                      <AvatarFallback>
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {professional.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{professional.name}</h3>
                      {professional.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{professional.title}</p>
                    
                    {/* Rating and Location */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{professional.rating}</span>
                        <span>({professional.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{professional.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <Badge className={`${getTierColor(professional.tier)} border`}>
                    <TierIcon className="w-3 h-3 mr-1" />
                    {professional.tier.toUpperCase()}
                  </Badge>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2">
                  {professional.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {professional.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{professional.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">${professional.hourlyRate}/hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Responds in {professional.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{professional.experienceYears} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span>{professional.successRate}% success rate</span>
                  </div>
                </div>

                <Separator />

                {/* Availability and Consultation Types */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Availability</span>
                    <Badge className={getAvailabilityColor(professional.availability)}>
                      {getAvailabilityText(professional.availability)}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    {professional.consultationTypes.map((type) => {
                      const icons = {
                        video: Video,
                        phone: Phone,
                        chat: MessageSquare,
                        in_person: Users
                      };
                      const IconComponent = icons[type];
                      return (
                        <div
                          key={type}
                          className="p-1 rounded border border-border"
                          title={type.replace('_', ' ')}
                        >
                          <IconComponent className="w-3 h-3 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {professional.bio}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => inviteProfessional(professional)}
                    className="flex-1"
                    size="sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Invite to Case
                  </Button>
                  <Button
                    onClick={() => scheduleConsultation(professional)}
                    variant="outline"
                    size="sm"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No results */}
      {filteredProfessionals.length === 0 && (
        <div className="text-center p-8 bg-muted/50 rounded-lg border border-dashed border-border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-muted-foreground mb-2">No professionals found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your filters or search criteria
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('');
              setMaxRate(1000);
              setOnlineOnly(false);
              setVerifiedOnly(false);
            }}
            variant="outline"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}