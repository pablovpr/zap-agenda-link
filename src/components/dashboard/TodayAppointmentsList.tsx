import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CheckCircle, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppointmentActions } from '@/hooks/useAppointmentActions';
import { useToast } from '@/hooks/use-toast';
import { getNowInBrazil } from '@/utils/timezone';
import { usePagination } from '@/hooks/usePagination';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink 
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface TodayAppointment {
  id: string;
  appointment_time: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  status: string;
}
interface TodayAppointmentsListProps {
  appointments: TodayAppointment[];
  loading?: boolean;
  onRefresh?: () => void;
}
const TodayAppointmentsList = ({
  appointments,
  loading,
  onRefresh
}: TodayAppointmentsListProps) => {
  const {
    completeAppointment,
    deleteAppointment,
    isUpdating,
    isDeleting
  } = useAppointmentActions();
  const {
    toast
  } = useToast();
  const handleCompleteAppointment = async (appointmentId: string, clientName: string) => {
    try {
      await completeAppointment(appointmentId, clientName, () => {
        // Forçar atualização imediata dos dados
        if (onRefresh) {
          onRefresh();
        }
        // Também disparar evento customizado para atualizar receita
        window.dispatchEvent(new CustomEvent('appointmentCompleted'));
      });
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string, clientName: string, clientPhone: string) => {
    if (!confirm(`Tem certeza que deseja excluir o agendamento de ${clientName}?`)) return;
    
    try {
      await deleteAppointment(appointmentId, clientPhone, clientName, () => {
        if (onRefresh) {
          onRefresh();
        }
      });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
    }
  };
  const handleWhatsAppClick = (phone: string, clientName: string, appointmentTime: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const today = getNowInBrazil();
    const todayFormatted = format(today, "dd 'de' MMMM", {
      locale: ptBR
    });
    const message = `Olá, ${clientName}! 👋\n\n` + `🔔 *LEMBRETE DO SEU AGENDAMENTO*\n\n` + `📅 *Data:* Hoje, ${todayFormatted}\n` + `⏰ *Horário:* ${appointmentTime.substring(0, 5)}\n\n` + `Estamos esperando por você! ✨\n\n` + `Se precisar de alguma coisa, estamos à disposição! 😊`;
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Hooks devem ser chamados sempre - mesmo quando loading ou sem dados
  const sortedAppointments = appointments.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex
  } = usePagination({
    data: sortedAppointments,
    itemsPerPage: 5
  });
  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Carregando agendamentos...
          </div>
        </CardContent>
      </Card>;
  }
  if (appointments.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Nenhum agendamento para hoje
          </div>
        </CardContent>
      </Card>;
  }

  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Agendamentos de Hoje ({appointments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {paginatedData.map(appointment => (
            <div key={appointment.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors">
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
                
                {/* Segunda linha: Serviço + Ícones de ação */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs text-gray-600 truncate">{appointment.service_name}</span>
                    {appointment.status === 'completed' && (
                      <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded flex-shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        <span>Concluído</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleWhatsAppClick(appointment.client_phone, appointment.client_name, appointment.appointment_time)}
                      className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                      title="Enviar lembrete via WhatsApp"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </Button>

                    {appointment.status !== 'completed' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCompleteAppointment(appointment.id, appointment.client_name)}
                        disabled={isUpdating}
                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                        title="Marcar como concluído"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    )}

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment.id, appointment.client_name, appointment.client_phone)}
                      disabled={isDeleting}
                      className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => goToPage(currentPage - 1)}
                      className={`h-8 w-8 text-sm ${!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        onClick={() => goToPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer h-8 w-8 text-sm"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => goToPage(currentPage + 1)}
                      className={`h-8 w-8 text-sm ${!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </CardContent>
    </Card>;
};
export default TodayAppointmentsList;