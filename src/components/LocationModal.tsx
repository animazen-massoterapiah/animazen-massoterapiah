import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Clock, ExternalLink, X, Navigation } from 'lucide-react';
import { ClinicaSettings } from '../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicaSettings: ClinicaSettings;
}

export default function LocationModal({ isOpen, onClose, clinicaSettings }: LocationModalProps) {
  if (!isOpen) return null;

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicaSettings.address)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#faf6f0] border-2 border-[#dfd3c3] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-[#3a271c] relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b7665] hover:text-[#1c5a3b] p-1.5 rounded-full hover:bg-white/50 transition-colors cursor-pointer z-10"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header image / Banner */}
        <div className="h-32 bg-gradient-to-br from-[#1c5a3b] to-[#143f29] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="text-center z-10 space-y-1">
            <div className="w-10 h-10 bg-[#d4af37]/15 rounded-full flex items-center justify-center mx-auto border border-[#d4af37]/30 text-[#d4af37]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#faf6f0] tracking-wide">Como nos Encontrar</h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-left">
          {/* Address Card */}
          <div className="bg-white p-4 rounded-xl border border-[#dfd3c3] space-y-2 shadow-sm">
            <span className="text-[10px] font-bold text-[#1c5a3b] uppercase tracking-wider flex items-center gap-1.5">
              📍 Endereço de Acolhimento
            </span>
            <p className="text-xs text-[#5c4433] leading-relaxed font-semibold">
              {clinicaSettings.address || "Rua Desembargador Lauro Nogueira, 1500 - Papicu, Fortaleza - CE"}
            </p>
          </div>

          {/* Clinica details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Working hours */}
            <div className="bg-white p-3 rounded-xl border border-[#dfd3c3] space-y-1 shadow-sm">
              <span className="text-[9px] font-bold text-[#8b7665] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1c5a3b]" /> Horários
              </span>
              <p className="text-[11px] text-[#3a271c] font-bold">Segunda a Sábado</p>
              <p className="text-[10px] text-[#5c4433]">08:00 às 20:00</p>
            </div>

            {/* Direct contact info */}
            <div className="bg-white p-3 rounded-xl border border-[#dfd3c3] space-y-1 shadow-sm">
              <span className="text-[9px] font-bold text-[#8b7665] uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1c5a3b]" /> Contato
              </span>
              <p className="text-[11px] text-[#3a271c] font-bold">Fale Conosco</p>
              <p className="text-[10px] text-[#5c4433] truncate">{(clinicaSettings.phone) ? clinicaSettings.phone : "85 99634-1602"}</p>
            </div>
          </div>

          {/* Large Maps Action Button */}
          <button
            onClick={handleOpenGoogleMaps}
            className="w-full py-3 bg-[#1b4332] text-white hover:bg-[#143f29] rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#d4af37]/30"
          >
            <Navigation className="w-4 h-4 text-[#d4af37]" /> Abrir Rota no Google Maps
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#dfd3c3] bg-white text-[10px] text-[#8b7665] text-center uppercase tracking-wider font-semibold">
          💆‍♀️ Estacionamento gratuito e seguro no local.
        </div>
      </motion.div>
    </div>
  );
}
