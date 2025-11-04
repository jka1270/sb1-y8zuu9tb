import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserRole {
  role: 'customer' | 'admin' | 'super_admin';
  is_admin: boolean;
}

export function useUserRole() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        setUserRole(data);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  return {
    userRole,
    loading,
    isAdmin: userRole?.is_admin || false,
    isSuperAdmin: userRole?.role === 'super_admin',
  };
}
