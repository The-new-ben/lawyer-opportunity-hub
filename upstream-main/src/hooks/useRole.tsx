import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type UserRole = 'admin' | 'lead_provider' | 'lawyer' | 'customer' | 'client' | 'supplier' | 'judge' | 'witness' | 'audience';

interface UserRoleData {
  role: UserRole | null;
  loading: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isLeadProvider: boolean;
  isLawyer: boolean;
  isCustomer: boolean;
}

export function useRole(): UserRoleData {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    // עיכוב קצר למניעת טעינות מיותרות
    const timeoutId = setTimeout(() => {
      fetchUserRole();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id]); // רק כשה-user id משתנה

  const fetchUserRole = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // יעיל יותר - רק בקשה אחת לprofiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        toast({
          title: 'Error fetching user role',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive'
        });
        setRole('customer');
        return;
      }

      const userRole = profile?.role as UserRole;
      setRole(userRole || 'customer');
      
    } catch (error) {
      toast({
        title: 'Error fetching user role',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
      setRole('customer'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;

    const synonyms: Record<string, UserRole> = {
      client: 'customer',
      supplier: 'lead_provider',
    } as const;

    const normalize = (r: UserRole) => (synonyms[r] ? synonyms[r] : r);

    const requiredRoles = (Array.isArray(requiredRole) ? requiredRole : [requiredRole])
      .map((r) => normalize(r));

    const current = normalize(role);

    // Admin has all permissions
    if (current === 'admin') return true;

    return requiredRoles.includes(current);
  };
  return {
    role,
    loading,
    hasPermission,
    isAdmin: role === 'admin',
    isLeadProvider: role === 'lead_provider',
    isLawyer: role === 'lawyer',
    isCustomer: role === 'customer'
  };
}