
import { useParams } from 'react-router-dom';
import { usePublicBooking } from '@/hooks/usePublicBooking';
import { usePublicTheme } from '@/hooks/usePublicTheme';
import LoadingState from '@/components/public-booking/LoadingState';
import ErrorState from '@/components/public-booking/ErrorState';
import EnhancedCompanyHeader from '@/components/public-booking/EnhancedCompanyHeader';
import BookingInfoSection from '@/components/public-booking/BookingInfoSection';
import BookingForm from '@/components/public-booking/BookingForm';
import PublicBookingFooter from '@/components/public-booking/PublicBookingFooter';

const PublicBooking = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  
  console.log('🌐 PublicBooking: Slug capturado da URL:', companySlug);
  console.log('🌐 PublicBooking: window.location.pathname:', window.location.pathname);
  console.log('🌐 PublicBooking: window.location.href:', window.location.href);
  console.log('🌐 PublicBooking: useParams result:', { companySlug });

  const {
    companyData,
    companySettings,
    profile,
    services,
    loading,
    error,
    submitting,
    generateAvailableDates,
    generateAvailableTimes,
    submitBooking
  } = usePublicBooking(companySlug || '');

  // Aplicar tema da empresa na página pública
  usePublicTheme(companySettings);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !companyData || !companySettings || !profile) {
    console.error('❌ PublicBooking: Empresa não encontrada para slug:', companySlug);
    console.error('❌ PublicBooking: error:', error);
    console.error('❌ PublicBooking: companyData:', companyData);
    console.error('❌ PublicBooking: companySettings:', companySettings);
    console.error('❌ PublicBooking: profile:', profile);
    return <ErrorState companySlug={companySlug} />;
  }

  const availableDates = generateAvailableDates();

  const handleFormSubmit = async (formData: {
    selectedService: string;
    selectedDate: string;
    selectedTime: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    notes: string;
  }) => {
    return await submitBooking(formData);
  };

  return (
    <div className="public-page min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header da empresa */}
        <EnhancedCompanyHeader 
          companySettings={companySettings}
          profile={profile}
        />

        {/* Seção informativa sobre agendamento */}
        <BookingInfoSection />

        {/* Formulário de agendamento */}
        <BookingForm
          services={services}
          availableDates={availableDates}
          submitting={submitting}
          onSubmit={handleFormSubmit}
          generateAvailableTimes={generateAvailableTimes}
        />

        {/* Footer */}
        <PublicBookingFooter companySettings={companySettings} />
      </div>
    </div>
  );
};

export default PublicBooking;
