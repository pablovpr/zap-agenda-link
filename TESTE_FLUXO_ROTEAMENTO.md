# Teste do Fluxo de Roteamento

## Cenários de Teste

### 1. Usuário Novo (Não Logado)
**Ação**: Acessar `/`
**Resultado Esperado**: Redirecionamento para `/login`
**Status**: ✅ Implementado

**Ação**: Acessar `/signup`
**Resultado Esperado**: Mostrar formulário de cadastro
**Status**: ✅ Implementado

**Ação**: Criar conta
**Resultado Esperado**: Mostrar mensagem de confirmação de email
**Status**: ✅ Implementado

### 2. Usuário com Email Confirmado
**Ação**: Clicar no link do email
**Resultado Esperado**: Redirecionamento para `/onboarding`
**Status**: ✅ Implementado

**Ação**: Preencher dados da empresa
**Resultado Esperado**: Redirecionamento para `/checkout`
**Status**: ✅ Implementado

### 3. Usuário no Checkout
**Ação**: Clicar em "Assinar Agora"
**Resultado Esperado**: Redirecionamento para Stripe
**Status**: ✅ Implementado

**Ação**: Completar pagamento
**Resultado Esperado**: Retorno para `/checkout` com mensagem de sucesso
**Status**: ✅ Implementado

**Ação**: Clicar em "Acessar Dashboard"
**Resultado Esperado**: Redirecionamento para `/dashboard`
**Status**: ✅ Implementado

### 4. Usuário Completo (Logado + Onboarding + Assinatura)
**Ação**: Acessar `/`
**Resultado Esperado**: Redirecionamento para `/dashboard`
**Status**: ✅ Implementado

**Ação**: Tentar acessar `/login`
**Resultado Esperado**: Redirecionamento para `/dashboard`
**Status**: ✅ Implementado

### 5. Usuário Logado Sem Onboarding
**Ação**: Acessar `/`
**Resultado Esperado**: Redirecionamento para `/onboarding`
**Status**: ✅ Implementado

**Ação**: Tentar acessar `/dashboard`
**Resultado Esperado**: Redirecionamento para `/onboarding`
**Status**: ✅ Implementado

### 6. Usuário Logado Sem Assinatura
**Ação**: Acessar `/`
**Resultado Esperado**: Redirecionamento para `/checkout`
**Status**: ✅ Implementado

**Ação**: Tentar acessar `/dashboard`
**Resultado Esperado**: Redirecionamento para `/checkout`
**Status**: ✅ Implementado

### 7. Rotas Públicas
**Ação**: Acessar `/b/empresa-teste`
**Resultado Esperado**: Mostrar página de agendamento público
**Status**: ✅ Implementado

### 8. Rotas Legadas
**Ação**: Acessar `/auth`
**Resultado Esperado**: Redirecionamento para `/login`
**Status**: ✅ Implementado

**Ação**: Acessar `/company-setup`
**Resultado Esperado**: Redirecionamento para `/onboarding`
**Status**: ✅ Implementado

## Comandos para Testar

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Testar build de produção
npm run build
npm run preview
```

## Pontos de Verificação

1. **Estados de Loading**: Verificar se não há "flash" de conteúdo
2. **Redirecionamentos**: Confirmar que seguem a lógica correta
3. **Persistência**: Sessão mantida após refresh da página
4. **Tratamento de Erros**: Mensagens apropriadas para cada erro
5. **Responsividade**: Interface funciona em mobile e desktop

## Logs para Monitorar

- Console do navegador para erros de JavaScript
- Network tab para requisições de API
- Application tab para verificar tokens de sessão
- Supabase dashboard para logs de autenticação