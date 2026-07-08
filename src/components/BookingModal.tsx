import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, Clock, User, Phone, FileText, CheckCircle, 
  Copy, ChevronLeft, ChevronRight, Sparkles, CreditCard, Loader2,
  Printer, Share2
} from 'lucide-react';
import { Service, Booking } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  initialSelectedServiceId?: string;
  onBookingCreated: (newBooking?: Booking) => void;
  pixKey: string;
  bookings: Booking[];
}

const TIME_SLOTS = [
  "08:00", "09:30", "11:00", "12:30", 
  "14:00", "15:30", "17:00", "18:30"
];

export default function BookingModal({
  isOpen,
  onClose,
  services,
  initialSelectedServiceId,
  onBookingCreated,
  pixKey,
  bookings
}: BookingModalProps) {
  // Navigation steps: 'service' | 'datetime' | 'form' | 'pix' | 'success'
  const [step, setStep] = useState<'service' | 'datetime' | 'form' | 'pix' | 'success'>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Date & Time states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Form states
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [observations, setObservations] = useState('');
  
  // Existing bookings to check for conflict
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  
  // UI helper states
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Set initial service
  useEffect(() => {
    if (initialSelectedServiceId) {
      const found = services.find(s => s.id === initialSelectedServiceId);
      if (found) {
        setSelectedService(found);
        setStep('datetime'); // skip service selection step if clicked direct from catalog
      }
    } else {
      setSelectedService(null);
      setStep('service');
    }
  }, [initialSelectedServiceId, services, isOpen]);

  // Load bookings for conflict validation, synced from parent state
  useEffect(() => {
    if (bookings) {
      setExistingBookings(bookings);
    }
  }, [bookings, isOpen]);

  if (!isOpen) return null;

  // Format date helper: YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Check if a time slot is booked on selected date
  const isTimeSlotBooked = (time: string) => {
    if (!selectedDate) return false;
    const dateStr = formatDateString(selectedDate);
    return existingBookings.some(b => b.date === dateStr && b.time === time && b.status !== 'cancelled');
  };

  // Calendar calculations
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Fill previous month days (blank spots to align start day of week)
    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday, etc.
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return { days, startDayOfWeek };
  };

  const { days } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    // Don't go past current month
    const now = new Date();
    if (prev.getMonth() >= now.getMonth() || prev.getFullYear() > now.getFullYear()) {
      setCurrentMonth(prev);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateInPast(date)) return;
    // Don't allow clicking days from adjacent months
    if (date.getMonth() !== currentMonth.getMonth()) return;
    setSelectedDate(date);
    setSelectedTime(''); // reset time when date changes
  };

  // WhatsApp formatter
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
      // (XX) XXXXX-XXXX
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      // (XX) XXXX-XXXX
      value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      // (XX) XXX
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      // (XX
      value = `(${value}`;
    }
    setWhatsapp(value);
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBookingSubmit = () => {
    if (!selectedService || !selectedDate || !selectedTime || !name || !whatsapp) return;
    
    setIsSubmitting(true);
    
    // Simulate slight network delay
    setTimeout(() => {
      const newBooking: Booking = {
        id: `book-${Date.now()}`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        clientName: name,
        clientWhatsApp: whatsapp,
        date: formatDateString(selectedDate),
        time: selectedTime,
        observations: observations,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const updatedList = [newBooking, ...existingBookings];
      localStorage.setItem('anima_zen_bookings', JSON.stringify(updatedList));
      setExistingBookings(updatedList);
      setCreatedBooking(newBooking);
      
      setIsSubmitting(false);
      setStep('pix'); // Redirect to PIX pay screen next
    }, 1200);
  };

  const resetForm = () => {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime('');
    setName('');
    setWhatsapp('');
    setObservations('');
  };

  const formatPortugueseDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div id="booking-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl overflow-hidden bg-[#faf6f0] border border-[#dfd3c3] rounded-2xl shadow-2xl text-[#3a271c] max-h-[90vh] flex flex-col"
      >
        {/* Spa Background Layer with subtle overlay */}
        <div className="absolute inset-0 z-0 opacity-5 mix-blend-overlay pointer-events-none">
          <img 
            src="/src/assets/images/spa_background_1783303723602.jpg" 
            alt="Spa Background" 
            className="object-cover w-full h-full filter sepia-[20%] hue-rotate-15"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-[#dfd3c3]">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium tracking-wide text-[#1c5a3b] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1c5a3b]" />
              Agendar Momento Zen
            </h2>
            <p className="text-xs text-[#5c4433]">Cultive a paz em sua rotina</p>
          </div>
          <button 
            id="close-booking-modal-btn"
            onClick={onClose} 
            className="p-2 transition-all duration-200 rounded-full hover:bg-[#f5ede4] text-[#8b7665] hover:text-[#1c5a3b] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="relative z-10 w-full h-1 bg-[#ebdcd0]">
          <div 
            className="h-full bg-gradient-to-r from-[#1c5a3b] via-[#ebdcd0] to-[#1c5a3b] transition-all duration-300"
            style={{
              width: 
              step === 'service' ? '20%' : 
              step === 'datetime' ? '45%' : 
              step === 'form' ? '70%' : 
              step === 'pix' ? '90%' : '100%'
            }}
          />
        </div>

        {/* Scrollable Modal Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SERVICE SELECTION */}
            {step === 'service' && (
              <motion.div
                key="service-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="font-serif text-lg text-[#3a271c]">Qual experiência deseja vivenciar hoje?</h3>
                  <p className="text-xs text-[#5c4433]">Selecione um serviço ou combo de massoterapia</p>
                </div>

                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setStep('datetime');
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer ${
                        selectedService?.id === service.id 
                          ? 'bg-[#1b4332]/10 border-[#1c5a3b] shadow-sm text-[#1c5a3b]' 
                          : 'bg-white border-[#dfd3c3] hover:border-[#1c5a3b]/60 hover:bg-[#fcf9f6]'
                      }`}
                    >
                      <div className="space-y-1 md:max-w-[75%]">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded ${
                            service.category === 'combo' 
                              ? 'bg-[#d4af37]/10 text-[#b3912b] border border-[#d4af37]/20' 
                              : 'bg-[#1b4332]/10 text-[#1c5a3b] border border-[#1b4332]/20'
                          }`}>
                            {service.category === 'combo' ? 'Combo Especial' : 'Individual'}
                          </span>
                          <h4 className="font-serif font-bold text-[#3a271c] text-base">{service.name}</h4>
                        </div>
                        <p className="text-xs text-[#5c4433] line-clamp-2">{service.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 border-t border-[#dfd3c3]/40 md:border-0 pt-2 md:pt-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#5c4433]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{service.duration} min</span>
                        </div>
                        <span className="font-display text-base font-bold text-[#1c5a3b]">
                          R$ {service.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATE & TIME SELECTION */}
            {step === 'datetime' && (
              <motion.div
                key="datetime-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Back button */}
                <button
                  onClick={() => setStep('service')}
                  className="inline-flex items-center gap-2 text-xs text-[#5c4433] hover:text-[#1c5a3b] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar para Serviços
                </button>

                <div className="text-center">
                  <h3 className="font-serif text-lg text-[#3a271c]">Escolha o dia e horário</h3>
                  <p className="text-xs text-[#5c4433]">Atendemos de segunda a sábado com agendamento prévio</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Custom Calendar (Columns: 7) */}
                  <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-[#dfd3c3]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-serif text-sm font-semibold text-[#3a271c] capitalize">
                        {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={prevMonth}
                          className="p-1.5 rounded bg-[#faf6f0] hover:bg-[#ebdcd0]/40 text-[#8b7665] hover:text-[#3a271c] transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={nextMonth}
                          className="p-1.5 rounded bg-[#faf6f0] hover:bg-[#ebdcd0]/40 text-[#8b7665] hover:text-[#3a271c] transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <span key={day} className="text-[10px] uppercase tracking-wider text-[#5c4433] font-semibold">
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((date, idx) => {
                        const dateStr = formatDateString(date);
                        const isSelected = selectedDate ? formatDateString(selectedDate) === dateStr : false;
                        const isPast = isDateInPast(date);
                        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                        const isSunday = date.getDay() === 0;

                        let btnClass = "h-8 text-xs font-medium rounded transition-all duration-150 flex items-center justify-center ";
                        
                        if (!isCurrentMonth) {
                          btnClass += "text-transparent pointer-events-none";
                        } else if (isPast || isSunday) {
                          btnClass += "text-[#5c4433]/30 cursor-not-allowed bg-transparent";
                        } else if (isSelected) {
                          btnClass += "bg-[#1b4332] text-white border border-[#1b4332] shadow-md font-bold";
                        } else {
                          btnClass += "bg-[#faf6f0] text-[#3a271c] hover:bg-[#ebdcd0]/40 hover:text-[#1c5a3b] cursor-pointer";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={!isCurrentMonth || isPast || isSunday}
                            onClick={() => handleDateSelect(date)}
                            className={btnClass}
                          >
                            {isCurrentMonth ? date.getDate() : ''}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-[10px] text-[#5c4433] text-center">
                      * Domingos fechados. Agendamento disponível para dias futuros.
                    </div>
                  </div>

                  {/* Hour slots (Columns: 5) */}
                  <div className="lg:col-span-5 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5c4433] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1c5a3b]" /> Horários Disponíveis
                    </h4>
                    
                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {TIME_SLOTS.map((slot) => {
                          const booked = isTimeSlotBooked(slot);
                          return (
                            <button
                              key={slot}
                              disabled={booked}
                              onClick={() => setSelectedTime(slot)}
                              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 text-center cursor-pointer ${
                                booked
                                  ? 'bg-[#ebdcd0]/30 text-[#8b7665]/40 border-[#dfd3c3] line-through cursor-not-allowed'
                                  : selectedTime === slot
                                    ? 'bg-[#1b4332] text-white border-[#1b4332]'
                                    : 'bg-white text-[#3a271c] border-[#dfd3c3] hover:border-[#1c5a3b] hover:bg-[#fcf9f6]'
                              }`}
                            >
                              {slot} {booked && '(Indisponível)'}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-[200px] border border-dashed border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center p-4 text-center text-[#5c4433]">
                        <Calendar className="w-8 h-8 text-[#5c4433]/40 mb-2" />
                        <p className="text-xs">Por favor, selecione um dia no calendário ao lado para ver os horários livres.</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Next button */}
                <div className="pt-4 flex justify-end">
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep('form')}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] border border-[#1b4332] text-white rounded-xl text-sm font-semibold tracking-wide shadow-lg hover:shadow-[#1c5a3b]/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    Prosseguir <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DETAILS FORM */}
            {step === 'form' && (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Back button */}
                <button
                  onClick={() => setStep('datetime')}
                  className="inline-flex items-center gap-2 text-xs text-[#5c4433] hover:text-[#1c5a3b] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar para Data e Hora
                </button>

                <div className="text-center">
                  <h3 className="font-serif text-lg text-[#3a271c]">Seus Dados de Contato</h3>
                  <p className="text-xs text-[#5c4433]">Precisamos destes dados para confirmar seu agendamento humano</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4">
                  {/* Selected summary */}
                  <div className="p-3.5 bg-[#faf6f0] rounded-lg border border-[#dfd3c3]/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#5c4433]">Serviço Selecionado:</span>
                      <p className="font-serif text-sm font-bold text-[#1c5a3b] mt-0.5">{selectedService?.name}</p>
                    </div>
                    <div>
                      <span className="text-[#5c4433]">Horário Agendado:</span>
                      <p className="font-semibold text-[#3a271c] mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#1c5a3b]" />
                        {selectedDate && formatPortugueseDate(selectedDate)} às {selectedTime}
                      </p>
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5c4433] block">Seu Nome Completo *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-[#8b7665]" />
                      <input
                        type="text"
                        placeholder="Ex: Larissa Manoela"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg focus:border-[#1c5a3b] text-sm text-[#3a271c] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* WhatsApp field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5c4433] block">WhatsApp / Telefone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#8b7665]" />
                      <input
                        type="text"
                        placeholder="Ex: (85) 99634-1602"
                        required
                        value={whatsapp}
                        onChange={handleWhatsappChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg focus:border-[#1c5a3b] text-sm text-[#3a271c] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Observations field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5c4433] block">Observações Especiais (Opcional)</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-[#8b7665]" />
                      <textarea
                        placeholder="Ex: Alergia a algum óleo essencial, focos de tensão, gestação..."
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg focus:border-[#1c5a3b] text-sm text-[#3a271c] outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end">
                  <button
                    disabled={!name.trim() || whatsapp.length < 14 || isSubmitting}
                    onClick={handleBookingSubmit}
                    className="px-6 py-3 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] border border-[#1c5a3b] text-white font-bold rounded-xl text-sm tracking-wide shadow-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        Confirmar e Ir para Pagamento <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PIX PAYMENT (AS REQUESTED: PAY PIX BUTTON) */}
            {step === 'pix' && (
              <motion.div
                key="pix-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-center"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-[#1c5a3b]/10 rounded-full flex items-center justify-center mb-4 border border-[#1c5a3b]/30">
                    <CreditCard className="w-8 h-8 text-[#1c5a3b]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#1c5a3b]">Garantir Vaga via PIX</h3>
                  <p className="text-xs text-[#5c4433] max-w-sm mt-1">
                    Para confirmar o seu atendimento humanizado, efetue o pagamento do sinal de R$ 50,00 ou o valor total do serviço.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#dfd3c3] max-w-md mx-auto space-y-4">
                  <div className="border-b border-[#dfd3c3] pb-3 text-sm">
                    <div className="flex justify-between text-[#5c4433] mb-1">
                      <span>Serviço:</span>
                      <span className="font-semibold text-[#3a271c]">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between text-[#5c4433]">
                      <span>Valor Total:</span>
                      <span className="font-bold text-[#1c5a3b]">R$ {selectedService?.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* QR Code Simulation */}
                  <div className="bg-white p-3 rounded-xl inline-block shadow-inner mx-auto border border-[#dfd3c3]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020101021126430014BR.GOV.BCB.PIX0111${encodeURIComponent(pixKey)}520400005303986540550.005802BR5909Anima_Zen6009Fortaleza62070503***6304724A`}
                      alt="PIX QR Code" 
                      className="w-[140px] h-[140px] block"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Pix Copy Key field */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[11px] font-semibold text-[#5c4433]">Chave PIX (Celular / WhatsApp):</span>
                    <div className="flex items-center gap-2 bg-[#faf6f0] p-2.5 rounded-lg border border-[#dfd3c3]">
                      <span className="font-mono text-xs text-[#3a271c] flex-1">{pixKey}</span>
                      <button
                        onClick={copyPixKey}
                        className="px-3 py-1.5 bg-[#1c5a3b] text-white hover:bg-[#143f29] transition-colors rounded text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {isCopied ? 'Copiado!' : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#5c4433] leading-relaxed">
                    * Após pagar, encaminhe o comprovante para o WhatsApp <strong className="text-[#1c5a3b]">(85) 99634-1602</strong>. Seu agendamento fica pré-reservado até o envio.
                  </div>
                </div>

                {/* Finalize Button */}
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setStep('success')}
                    className="px-8 py-3 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] border border-[#1c5a3b] text-white font-bold rounded-xl text-sm tracking-wide shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    Já Efetuei o Pagamento
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS CONFIRMATION */}
            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-center py-4"
              >
                <div className="w-16 h-16 bg-[#1b4332]/10 rounded-full flex items-center justify-center mx-auto border border-[#1c5a3b] shadow-sm">
                  <CheckCircle className="w-9 h-9 text-[#1c5a3b]" />
                </div>

                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-display text-xl md:text-2xl font-bold text-[#1c5a3b]">Reserva Realizada!</h3>
                  <p className="text-xs text-[#5c4433]">
                    Parabéns, <strong>{name}</strong>! Seu agendamento de bem-estar na <strong>Ânima Zen</strong> foi registrado com sucesso.
                  </p>
                </div>

                {/* GORGEOUS ON-SCREEN RECEIPT CARD (VOUCHER STYLE) */}
                <div className="bg-white border-2 border-dashed border-[#dfd3c3] rounded-2xl p-6 text-left max-w-sm mx-auto shadow-md relative overflow-hidden">
                  {/* Decorative gold aesthetic badges */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center border border-[#d4af37]/20 rotate-12">
                    <Sparkles className="w-5 h-5 text-[#d4af37]/70" />
                  </div>

                  <div className="text-center pb-4 border-b border-dashed border-[#dfd3c3]">
                    <span className="font-display text-xs tracking-widest text-[#3a271c] font-bold uppercase">Ânima Zen</span>
                    <p className="text-[9px] text-[#8b7665] uppercase tracking-wider mt-0.5">Recibo de Agendamento</p>
                  </div>

                  <div className="space-y-2.5 pt-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8b7665]">Controle:</span>
                      <span className="font-mono font-bold text-[#3a271c]">{createdBooking?.id || 'book-pending'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b7665]">Paciente:</span>
                      <span className="font-semibold text-[#3a271c]">{name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b7665]">WhatsApp:</span>
                      <span className="font-mono text-[#3a271c]">{whatsapp}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b7665]">Tratamento:</span>
                      <span className="font-semibold text-[#1c5a3b]">{selectedService?.name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b7665]">Data & Hora:</span>
                      <span className="font-semibold text-[#3a271c]">
                        {selectedDate && selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-dashed border-[#dfd3c3]/60 pt-2">
                      <span className="text-[#8b7665] font-bold">Valor do Serviço:</span>
                      <span className="font-bold text-sm text-[#1c5a3b]">R$ {selectedService?.price.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b7665]">Forma Pgto:</span>
                      <span className="font-semibold text-[#3a271c]">PIX</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b7665]">Sinal / Reserva:</span>
                      <span className="font-semibold text-[#3a271c]">Aguardando Validação</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-[#8b7665] leading-relaxed text-center mt-4 pt-3 border-t border-dashed border-[#dfd3c3] italic">
                    "Um refúgio para o seu corpo, mente e alma."
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center max-w-sm mx-auto">
                  {/* Copy Receipt Text Button */}
                  <button
                    onClick={() => {
                      const text = `ÂNIMA ZEN RECIBO\nCódigo: ${createdBooking?.id || ''}\nCliente: ${name}\nWhatsApp: ${whatsapp}\nServiço: ${selectedService?.name}\nData: ${selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}\nHorário: ${selectedTime}\nValor: R$ ${selectedService?.price.toFixed(2)}\nStatus: Aguardando PIX`;
                      navigator.clipboard.writeText(text);
                      alert('Recibo copiado para a área de transferência!');
                    }}
                    className="w-full py-2 border border-[#dfd3c3] hover:bg-[#1b4332]/5 text-[#3a271c] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar Texto do Recibo
                  </button>

                  {/* Print Receipt Trigger */}
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full py-2 border border-[#dfd3c3] hover:bg-[#1b4332]/5 text-[#3a271c] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir Comprovante
                  </button>
                </div>

                {/* Actions Row */}
                <div className="pt-3 flex flex-col gap-2 max-w-sm mx-auto">
                  {/* WhatsApp redirect shortcut */}
                  <a
                    href={`https://wa.me/5585996341602?text=Ol%C3%A1%20%C3%82nima%20Zen!%20Acabei%20de%20efetuar%20o%20pagamento%20e%20agendamento%20pelo%20site.%0A%0A%F0%9F%93%84%20*COMPROVANTE%20DE%20AGENDAMENTO*%0A---------------------------------------%0A%E2%80%A2%20*C%C3%B3digo:*%20${createdBooking?.id || ''}%0A%E2%80%A2%20*Cliente:*%20${encodeURIComponent(name)}%0A%E2%80%A2%20*Servi%C3%A7o:*%20${encodeURIComponent(selectedService?.name || '')}%0A%E2%80%A2%20*Valor:*%20R$%20${selectedService?.price.toFixed(2)}%0A%E2%80%A2%20*Data:*%20${selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}%0A%E2%80%A2%20*Hor%C3%A1rio:*%20${selectedTime}%0A---------------------------------------%0A*Status:*%20Aguardando%20valida%C3%A7%C3%A3o%20do%20PIX.%20Segue%20o%20comprovante%20da%20transa%C3%A7%C3%A3o%20em%20anexo!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#2d9e6b] text-white rounded-xl text-xs font-bold tracking-wide hover:bg-[#25855a] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    Enviar Comprovante via WhatsApp
                  </a>

                  <button
                    onClick={() => {
                      if (createdBooking) {
                        onBookingCreated(createdBooking);
                      } else {
                        onBookingCreated();
                      }
                      resetForm();
                      onClose();
                    }}
                    className="w-full py-2.5 bg-[#1b4332] text-white hover:bg-[#143f29] rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer"
                  >
                    Concluir Agendamento
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
