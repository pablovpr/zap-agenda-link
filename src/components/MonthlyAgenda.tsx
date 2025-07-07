
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMonthlyAppointments } from '@/hooks/useMonthlyAppointments';
import CalendarHeader from './monthly-agenda/CalendarHeader';
import CalendarGrid from './monthly-agenda/CalendarGrid';
import AppointmentDialog from './monthly-agenda/AppointmentDialog';
import BackButton from './BackButton';

interface MonthlyAgendaProps {
  onBack?: () => void;
}

const MonthlyAgenda = ({ onBack }: MonthlyAgendaProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { appointments, loading, getAppointmentsForDate, refreshAppointments } = useMonthlyAppointments(currentDate);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date);
    if (dayAppointments.length > 0) {
      console.log('Selecionando data:', format(date, 'yyyy-MM-dd'), 'com', dayAppointments.length, 'agendamentos');
      setSelectedDate(date);
    }
  };

  const handleWhatsAppClick = (phone: string, clientName: string, appointmentDate?: string, appointmentTime?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Formatar data e horário se fornecidos
    let message = `Olá, ${clientName}! 👋\n`;
    
    if (appointmentDate && appointmentTime) {
      const formattedDate = format(new Date(appointmentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      const formattedTime = appointmentTime.substring(0, 5);
      message += `Seu procedimento foi marcado com sucesso para o dia ${formattedDate}, às ${formattedTime}.\n`;
    } else {
      message += `Seu procedimento foi marcado com sucesso.\n`;
    }
    
    message += `Se precisar remarcar ou tiver alguma dúvida, estou à disposição para ajudar!`;
    
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  // Criar array de dias começando no domingo
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 fade-in">
      {onBack && (
        <BackButton onClick={onBack} />
      )}
      
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="w-4 md:w-5 h-4 md:h-5 text-primary" />
            Agenda - {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Carregando agendamentos...</div>
            </div>
          ) : (
            <CalendarGrid
              currentDate={currentDate}
              calendarDays={calendarDays}
              getAppointmentsForDate={getAppointmentsForDate}
              onDateClick={handleDateClick}
            />
          )}
        </CardContent>
      </Card>

      <AppointmentDialog
        selectedDate={selectedDate}
        appointments={selectedDateAppointments}
        onClose={() => setSelectedDate(null)}
        onWhatsAppClick={handleWhatsAppClick}
        onRefresh={refreshAppointments}
      />
    </div>
  );
};

export default MonthlyAgenda;
