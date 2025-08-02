import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'lawyer' | 'client' | 'supplier' | 'customer';

interface UserRoleData {
  role: UserRole | null;
  loading: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isLawyer: boolean;
  isClient: boolean;
  isSupplier: boolean;
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

    fetchUserRole();
  }, [user]);

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
        console.error('Error fetching user role:', error);
        setRole('customer');
        return;
      }

      const userRole = profile?.role as UserRole;
      setRole(userRole || 'customer');
      
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('customer'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Admin has all permissions
    if (role === 'admin') return true;
    
    return requiredRoles.includes(role);
  };

  return {
    role,
    loading,
    hasPermission,
    isAdmin: role === 'admin',
    isLawyer: role === 'lawyer',
    isClient: role === 'client',
    isSupplier: role === 'supplier',
    isCustomer: role === 'customer'
  };
}