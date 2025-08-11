import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, TestTube } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

const NotificationTest = () => {
  const { showNotification, permission } = useNotifications();
  const { toast } = useToast();

  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      toast({
        title: "Permissão necessária",
        description: "Habilite as notificações primeiro nas configurações.",
        variant: "destructive"
      });
      return;
    }

    await showNotification({
      title: '🧪 Teste - Novo Agendamento!',
      body: 'Maria Silva - 15 de janeiro às 14:30',
      tag: 'test-notification',
      data: {
        appointmentId: 'test-123',
        clientName: 'Maria Silva',
        date: '15 de janeiro',
        time: '14:30',
        service: 'Corte de Cabelo'
      }
    });

    toast({
      title: "Notificação de teste enviada!",
      description: "Verifique se a notificação apareceu na sua tela."
    });
  };

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <TestTube className="w-4 h-4 text-blue-500" />
          Teste de Notificações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Use este botão para testar se as notificações estão funcionando corretamente.
        </p>
        <Button
          onClick={handleTestNotification}
          variant="outline"
          size="sm"
          className="w-full"
          disabled={permission !== 'granted'}
        >
          <Bell className="w-4 h-4 mr-2" />
          Enviar Notificação de Teste
        </Button>
        {permission !== 'granted' && (
          <p className="text-xs text-red-600 mt-2">
            Habilite as notificações primeiro para testar.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationTest;