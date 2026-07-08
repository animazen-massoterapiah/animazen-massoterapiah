import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Lock, PhoneCall, Instagram } from 'lucide-react';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  logoUrl?: string;
  instagramUrl?: string;
}

export default function Header({ onOpenBooking, onOpenAdmin, logoUrl, instagramUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#f5ede4f0] backdrop-blur-md border-b border-[#dfd3c3] px-4 md:px-8 py-4 flex items-center justify-between">
      {/* Brand logo & name */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-[#d4af37] flex items-center justify-center shadow-lg bg-white shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Ânima Zen Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1c5a3b] to-[#123b26] flex items-center justify-center">
              <span className="font-display font-bold text-sm md:text-base text-[#d4af37]">ÂZ</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-lg md:text-2xl font-bold tracking-widest text-[#3a271c] flex items-center gap-1.5 leading-none">
            Ânima Zen
          </h1>
          <span className="text-[9px] md:text-[10px] tracking-wider uppercase text-[#8b7665] block mt-0.5 font-semibold">
            Massoterapia & Bem-Estar Humanizado
          </span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Instagram social shortcut */}
        {instagramUrl && (
          <a 
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white text-[#5c4433] hover:text-[#1c5a3b] rounded-full border border-[#dfd3c3] transition-all hover:bg-white/60 flex items-center justify-center"
            title="Siga-nos no Instagram"
          >
            <Instagram className="w-4.5 h-4.5 text-[#d4af37]" />
          </a>
        )}

        {/* Telephone quickcall */}
        <a 
          href="tel:+5585996341602"
          className="hidden sm:flex p-2 bg-white text-[#5c4433] hover:text-[#1c5a3b] rounded-full border border-[#dfd3c3] transition-all hover:bg-white/60"
          title="Ligar para nós"
        >
          <PhoneCall className="w-4 h-4 text-[#d4af37]" />
        </a>

        {/* Admin hidden access button */}
        <button
          onClick={onOpenAdmin}
          className="p-2.5 bg-[#fcf9f6] text-[#5c4433] hover:text-[#1c5a3b] rounded-lg border border-[#dfd3c3] transition-all text-xs font-semibold flex items-center gap-1.5 hover:bg-white cursor-pointer"
          title="Área do Administrador"
        >
          <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> <span className="hidden md:inline">Painel</span>
        </button>

        {/* Agendar Horário Shortcut */}
        <button
          onClick={onOpenBooking}
          className="px-4 py-2 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] border border-[#d4af37]/40 hover:border-[#d4af37]/75 hover:scale-[1.03] transition-all duration-200 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-black/30 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> Agendar Horário
        </button>
      </div>
    </header>
  );
}
