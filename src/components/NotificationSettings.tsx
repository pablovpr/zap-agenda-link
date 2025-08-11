import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import NotificationTest from './NotificationTest';

const NotificationSettings = () => {
  const { toast } = useToast();
  const { 
    requestPermission, 
    isSupported, 
    permission, 
    showNotification,
    enableNotifications,
    disableNotifications,
    isLocallyEnabled
  } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(permission === 'granted' && isLocallyEnabled);
  }, [permission, isLocallyEnabled]);

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive"
      });
      return;
    }

    if (permission === 'denied') {
      toast({
        title: "Permissão negada",
        description: "As notificações foram bloqueadas. Você pode habilitá-las nas configurações do navegador.",
        variant: "destructive"
      });
      return;
    }

    if (permission === 'granted' && isLocallyEnabled) {
      toast({
        title: "Notificações já ativas",
        description: "Você já está recebendo notificações de novos agendamentos."
      });
      return;
    }

    // Se tem permissão mas está desabilitado localmente
    if (permission === 'granted' && !isLocallyEnabled) {
      enableNotifications();
      toast({
        title: "Notificações reativadas!",
        description: "Você voltará a receber notificações de novos agendamentos."
      });
      return;
    }

    // Solicitar permissão
    const granted = await requestPermission();
    
    if (granted) {
      enableNotifications();
      toast({
        title: "Notificações habilitadas!",
        description: "Você receberá notificações de novos agendamentos."
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Não foi possível habilitar as notificações.",
        variant: "destructive"
      });
    }
  };

  const handleDisableNotifications = () => {
    disableNotifications();
    toast({
      title: "Notificações desativadas",
      description: "Você não receberá mais notificações de novos agendamentos.",
      variant: "destructive"
    });
  };

  const handleTestNotification = async () => {
    await showNotification({
      title: '🧪 Teste de Notificação',
      body: 'João Silva - 15 de janeiro às 14:30',
      tag: 'test-notification'
    });

    toast({
      title: "Notificação de teste enviada",
      description: "Verifique se a notificação apareceu."
    });
  };

  const getStatusIcon = () => {
    if (!isSupported) return <BellOff className="w-5 h-5 text-gray-400" />;
    if (permission === 'granted') return <Check className="w-5 h-5 text-green-500" />;
    if (permission === 'denied') return <X className="w-5 h-5 text-red-500" />;
    return <Bell className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!isSupported) return 'Não suportado';
    if (permission === 'granted' && isLocallyEnabled) return 'Ativas';
    if (permission === 'granted' && !isLocallyEnabled) return 'Desativadas';
    if (permission === 'denied') return 'Bloqueadas';
    return 'Não configuradas';
  };

  const getStatusColor = () => {
    if (!isSupported) return 'text-gray-500';
    if (permission === 'granted' && isLocallyEnabled) return 'text-green-600';
    if (permission === 'granted' && !isLocallyEnabled) return 'text-orange-600';
    if (permission === 'denied') return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-whatsapp-green" />
          Notificações Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              Notificações de novos agendamentos
            </Label>
            <p className="text-xs text-gray-500">
              Receba notificações em tempo real quando um cliente fizer um agendamento
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {notificationsEnabled ? (
            <>
              <Button
                onClick={handleDisableNotifications}
                variant="destructive"
                className="flex-1"
              >
                <BellOff className="w-4 h-4 mr-2" />
                Desativar Notificações
              </Button>
              <Button
                onClick={handleTestNotification}
                variant="outline"
                size="sm"
              >
                Testar
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEnableNotifications}
              disabled={!isSupported}
              className="flex-1"
            >
              <Bell className="w-4 h-4 mr-2" />
              Habilitar Notificações
            </Button>
          )}
        </div>

        {!isSupported && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Navegador não suportado:</strong> Seu navegador não suporta notificações push. 
              Considere usar Chrome, Firefox ou Safari para receber notificações.
            </p>
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Notificações bloqueadas:</strong> Para habilitar, clique no ícone de cadeado 
              na barra de endereços e permita notificações para este site.
            </p>
          </div>
        )}

        {permission === 'granted' && !isLocallyEnabled && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Notificações desativadas:</strong> Você tem permissão para receber notificações, 
              mas elas estão desativadas. Clique em "Habilitar Notificações" para reativá-las.
            </p>
          </div>
        )}

        {notificationsEnabled && (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Notificações ativas!</strong> Você receberá uma notificação sempre que 
                um cliente fizer um novo agendamento.
              </p>
            </div>
            
            <NotificationTest />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;