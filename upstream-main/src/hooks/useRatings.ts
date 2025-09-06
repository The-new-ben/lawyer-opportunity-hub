import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Rating {
  id: string;
  case_id: string;
  client_id?: string;
  lawyer_id: string;
  score: number; // 1-5
  feedback?: string;
  created_at: string;
}

export type NewRating = Omit<Rating, 'id' | 'created_at'>;

export const useRatings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ratings, isLoading, error } = useQuery({
    queryKey: ['ratings'],
    queryFn: async (): Promise<Rating[]> => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const addRating = useMutation({
    mutationFn: async (newRating: NewRating) => {
      const { data, error } = await supabase
        .from('ratings')
        .insert(newRating)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      toast({
        title: "Rating submitted successfully",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRatingStats = () => {
    if (!ratings) return { 
      totalRatings: 0, 
      averageScore: 0, 
      fiveStars: 0, 
      fourStars: 0, 
      threeStars: 0, 
      twoStars: 0, 
      oneStar: 0 
    };

    const totalRatings = ratings.length;
    const averageScore = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.score, 0) / totalRatings 
      : 0;

    const fiveStars = ratings.filter(r => r.score === 5).length;
    const fourStars = ratings.filter(r => r.score === 4).length;
    const threeStars = ratings.filter(r => r.score === 3).length;
    const twoStars = ratings.filter(r => r.score === 2).length;
    const oneStar = ratings.filter(r => r.score === 1).length;

    return {
      totalRatings,
      averageScore: Math.round(averageScore * 10) / 10,
      fiveStars,
      fourStars,
      threeStars,
      twoStars,
      oneStar,
    };
  };

  const getLawyerRatings = (lawyerId: string) => {
    if (!ratings) return [];
    return ratings.filter(r => r.lawyer_id === lawyerId);
  };

  return {
    ratings,
    isLoading,
    error,
    addRating,
    getRatingStats,
    getLawyerRatings,
  };
};