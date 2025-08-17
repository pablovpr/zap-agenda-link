
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User } from 'lucide-react';
import AppointmentActions from './AppointmentActions';

interface MonthlyAppointment {
  id: string;
  appointment_time: string;
  appointment_date: string;
  status: string;
  duration: number;
  notes?: string;
  client_name: string;
  client_phone: string;
  service_name: string;
}

interface AppointmentCardProps {
  appointment: MonthlyAppointment;
  index: number;
  totalAppointments: number;
  onWhatsAppClick: (phone: string, clientName: string, appointmentDate?: string, appointmentTime?: string) => void;
  onCancelClick: (phone: string, clientName: string) => void;
  onRescheduleClick: (phone: string, clientName: string) => void;
  onDeleteClick: () => void;
  onRefresh: () => void;
}

const AppointmentCard = ({
  appointment,
  index,
  totalAppointments,
  onWhatsAppClick,
  onCancelClick,
  onRescheduleClick,
  onDeleteClick,
  onRefresh
}: AppointmentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors">
        <div className="space-y-2">
          {/* Primeira linha: Horário + Nome do cliente */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{appointment.appointment_time.substring(0, 5)}</span>
            </div>
            
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium text-gray-800 truncate text-sm">{appointment.client_name}</span>
            </div>
          </div>
          
          {/* Segunda linha: Tipo de serviço + Ícones de ação */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-gray-600 truncate">{appointment.service_name}</span>
              {appointment.status === 'completed' && (
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                  Concluído
                </Badge>
              )}
            </div>
            
            <AppointmentActions
              appointment={appointment}
              onWhatsAppClick={onWhatsAppClick}
              onCancelClick={onCancelClick}
              onRescheduleClick={onRescheduleClick}
              onDeleteClick={onDeleteClick}
              onRefresh={onRefresh}
            />
          </div>
        </div>
      </div>
      
      {index < totalAppointments - 1 && (
        <Separator className="my-1" />
      )}
    </div>
  );
};

export default AppointmentCard;
