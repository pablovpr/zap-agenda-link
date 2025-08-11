# Plano de Implementação - Sistema de Pagamento Recorrente

## 🎯 Objetivo
Implementar um sistema completo de pagamento recorrente com Stripe para o ZapAgenda, incluindo múltiplos planos, controle de limites e gestão de assinaturas.

## 📋 Checklist de Implementação

### Fase 1: Estrutura Base (Crítica - 3-5 dias)

#### ✅ 1.1 Criação das Tabelas do Banco
```sql
-- Tabela de assinantes
CREATE TABLE public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN DEFAULT false,
  subscription_tier TEXT,
  subscription_status TEXT, -- active, canceled, past_due, etc.
  subscription_id TEXT, -- Stripe subscription ID
  subscription_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stripe_price_id TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  trial_days INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE public.payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subscriber_id UUID REFERENCES public.subscribers(id),
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL, -- succeeded, failed, pending
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de uso/limites
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  resource_type TEXT NOT NULL, -- appointments, clients, services, etc.
  count INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_type, period_start)
);
```

#### ✅ 1.2 Inserir Planos Padrão
```sql
INSERT INTO public.subscription_plans (name, description, stripe_price_id, price_monthly, price_yearly, features, limits, trial_days) VALUES
('Gratuito', 'Plano básico para começar', 'free', 0.00, 0.00, 
 '{"basic_features": true, "email_support": true}',
 '{"appointments_per_month": 10, "clients": 50, "services": 3, "professionals": 1}',
 0),
('Premium', 'Plano completo para profissionais', 'price_1RuPSSAGs1NuWqcoIbRfCPzV', 29.90, 299.00,
 '{"unlimited_appointments": true, "custom_themes": true, "reports": true, "priority_support": true, "whatsapp_integration": true}',
 '{"appointments_per_month": -1, "clients": -1, "services": -1, "professionals": -1}',
 7),
('Enterprise', 'Para empresas com múltiplas unidades', 'price_enterprise', 99.90, 999.00,
 '{"multi_location": true, "api_access": true, "custom_integrations": true, "dedicated_support": true}',
 '{"appointments_per_month": -1, "clients": -1, "services": -1, "professionals": -1, "locations": 10}',
 14);
```

#### ✅ 1.3 Políticas RLS
```sql
-- RLS para subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" ON public.subscribers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription" ON public.subscribers FOR UPDATE USING (auth.uid() = user_id);

-- RLS para usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own usage" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);

-- Planos são públicos (todos podem ver)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are publicly readable" ON public.subscription_plans FOR SELECT USING (active = true);

-- Transações são privadas
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);
```

### Fase 2: Edge Functions (Crítica - 2-3 dias)

#### ✅ 2.1 Corrigir check-subscription
```typescript
// supabase/functions/check-subscription/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  // Implementação completa com:
  // - Verificação de assinatura no Stripe
  // - Atualização da tabela subscribers
  // - Cache de 5 minutos
  // - Logs detalhados
  // - Tratamento de erros robusto
});
```

#### ✅ 2.2 Melhorar create-checkout
```typescript
// supabase/functions/create-checkout/index.ts
// Adicionar:
// - Suporte a múltiplos planos
// - Períodos anuais/mensais
// - Metadata completa
// - Cupons de desconto
// - Trial periods
```

#### ✅ 2.3 Corrigir stripe-webhook
```typescript
// supabase/functions/stripe-webhook/index.ts
// Processar eventos:
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
// - customer.subscription.trial_will_end
```

#### ✅ 2.4 Nova função: get-usage
```typescript
// supabase/functions/get-usage/index.ts
// Retornar uso atual vs limites do plano
```

### Fase 3: Frontend - Hooks e Serviços (2-3 dias)

#### ✅ 3.1 Hook useSubscription Atualizado
```typescript
// src/hooks/useSubscription.ts
export const useSubscription = () => {
  // Remover simulação
  // Implementar verificação real
  // Cache inteligente
  // Estados de loading otimizados
  
  return {
    subscription,
    loading,
    isSubscribed,
    plan,
    usage,
    checkSubscription,
    createCheckoutSession,
    cancelSubscription,
    updatePaymentMethod
  };
};
```

#### ✅ 3.2 Novo Hook usePlans
```typescript
// src/hooks/usePlans.ts
export const usePlans = () => {
  // Buscar planos disponíveis
  // Cache de planos
  // Comparação de features
  
  return {
    plans,
    loading,
    currentPlan,
    canUpgrade,
    canDowngrade
  };
};
```

#### ✅ 3.3 Novo Hook useUsageLimit
```typescript
// src/hooks/useUsageLimit.ts
export const useUsageLimit = (resource: string) => {
  // Verificar se pode criar novo recurso
  // Alertas de limite próximo
  // Sugestões de upgrade
  
  return {
    canCreate,
    usage,
    limit,
    percentage,
    nearLimit,
    exceeded
  };
};
```

#### ✅ 3.4 Serviço de Pagamento
```typescript
// src/services/paymentService.ts
export const paymentService = {
  getSubscription,
  createCheckout,
  cancelSubscription,
  updatePaymentMethod,
  getInvoices,
  downloadInvoice
};
```

### Fase 4: Componentes de UI (3-4 dias)

#### ✅ 4.1 PlanSelector Component
```typescript
// src/components/billing/PlanSelector.tsx
// - Comparação visual de planos
// - Destaque do plano atual
// - Botões de upgrade/downgrade
// - Indicação de economia anual
```

#### ✅ 4.2 BillingDashboard Component
```typescript
// src/components/billing/BillingDashboard.tsx
// - Status da assinatura
// - Próxima cobrança
// - Histórico de pagamentos
// - Gerenciar método de pagamento
```

#### ✅ 4.3 UsageIndicator Component
```typescript
// src/components/billing/UsageIndicator.tsx
// - Barras de progresso por recurso
// - Alertas visuais
// - Links para upgrade
```

#### ✅ 4.4 PaymentMethod Component
```typescript
// src/components/billing/PaymentMethod.tsx
// - Stripe Elements integration
// - Cartões salvos
// - Adicionar/remover métodos
```

### Fase 5: Middleware de Controle (2 dias)

#### ✅ 5.1 Middleware de Verificação
```typescript
// src/middleware/subscriptionMiddleware.ts
export const checkSubscriptionLimit = async (
  resource: string,
  action: 'create' | 'update' | 'delete'
) => {
  // Verificar limites antes de ações
  // Bloquear se excedido
  // Sugerir upgrade
};
```

#### ✅ 5.2 HOC para Proteção
```typescript
// src/components/SubscriptionProtected.tsx
export const SubscriptionProtected = ({ 
  feature, 
  fallback, 
  children 
}) => {
  // Verificar se feature está disponível no plano
  // Mostrar fallback se não disponível
};
```

### Fase 6: Páginas e Fluxos (2-3 dias)

#### ✅ 6.1 Página de Billing
```typescript
// src/pages/Billing.tsx
// - Dashboard completo de cobrança
// - Gerenciamento de assinatura
// - Histórico de pagamentos
```

#### ✅ 6.2 Página de Upgrade
```typescript
// src/pages/Upgrade.tsx
// - Seleção de planos
// - Comparação de features
// - Processo de upgrade
```

#### ✅ 6.3 Atualizar Checkout
```typescript
// src/pages/Checkout.tsx
// - Seleção de plano
// - Período (mensal/anual)
// - Aplicação de cupons
// - Trial information
```

### Fase 7: Integrações e Melhorias (3-4 dias)

#### ✅ 7.1 Stripe Customer Portal
```typescript
// Integração com Stripe Customer Portal
// Permite usuários gerenciarem próprias assinaturas
```

#### ✅ 7.2 Email Notifications
```typescript
// Emails automáticos para:
// - Bem-vindo
// - Pagamento bem-sucedido
// - Pagamento falhado
// - Trial expirando
// - Assinatura cancelada
```

#### ✅ 7.3 Analytics e Métricas
```typescript
// Dashboard admin com:
// - MRR (Monthly Recurring Revenue)
// - Churn rate
// - Conversion rate
// - LTV (Lifetime Value)
```

## 🔧 Configurações Necessárias

### Variáveis de Ambiente
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Features
ENABLE_TRIAL=true
DEFAULT_TRIAL_DAYS=7
ENABLE_ANNUAL_DISCOUNT=true
ANNUAL_DISCOUNT_PERCENT=20
```

### Stripe Dashboard
1. Configurar produtos e preços
2. Configurar webhooks
3. Configurar Customer Portal
4. Configurar emails automáticos

## 📊 Métricas de Sucesso

### KPIs Principais
- **Conversion Rate**: Trial → Paid > 15%
- **Churn Rate**: < 5% mensal
- **MRR Growth**: > 20% mensal
- **Customer LTV**: > R$ 500

### Métricas Técnicas
- **Webhook Success Rate**: > 99%
- **Payment Success Rate**: > 95%
- **API Response Time**: < 500ms
- **Uptime**: > 99.9%

## 🚨 Riscos e Mitigações

### Riscos Identificados
1. **Webhook Failures**: Implementar retry logic
2. **Payment Failures**: Dunning management
3. **Data Inconsistency**: Reconciliation jobs
4. **Security**: PCI compliance

### Plano de Contingência
1. **Rollback Plan**: Manter simulação como fallback
2. **Monitoring**: Alertas em tempo real
3. **Support**: Processo para resolver problemas de cobrança

## 📅 Timeline Estimado

| Fase | Duração | Dependências |
|------|---------|--------------|
| Fase 1 | 3-5 dias | - |
| Fase 2 | 2-3 dias | Fase 1 |
| Fase 3 | 2-3 dias | Fase 2 |
| Fase 4 | 3-4 dias | Fase 3 |
| Fase 5 | 2 dias | Fase 3 |
| Fase 6 | 2-3 dias | Fase 4, 5 |
| Fase 7 | 3-4 dias | Todas anteriores |

**Total Estimado**: 17-25 dias úteis (3-5 semanas)

## 🎯 Próximos Passos Imediatos

1. **Criar tabelas do banco** (Fase 1.1)
2. **Inserir planos padrão** (Fase 1.2)
3. **Configurar RLS** (Fase 1.3)
4. **Corrigir check-subscription** (Fase 2.1)
5. **Testar fluxo básico**

Quer que eu comece implementando alguma fase específica?