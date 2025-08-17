<<<<<<< HEAD
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Service } from '@/types/publicBooking';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
}

const ServiceSelectionModal = ({
  isOpen,
  onClose,
  services,
  selectedService,
  onServiceSelect
}: ServiceSelectionModalProps) => {
  const handleServiceSelect = (serviceId: string) => {
=======
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Service } from '@/types/publicBooking';

interface ServiceWithCategory extends Service {
  category?: string;
}

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceWithCategory[];
  onServiceSelect: (serviceId: string) => void;
}

const ServiceSelectionModal = ({ 
  isOpen, 
  onClose, 
  services, 
  onServiceSelect 
}: ServiceSelectionModalProps) => {
  
  // Organizar serviços por categoria
  const categorizeServices = () => {
    const categories = {
      'Básico': services.filter(s => s.category === 'basic' || !s.category),
      'Neutro': services.filter(s => s.category === 'neutral'),
      'Profissional': services.filter(s => s.category === 'professional')
    };
    
    // Remover categorias vazias
    Object.keys(categories).forEach(key => {
      if (categories[key as keyof typeof categories].length === 0) {
        delete categories[key as keyof typeof categories];
      }
    });
    
    return categories;
  };

  const categorizedServices = categorizeServices();

  const handleServiceClick = (serviceId: string) => {
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
    onServiceSelect(serviceId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
<<<<<<< HEAD
      <DialogContent className="sm:max-w-md max-w-[90vw] bg-[#fafafa] border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">
            Escolha o serviço
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          <p className="text-sm text-gray-600 mb-4">
            Selecione o serviço desejado para seu agendamento:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceSelect(service.id)}
                className={`w-full p-4 rounded-lg border text-left transition-all hover:shadow-sm ${
                  selectedService === service.id
                    ? 'border-gray-400 bg-white shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-base mb-1">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>
                        {service.duration} min
                      </span>
                      {service.price && (
                        <span className="font-medium text-gray-600">
=======
      <DialogContent 
        className="max-w-md max-h-[80vh] overflow-y-auto border-0 shadow-lg rounded-lg [&>button]:hidden" 
        style={{ 
          backgroundColor: '#fafafa',
          color: '#000000',
          padding: '24px'
        }}
      >
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-1 h-auto rounded hover:opacity-80"
            style={{ 
              color: '#666666',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X className="w-5 h-5" />
          </button>
          
          <DialogTitle 
            className="text-xl font-semibold text-center mb-2"
            style={{ color: '#000000' }}
          >
            Escolha o serviço
          </DialogTitle>
          
          <p 
            className="text-sm text-center mb-6"
            style={{ color: '#666666' }}
          >
            Selecione o serviço desejado para seu agendamento.
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {Object.keys(categorizedServices).length > 0 ? (
            Object.entries(categorizedServices).map(([category, categoryServices]) => (
              <div key={category} className="space-y-3">
                {Object.keys(categorizedServices).length > 1 && (
                  <h3 
                    className="text-base font-medium pb-2 text-center"
                    style={{ 
                      color: '#000000',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    {category}
                  </h3>
                )}
                <div className="space-y-3">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service.id)}
                      className="p-4 rounded-lg cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e0e0e0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cccccc';
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <div className="flex flex-col">
                        <h4 
                          className="font-medium text-base mb-2"
                          style={{ color: '#000000' }}
                        >
                          {service.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span style={{ color: '#666666' }}>
                            {service.duration} min
                          </span>
                          {service.price && (
                            <span 
                              className="font-medium"
                              style={{ color: '#666666' }}
                            >
                              R$ {service.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="p-4 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cccccc';
                    e.currentTarget.style.backgroundColor = '#f8f8f8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div className="flex flex-col">
                    <h4 
                      className="font-medium text-base mb-2"
                      style={{ color: '#000000' }}
                    >
                      {service.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span style={{ color: '#666666' }}>
                        {service.duration} min
                      </span>
                      {service.price && (
                        <span 
                          className="font-medium"
                          style={{ color: '#666666' }}
                        >
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
                          R$ {service.price.toFixed(2)}
                        </span>
                      )}
                    </div>
<<<<<<< HEAD
                    {service.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                  {selectedService === service.id && (
                    <div className="ml-3 flex-shrink-0">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                Nenhum serviço disponível no momento.
              </p>
=======
                  </div>
                </div>
              ))}
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceSelectionModal;