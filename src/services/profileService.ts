
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  company_name?: string;
  business_type?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
<<<<<<< HEAD
=======
  
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar perfil:', error);
      }
      throw new Error(`Erro ao buscar perfil: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro no serviço fetchProfile:', error);
    }
    throw error;
  }
};

export const upsertProfile = async (userId: string, profileData: Partial<Profile>): Promise<Profile> => {
<<<<<<< HEAD
=======
  
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
  try {
    // Preparar dados para upsert
    const dataToUpsert = {
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    };

    // Usar upsert nativo do Supabase para evitar condições de corrida
    const { data, error } = await supabase
      .from('profiles')
      .upsert(dataToUpsert, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao salvar perfil:', error);
      }
      throw new Error(`Erro ao salvar perfil: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro no serviço upsertProfile:', error);
    }
    throw error;
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
<<<<<<< HEAD
=======
  
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
  return upsertProfile(userId, updates);
};

export const createProfile = async (userId: string, profileData: Partial<Profile>): Promise<Profile> => {
<<<<<<< HEAD
=======
  
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
  return upsertProfile(userId, profileData);
};
