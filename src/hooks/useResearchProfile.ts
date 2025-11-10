import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface ResearchProfile {
  id: string;
  institution_type: string;
  research_areas: string[];
  position_title: string;
  department: string;
  supervisor_name?: string;
  supervisor_email?: string;
  years_experience?: number;
  education_level: string;
  specializations: string[];
  publications_count: number;
  orcid_id?: string;
  research_interests?: string;
  current_projects?: string;
  funding_sources: string[];
  ethics_training_completed: boolean;
  ethics_training_date?: string;
  safety_training_completed: boolean;
  safety_training_date?: string;
  institutional_approval: boolean;
  approval_document_url?: string;
  verification_status: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export const useResearchProfile = () => {
  const [profile, setProfile] = useState<ResearchProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('research_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<ResearchProfile>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating profile with data:', { id: user.id, ...profileData });

      const { data, error } = await supabase
        .from('research_profiles')
        .insert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to create research profile');
      }

      setProfile(data);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create research profile';
      setError(errorMsg);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<ResearchProfile>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('research_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Profile not found. Please complete your research profile first.');

      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update research profile');
      throw err;
    }
  };

  const uploadApprovalDocument = async (file: File) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/approval_document.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('research_documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      await updateProfile({ approval_document_url: fileName });

      return fileName;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    uploadApprovalDocument,
    refetch: fetchProfile
  };
};