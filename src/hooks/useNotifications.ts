import { useEffect, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [isLocallyEnabled, setIsLocallyEnabled] = useState(() => {
    // Verificar se as notificações estão habilitadas localmente
    const stored = localStorage.getItem('zapagenda-notifications-enabled');
    return stored !== 'false'; // Por padrão, habilitado
  });

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notificações foram negadas pelo usuário');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Habilitar notificações localmente
  const enableNotifications = useCallback(() => {
    setIsLocallyEnabled(true);
    localStorage.setItem('zapagenda-notifications-enabled', 'true');
  }, []);

  // Desabilitar notificações localmente
  const disableNotifications = useCallback(() => {
    setIsLocallyEnabled(false);
    localStorage.setItem('zapagenda-notifications-enabled', 'false');
  }, []);

  // Mostrar notificação
  const showNotification = useCallback(async (data: NotificationData) => {
    // Verificar se as notificações estão habilitadas localmente
    if (!isLocallyEnabled) {
      console.log('Notificações desabilitadas localmente');
      return;
    }

    const hasPermission = await requestPermission();
    
    if (!hasPermission) {
      console.warn('Sem permissão para mostrar notificações');
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        tag: data.tag || 'zapagenda-notification',
        badge: '/icon-192x192.png',
        requireInteraction: true,
        data: data.data
      });

      // Auto-fechar após 10 segundos se não interagir
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Focar na aba quando clicar na notificação
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
    }
  }, [requestPermission, isLocallyEnabled]);

  // Escutar novos agendamentos em tempo real
  useEffect(() => {
    if (!user || !isLocallyEnabled) return;

    console.log('🔔 Iniciando escuta de notificações para empresa:', user.id);

    const channel = supabase
      .channel('appointments-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `company_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🎉 Novo agendamento detectado:', payload);
          
          try {
            // Buscar dados completos do agendamento
            const { data: appointmentData, error } = await supabase
              .from('appointments')
              .select(`
                *,
                services (name),
                clients (name, phone)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error || !appointmentData) {
              console.error('Erro ao buscar dados do agendamento:', error);
              return;
            }

            // Formatar data e hora
            const appointmentDate = new Date(appointmentData.appointment_date + 'T00:00:00');
            const formattedDate = format(appointmentDate, "dd 'de' MMMM", { locale: ptBR });
            const formattedTime = appointmentData.appointment_time.substring(0, 5);

            // Mostrar notificação
            console.log('📱 Enviando notificação:', {
              cliente: appointmentData.clients?.name,
              data: formattedDate,
              hora: formattedTime
            });

            await showNotification({
              title: '🎉 Novo Agendamento!',
              body: `${appointmentData.clients?.name || 'Cliente'} - ${formattedDate} às ${formattedTime}`,
              tag: `appointment-${appointmentData.id}`,
              data: {
                appointmentId: appointmentData.id,
                clientName: appointmentData.clients?.name,
                date: formattedDate,
                time: formattedTime,
                service: appointmentData.services?.name
              }
            });

            // Tocar som de notificação (opcional)
            try {
              const audio = new Audio('/notification-sound.mp3');
              audio.volume = 0.3;
              audio.play().catch(() => {
                // Ignorar erro se não conseguir tocar o som
              });
            } catch (error) {
              // Ignorar erro de áudio
            }

          } catch (error) {
            console.error('Erro ao processar notificação de agendamento:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showNotification, isLocallyEnabled]);

  // Inicializar permissões quando o hook for usado
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    showNotification,
    requestPermission,
    enableNotifications,
    disableNotifications,
    isLocallyEnabled,
    isSupported: 'Notification' in window,
    permission: typeof window !== 'undefined' ? Notification.permission : 'default'
  };
};