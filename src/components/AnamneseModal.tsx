import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ChevronRight, ChevronLeft, CheckCircle, Heart, ShieldAlert, HeartPulse, Send } from 'lucide-react';

interface AnamneseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneClinica: string;
}

export default function AnamneseModal({ isOpen, onClose, phoneClinica }: AnamneseModalProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    profession: '',
    stressLevel: '5',
    sleepsWell: 'sim',
    exercise: 'nao',
    heartProblem: 'nao',
    isPregnant: 'nao',
    recentFracture: 'nao',
    highPressure: 'nao',
    essentialOilAllergy: 'nao',
    chronicPainArea: '',
    consent: false,
    signature: ''
  });

  // Pre-populate with previous anamnese from localStorage if exists
  useEffect(() => {
    const stored = localStorage.getItem('anima_zen_anamnese');
    if (stored) {
      try {
        setFormData(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    // Validate inputs
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.age) {
        alert('Por favor, preencha todos os campos obrigatórios do Passo 1.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent || !formData.signature) {
      alert('Por favor, declare seu consentimento e digite sua assinatura digital para finalizar.');
      return;
    }

    setSubmitting(true);
    
    // Save locally
    localStorage.setItem('anima_zen_anamnese', JSON.stringify(formData));
    localStorage.setItem('anima_zen_has_anamnese', 'true');

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  // Generate WhatsApp Summary Link
  const handleSendToWhatsApp = () => {
    const summary = `*FICHA DE ANAMNESE - ÂNIMA ZEN*\n\n` +
      `*1. Informações Pessoais*\n` +
      `• Nome: ${formData.name}\n` +
      `• Idade: ${formData.age} anos\n` +
      `• Contato: ${formData.phone}\n` +
      `• Profissão: ${formData.profession || 'Não informada'}\n\n` +
      `*2. Hábitos e Estresse*\n` +
      `• Nível de Estresse: ${formData.stressLevel}/10\n` +
      `• Dorme Bem? ${formData.sleepsWell.toUpperCase()}\n` +
      `• Pratica Exercícios? ${formData.exercise.toUpperCase()}\n\n` +
      `*3. Triagem Clínica / Contraindicações*\n` +
      `• Cardiopata/Marcapasso? ${formData.heartProblem.toUpperCase()}\n` +
      `• Gestante? ${formData.isPregnant.toUpperCase()}\n` +
      `• Fraturas/Cirurgia recente? ${formData.recentFracture.toUpperCase()}\n` +
      `• Hipertensão? ${formData.highPressure.toUpperCase()}\n` +
      `• Alergia a óleos? ${formData.essentialOilAllergy.toUpperCase()}\n` +
      `• Áreas de Dor Crônica: ${formData.chronicPainArea || 'Nenhuma'}\n\n` +
      `*4. Consentimento*\n` +
      `• Assinatura Digital: ${formData.signature}\n` +
      `• Declaro consentimento de saúde para massoterapia integrativa.`;

    const cleanPhone = phoneClinica.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="anamnese-modal-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-[#faf6f0] border border-[#dfd3c3] rounded-2xl max-w-lg w-full relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Decorative spa bar */}
        <div className="h-1.5 bg-[#1c5a3b]" />

        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#dfd3c3] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#1c5a3b]" />
            <div>
              <h3 className="font-serif text-base md:text-lg font-bold text-[#3a271c]">Ficha de Anamnese Digital</h3>
              <p className="text-[10px] text-[#5c4433] uppercase tracking-wider">Estúdio de Saúde Ânima Zen</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#faf6f0] text-gray-400 hover:text-[#3a271c] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps progress indicator */}
        {!submitted && (
          <div className="bg-[#faf6f0] px-6 py-2 border-b border-[#dfd3c3]/50 flex justify-between items-center text-[10px] text-[#8b7665] font-semibold">
            <span>Passo {step} de 4</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step >= num ? 'w-4 bg-[#1c5a3b]' : 'w-1.5 bg-[#dfd3c3]'
                  }`} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-5"
              >
                <div className="w-16 h-16 bg-[#1c5a3b]/10 border border-[#1c5a3b]/30 rounded-full flex items-center justify-center mx-auto text-[#1c5a3b]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-lg font-bold text-[#3a271c]">Ficha Salva com Sucesso!</h4>
                  <p className="text-xs text-[#5c4433] leading-relaxed max-w-md mx-auto">
                    Suas respostas foram gravadas com segurança neste dispositivo. Para que Bia Lopes possa analisar seu histórico de saúde antes do seu agendamento, clique abaixo para enviar o resumo por WhatsApp!
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-2 max-w-sm mx-auto">
                  <button
                    onClick={handleSendToWhatsApp}
                    className="w-full py-3 bg-[#1b4332] hover:bg-[#143f29] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#d4af37]" /> Compartilhar Resumo no WhatsApp
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-white border border-[#dfd3c3] text-[#3a271c] hover:bg-[#faf6f0] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Fechar Janela
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* STEP 1: Dados Pessoais */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="p-3 bg-white border border-[#dfd3c3] rounded-xl text-xs text-[#5c4433] leading-relaxed">
                      💡 <strong>Por que preencher?</strong> A massoterapia trabalha com o corpo físico. Entender seus hábitos nos ajuda a realizar manobras seguras e potencializar os óleos essenciais no seu atendimento.
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433]">Nome Completo *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl px-3 py-2 text-xs md:text-sm text-[#3a271c] outline-none"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433]">WhatsApp / Celular *</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-white border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl px-3 py-2 text-xs text-[#3a271c] outline-none"
                          placeholder="ex: (85) 99634-1602"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433]">Idade *</label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          className="w-full bg-white border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl px-3 py-2 text-xs text-[#3a271c] outline-none"
                          placeholder="Sua idade"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433]">Profissão / Ocupação</label>
                      <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        className="w-full bg-white border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl px-3 py-2 text-xs text-[#3a271c] outline-none"
                        placeholder="Ex: Advogada, Engenheiro, Professora"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Hábitos e Estresse */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433] block">Como você avalia seu nível de ESTRESSE atual? (1 a 10)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          name="stressLevel"
                          min="1"
                          max="10"
                          value={formData.stressLevel}
                          onChange={handleChange}
                          className="flex-1 accent-[#1c5a3b]"
                        />
                        <span className="font-serif font-bold text-[#1c5a3b] bg-white border border-[#dfd3c3] w-9 h-9 flex items-center justify-center rounded-xl text-sm shadow-sm">{formData.stressLevel}</span>
                      </div>
                      <span className="text-[10px] text-[#8b7665] block">1 = Extremamente calmo, 10 = Sob estresse/exaustão severa.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433] block">Você dorme bem?</label>
                        <select
                          name="sleepsWell"
                          value={formData.sleepsWell}
                          onChange={handleChange}
                          className="w-full bg-white border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl px-3 py-2 text-xs text-[#3a271c] outline-none"
                        >
                          <option value="sim">Sim, tenho sono reparador</option>
                          <option value="nao">Não, sofro de insônia/sono leve</option>
                          <option value="as vezes">Às vezes / Inconstante</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433] block">Pratica exercícios?</label>
                        <select
                          name="exercise"
                          value={formData.exercise}
                          onChange={handleChange}
                          className="w-full bg-white border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl px-3 py-2 text-xs text-[#3a271c] outline-none"
                        >
                          <option value="sim">Sim, regularmente</option>
                          <option value="as vezes">Esporadicamente</option>
                          <option value="nao">Não, sou sedentário(a)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Triagem Médica e Dores */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-xl flex gap-2 text-[10.5px] text-[#8b7665] leading-normal shrink-0">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Aviso importante de contraindicação:</strong> Determinados quadros de saúde requerem cuidados diferenciados ou liberação médica formal. Responda com sinceridade.
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#dfd3c3]/60">
                        <span className="font-semibold text-[#3a271c]">Possui problemas cardíacos ou usa marcapasso?</span>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="heartProblem" value="sim" checked={formData.heartProblem === 'sim'} onChange={handleChange} className="accent-[#1c5a3b]" /> Sim
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="heartProblem" value="nao" checked={formData.heartProblem === 'nao'} onChange={handleChange} className="accent-[#1c5a3b]" /> Não
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#dfd3c3]/60">
                        <span className="font-semibold text-[#3a271c]">É gestante / Grávida?</span>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="isPregnant" value="sim" checked={formData.isPregnant === 'sim'} onChange={handleChange} className="accent-[#1c5a3b]" /> Sim
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="isPregnant" value="nao" checked={formData.isPregnant === 'nao'} onChange={handleChange} className="accent-[#1c5a3b]" /> Não
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#dfd3c3]/60">
                        <span className="font-semibold text-[#3a271c]">Teve fratura ou cirurgia de grande porte recente?</span>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="recentFracture" value="sim" checked={formData.recentFracture === 'sim'} onChange={handleChange} className="accent-[#1c5a3b]" /> Sim
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="recentFracture" value="nao" checked={formData.recentFracture === 'nao'} onChange={handleChange} className="accent-[#1c5a3b]" /> Não
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#dfd3c3]/60">
                        <span className="font-semibold text-[#3a271c]">Sofre de pressão alta (hipertensão) descontrolada?</span>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="highPressure" value="sim" checked={formData.highPressure === 'sim'} onChange={handleChange} className="accent-[#1c5a3b]" /> Sim
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="highPressure" value="nao" checked={formData.highPressure === 'nao'} onChange={handleChange} className="accent-[#1c5a3b]" /> Não
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#dfd3c3]/60">
                        <span className="font-semibold text-[#3a271c]">Tem alergia a óleos essenciais ou hidratantes?</span>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="essentialOilAllergy" value="sim" checked={formData.essentialOilAllergy === 'sim'} onChange={handleChange} className="accent-[#1c5a3b]" /> Sim
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="essentialOilAllergy" value="nao" checked={formData.essentialOilAllergy === 'nao'} onChange={handleChange} className="accent-[#1c5a3b]" /> Não
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433]">Descreva se possui alguma área de dor crônica ou queixa muscular:</label>
                      <textarea
                        name="chronicPainArea"
                        value={formData.chronicPainArea}
                        onChange={handleChange}
                        rows={2}
                        className="w-full bg-white border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl px-3 py-2 text-xs text-[#3a271c] outline-none resize-none"
                        placeholder="Ex: Dor constante na lombar, tensão extrema no pescoço/trapézio."
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Consentimento e Assinatura */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-white border border-[#dfd3c3] rounded-xl space-y-3">
                      <h4 className="font-serif font-bold text-xs text-[#1c5a3b] uppercase tracking-wider">Termo de Ciência Terapêutica</h4>
                      <p className="text-[10.5px] text-[#5c4433] leading-relaxed">
                        Declaro para os devidos fins que as informações aqui fornecidas são fiéis e condizentes com meu estado atual de saúde. Compreendo que a massoterapia oferecida pela Ânima Zen é uma terapia complementar que não substitui tratamentos médicos ou fisioterápicos formais de enfermidades graves, e comprometo-me a comunicar imediatamente qualquer desconforto ou alteração de saúde durante as sessões.
                      </p>

                      <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="consent"
                          checked={formData.consent}
                          onChange={handleChange}
                          className="mt-0.5 accent-[#1c5a3b]"
                          required
                        />
                        <span className="text-[10.5px] text-[#3a271c] font-semibold">Estou ciente e aceito os termos acima descritos. *</span>
                      </label>
                    </div>

                    <div className="space-y-1 bg-white p-3 border border-[#dfd3c3] rounded-xl">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#5c4433]">Assinatura do Paciente (Digite seu nome completo) *</label>
                      <input
                        type="text"
                        name="signature"
                        value={formData.signature}
                        onChange={handleChange}
                        className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl px-3 py-2 text-xs text-[#3a271c] outline-none font-serif italic text-center font-bold tracking-wide"
                        placeholder="Nome como assinatura digital"
                        required
                      />
                      <span className="text-[9px] text-[#8b7665] block text-center mt-1">Sua digitação equivale a uma assinatura eletrônica de preenchimento.</span>
                    </div>
                  </motion.div>
                )}

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-[#dfd3c3] flex justify-between gap-3 shrink-0">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-2 border border-[#dfd3c3] hover:bg-[#faf6f0] text-[#3a271c] font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2 bg-[#1b4332] hover:bg-[#143f29] text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow"
                    >
                      Avançar <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
                    >
                      {submitting ? 'Gravando...' : (
                        <>
                          Finalizar Ficha <Sparkles className="w-4 h-4 text-[#d4af37]" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
