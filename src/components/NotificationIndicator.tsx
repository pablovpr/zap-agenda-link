import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const NotificationIndicator = () => {
  const { permission, isSupported, requestPermission, isLocallyEnabled } = useNotifications();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(permission === 'granted' && isLocallyEnabled);
  }, [permission, isLocallyEnabled]);

  const handleClick = async () => {
    if (!isSupported) return;
    
    if (permission !== 'granted') {
      await requestPermission();
    }
  };

  const getTooltipText = () => {
    if (!isSupported) return 'Notificações não suportadas neste navegador';
    if (permission === 'granted' && isLocallyEnabled) return 'Notificações ativas - Você receberá alertas de novos agendamentos';
    if (permission === 'granted' && !isLocallyEnabled) return 'Notificações desativadas - Vá em Configurações → Notificações para reativar';
    if (permission === 'denied') return 'Notificações bloqueadas - Clique para tentar habilitar';
    return 'Clique para habilitar notificações de novos agendamentos';
  };

  const getIcon = () => {
    if (!isSupported || permission === 'denied') {
      return <BellOff className="w-4 h-4 text-gray-400" />;
    }

    if (permission === 'granted' && !isLocallyEnabled) {
      return <BellOff className="w-4 h-4 text-orange-500" />;
    }
    
    return (
      <div className="relative">
        <Bell className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-600'}`} />
        {isActive && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className="p-2 hover:bg-gray-50 relative"
            disabled={!isSupported}
          >
            {getIcon()}
            {isActive && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-green-500 border-white"
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-48">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationIndicator;