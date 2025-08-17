
import { supabase } from '@/integrations/supabase/client';
import { getNowInBrazil } from '@/utils/timezone';

export const checkMonthlyLimit = async (
  companyId: string,
  clientPhone: string,
  monthlyAppointmentsLimit?: number
) => {
  if (!monthlyAppointmentsLimit) {
    return true;
  }

  try {
    const currentDate = getNowInBrazil();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const startOfNextMonth = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
    
    
    // Buscar cliente por telefone
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', clientPhone)
      .eq('company_id', companyId)
      .maybeSingle();
    
    if (clientError) {
      console.error('❌ Erro ao buscar cliente:', clientError);
      return true; // Em caso de erro, permitir agendamento
    }
    
    if (!client) {
      return true; // Novo cliente, pode agendar
    }

    // Buscar agendamentos do mês atual
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .eq('company_id', companyId)
      .eq('client_id', client.id)
      .gte('appointment_date', startOfMonth)
      .lt('appointment_date', startOfNextMonth)
      .neq('status', 'cancelled');

    if (appointmentsError) {
      console.error('❌ Erro ao buscar agendamentos:', appointmentsError);
      return true; // Em caso de erro, permitir agendamento
    }

    const appointmentCount = appointments?.length || 0;
    
    const canBook = appointmentCount < monthlyAppointmentsLimit;
    
    return canBook;
  } catch (error) {
    console.error('❌ Erro ao verificar limite mensal:', error);
    return true; // Em caso de erro, permitir agendamento
  }
};
