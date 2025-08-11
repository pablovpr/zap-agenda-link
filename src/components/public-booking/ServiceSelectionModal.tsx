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
    onServiceSelect(serviceId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                          R$ {service.price.toFixed(2)}
                        </span>
                      )}
                    </div>
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceSelectionModal;