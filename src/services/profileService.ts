
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
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ fetchProfile: Erro:', error);
      throw new Error(`Erro ao buscar perfil: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('❌ fetchProfile: Erro no serviço:', error);
    throw error;
  }
};

export const upsertProfile = async (userId: string, profileData: Partial<Profile>): Promise<Profile> => {
  
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
      console.error('❌ upsertProfile: Erro ao salvar:', error);
      throw new Error(`Erro ao salvar perfil: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('❌ upsertProfile: Erro no serviço:', error);
    throw error;
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  
  return upsertProfile(userId, updates);
};

export const createProfile = async (userId: string, profileData: Partial<Profile>): Promise<Profile> => {
  
  return upsertProfile(userId, profileData);
};
