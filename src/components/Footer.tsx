import React, { useState } from 'react';
import { 
  Phone, MapPin, ExternalLink, Calendar, CreditCard, 
  Sparkles, Heart, Copy, Check, Instagram, Youtube 
} from 'lucide-react';

import { ClinicaSettings } from '../types';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenPixInfo: () => void;
  pixKey: string;
  clinicaSettings: ClinicaSettings;
}

export default function Footer({ onOpenBooking, onOpenPixInfo, pixKey, clinicaSettings }: FooterProps) {
  const [copiedKey, setCopiedKey] = useState(false);

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const formatPhoneNumber = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.length === 11) {
      return `(${cleanNum.slice(0, 2)}) ${cleanNum.slice(2, 7)}-${cleanNum.slice(7)}`;
    } else if (cleanNum.length === 13 && cleanNum.startsWith('55')) {
      return `(${cleanNum.slice(2, 4)}) ${cleanNum.slice(4, 9)}-${cleanNum.slice(9)}`;
    }
    return num;
  };

  return (
    <footer className="relative bg-[#f5ede4] border-t border-[#dfd3c3] text-[#5c4433] overflow-hidden">
      {/* Background spa layer blending */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Brand identity */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1c5a3b] to-[#123b26] border border-[#d4af37]/30 flex items-center justify-center">
              <span className="font-display font-semibold text-sm text-[#d4af37]">ÂZ</span>
            </div>
            <h3 className="font-display text-xl font-bold tracking-widest text-[#3a271c]">Ânima Zen</h3>
          </div>
          <p className="text-xs leading-relaxed max-w-sm text-left text-[#5c4433]">
            Um refúgio de paz dedicado ao relaxamento profundo e ao atendimento humanizado. Harmonizamos o corpo, acalmamos a mente e restauramos a alma através da massoterapia profissional.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#1c5a3b] font-medium">
            <Heart className="w-3.5 h-3.5 fill-[#1c5a3b] text-[#1c5a3b]" /> Cultivado com muito amor e dedicação.
          </div>

          {/* Redes Sociais */}
          <div className="flex items-center gap-3 pt-1">
            {clinicaSettings.instagramUrl && (
              <a 
                href={clinicaSettings.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-[#1b4332]/10 text-[#d4af37] hover:text-[#1c5a3b] rounded-lg border border-[#dfd3c3] transition-all flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider shadow-sm"
                title="Siga no Instagram"
              >
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </a>
            )}
            {clinicaSettings.youtubeUrl && (
              <a 
                href={clinicaSettings.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-red-50 text-[#d4af37] hover:text-red-600 rounded-lg border border-[#dfd3c3] transition-all flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider shadow-sm"
                title="Assista no YouTube"
              >
                <Youtube className="w-3.5 h-3.5" /> YouTube
              </a>
            )}
          </div>
        </div>

        {/* Contact info (Telephone / WhatsApp, Address) */}
        <div className="md:col-span-4 space-y-4 text-xs">
          <h4 className="font-serif font-bold text-sm text-[#3a271c] tracking-wide border-b border-[#dfd3c3] pb-1.5 text-left">
            Contatos & Localização
          </h4>
          <div className="space-y-3 text-left">
            {/* Phone WhatsApp click */}
            <a 
              href={`https://wa.me/${clinicaSettings.phone}?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20as%20massagens%20da%20%C3%82nima%20Zen.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-2 bg-white border border-[#dfd3c3] rounded-lg hover:border-[#1c5a3b] hover:bg-white/60 transition-all group shadow-sm"
            >
              <Phone className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-semibold text-[#3a271c] block">WhatsApp / Telefone</span>
                <span className="text-[#5c4433] block mt-0.5">{formatPhoneNumber(clinicaSettings.phone)}</span>
                <span className="text-[10px] text-[#2d9e6b] font-semibold flex items-center gap-1 mt-0.5">
                  Clique para iniciar conversa
                </span>
              </div>
            </a>

            {/* Address */}
            <div className="flex items-start gap-3 p-2 bg-white border border-[#dfd3c3] rounded-lg shadow-sm">
              <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#3a271c] block">Endereço da Clínica</span>
                <span className="text-[#5c4433] block mt-0.5">
                  {clinicaSettings.address}
                </span>
                {/* Como chegar button integrated to Google Maps */}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicaSettings.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1c5a3b] hover:text-[#123b26] font-bold text-[10px] uppercase tracking-wider mt-2 group"
                >
                  Como Chegar <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick buttons section */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-serif font-bold text-sm text-[#3a271c] tracking-wide border-b border-[#dfd3c3] pb-1.5">
            Ações Rápidas
          </h4>
          <div className="space-y-3 text-xs">
            {/* Quick booking trigger */}
            <button
              onClick={onOpenBooking}
              className="w-full py-2.5 px-4 bg-[#1b4332] hover:bg-[#153527] border border-[#d4af37]/40 hover:border-[#d4af37]/70 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#d4af37]" /> Agendar Horário Online
            </button>

            {/* Quick pix copy triggers */}
            <button
              onClick={onOpenPixInfo}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#fcf9f6] border border-[#dfd3c3] text-[#3a271c] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <CreditCard className="w-4 h-4 text-[#d4af37]" /> Botão de Pagamento PIX
            </button>

            {/* Inline Pix click to copy */}
            <div className="flex items-center gap-2 bg-[#fcf9f6] p-2 rounded-lg border border-[#dfd3c3] justify-between shadow-inner">
              <span className="font-mono text-[10px] tracking-wider text-[#5c4433]">Chave PIX: {pixKey}</span>
              <button 
                onClick={copyPixKey}
                className="text-[10px] text-[#1c5a3b] hover:text-[#123b26] font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3 h-3" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar Chave
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="relative z-10 border-t border-[#dfd3c3]/50 bg-[#ebdcd0] py-6 text-center text-[10px] tracking-wider text-[#5c4433]/80">
        &copy; {new Date().getFullYear()} Ânima Zen Massoterapia. Todos os direitos reservados. 
        <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">Fortaleza - CE.</span>
      </div>
    </footer>
  );
}
