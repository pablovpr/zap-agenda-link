
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const useSubscription = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const checkSubscription = async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      
      // Temporariamente simular assinatura ativa para todos os usuários
      // TODO: Implementar verificação real quando o sistema de pagamento estiver configurado
      
      const mockSubscriptionData = {
        subscribed: true,
        subscription_tier: 'premium',
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      };

      setSubscriptionData(mockSubscriptionData);
      
    } catch (error: any) {
      console.error('Error in checkSubscription:', error);
      // Em caso de erro, ainda simular assinatura ativa
      setSubscriptionData({ subscribed: true });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setCheckingPayment(true);
      
      // Temporariamente simular sucesso no checkout
      // TODO: Implementar integração real com Stripe
      console.log('Simulating checkout success for user:', user.id);
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ativar assinatura imediatamente
      const mockSubscriptionData = {
        subscribed: true,
        subscription_tier: 'premium',
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setSubscriptionData(mockSubscriptionData);
      
      toast({
        title: "Assinatura ativada!",
        description: "Sua assinatura Premium foi ativada com sucesso.",
      });
      
      return null; // Não redirecionar para Stripe
      
    } catch (error: any) {
      console.error('Error in createCheckoutSession:', error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar o pagamento.",
        variant: "destructive",
      });
      return null;
    } finally {
      setCheckingPayment(false);
    }
  };

  // Check subscription on auth changes
  useEffect(() => {
    if (user && !authLoading) {
      checkSubscription();
    }
  }, [user, authLoading]);

  // Check for payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId && user) {
      console.log('Payment success detected, checking subscription');
      setTimeout(() => {
        checkSubscription();
      }, 2000); // Wait a bit for webhook processing
    }
  }, [user]);

  return {
    subscriptionData,
    loading: loading || authLoading,
    checkingPayment,
    isSubscribed: subscriptionData?.subscribed || false,
    checkSubscription,
    createCheckoutSession
  };
};
