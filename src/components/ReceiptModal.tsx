import React from 'react';
import { motion } from 'motion/react';
import { Check, Printer, X, Download, ShieldCheck, Heart, MapPin, Calendar, Clock, DollarSign, Sparkles } from 'lucide-react';
import { Booking } from '../types';

interface ReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function ReceiptModal({ booking, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#faf6f0] border-2 border-[#d4af37]/40 rounded-2xl max-w-lg w-full relative overflow-hidden shadow-2xl print:border-0 print:shadow-none print:bg-white print:max-w-none print:w-full print:p-0 print:absolute print:inset-0"
      >
        {/* Decorative spa bar */}
        <div className="h-2 bg-gradient-to-r from-[#1c5a3b] via-[#d4af37] to-[#143f29] print:hidden" />

        {/* Modal controls */}
        <div className="absolute top-4 right-4 flex gap-2 print:hidden z-10">
          <button
            onClick={handlePrint}
            className="p-1.5 bg-white border border-[#dfd3c3] text-[#1c5a3b] hover:bg-[#faf6f0] rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="Imprimir Comprovante"
          >
            <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Imprimir</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-white border border-[#dfd3c3] text-gray-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Content */}
        <div className="p-6 md:p-8 space-y-6 text-left">
          
          {/* Header */}
          <div className="text-center space-y-2 border-b border-[#dfd3c3] pb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#d4af37] mx-auto bg-white flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#1c5a3b] flex items-center justify-center">
                <span className="font-display font-extrabold text-xs text-[#d4af37]">ÂZ</span>
              </div>
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold tracking-widest text-[#3a271c] uppercase">Ânima Zen</h3>
            <p className="text-[10px] uppercase tracking-wider text-[#8b7665] font-semibold">Massoterapia & Bem-Estar Humanizado</p>
            <p className="text-[9px] text-[#5c4433] font-mono mt-1">Fortaleza - Ceará • Telefone: (85) 99634-1602</p>
          </div>

          {/* Title of Document */}
          <div className="bg-[#1b4332]/5 p-3 rounded-xl border border-[#1b4332]/10 text-center space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#1c5a3b] font-bold block">Documento de Confirmação</span>
            <h4 className="font-serif text-sm md:text-base font-bold text-[#3a271c]">Comprovante de Agendamento</h4>
            <span className="text-[10px] text-[#5c4433] font-mono block">Código do Registro: <strong className="font-mono text-[#3a271c]">#{booking.id}</strong></span>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <h5 className="text-[11px] font-bold text-[#1c5a3b] uppercase tracking-wider border-b border-[#dfd3c3]/50 pb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Detalhes do Atendimento
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8b7665] block">Paciente / Cliente:</span>
                <strong className="text-[#3a271c] text-sm">{booking.clientName}</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8b7665] block">WhatsApp / Contato:</span>
                <strong className="text-[#3a271c]">{booking.clientWhatsApp}</strong>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-[10px] text-[#8b7665] block">Serviço / Tratamento Contratado:</span>
                <strong className="text-[#3a271c] text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1c5a3b]" />
                  {booking.serviceName}
                </strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8b7665] block">Data Reservada:</span>
                <strong className="text-[#3a271c] flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#1c5a3b]" /> {booking.date}</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8b7665] block">Horário Reservado:</span>
                <strong className="text-[#3a271c] flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#1c5a3b]" /> {booking.time}</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8b7665] block">Terapeuta Responsável:</span>
                <strong className="text-[#1c5a3b]">Bia Lopes</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8b7665] block">Valor do Atendimento:</span>
                <strong className="text-sm text-[#1c5a3b] font-display font-extrabold flex items-center"><DollarSign className="w-3.5 h-3.5" /> R$ {booking.servicePrice.toFixed(2)}</strong>
              </div>
            </div>

            {booking.observations && (
              <div className="p-3 bg-white rounded-xl border border-[#dfd3c3] text-xs text-[#5c4433] italic">
                <strong className="text-[#3a271c] not-italic">Observações informadas:</strong> "{booking.observations}"
              </div>
            )}
          </div>

          {/* Ethics Philosophy Notice ("Não é Toque!") */}
          <div className="p-4 bg-emerald-50/50 border border-[#1c5a3b]/20 rounded-xl space-y-1.5">
            <h6 className="text-[11px] font-bold text-[#1c5a3b] flex items-center gap-1 uppercase tracking-wider leading-none">
              <ShieldCheck className="w-4 h-4 text-[#1c5a3b]" /> Filosofia "Não é Toque!"
            </h6>
            <p className="text-[10px] text-[#5c4433] leading-relaxed">
              A <strong>Ânima Zen</strong> declara formalmente que realiza exclusivamente <strong>massoterapia terapêutica, humanizada e bem-estar</strong> com propósitos estritamente de saúde física, relaxamento, alívio de contraturas e equilíbrio muscular. Seguimos diretrizes éticas inegociáveis.
            </p>
          </div>

          {/* Instuctions and cancellation policies */}
          <div className="space-y-1 text-[10px] text-[#8b7665] border-t border-[#dfd3c3]/50 pt-3">
            <p className="font-semibold text-[#3a271c]">Instruções para o dia do atendimento:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[#5c4433]">
              <li>Favor chegar ao local com <strong>10 minutos de antecedência</strong> para acomodação e escalda-pés cortesia.</li>
              <li>Em caso de necessidade de remarcação, comunique o estúdio pelo WhatsApp com pelo menos <strong>2 horas de antecedência</strong>.</li>
              <li>Apresente este comprovante digital ou impresso no momento da sua chegada.</li>
            </ul>
          </div>

          {/* Footer Signature placeholder */}
          <div className="text-center pt-4 border-t border-dashed border-[#dfd3c3] flex flex-col items-center">
            <span className="text-[9px] uppercase text-[#8b7665] tracking-widest mb-1.5">Assinatura Digital</span>
            <span className="font-serif italic text-sm text-[#1c5a3b] font-medium tracking-wide">Bia Lopes — Ânima Zen</span>
            <span className="text-[8px] text-[#a08e82] mt-0.5">Atendimento Registrado em {new Date(booking.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="bg-[#f5ede4] px-6 py-4 flex flex-col sm:flex-row justify-between gap-3 border-t border-[#dfd3c3] print:hidden">
          <span className="text-[10px] text-[#8b7665] self-center">Ficha de agendamento validada pelo sistema.</span>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1b4332] hover:bg-[#143f29] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Imprimir Comprovante
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#dfd3c3] text-[#3a271c] hover:bg-[#faf6f0] font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Fechar Recibo
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
