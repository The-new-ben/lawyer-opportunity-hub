import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, ThumbsUp } from 'lucide-react';
import { useRatings, type NewRating } from '@/hooks/useRatings';

interface RatingDialogProps {
  caseId: string;
  lawyerId: string;
  clientId?: string;
  trigger?: React.ReactNode;
}

export function RatingDialog({ caseId, lawyerId, clientId, trigger }: RatingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<Partial<NewRating>>({
    case_id: caseId,
    lawyer_id: lawyerId,
    client_id: clientId,
    score: 0,
    comment: '',
  });
  const [hoveredStar, setHoveredStar] = useState(0);

  const { addRating } = useRatings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating.score || rating.score === 0) {
      return;
    }

    await addRating.mutateAsync(rating as NewRating);
    setIsOpen(false);
    setRating({
      case_id: caseId,
      lawyer_id: lawyerId,
      client_id: clientId,
      score: 0,
      comment: '',
    });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredStar || rating.score || 0);
      
      return (
        <button
          key={index}
          type="button"
          className={`transition-all duration-200 hover:scale-110 ${
            isActive ? 'text-yellow-400' : 'text-muted-foreground'
          }`}
          onMouseEnter={() => setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => setRating({ ...rating, score: starValue })}
        >
          <Star 
            className={`h-8 w-8 ${isActive ? 'fill-current' : ''}`} 
          />
        </button>
      );
    });
  };

  const getScoreText = (score: number) => {
    switch (score) {
      case 1: return 'לא מרוצה';
      case 2: return 'פחות מרוצה';
      case 3: return 'בסדר';
      case 4: return 'מרוצה';
      case 5: return 'מרוצה מאוד';
      default: return 'בחר דירוג';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="animate-fade-in hover-scale">
            <ThumbsUp className="h-4 w-4 ml-2" />
            דרג את השירות
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-center">
            איך היה השירות?
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-1">
              {renderStars()}
            </div>
            <p className="text-sm text-muted-foreground animate-fade-in">
              {getScoreText(hoveredStar || rating.score || 0)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">תגובה (אופציונלי)</Label>
            <Textarea
              id="comment"
              value={rating.comment || ''}
              onChange={(e) => setRating({ ...rating, comment: e.target.value })}
              placeholder="ספר לנו על החוויה שלך..."
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              disabled={addRating.isPending || !rating.score}
              className="flex-1 animate-pulse-subtle"
            >
              <Star className="h-4 w-4 ml-2" />
              {addRating.isPending ? 'שולח...' : 'שלח דירוג'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}