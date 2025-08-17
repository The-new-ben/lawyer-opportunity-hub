import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Building, Award, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReputationBadge from './court/ReputationBadge';

interface Professional {
  id: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  law_firm?: string;
  bio?: string;
  years_experience?: number;
  hourly_rate?: number;
  rating: number;
  total_cases: number;
  specializations: string[];
  verification_status: string;
  tier?: string;
  tier_score?: number;
  specialization_details?: Array<{
    specialization: string;
    experience_years: number;
    success_rate: number;
  }>;
  ratings?: Array<{
    score: number;
    comment: string;
    case_title?: string;
  }>;
}

const ProfessionalsDirectory = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    filterProfessionals();
  }, [professionals, searchQuery, selectedSpecialization, selectedLocation, selectedTier]);

  const fetchProfessionals = async () => {
    try {
      console.log('Fetching professionals...');
      
      // First, get basic lawyer data with profiles
      const { data: lawyersData, error: lawyersError } = await supabase
        .from('lawyers')
        .select(`
          id,
          years_experience,
          hourly_rate,
          rating,
          total_cases,
          specializations,
          law_firm,
          bio,
          location,
          verification_status,
          profiles!left(full_name, avatar_url)
        `)
        .eq('verification_status', 'verified')
        .eq('is_active', true);

      console.log('Lawyers data:', lawyersData);

      if (lawyersError) {
        console.error('Error fetching lawyers:', lawyersError);
        throw lawyersError;
      }

      if (!lawyersData || lawyersData.length === 0) {
        console.log('No lawyers found');
        setProfessionals([]);
        return;
      }

      // Get lawyer IDs for additional queries
      const lawyerIds = lawyersData.map(lawyer => lawyer.id);

      // Fetch tiers separately
      const { data: tiersData } = await supabase
        .from('lawyer_tiers')
        .select('lawyer_id, tier, tier_score')
        .in('lawyer_id', lawyerIds);

      console.log('Tiers data:', tiersData);

      // Fetch specializations separately
      const { data: specializationsData } = await supabase
        .from('lawyer_specializations')
        .select('lawyer_id, specialization, experience_years, success_rate')
        .in('lawyer_id', lawyerIds);

      console.log('Specializations data:', specializationsData);

      // Fetch ratings separately
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('lawyer_id, score, comment')
        .in('lawyer_id', lawyerIds)
        .order('created_at', { ascending: false });

      console.log('Ratings data:', ratingsData);

      // Combine all data
      const formattedData: Professional[] = lawyersData.map((lawyer: any) => {
        // Find tier data for this lawyer
        const tierInfo = tiersData?.find(tier => tier.lawyer_id === lawyer.id);
        
        // Find specializations for this lawyer
        const lawyerSpecializations = specializationsData?.filter(spec => spec.lawyer_id === lawyer.id) || [];
        
        // Find ratings for this lawyer
        const lawyerRatings = ratingsData?.filter(rating => rating.lawyer_id === lawyer.id) || [];

        return {
          id: lawyer.id,
          full_name: lawyer.profiles?.full_name || 'לא צוין',
          avatar_url: lawyer.profiles?.avatar_url,
          location: lawyer.location,
          law_firm: lawyer.law_firm,
          bio: lawyer.bio,
          years_experience: lawyer.years_experience,
          hourly_rate: lawyer.hourly_rate,
          rating: lawyer.rating || 0,
          total_cases: lawyer.total_cases || 0,
          specializations: lawyer.specializations || [],
          verification_status: lawyer.verification_status,
          tier: tierInfo?.tier,
          tier_score: tierInfo?.tier_score,
          specialization_details: lawyerSpecializations.map(spec => ({
            specialization: spec.specialization,
            experience_years: spec.experience_years,
            success_rate: spec.success_rate
          })),
          ratings: lawyerRatings.map(rating => ({
            score: rating.score,
            comment: rating.comment,
            case_title: undefined // We'll add case titles later if needed
          }))
        };
      });

      console.log('Formatted professionals:', formattedData);

      setProfessionals(formattedData);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast({
        title: "שגיאה בטעינת המקצועיים",
        description: "לא ניתן היה לטעון את רשימת המקצועיים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfessionals = () => {
    let filtered = professionals;

    if (searchQuery) {
      filtered = filtered.filter(prof => 
        prof.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.law_firm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(prof => 
        prof.specializations.includes(selectedSpecialization) ||
        prof.specialization_details?.some(spec => spec.specialization === selectedSpecialization)
      );
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(prof => prof.location === selectedLocation);
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(prof => prof.tier === selectedTier);
    }

    setFilteredProfessionals(filtered);
  };

  const getUniqueSpecializations = () => {
    const specs = new Set<string>();
    professionals.forEach(prof => {
      prof.specializations.forEach(spec => specs.add(spec));
      prof.specialization_details?.forEach(spec => specs.add(spec.specialization));
    });
    return Array.from(specs).sort();
  };

  const getUniqueLocations = () => {
    const locations = new Set<string>();
    professionals.forEach(prof => {
      if (prof.location) locations.add(prof.location);
    });
    return Array.from(locations).sort();
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-slate-300 to-slate-500';
      case 'gold': return 'bg-gradient-to-r from-yellow-300 to-yellow-500';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 'bronze': return 'bg-gradient-to-r from-amber-600 to-amber-800';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getReputationPoints = (prof: Professional) => {
    return Math.floor((prof.tier_score || 0) + (prof.rating * 20) + (prof.total_cases * 0.5));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען מאגר מקצועיים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          מאגר בעלי המקצוע הוותיקים
        </h1>
        <p className="text-xl text-muted-foreground">
          עורכי דין מנוסים עם תיקים מוצלחים ודירוגי קהל גבוהים
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{professionals.length} מקצועיים מאומתים</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>תיקים מוצלחים בפיקוח שופטים</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>דירוגי קהל מאומתים</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="חפש לפי שם, משרד או התמחות..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="בחר התמחות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל ההתמחויות</SelectItem>
            {getUniqueSpecializations().map(spec => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="בחר מיקום" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל המיקומים</SelectItem>
            {getUniqueLocations().map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTier} onValueChange={setSelectedTier}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="בחר דרגה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הדרגות</SelectItem>
            <SelectItem value="platinum">פלטינום</SelectItem>
            <SelectItem value="gold">זהב</SelectItem>
            <SelectItem value="silver">כסף</SelectItem>
            <SelectItem value="bronze">ברונזה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="text-center">
        <p className="text-muted-foreground">
          נמצאו {filteredProfessionals.length} מקצועיים
        </p>
      </div>

      {/* Professionals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.map((professional) => (
          <Card key={professional.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={professional.avatar_url} alt={professional.full_name} />
                  <AvatarFallback className="text-lg">
                    {professional.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-1">{professional.full_name}</CardTitle>
                  
                  {professional.tier && (
                    <Badge className={`${getTierColor(professional.tier)} text-white mb-2`}>
                      {professional.tier === 'platinum' && 'פלטינום'}
                      {professional.tier === 'gold' && 'זהב'}
                      {professional.tier === 'silver' && 'כסף'}
                      {professional.tier === 'bronze' && 'ברונזה'}
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{professional.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{professional.total_cases} תיקים</span>
                    <span>•</span>
                    <span>{professional.years_experience} שנות ניסיון</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {professional.location && (
                      <>
                        <MapPin className="h-3 w-3" />
                        <span>{professional.location}</span>
                      </>
                    )}
                    {professional.law_firm && (
                      <>
                        <span>•</span>
                        <Building className="h-3 w-3" />
                        <span>{professional.law_firm}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-4">
                {/* Specializations */}
                <div>
                  <h4 className="font-medium text-sm mb-2">התמחויות:</h4>
                  <div className="flex flex-wrap gap-1">
                    {professional.specializations.slice(0, 3).map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {professional.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{professional.specializations.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {professional.bio && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">אודות:</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {professional.bio}
                    </p>
                  </div>
                )}

                {/* Recent Rating */}
                {professional.ratings && professional.ratings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">ביקורת אחרונה:</h4>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < professional.ratings![0].score
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {professional.ratings[0].case_title && (
                          <span className="text-xs text-muted-foreground">
                            {professional.ratings[0].case_title}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        "{professional.ratings[0].comment}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Reputation Badge */}
                <ReputationBadge points={getReputationPoints(professional)} />
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">תעריף שעתי:</span>
                  <span className="font-medium">₪{professional.hourly_rate?.toLocaleString()}</span>
                </div>
                <Button className="w-full" variant="default">
                  פנה למקצועי
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProfessionals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            לא נמצאו מקצועיים העונים על הקריטריונים
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialization('all');
              setSelectedLocation('all');
              setSelectedTier('all');
            }}
          >
            נקה מסננים
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfessionalsDirectory;