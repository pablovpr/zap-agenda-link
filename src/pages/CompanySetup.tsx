import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Store, AlertCircle } from 'lucide-react';
import { fetchProfile, upsertProfile } from '@/services/profileService';
import { createDefaultSettings } from '@/services/companySettingsService';
import { useSubscription } from '@/hooks/useSubscription';

const CompanySetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const { subscriptionData, loading: subscriptionLoading, checkingPayment, isSubscribed, createCheckoutSession } = useSubscription();

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isLoading || subscriptionLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const cancelled = urlParams.get('cancelled');
    
    if (sessionId) {
      setShowPaymentSuccess(true);
      // Clean URL
      window.history.replaceState({}, '', '/company-setup');
    } else if (cancelled) {
      toast({
        title: "Pagamento cancelado",
        description: "O pagamento foi cancelado. Você pode tentar novamente.",
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, '', '/company-setup');
    }

    checkExistingProfile();
  }, [user, isLoading, subscriptionLoading, navigate]);

  // Redirect to main app if user has active subscription and complete profile
  useEffect(() => {
    if (isSubscribed && companyName.trim() && !showPaymentSuccess) {
      console.log('User has active subscription and complete profile, redirecting to main app');
      navigate('/', { replace: true });
    }
  }, [isSubscribed, companyName, showPaymentSuccess, navigate]);

  const checkExistingProfile = async () => {
    if (!user) return;

    try {
      setCheckingProfile(true);
      setError(null);
      
      const profile = await fetchProfile(user.id);
      
<<<<<<< HEAD
      // Pre-fill form if profile exists
=======
      if (profile?.company_name && profile.company_name.trim()) {
        navigate('/', { replace: true });
        return;
      }
      
      // Profile exists but incomplete, pre-fill form
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
      if (profile) {
        if (profile.company_name) setCompanyName(profile.company_name);
        if (profile.business_type) setBusinessType(profile.business_type);
      }
      
    } catch (error: any) {
      console.error('Error checking profile:', error);
      setError('Erro ao verificar perfil existente');
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!companyName.trim()) {
      toast({
        title: "Nome da empresa obrigatório",
        description: "Por favor, preencha o nome da empresa.",
        variant: "destructive",
      });
      return;
    }

    if (loading || checkingPayment) return;

    // If user already has active subscription, just save profile and redirect
    if (isSubscribed) {
      await saveProfileAndRedirect();
      return;
    }

    // Create checkout session for payment
    const checkoutUrl = await createCheckoutSession();
    if (checkoutUrl) {
      // Save profile data first
      try {
        setLoading(true);
        const profileData = {
          company_name: companyName.trim(),
          business_type: businessType.trim() || null,
        };
        await upsertProfile(user.id, profileData);
        console.log('Profile saved before payment redirect');
      } catch (error: any) {
        console.error('Error saving profile before payment:', error);
        toast({
          title: "Erro ao salvar dados",
          description: "Não foi possível salvar os dados da empresa.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      console.log('Redirecting to Stripe Checkout:', checkoutUrl);
      window.location.href = checkoutUrl;
    }
  };

  const saveProfileAndRedirect = async () => {
    try {
<<<<<<< HEAD
      setLoading(true);
=======
      
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
      const profileData = {
        company_name: companyName.trim(),
        business_type: businessType.trim() || null,
      };

<<<<<<< HEAD
      await upsertProfile(user.id, profileData);
      await createDefaultSettings(user.id, companyName.trim());
=======
      const profile = await upsertProfile(user.id, profileData);

      // Create default company settings (non-blocking)
      try {
        await createDefaultSettings(user.id, companyName.trim());
      } catch (settingsError: any) {
        console.error('Error creating default settings (non-blocking):', settingsError);
        toast({
          title: "Parcialmente configurado",
          description: "Empresa criada, mas algumas configurações serão definidas depois.",
          variant: "default",
        });
      }
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539

      toast({
        title: "Empresa configurada com sucesso!",
        description: "Redirecionando para o painel principal...",
      });

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);

    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erro ao configurar empresa",
        description: error.message || "Erro inesperado ao configurar empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || subscriptionLoading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando dados do usuário...</p>
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
              <Store className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Pagamento Realizado!</CardTitle>
            <p className="text-gray-600">Sua assinatura foi ativada com sucesso</p>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700">
              Obrigado por assinar nosso plano Premium! Sua conta está ativa e você já pode acessar todas as funcionalidades.
            </p>
            <Button 
              onClick={() => {
                setShowPaymentSuccess(false);
                if (companyName.trim()) {
                  navigate('/', { replace: true });
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Configure sua Empresa</CardTitle>
          <p className="text-gray-600">
            {isSubscribed 
              ? "Complete as informações da sua empresa" 
              : "Configure sua empresa e ative sua assinatura"
            }
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Erro na configuração</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {!isSubscribed && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Plano Premium - R$ 29,90/mês</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Agendamentos ilimitados</li>
                <li>• Página de agendamento personalizada</li>
                <li>• Relatórios e estatísticas</li>
                <li>• Suporte prioritário</li>
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa *</Label>
              <Input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Salão Beleza & Estilo"
                required
                disabled={loading || checkingPayment}
                maxLength={100}
                className={error ? 'border-red-300' : ''}
              />
              <p className="text-xs text-gray-500">
                Este nome aparecerá na sua página de agendamentos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type">Tipo de Negócio</Label>
              <Input
                id="business-type"
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Ex: Salão de Beleza, Barbearia, Clínica"
                disabled={loading || checkingPayment}
                maxLength={50}
              />
              <p className="text-xs text-gray-500">
                Opcional - ajuda a personalizar sua experiência
              </p>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading || checkingPayment || !companyName.trim()}
                size="lg"
              >
                {checkingPayment 
                  ? "Processando pagamento..." 
                  : isSubscribed 
                    ? (loading ? "Configurando..." : "Finalizar Configuração")
                    : "Continuar para Pagamento"
                }
              </Button>
            </div>

            {isSubscribed && (
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium">
                  ✓ Assinatura Premium Ativa
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Você poderá alterar essas informações depois nas configurações
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySetup;
