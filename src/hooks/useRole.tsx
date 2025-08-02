import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'lawyer' | 'client' | 'supplier';

interface UserRoleData {
  role: UserRole | null;
  loading: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isLawyer: boolean;
  isClient: boolean;
  isSupplier: boolean;
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
    try {
      setLoading(true);
      
      // First try to get role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (profile?.role) {
        setRole(profile.role as UserRole);
        return;
      }

      // If no profile role, check user_roles table
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (userRole?.role) {
        setRole(userRole.role as UserRole);
      } else {
        // Default role
        setRole('client');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('client'); // Default fallback
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
    isSupplier: role === 'supplier'
  };
}