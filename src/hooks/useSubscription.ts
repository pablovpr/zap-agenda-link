
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
      console.log('Checking subscription status for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        throw error;
      }

      console.log('Subscription data received:', data);
      setSubscriptionData(data);
      
    } catch (error: any) {
      console.error('Error in checkSubscription:', error);
      toast({
        title: "Erro ao verificar assinatura",
        description: "Não foi possível verificar o status da assinatura.",
        variant: "destructive",
      });
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
      console.log('Creating checkout session for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error('Error creating checkout session:', error);
        throw error;
      }

      console.log('Checkout session created:', data);
      return data.url;
      
    } catch (error: any) {
      console.error('Error in createCheckoutSession:', error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível criar a sessão de pagamento.",
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
