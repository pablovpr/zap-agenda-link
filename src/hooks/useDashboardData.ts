
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchCompanySettings } from '@/services/companySettingsService';
import { generatePublicBookingUrl } from '@/lib/domainConfig';
import { supabase } from '@/integrations/supabase/client';
import { DashboardData } from '@/types/dashboard';
import { getNowInBrazil, getTodayInBrazil } from '@/utils/timezone';

export const useDashboardData = (companyName?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [bookingLink, setBookingLink] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todayAppointments: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    completionRate: 0,
    bookingLink: '',
    recentAppointments: [],
    todayAppointmentsList: []
  });

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Use Brazil timezone for dates
      const today = getTodayInBrazil();
      const currentMonth = getNowInBrazil();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

      // Execute all queries in parallel for better performance
      const [
        settingsResult,
        todayAppointmentsResult,
        clientsResult,
        completedAppointmentsResult,
        recentAppointmentsResult
      ] = await Promise.all([
        // Company settings
        fetchCompanySettings(user.id),
        
        // Today's appointments
        supabase
          .from('appointments')
          .select(`
            id,
            appointment_time,
            status,
            clients!inner(name, phone),
            services!inner(name)
          `)
          .eq('company_id', user.id)
          .eq('appointment_date', today)
          .order('appointment_time'),
        
        // Total clients count only
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', user.id),
        
        // Monthly revenue from completed appointments
        supabase
          .from('appointments')
          .select('service_id, services(price)')
          .eq('company_id', user.id)
          .gte('appointment_date', firstDay)
          .lte('appointment_date', lastDay)
          .eq('status', 'completed'),
        
        // Recent appointments
        supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            status,
            clients(name, phone),
            services(name)
          `)
          .eq('company_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Process company settings
      const settings = settingsResult;
      setCompanySettings(settings);
      
      let publicUrl = '';
      if (settings?.slug) {
        publicUrl = generatePublicBookingUrl(settings.slug);
        setBookingLink(publicUrl);
      }

      // Process results
      const todayAppointments = todayAppointmentsResult.data || [];
      const clientsCount = clientsResult.count || 0;
      const completedAppointments = completedAppointmentsResult.data || [];
      const recentAppointments = recentAppointmentsResult.data || [];

      // Calculate monthly revenue
      const monthlyRevenue = completedAppointments.reduce((total, apt: any) => {
        return total + (apt.services?.price || 0);
      }, 0);

<<<<<<< HEAD
      // Format data efficiently
      const formattedTodayList = todayAppointments.map((apt: any) => ({
=======
      // Recent appointments - ordenar por data e hora do agendamento
      const { data: recentAppointments, error: recentError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          clients(name, phone),
          services(name)
        `)
        .eq('company_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false })
        .limit(50);

      if (recentError) {
        console.error('Error fetching recent appointments:', recentError);
      }

      // Format data
      const formattedTodayList = (todayAppointments || []).map((apt: any) => ({
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
        id: apt.id,
        appointment_time: apt.appointment_time,
        status: apt.status,
        client_name: apt.clients?.name || 'Cliente',
        client_phone: apt.clients?.phone || '',
        service_name: apt.services?.name || 'Serviço'
      }));

      const formattedRecentList = recentAppointments.map((apt: any) => ({
        id: apt.id,
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        status: apt.status,
        client_name: apt.clients?.name || 'Cliente',
        client_phone: apt.clients?.phone || '',
        service_name: apt.services?.name || 'Serviço'
      }));

      setDashboardData({
        todayAppointments: todayAppointments.length,
        totalClients: clientsCount,
        monthlyRevenue,
        completionRate: 85, // Mock completion rate
        bookingLink: publicUrl,
        recentAppointments: formattedRecentList,
        todayAppointmentsList: formattedTodayList
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Escutar atualizações de configurações para recarregar dados
  useEffect(() => {
    const handleSettingsUpdated = () => {
      console.log('Configurações atualizadas detectadas, recarregando dashboard...');
      if (user?.id) {
        loadData();
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdated);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdated);
    };
  }, [user?.id]);

  const handleCopyLink = async () => {
    if (!bookingLink) return;
    
    try {
      await navigator.clipboard.writeText(bookingLink);
      setLinkCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleViewPublicPage = () => {
    if (bookingLink) {
      window.open(bookingLink, '_blank');
    }
  };

  const handleShareWhatsApp = () => {
    if (!bookingLink) return;
    
    const message = `Olá! Você pode agendar um horário comigo através deste link: ${bookingLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return {
    companySettings,
    bookingLink,
    linkCopied,
    loading,
    data: dashboardData,
    refreshData: loadData,
    handleCopyLink,
    handleViewPublicPage,
    handleShareWhatsApp
  };
};
