import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Plus, Check, X, Shield, Sparkles, Heart } from 'lucide-react';
import { Testimonial } from '../types';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonials: Testimonial[];
  onAddReview: (review: Testimonial) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150',
];

export default function ReviewsModal({ isOpen, onClose, testimonials, onAddReview }: ReviewsModalProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'write'>('view');
  
  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const newReview: Testimonial = {
      id: `test-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Cliente',
      avatarUrl: selectedAvatar,
      rating,
      content: content.trim()
    };

    onAddReview(newReview);
    setIsSubmitted(true);
    
    // Reset form
    setTimeout(() => {
      setName('');
      setRole('');
      setContent('');
      setRating(5);
      setIsSubmitted(false);
      setActiveTab('view');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#faf6f0] border-2 border-[#dfd3c3] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-[#3a271c]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#dfd3c3] bg-[#f5ede4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#1c5a3b]/10 flex items-center justify-center border border-[#1c5a3b]/20">
              <MessageSquare className="w-5 h-5 text-[#1c5a3b]" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#1c5a3b] tracking-wider">Avaliações & Depoimentos</h3>
              <p className="text-[10px] text-[#5c4433] uppercase font-semibold tracking-wider">Ânima Zen Massoterapia</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#8b7665] hover:text-[#1c5a3b] rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-[#dfd3c3] bg-white shrink-0">
          <button
            onClick={() => {
              setActiveTab('view');
              setIsSubmitted(false);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'view'
                ? 'border-[#1c5a3b] text-[#1c5a3b] bg-[#faf6f0]/50'
                : 'border-transparent text-[#8b7665] hover:text-[#3a271c]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#d4af37]" /> Ler Avaliações ({testimonials.length})
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'write'
                ? 'border-[#1c5a3b] text-[#1c5a3b] bg-[#faf6f0]/50'
                : 'border-transparent text-[#8b7665] hover:text-[#3a271c]'
            }`}
          >
            <Plus className="w-4 h-4 text-[#1c5a3b]" /> Escrever Avaliação
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'view' ? (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {testimonials.length === 0 ? (
                  <div className="py-12 text-center text-[#8b7665] border border-dashed border-[#dfd3c3] rounded-xl bg-white">
                    Nenhuma avaliação cadastrada ainda. Seja o primeiro a avaliar!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {testimonials.map((test) => (
                      <div 
                        key={test.id}
                        className="bg-white p-5 rounded-xl border border-[#dfd3c3] flex flex-col justify-between space-y-3 shadow-sm text-left"
                      >
                        <p className="text-xs text-[#5c4433] leading-relaxed italic flex-1">
                          "{test.content}"
                        </p>
                        <div className="flex items-center gap-3 border-t border-[#dfd3c3]/40 pt-3">
                          <img 
                            src={test.avatarUrl || PRESET_AVATARS[0]} 
                            alt={test.name} 
                            className="w-9 h-9 rounded-full object-cover border border-[#dfd3c3]/50 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0]; }}
                          />
                          <div>
                            <h4 className="font-serif font-bold text-xs text-[#3a271c]">{test.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-[#8b7665] font-medium">{test.role || 'Cliente'}</span>
                              <div className="flex text-amber-500 text-[9px]">
                                {'★'.repeat(test.rating || 5)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Call to action */}
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setActiveTab('write')}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] text-white border border-[#d4af37]/40 rounded-xl text-xs font-bold hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    Deixar Minha Avaliação
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="write"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto"
              >
                {isSubmitted ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-green-100 border border-green-300 text-green-700 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-green-800">Muito Obrigado!</h4>
                    <p className="text-xs text-[#5c4433] max-w-sm mx-auto">
                      Sua avaliação do atendimento humanizado da <strong>Ânima Zen</strong> foi registrada com sucesso e publicada em nosso espaço de acolhimento.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="p-4 bg-[#f5ede4]/60 border border-[#dfd3c3] rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-[#1c5a3b] uppercase tracking-wider flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-[#1c5a3b] text-[#1c5a3b]" /> Sua Opinião Importa
                      </span>
                      <p className="text-[11px] text-[#5c4433] leading-relaxed">
                        Seu relato ajuda outras pessoas a descobrirem os benefícios terapêuticos e o respeito profissional das nossas massagens.
                      </p>
                    </div>

                    {/* Star selection */}
                    <div className="space-y-1">
                      <label className="text-xs text-[#5c4433] font-semibold block">Sua Nota *</label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(null)}
                            className="p-1 transition-all hover:scale-110 cursor-pointer"
                          >
                            <Star 
                              className={`w-7 h-7 ${
                                star <= (hoveredRating ?? rating)
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-[#8b7665] ml-2 font-serif italic">
                          {rating === 5 ? 'Excelente!' : rating === 4 ? 'Muito bom!' : rating === 3 ? 'Bom' : rating === 2 ? 'Regular' : 'Ruim'}
                        </span>
                      </div>
                    </div>

                    {/* Name input */}
                    <div className="space-y-1">
                      <label className="text-xs text-[#5c4433] font-semibold block">Seu Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ana Souza"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#dfd3c3] rounded-lg text-sm outline-none focus:border-[#1c5a3b] text-[#3a271c]"
                      />
                    </div>

                    {/* Role / Label input */}
                    <div className="space-y-1">
                      <label className="text-xs text-[#5c4433] font-semibold block">Quem você é? (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Cliente Mensal, Paciente, etc."
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#dfd3c3] rounded-lg text-sm outline-none focus:border-[#1c5a3b] text-[#3a271c]"
                      />
                    </div>

                    {/* Avatar select */}
                    <div className="space-y-1">
                      <label className="text-xs text-[#5c4433] font-semibold block">Selecione um Avatar</label>
                      <div className="flex items-center gap-3 pt-1">
                        {PRESET_AVATARS.map((avatar, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                              selectedAvatar === avatar 
                                ? 'border-[#1c5a3b] scale-110 shadow-md shadow-black/20' 
                                : 'border-[#dfd3c3] opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review text area */}
                    <div className="space-y-1">
                      <label className="text-xs text-[#5c4433] font-semibold block">Sua Mensagem / Relato *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Conte como foi sua sessão de massagem, o ambiente, o acolhimento..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#dfd3c3] rounded-lg text-sm outline-none focus:border-[#1c5a3b] text-[#3a271c] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!name.trim() || !content.trim()}
                      className="w-full py-3 bg-[#1b4332] text-white hover:bg-[#143f29] rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Enviar Avaliação Pública
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info banner */}
        <div className="p-4 border-t border-[#dfd3c3] bg-white text-[10px] text-[#8b7665] text-center uppercase tracking-wider font-semibold shrink-0">
          🛡️ Espaço de transparência e acolhimento humanizado.
        </div>
      </motion.div>
    </div>
  );
}
