import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Sparkles, Heart, Search, MessageCircle, Calendar } from 'lucide-react';
import { Service, ClinicaSettings } from '../types';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  initialCategory: 'individual' | 'combo';
  onBookService: (serviceId: string) => void;
  clinicaSettings: ClinicaSettings;
}

export default function CatalogModal({
  isOpen,
  onClose,
  services,
  initialCategory,
  onBookService,
  clinicaSettings
}: CatalogModalProps) {
  const [activeCategory, setActiveCategory] = useState<'individual' | 'combo'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter services by category and search query
  const filteredServices = services.filter((service) => {
    const matchesCategory = service.category === activeCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl overflow-hidden bg-[#faf6f0] border border-[#dfd3c3] rounded-2xl shadow-2xl text-[#3a271c] max-h-[90vh] flex flex-col"
      >
        {/* Decorative spa background asset for luxury aesthetic */}
        <div className="absolute inset-0 z-0 opacity-5 mix-blend-overlay pointer-events-none">
          <img 
            src="/src/assets/images/spa_background_1783303723602.jpg" 
            alt="Spa Deco" 
            className="object-cover w-full h-full filter sepia-[15%]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-[#dfd3c3] gap-4">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-semibold tracking-wide text-[#1c5a3b] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1c5a3b]" />
              Catálogo de Bem-Estar Ânima Zen
            </h2>
            <p className="text-xs text-[#5c4433]">Experiências humanizadas de massoterapia e autocuidado</p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8b7665]" />
              <input
                type="text"
                placeholder="Buscar tratamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-[#dfd3c3] rounded-xl text-xs text-[#3a271c] outline-none focus:border-[#1c5a3b] w-48 md:w-56 transition-all"
              />
            </div>

            <button
              onClick={onClose}
              className="p-2 transition-all rounded-full hover:bg-[#f5ede4] text-[#8b7665] hover:text-[#1c5a3b] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="relative z-10 bg-[#f5ede4]/40 border-b border-[#dfd3c3] p-3 flex justify-center gap-2">
          <button
            onClick={() => setActiveCategory('individual')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'individual'
                ? 'bg-[#1b4332] text-white shadow-md'
                : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#fcf9f6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Massagens Individuais
          </button>
          <button
            onClick={() => setActiveCategory('combo')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'combo'
                ? 'bg-[#1b4332] text-white shadow-md'
                : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#fcf9f6]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-amber-500" /> Combos Promocionais (Especiais)
          </button>
        </div>

        {/* Scrollable grid container */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            {filteredServices.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-[#a08e82] flex flex-col items-center justify-center space-y-2"
              >
                <Search className="w-10 h-10 opacity-30" />
                <p className="text-sm font-semibold">Nenhum serviço correspondente encontrado.</p>
                <p className="text-xs">Tente buscar por termos diferentes ou selecione outra aba.</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
              >
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl overflow-hidden border border-[#dfd3c3] flex flex-col justify-between hover:border-[#1c5a3b] hover:shadow-xl transition-all"
                  >
                    {/* Thumbnail banner */}
                    <div className="h-36 overflow-hidden relative">
                      <img
                        src={service.imageUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop'}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 border border-[#dfd3c3] rounded-lg px-2 py-0.5 text-[10px] font-bold text-[#1c5a3b] flex items-center gap-1 shadow-sm">
                        <Clock className="w-3.5 h-3.5" /> {service.duration} min
                      </div>
                    </div>

                    {/* Description and metadata */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1 text-left">
                        <h4 className="font-serif text-base font-bold text-[#3a271c]">{service.name}</h4>
                        <p className="text-xs text-[#5c4433] leading-relaxed line-clamp-3">{service.description}</p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col gap-2 w-full pt-3 border-t border-[#dfd3c3]/40 mt-auto">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-[#5c4433] uppercase block text-left">Investimento</span>
                            <span className="font-display text-lg font-bold text-[#1c5a3b]">R$ {service.price.toFixed(2)}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              onBookService(service.id);
                              onClose();
                            }}
                            className="px-4 py-1.5 bg-[#1b4332] hover:bg-[#143f29] text-white text-xs font-bold rounded-lg tracking-wide transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Agendar Agora
                          </button>
                        </div>

                        <a
                          href={`https://wa.me/${clinicaSettings.phone}?text=Ol%C3%A1%20%C3%82nima%20Zen!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20servi%C3%A7o%20"${encodeURIComponent(service.name)}"`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#1c5a3b] hover:text-[#123b26] font-semibold flex items-center justify-center gap-1 py-1 bg-[#1b4332]/5 rounded-lg border border-dashed border-[#dfd3c3] transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25d366]" /> Tirar Dúvida no WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="relative z-10 bg-[#f5ede4]/30 border-t border-[#dfd3c3] p-4 text-center text-[11px] text-[#5c4433]">
          Todos os tratamentos são ministrados com óleos essenciais florais puros e toques humanizados.
        </div>
      </motion.div>
    </div>
  );
}
