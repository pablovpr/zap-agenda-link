<<<<<<< HEAD
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
=======
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';

>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}
<<<<<<< HEAD
const SupportModal = ({
  isOpen,
  onClose
}: SupportModalProps) => {
  const {
    toast
  } = useToast();
  const [emailCopied, setEmailCopied] = useState(false);
  const supportEmail = 'zapcomercios@gmail.com';
  const whatsappNumber = '5535991208159'; // Formato internacional
  const whatsappDisplayNumber = '(35) 99120-8159';
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setEmailCopied(true);
      toast({
        title: "Email copiado!",
        description: "O email foi copiado para a área de transferência."
      });
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o email.",
        variant: "destructive"
      });
    }
  };
  const handleOpenEmail = () => {
    const subject = encodeURIComponent('Suporte ZapAgenda');
    const body = encodeURIComponent('Olá, preciso de ajuda com o ZapAgenda.\n\nDescreva sua dúvida ou problema aqui...');
    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`, '_blank');
  };
  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent('Olá! Preciso de ajuda com o ZapAgenda.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[90vw] bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            
            Suporte ZapAgenda
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <p className="text-sm text-[#6f7173] mb-4">
            Precisa de ajuda? Entre em contato conosco através dos canais abaixo:
          </p>

          {/* Email Support */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#19c662] rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Email</h3>
                <p className="text-xs text-[#6f7173]">Resposta em até 24h</p>
              </div>
            </div>
            
            <div className="bg-white rounded-md p-2 border border-gray-200 mb-2">
              <p className="text-xs font-mono text-gray-800">{supportEmail}</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCopyEmail} variant="outline" size="sm" className="flex-1 border-[#19c662] text-[#19c662] hover:bg-[#d0ffcf] hover:border-[#19c662]">
                <Copy className="w-4 h-4 mr-2" />
                {emailCopied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button onClick={handleOpenEmail} size="sm" className="flex-1 bg-[#19c662] hover:bg-[#16b356] text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Email
              </Button>
            </div>
          </div>

          {/* WhatsApp Support */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#19c662] rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">WhatsApp</h3>
                <p className="text-xs text-[#6f7173]">Resposta imediata</p>
              </div>
            </div>
            
            <div className="bg-white rounded-md p-2 border border-gray-200 mb-2">
              <p className="text-xs font-mono text-gray-800">{whatsappDisplayNumber}</p>
            </div>
            
            <Button onClick={handleOpenWhatsApp} size="sm" className="w-full bg-[#19c662] hover:bg-[#16b356] text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Abrir WhatsApp
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-[#d0ffcf] rounded-lg p-2 border border-[#19c662]/20">
            <p className="text-xs text-[#6f7173] text-center">
              💡 <strong>Dica:</strong> Para um atendimento mais rápido, descreva detalhadamente sua dúvida ou problema.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
=======

const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const handleEmailClick = () => {
    window.open('mailto:zapcomercios@gmail.com', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5535991208159', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Suporte
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-gray-600 text-sm mb-6">
            Entre em contato conosco através dos canais abaixo:
          </p>

          {/* Email */}
          <div 
            onClick={handleEmailClick}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">
                Email
              </h3>
              <p className="text-sm text-gray-600">
                zapcomercios@gmail.com
              </p>
            </div>
          </div>

          {/* WhatsApp */}
          <div 
            onClick={handleWhatsAppClick}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">
                WhatsApp
              </h3>
              <p className="text-sm text-gray-600">
                (35) 99120-8159
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-gray-200 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
export default SupportModal;