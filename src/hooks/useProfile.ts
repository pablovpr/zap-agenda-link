import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchProfile } from '@/services/profileService';

interface ProfileData {
  company_name?: string;
  business_type?: string;
}

let profileCache: { [userId: string]: ProfileData | null } = {};
let profilePromises: { [userId: string]: Promise<ProfileData | null> } = {};

export const useProfile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (profileCache[user.id] !== undefined) {
          setProfile(profileCache[user.id]);
          setLoading(false);
          return;
        }

        // Check if there's already a promise for this user
        if (profilePromises[user.id]) {
          const cachedProfile = await profilePromises[user.id];
          setProfile(cachedProfile);
          setLoading(false);
          return;
        }

        // Create new promise and cache it
        profilePromises[user.id] = fetchProfile(user.id);
        const profileData = await profilePromises[user.id];
        
        // Cache the result
        profileCache[user.id] = profileData;
        setProfile(profileData);
        
        // Clean up promise
        delete profilePromises[user.id];
        
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Erro ao carregar perfil');
        profileCache[user.id] = null;
        delete profilePromises[user.id];
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authLoading]);

  const isProfileComplete = !!(profile && profile.company_name);

  const clearCache = () => {
    if (user) {
      delete profileCache[user.id];
      delete profilePromises[user.id];
    }
  };

  return {
    profile,
    loading: loading || authLoading,
    error,
    isProfileComplete,
    clearCache
  };
};