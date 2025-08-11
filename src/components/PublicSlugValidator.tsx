import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PublicBooking from '@/pages/PublicBooking';
import LoadingScreen from '@/components/LoadingScreen';

/**
 * Componente que valida se um slug existe antes de renderizar a página pública
 * Evita que URLs aleatórias sejam interpretadas como slugs válidos
 */
const PublicSlugValidator = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const [isValidSlug, setIsValidSlug] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSlug = async () => {
      if (!companySlug) {
        setIsValidSlug(false);
        setLoading(false);
        return;
      }

      try {
        // Verificar se o slug existe e a empresa está ativa
        const { data, error } = await supabase
          .from('company_settings')
          .select('slug')
          .eq('slug', companySlug)
          .eq('status_aberto', true)
          .maybeSingle();

        if (error) {
          console.error('Erro ao validar slug:', error);
          setIsValidSlug(false);
        } else {
          setIsValidSlug(!!data);
        }
      } catch (error) {
        console.error('Erro ao validar slug:', error);
        setIsValidSlug(false);
      } finally {
        setLoading(false);
      }
    };

    validateSlug();
  }, [companySlug]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isValidSlug) {
    // Redirecionar para 404 se o slug não for válido
    return <Navigate to="/404" replace />;
  }

  // Se o slug é válido, renderizar a página pública
  return <PublicBooking />;
};

export default PublicSlugValidator;