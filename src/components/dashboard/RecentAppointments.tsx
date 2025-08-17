
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  client_name: string;
  client_phone: string;
  service_name: string;
}

interface RecentAppointmentsProps {
  appointments: RecentAppointment[];
}

const RecentAppointments = ({ appointments }: RecentAppointmentsProps) => {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Agendamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Nenhum agendamento recente
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Agendamentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id}
              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="space-y-2">
                {/* Primeira linha: Nome + Data + Horário */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate text-sm">{appointment.client_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {format(new Date(appointment.appointment_date), 'dd/MM', { locale: ptBR })} às {appointment.appointment_time.substring(0, 5)}
                    </span>
                  </div>
                </div>
                
                {/* Segunda linha: Tipo de serviço */}
                <div className="ml-6">
                  <span className="text-xs text-gray-600">{appointment.service_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAppointments;
