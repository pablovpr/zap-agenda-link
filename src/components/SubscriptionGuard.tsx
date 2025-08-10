
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { subscriptionData, loading: subscriptionLoading, isSubscribed, createCheckoutSession } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Allow access to auth, company-setup pages and public booking pages
  const isPublicRoute = location.pathname.startsWith('/auth') || 
                       location.pathname.startsWith('/company-setup') ||
                       location.pathname.startsWith('/b/') ||
                       location.pathname === '/';

  useEffect(() => {
    if (authLoading || subscriptionLoading) return;

    // Redirect unauthenticated users to auth page
    if (!user && !isPublicRoute) {
      navigate('/auth');
      return;
    }

    // If user is authenticated but on root path, decide where to redirect
    if (user && location.pathname === '/') {
      if (!isSubscribed) {
        navigate('/company-setup');
      }
      // If subscribed, stay on root (will show main app)
    }
  }, [user, isSubscribed, authLoading, subscriptionLoading, navigate, location.pathname, isPublicRoute]);

  const handleSubscribe = async () => {
    setCheckingPayment(true);
    const checkoutUrl = await createCheckoutSession();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
    setCheckingPayment(false);
  };

  // Show loading state
  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Allow public routes
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show subscription required page for authenticated users without subscription
  if (user && !isSubscribed && !subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Assinatura Necessária</CardTitle>
            <p className="text-gray-600">Você precisa de uma assinatura ativa para acessar a plataforma</p>
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
              onClick={() => navigate('/company-setup')}
              className="w-full"
            >
              Voltar para Configuração
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show main app for subscribed users
  return <>{children}</>;
};

export default SubscriptionGuard;
