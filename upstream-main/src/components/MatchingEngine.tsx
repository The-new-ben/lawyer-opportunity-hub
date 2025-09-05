import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, DollarSign } from 'lucide-react';
import { useMatching, MatchedLawyer } from '@/hooks/useMatching';
import { useQuotes } from '@/hooks/useQuotes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QuoteForm } from './QuoteForm';
import { LawyerTierBadge } from './LawyerTierBadge';

interface MatchingEngineProps {
  leadId: string;
  legalCategory: string;
}

export function MatchingEngine({ leadId, legalCategory }: MatchingEngineProps) {
  const { useMatchedLawyers } = useMatching();
  const { addQuote } = useQuotes();
  const { data: matchedLawyers = [], isLoading } = useMatchedLawyers(leadId);
  const [selectedLawyer, setSelectedLawyer] = useState<MatchedLawyer | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const handleSendQuote = (lawyer: MatchedLawyer) => {
    setSelectedLawyer(lawyer);
    setShowQuoteForm(true);
  };

  const getMatchingScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'התאמה מושלמת', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { variant: 'secondary' as const, label: 'התאמה טובה', color: 'bg-blue-100 text-blue-800' };
    return { variant: 'outline' as const, label: 'התאמה חלקית', color: 'bg-yellow-100 text-yellow-800' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>מנוע התאמות</CardTitle>
          <CardDescription>מחפש עורכי דין מתאימים...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          מנוע התאמות
        </CardTitle>
        <CardDescription>
          נמצאו {matchedLawyers.length} עורכי דין מתאימים לתחום {legalCategory}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matchedLawyers.map((lawyer) => {
            const matchingBadge = getMatchingScoreBadge(lawyer.matching_score);
            return (
              <div key={lawyer.lawyer_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{lawyer.lawyer_name}</h3>
                      <LawyerTierBadge tier="gold" />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{lawyer.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>₪{lawyer.hourly_rate}/שעה</span>
                      </div>
                    </div>

                    {lawyer.specializations && lawyer.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specializations.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {lawyer.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{lawyer.specializations.length - 3} נוספות
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-left space-y-2">
                    <Badge className={matchingBadge.color}>
                      {lawyer.matching_score}% {matchingBadge.label}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSendQuote(lawyer)}
                      >
                        שלח הצעה
                      </Button>
                      <Button size="sm">
                        פרטים נוספים
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {matchedLawyers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>לא נמצאו עורכי דין מתאימים כרגע</p>
              <p className="text-sm">נסה לעדכן את קריטריוני החיפוש</p>
            </div>
          )}
        </div>

        <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>שליחת הצעת מחיר</DialogTitle>
            </DialogHeader>
            {selectedLawyer && (
              <QuoteForm
                leadId={leadId}
                lawyerId={selectedLawyer.lawyer_id}
                lawyerName={selectedLawyer.lawyer_name}
                onSubmit={(data) => {
                  addQuote.mutate(data);
                  setShowQuoteForm(false);
                }}
                onCancel={() => setShowQuoteForm(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}