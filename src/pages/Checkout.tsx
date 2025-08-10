import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const { subscriptionData, loading: subscriptionLoading, checkingPayment, isSubscribed, createCheckoutSession } = useSubscription();

  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isLoading || subscriptionLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const cancelled = urlParams.get('cancelled');
    
    if (sessionId) {
      setShowPaymentSuccess(true);
      // Clean URL
      window.history.replaceState({}, '', '/checkout');
    } else if (cancelled) {
      toast({
        title: "Pagamento cancelado",
        description: "O pagamento foi cancelado. Você pode tentar novamente.",
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, '', '/checkout');
    }

    // If user already has active subscription, redirect to dashboard
    if (isSubscribed && !showPaymentSuccess) {
      navigate('/dashboard');
    }
  }, [user, isLoading, subscriptionLoading, isSubscribed, navigate, showPaymentSuccess]);

  const handleSubscribe = async () => {
    const checkoutUrl = await createCheckoutSession();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      // Se não há URL (simulação), aguardar um pouco e redirecionar
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  if (isLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Show payment success message
  if (showPaymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Pagamento Realizado!</CardTitle>
            <p className="text-gray-600">Sua assinatura foi ativada com sucesso</p>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700">
              Obrigado por assinar nosso plano Premium! Sua conta está ativa e você já pode acessar todas as funcionalidades.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Acessar Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show subscription required page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-600">Assinatura Premium</CardTitle>
          <p className="text-gray-600">Ative sua assinatura para continuar</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Plano Premium - R$ 29,90/mês
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Agendamentos ilimitados</li>
              <li>• Página de agendamento personalizada</li>
              <li>• Relatórios e estatísticas</li>
              <li>• Suporte prioritário</li>
            </ul>
          </div>

          <Button 
            onClick={handleSubscribe}
            disabled={checkingPayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {checkingPayment ? "Processando..." : "Assinar Agora"}
          </Button>

          <Button 
            variant="outline"
            onClick={() => navigate('/onboarding')}
            className="w-full"
          >
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;