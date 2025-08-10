import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MerchantDashboard from '../components/MerchantDashboard';
import MonthlyAgenda from '../components/MonthlyAgenda';
import SettingsPanel from '../components/SettingsPanel';
import ClientManagement from '../components/ClientManagement';
import ServiceManagement from '../components/ServiceManagement';
import ProfileCustomizationModal from '../components/ProfileCustomizationModal';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar, Users, Briefcase, LogOut, HelpCircle, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchProfile } from '@/services/profileService';

type ViewType = 'dashboard' | 'agenda' | 'settings' | 'clients' | 'services';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [companyName, setCompanyName] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Garantir que área administrativa tenha classe correta
  useEffect(() => {
    document.body.classList.add('admin-area');
    document.body.classList.remove('public-area');
    
    return () => {
      document.body.classList.remove('admin-area');
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile(user.id);
        if (profileData && profileData.company_name) {
          setCompanyName(profileData.company_name);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileSuccess = () => {
    // Recarregar dados após atualização do perfil
    window.location.reload();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <MerchantDashboard companyName={companyName} onViewChange={setCurrentView} />;
      case 'agenda':
        return <MonthlyAgenda />;
      case 'settings':
        return <SettingsPanel />;
      case 'clients':
        return <ClientManagement />;
      case 'services':
        return <ServiceManagement />;
      default:
        return <MerchantDashboard companyName={companyName} onViewChange={setCurrentView} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-whatsapp-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-whatsapp-green">ZapAgenda</div>
          <div className="text-whatsapp-muted">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-whatsapp-bg">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-whatsapp p-3 md:p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold text-whatsapp-green">ZapAgenda</h1>
              <p className="text-xs md:text-sm text-whatsapp-muted">{companyName}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-50">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-whatsapp">
                <DropdownMenuItem onClick={() => setCurrentView('dashboard')} className="hover:bg-gray-50">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('agenda')} className="hover:bg-gray-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agenda Mensal
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-whatsapp-border" />
                <DropdownMenuItem onClick={() => setShowProfileModal(true)} className="hover:bg-gray-50">
                  <Palette className="w-4 h-4 mr-2" />
                  Personalizar Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('clients')} className="hover:bg-gray-50">
                  <Users className="w-4 h-4 mr-2" />
                  Gerenciar Clientes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('services')} className="hover:bg-gray-50">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Gerenciar Serviços
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-whatsapp-border" />
                <DropdownMenuItem className="hover:bg-gray-50">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Suporte
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-whatsapp-border" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-4 md:pb-8">
          {renderContent()}
        </div>
      </div>

      {/* Modal de Personalização de Perfil */}
      <ProfileCustomizationModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={handleProfileSuccess}
      />
    </>
  );
};

export default Dashboard;