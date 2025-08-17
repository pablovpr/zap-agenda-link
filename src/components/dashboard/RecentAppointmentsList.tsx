import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePagination } from '@/hooks/usePagination';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink 
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RecentAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  status: string;
}

interface RecentAppointmentsListProps {
  appointments: RecentAppointment[];
  loading?: boolean;
  onRefresh?: () => void;
}

const RecentAppointmentsList = ({
  appointments,
  loading,
  onRefresh
}: RecentAppointmentsListProps) => {
  
  // Paginação
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
    data: appointments,
    itemsPerPage: 5
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Agendamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Carregando agendamentos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
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
          <Calendar className="w-5 h-5 text-primary" />
          Agendamentos Recentes ({appointments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {paginatedData.map((appointment) => (
            <div key={appointment.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
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
                      {format(new Date(appointment.appointment_date + 'T12:00:00'), 'dd/MM')} às {appointment.appointment_time.substring(0, 5)}
                    </span>
                  </div>
                </div>
                
                {/* Segunda linha: Tipo de serviço */}
                <div className="ml-6">
                  <span className="text-xs text-gray-600">{appointment.service_name}</span>
                  {appointment.status === 'completed' && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                      <CheckCircle className="w-3 h-3" />
                      Concluído
                    </span>
                  )}
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
    </Card>
  );
};

export default RecentAppointmentsList;