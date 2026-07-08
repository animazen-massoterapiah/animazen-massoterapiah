import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, KeyRound, LayoutDashboard, Calendar, Sparkles, BookOpen, 
  MessageSquare, ShieldAlert, Plus, Edit2, Trash2, Check, X, 
  Eye, EyeOff, Save, RefreshCw, LogOut, CheckCircle, HelpCircle, 
  Users, DollarSign, Clock, FileText, ChevronRight, Settings, Music, Heart, BarChart3, Star,
  MessageCircle, Bell
} from 'lucide-react';
import { Service, Banner, Curiosity, Testimonial, Booking, AdminUser, ClinicaSettings, AboutSettings } from '../types';
import ReceiptModal from './ReceiptModal';

interface AdminPanelProps {
  services: Service[];
  banners: Banner[];
  curiosities: Curiosity[];
  testimonials: Testimonial[];
  bookings: Booking[];
  adminUsers: AdminUser[];
  onDataUpdate: (keys: {
    services?: Service[];
    banners?: Banner[];
    curiosities?: Curiosity[];
    testimonials?: Testimonial[];
    bookings?: Booking[];
    adminUsers?: AdminUser[];
    pixKey?: string;
    clinicaSettings?: ClinicaSettings;
    aboutSettings?: AboutSettings;
  }) => void;
  onClose: () => void;
  pixKey: string;
  onPixKeyUpdate: (key: string) => void;
  clinicaSettings: ClinicaSettings;
  aboutSettings: AboutSettings;
}

export default function AdminPanel({
  services,
  banners,
  curiosities,
  testimonials,
  bookings,
  adminUsers,
  onDataUpdate,
  onClose,
  pixKey,
  onPixKeyUpdate,
  clinicaSettings,
  aboutSettings
}: AdminPanelProps) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState('');

  // Tab State: 'bookings' | 'services' | 'banners' | 'curiosities' | 'testimonials' | 'users' | 'settings' | 'about' | 'loyalty' | 'reports'
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'banners' | 'curiosities_testimonials' | 'users' | 'settings' | 'about' | 'loyalty' | 'reports'>('bookings');

  // Form Editing States (Generic modals or inline states)
  const [editingItem, setEditingItem] = useState<any>(null); // holds the item being edited
  const [editType, setEditType] = useState<'service' | 'banner' | 'curiosity' | 'testimonial' | 'user' | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Custom IFrame safe deletion states
  const [bookingIdToDelete, setBookingIdToDelete] = useState<string | null>(null);
  const [itemIdToDelete, setItemIdToDelete] = useState<{ id: string; type: 'service' | 'banner' | 'curiosity' | 'testimonial' | 'user' } | null>(null);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // Receipt Modal State
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<Booking | null>(null);

  // About Settings fields controlled states
  const [aboutPhotoUrl, setAboutPhotoUrl] = useState(aboutSettings?.photoUrl || '');

  // Loyalty Tab filter
  const [loyaltySearch, setLoyaltySearch] = useState('');

  // Controlled states for settings images
  const [logoUrl, setLogoUrl] = useState(clinicaSettings.logoUrl || '');
  const [spaceImageUrl, setSpaceImageUrl] = useState(clinicaSettings.spaceImageUrl || '');
  const [localPixKey, setLocalPixKey] = useState(pixKey);

  // Synchronize with external changes
  useEffect(() => {
    setLogoUrl(clinicaSettings.logoUrl || '');
    setSpaceImageUrl(clinicaSettings.spaceImageUrl || '');
    setLocalPixKey(pixKey);
    if (aboutSettings) {
      setAboutPhotoUrl(aboutSettings.photoUrl || '');
    }
  }, [clinicaSettings, pixKey, aboutSettings]);

  // Real-time audio chime alert and browser notifications for new bookings
  const prevBookingsCount = useRef(bookings.length);
  useEffect(() => {
    if (bookings.length > prevBookingsCount.current) {
      // Audio chime
      try {
        const chime = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav');
        chime.volume = 0.5;
        chime.play();
      } catch (err) {
        console.warn('Audio feedback blocked by browser policies:', err);
      }

      // Dynamic toast notification
      const latest = bookings[0];
      if (latest) {
        alert(`🔔 Novo Agendamento Recebido na Ânima Zen!\n\nCliente: ${latest.clientName}\nServiço: ${latest.serviceName}\nValor: R$ ${latest.servicePrice.toFixed(2)}\nData: ${latest.date.split('-').reverse().join('/')} às ${latest.time}`);
      }
    }
    prevBookingsCount.current = bookings.length;
  }, [bookings]);

  // Helper for uploading and converting image to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 3MB to keep data sync size within reasonable limits
    if (file.size > 3 * 1024 * 1024) {
      alert("A imagem selecionada é muito grande. Escolha uma imagem de até 3MB para garantir o bom funcionamento do salvamento.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Stats
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.servicePrice, 0);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = adminUsers.find(
      u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.passcode === passcodeInput
    );

    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setAuthError('');
    } else {
      setAuthError('Usuário ou senha incorreta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsernameInput('');
    setPasscodeInput('');
  };

  // --- ENTITY CRUD FUNCTIONS ---

  // Booking Status Toggle
  const handleUpdateBookingStatus = (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    onDataUpdate({ bookings: updated });
  };

  // Delete Booking
  const handleDeleteBooking = (id: string) => {
    setBookingIdToDelete(id);
  };

  const confirmDeleteBooking = () => {
    if (bookingIdToDelete) {
      const updated = bookings.filter(b => b.id !== bookingIdToDelete);
      onDataUpdate({ bookings: updated });
      setBookingIdToDelete(null);
    }
  };

  // Generic Save (Creates or Updates depending on isCreatingNew)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editType || !editingItem) return;

    if (editType === 'service') {
      const serviceObj = editingItem as Service;
      if (!serviceObj.name || serviceObj.price <= 0 || serviceObj.duration <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
      }
      if (isCreatingNew) {
        onDataUpdate({ services: [...services, { ...serviceObj, id: `service-${Date.now()}` }] });
      } else {
        onDataUpdate({ services: services.map(s => s.id === serviceObj.id ? serviceObj : s) });
      }
    } 
    
    else if (editType === 'banner') {
      const bannerObj = editingItem as Banner;
      if (!bannerObj.title || !bannerObj.imageUrl) {
        alert('Por favor, insira o título e o link da imagem.');
        return;
      }
      if (isCreatingNew) {
        onDataUpdate({ banners: [...banners, { ...bannerObj, id: `banner-${Date.now()}` }] });
      } else {
        onDataUpdate({ banners: banners.map(b => b.id === bannerObj.id ? bannerObj : b) });
      }
    } 
    
    else if (editType === 'curiosity') {
      const curioObj = editingItem as Curiosity;
      if (!curioObj.title || !curioObj.content) {
        alert('Por favor, preencha o título e o conteúdo.');
        return;
      }
      if (isCreatingNew) {
        onDataUpdate({ curiosities: [...curiosities, { ...curioObj, id: `curio-${Date.now()}` }] });
      } else {
        onDataUpdate({ curiosities: curiosities.map(c => c.id === curioObj.id ? curioObj : c) });
      }
    } 
    
    else if (editType === 'testimonial') {
      const testObj = editingItem as Testimonial;
      if (!testObj.name || !testObj.content) {
        alert('Por favor, insira o nome do cliente e a avaliação.');
        return;
      }
      if (isCreatingNew) {
        onDataUpdate({ testimonials: [...testimonials, { ...testObj, id: `test-${Date.now()}`, rating: testObj.rating || 5 }] });
      } else {
        onDataUpdate({ testimonials: testimonials.map(t => t.id === testObj.id ? testObj : t) });
      }
    } 
    
    else if (editType === 'user') {
      const userObj = editingItem as AdminUser;
      if (!userObj.username || !userObj.passcode) {
        alert('Por favor, insira o usuário e a senha de acesso.');
        return;
      }
      if (isCreatingNew) {
        onDataUpdate({ adminUsers: [...adminUsers, { ...userObj, id: `user-${Date.now()}` }] });
      } else {
        onDataUpdate({ adminUsers: adminUsers.map(u => u.id === userObj.id ? userObj : u) });
      }
    }

    // Reset State
    setEditingItem(null);
    setEditType(null);
    setIsCreatingNew(false);
  };

  // Delete Entity Helpers
  const handleDeleteItem = (id: string, type: 'service' | 'banner' | 'curiosity' | 'testimonial' | 'user') => {
    if (type === 'user' && adminUsers.length <= 1) {
      alert('Não é possível excluir o último usuário cadastrado do sistema.');
      return;
    }
    setItemIdToDelete({ id, type });
  };

  const confirmDeleteItem = () => {
    if (itemIdToDelete) {
      const { id, type } = itemIdToDelete;
      if (type === 'service') {
        onDataUpdate({ services: services.filter(s => s.id !== id) });
      } else if (type === 'banner') {
        onDataUpdate({ banners: banners.filter(b => b.id !== id) });
      } else if (type === 'curiosity') {
        onDataUpdate({ curiosities: curiosities.filter(c => c.id !== id) });
      } else if (type === 'testimonial') {
        onDataUpdate({ testimonials: testimonials.filter(t => t.id !== id) });
      } else if (type === 'user') {
        onDataUpdate({ adminUsers: adminUsers.filter(u => u.id !== id) });
      }
      setItemIdToDelete(null);
    }
  };

  // Start Create/Edit Form helpers
  const startEdit = (item: any, type: 'service' | 'banner' | 'curiosity' | 'testimonial' | 'user') => {
    setEditingItem({ ...item });
    setEditType(type);
    setIsCreatingNew(false);
  };

  const startCreate = (type: 'service' | 'banner' | 'curiosity' | 'testimonial' | 'user') => {
    setEditType(type);
    setIsCreatingNew(true);
    
    // Set default objects
    if (type === 'service') {
      setEditingItem({ name: '', description: '', duration: 60, price: 100, category: 'individual', imageUrl: '' });
    } else if (type === 'banner') {
      setEditingItem({ title: '', subtitle: '', imageUrl: '', active: true });
    } else if (type === 'curiosity') {
      setEditingItem({ title: '', content: '', icon: 'Sparkles' });
    } else if (type === 'testimonial') {
      setEditingItem({ name: '', role: 'Cliente', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop', rating: 5, content: '' });
    } else if (type === 'user') {
      setEditingItem({ username: '', role: 'collaborator', passcode: '' });
    }
  };

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#faf6f0] border-2 border-[#dfd3c3] rounded-2xl shadow-2xl text-[#3a271c] overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* NOT AUTHENTICATED: LOGIN VIEW */}
        {!isAuthenticated ? (
          <div className="relative p-6 md:p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 bg-[#1c5a3b]/10 rounded-full flex items-center justify-center border border-[#1c5a3b]/30">
              <Lock className="w-8 h-8 text-[#1c5a3b]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl md:text-3xl font-medium text-[#1c5a3b]">Painel Administrativo</h2>
              <p className="text-xs text-[#5c4433] max-w-md">
                Bem-vindo à área protegida da <strong>Ânima Zen</strong>. Insira suas credenciais para gerenciar a clínica.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-6 rounded-xl border border-[#dfd3c3] space-y-4 text-left shadow-lg">
              {authError && (
                <div className="p-3 bg-red-100/50 border border-red-300 rounded-lg text-xs text-red-800 text-center font-semibold">
                  {authError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-[#5c4433] font-semibold">Usuário</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-[#8b7665]" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Larissa"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#5c4433] font-semibold">Senha Numérica (Passcode)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8b7665]" />
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    required
                    placeholder="Ex: 1234"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b] transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 top-3 text-[#8b7665] hover:text-[#1c5a3b]"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] border border-[#1c5a3b] text-white font-bold rounded-lg text-sm hover:scale-[1.02] transition-all duration-150 shadow-md cursor-pointer"
              >
                Acessar Painel
              </button>
            </form>

            <button
              onClick={onClose}
              className="text-xs text-[#5c4433] hover:text-[#1c5a3b] underline transition-colors"
            >
              Voltar para o site institucional
            </button>
          </div>
        ) : (
          
          /* AUTHENTICATED: FULL PANEL */
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-[#dfd3c3] bg-[#f5ede4] gap-4">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-[#1c5a3b]" />
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-bold text-[#1c5a3b]">Painel de Controle Ânima Zen</h2>
                  <p className="text-xs text-[#5c4433]">
                    Olá, <strong className="text-[#3a271c]">{currentUser?.username}</strong> ({currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador'})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 border border-red-500/30 text-red-600 hover:bg-red-500/10 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sair do Painel
                </button>
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-[#1b4332] text-white border border-[#1b4332] rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#143f29] transition-colors cursor-pointer"
                >
                  Ver Site
                </button>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#dfd3c3] bg-[#faf6f0] divide-x divide-[#dfd3c3] text-center">
              <div className="p-4">
                <span className="text-[10px] text-[#5c4433] uppercase tracking-wider font-semibold">Total Agendamentos</span>
                <p className="font-display text-xl md:text-2xl font-bold text-[#3a271c]">{bookings.length}</p>
              </div>
              <div className="p-4">
                <span className="text-[10px] text-[#5c4433] uppercase tracking-wider font-semibold">Aguardando Confirmação</span>
                <p className="font-display text-xl md:text-2xl font-bold text-[#1c5a3b]">{pendingBookingsCount}</p>
              </div>
              <div className="p-4">
                <span className="text-[10px] text-[#5c4433] uppercase tracking-wider font-semibold">Confirmados</span>
                <p className="font-display text-xl md:text-2xl font-bold text-[#1c5a3b]">{confirmedBookingsCount}</p>
              </div>
              <div className="p-4">
                <span className="text-[10px] text-[#5c4433] uppercase tracking-wider font-semibold">Receita Estimada (Total)</span>
                <p className="font-display text-xl md:text-2xl font-bold text-[#1c5a3b]">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Main Workspace Layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Sidebar Menu */}
              <div className="w-full md:w-56 bg-[#f5ede4] border-b md:border-b-0 md:border-r border-[#dfd3c3] p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible shrink-0">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                      : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" /> Agendamentos ({pendingBookingsCount})
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                      : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" /> Serviços e Combos
                </button>
                <button
                  onClick={() => setActiveTab('banners')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                    activeTab === 'banners'
                      ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                      : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" /> Banners Promocionais
                </button>
                <button
                  onClick={() => setActiveTab('curiosities_testimonials')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                    activeTab === 'curiosities_testimonials'
                      ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                      : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" /> Textos e Depoimentos
                </button>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                        : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" /> Usuários e Acessos
                  </button>
                )}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                        : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" /> Configurações Gerais
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                    activeTab === 'about'
                      ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                      : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" /> Biografia Quem Sou
                </button>
                <button
                  onClick={() => setActiveTab('loyalty')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                    activeTab === 'loyalty'
                      ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                      : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                  }`}
                >
                  <Heart className="w-4 h-4 shrink-0 text-[#d4af37]" /> Painel de Fidelidade
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 md:w-full cursor-pointer ${
                    activeTab === 'reports'
                      ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-sm'
                      : 'text-[#5c4433] hover:text-[#1c5a3b] hover:bg-[#ebdcd0]/40'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" /> Relatórios de Faturamento
                </button>
              </div>
 
              {/* Workspace Content View */}
              <div className="flex-1 p-6 overflow-y-auto bg-[#faf6f0]">
                
                {/* MODAL: CREATE OR EDIT ELEMENT (Service, Banner, Curiosity, Testimonial, User) */}
                {editingItem && (
                  <div className="p-5 border border-[#dfd3c3] rounded-xl bg-white mb-6 space-y-4 shadow-xl">
                    <h3 className="font-serif text-base font-bold text-[#1c5a3b] border-b border-[#dfd3c3] pb-2">
                      {isCreatingNew ? 'Criar Novo Registro' : 'Editar Registro'}
                    </h3>

                    <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* SERVICE FORM FIELDS */}
                      {editType === 'service' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Nome do Serviço / Combo *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Massagem Relaxante Premium"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Preço (R$) *</label>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="120"
                              value={editingItem.price}
                              onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Duração (Minutos) *</label>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="60"
                              value={editingItem.duration}
                              onChange={(e) => setEditingItem({ ...editingItem, duration: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Categoria *</label>
                            <select
                              value={editingItem.category}
                              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            >
                              <option value="individual">Serviço Individual</option>
                              <option value="combo">Combo Especial</option>
                            </select>
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-xs text-[#5c4433] font-semibold block">Imagem do Serviço (Opcional)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] text-[#5c4433]/80 block">Opção A: Colar link da internet (URL)</span>
                                <input
                                  type="text"
                                  placeholder="Link HTTPS para ilustrar o card"
                                  value={editingItem.imageUrl}
                                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                                  className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-[#5c4433]/80 block">Opção B: Enviar foto do celular/computador</span>
                                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-xs text-[#3a271c] font-bold cursor-pointer transition-colors w-full h-[38px]">
                                  <Plus className="w-4 h-4 text-[#1c5a3b]" /> Selecionar Arquivo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, (base64) => setEditingItem({ ...editingItem, imageUrl: base64 }))}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                            {editingItem.imageUrl && (
                              <div className="mt-1.5 flex items-center gap-3 bg-[#1c5a3b]/5 p-2 rounded-lg border border-[#1c5a3b]/20">
                                <div className="w-12 h-12 rounded overflow-hidden border border-[#dfd3c3] bg-black shrink-0">
                                  <img src={editingItem.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[11px] text-[#1c5a3b] font-medium truncate flex-1">Imagem adicionada com sucesso!</span>
                                <button 
                                  type="button"
                                  onClick={() => setEditingItem({ ...editingItem, imageUrl: '' })}
                                  className="text-[10px] text-red-600 hover:text-red-700 font-bold px-2 py-1 bg-red-50 border border-red-200 rounded cursor-pointer"
                                >
                                  Remover
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Descrição Detalhada *</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Explique os benefícios, técnicas e as etapas deste serviço..."
                              value={editingItem.description}
                              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b] resize-none"
                            />
                          </div>
                        </>
                      )}

                      {/* BANNER FORM FIELDS */}
                      {editType === 'banner' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Título do Banner *</label>
                            <input
                              type="text"
                              required
                              placeholder="Combo Suprema Felicidade"
                              value={editingItem.title}
                              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Ativo (Visível) *</label>
                            <select
                              value={editingItem.active ? 'true' : 'false'}
                              onChange={(e) => setEditingItem({ ...editingItem, active: e.target.value === 'true' })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            >
                              <option value="true">Sim, exibir na Home</option>
                              <option value="false">Não, ocultar</option>
                            </select>
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Subtítulo / Descrição da Oferta *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: 15% de desconto de segunda a quarta"
                              value={editingItem.subtitle}
                              onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-xs text-[#5c4433] font-semibold block">Imagem de Banner *</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] text-[#5c4433]/80 block">Opção A: Colar link da internet (URL)</span>
                                <input
                                  type="text"
                                  placeholder="https://images.unsplash.com/..."
                                  value={editingItem.imageUrl}
                                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                                  className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-[#5c4433]/80 block">Opção B: Enviar foto do celular/computador</span>
                                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-xs text-[#3a271c] font-bold cursor-pointer transition-colors w-full h-[38px]">
                                  <Plus className="w-4 h-4 text-[#1c5a3b]" /> Selecionar Arquivo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, (base64) => setEditingItem({ ...editingItem, imageUrl: base64 }))}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                            {editingItem.imageUrl && (
                              <div className="mt-1.5 flex items-center gap-3 bg-[#1c5a3b]/5 p-2 rounded-lg border border-[#1c5a3b]/20">
                                <div className="w-12 h-12 rounded overflow-hidden border border-[#dfd3c3] bg-black shrink-0">
                                  <img src={editingItem.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[11px] text-[#1c5a3b] font-medium truncate flex-1">Imagem adicionada com sucesso!</span>
                                <button 
                                  type="button"
                                  onClick={() => setEditingItem({ ...editingItem, imageUrl: '' })}
                                  className="text-[10px] text-red-600 hover:text-red-700 font-bold px-2 py-1 bg-red-50 border border-red-200 rounded cursor-pointer"
                                >
                                  Remover
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* CURIOSITY FORM FIELDS */}
                      {editType === 'curiosity' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Título da Curiosidade *</label>
                            <input
                              type="text"
                              required
                              placeholder="Reduz o Estresse"
                              value={editingItem.title}
                              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Ícone representativo</label>
                            <select
                              value={editingItem.icon || 'Sparkles'}
                              onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            >
                              <option value="Sparkles">Estrelas (Sparkles)</option>
                              <option value="Moon">Lua (Melhora Sono)</option>
                              <option value="Shield">Escudo (Imunidade)</option>
                              <option value="Activity">Atividade (Dor muscular)</option>
                              <option value="Heart">Coração (Circulação)</option>
                            </select>
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Conteúdo Informativo *</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Escreva sobre os benefícios científicos ou curiosidade..."
                              value={editingItem.content}
                              onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b] resize-none"
                            />
                          </div>
                        </>
                      )}

                      {/* TESTIMONIAL FORM FIELDS */}
                      {editType === 'testimonial' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Nome do Cliente *</label>
                            <input
                              type="text"
                              required
                              placeholder="Mariana de Souza"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Função / Rótulo</label>
                            <input
                              type="text"
                              placeholder="Ex: Cliente Mensal"
                              value={editingItem.role}
                              onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Nota (1 a 5 estrelas) *</label>
                            <select
                              value={editingItem.rating || 5}
                              onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) || 5 })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ 5 Estrelas</option>
                              <option value="4">⭐⭐⭐⭐ 4 Estrelas</option>
                              <option value="3">⭐⭐⭐ 3 Estrelas</option>
                            </select>
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-xs text-[#5c4433] font-semibold block">Foto do Cliente (Avatar)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] text-[#5c4433]/80 block">Opção A: Colar link da internet (URL)</span>
                                <input
                                  type="text"
                                  placeholder="Link HTTPS para foto circular"
                                  value={editingItem.avatarUrl}
                                  onChange={(e) => setEditingItem({ ...editingItem, avatarUrl: e.target.value })}
                                  className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-[#5c4433]/80 block">Opção B: Enviar foto do celular/computador</span>
                                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-xs text-[#3a271c] font-bold cursor-pointer transition-colors w-full h-[38px]">
                                  <Plus className="w-4 h-4 text-[#1c5a3b]" /> Selecionar Arquivo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, (base64) => setEditingItem({ ...editingItem, avatarUrl: base64 }))}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                            {editingItem.avatarUrl && (
                              <div className="mt-1.5 flex items-center gap-3 bg-[#1c5a3b]/5 p-2 rounded-lg border border-[#1c5a3b]/20">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#dfd3c3] bg-[#faf6f0] shrink-0">
                                  <img src={editingItem.avatarUrl} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[11px] text-[#1c5a3b] font-medium truncate flex-1">Foto adicionada com sucesso!</span>
                                <button 
                                  type="button"
                                  onClick={() => setEditingItem({ ...editingItem, avatarUrl: '' })}
                                  className="text-[10px] text-red-600 hover:text-red-700 font-bold px-2 py-1 bg-red-50 border border-red-200 rounded cursor-pointer"
                                >
                                  Remover
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Mensagem / Depoimento *</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Depoimento elogiando o atendimento humanizado..."
                              value={editingItem.content}
                              onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b] resize-none"
                            />
                          </div>
                        </>
                      )}

                      {/* USER FORM FIELDS */}
                      {editType === 'user' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Nome de Usuário *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Larissa"
                              value={editingItem.username}
                              onChange={(e) => setEditingItem({ ...editingItem, username: e.target.value })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Perfil de Permissão *</label>
                            <select
                              value={editingItem.role}
                              onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value as 'admin' | 'collaborator' })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b]"
                            >
                              <option value="admin">Administrador Geral</option>
                              <option value="collaborator">Colaborador / Atendente</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#5c4433] font-semibold">Passcode Numérico (Senha) *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: 1234"
                              value={editingItem.passcode}
                              onChange={(e) => setEditingItem({ ...editingItem, passcode: e.target.value.replace(/\D/g, '') })}
                              className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-sm text-[#3a271c] outline-none focus:border-[#1c5a3b] font-mono"
                            />
                          </div>
                        </>
                      )}

                      {/* Form action buttons */}
                      <div className="col-span-1 md:col-span-2 flex justify-end gap-2 pt-2 border-t border-[#dfd3c3]">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(null);
                            setEditType(null);
                            setIsCreatingNew(false);
                          }}
                          className="px-4 py-2 bg-white border border-[#dfd3c3] text-[#5c4433] rounded-lg text-xs font-bold hover:text-[#1c5a3b] hover:bg-[#faf6f0] transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#1b4332] text-white rounded-lg text-xs font-bold hover:bg-[#143f29] transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Salvar Alterações
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 1: BOOKINGS LIST */}
                {activeTab === 'bookings' && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#1c5a3b]" /> Solicitações de Agendamento
                      </h3>
                      <p className="text-[11px] text-[#5c4433]">Exibindo {bookings.length} agendamentos</p>
                    </div>

                    {/* GLOBAL CONFIGURATION ZONE: PIX KEY */}
                    <div className="p-4 bg-white border border-[#dfd3c3] rounded-xl space-y-3 shadow-sm text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-[#1c5a3b] flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#1c5a3b]" /> Configuração de Pagamento (Chave PIX)
                          </h4>
                          <p className="text-[11px] text-[#5c4433]">
                            Esta é a chave PIX exibida aos clientes no rodapé do site e na tela de confirmação de agendamentos.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                        <input
                          type="text"
                          value={localPixKey}
                          onChange={(e) => setLocalPixKey(e.target.value)}
                          placeholder="Digite a chave PIX. Ex: 85996341602"
                          className="flex-1 px-3 py-2 bg-[#faf6f0] border border-[#dfd3c3] rounded-lg text-xs outline-none focus:border-[#1c5a3b] font-mono text-[#3a271c]"
                        />
                        <button
                          onClick={() => {
                            onPixKeyUpdate(localPixKey);
                            localStorage.setItem('anima_zen_pix_key', localPixKey);
                            alert('Chave PIX salva e atualizada com sucesso no aplicativo!');
                          }}
                          className="px-4 py-2 bg-[#1b4332] text-white rounded-lg text-xs font-bold hover:bg-[#143f29] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Salvar Chave
                        </button>
                      </div>
                    </div>

                    {/* Status filter tabs */}
                    <div className="flex flex-wrap gap-2 pb-2">
                      <button
                        onClick={() => setBookingFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bookingFilter === 'all'
                            ? 'bg-[#1b4332] text-white shadow-sm'
                            : 'bg-white text-[#5c4433] border border-[#dfd3c3] hover:bg-[#faf6f0]'
                        }`}
                      >
                        Todos ({bookings.length})
                      </button>
                      <button
                        onClick={() => setBookingFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bookingFilter === 'pending'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50/50'
                        }`}
                      >
                        Aguardando ({bookings.filter(b => b.status === 'pending' || !b.status).length})
                      </button>
                      <button
                        onClick={() => setBookingFilter('confirmed')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bookingFilter === 'confirmed'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50/50'
                        }`}
                      >
                        Confirmados ({bookings.filter(b => b.status === 'confirmed').length})
                      </button>
                      <button
                        onClick={() => setBookingFilter('cancelled')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bookingFilter === 'cancelled'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-white text-red-700 border border-red-200 hover:bg-red-50/50'
                        }`}
                      >
                        Cancelados ({bookings.filter(b => b.status === 'cancelled').length})
                      </button>
                    </div>

                    {(() => {
                      const filtered = bookings.filter(b => {
                        if (bookingFilter === 'all') return true;
                        if (bookingFilter === 'pending') return b.status === 'pending' || !b.status;
                        return b.status === bookingFilter;
                      });

                      return (
                        <div className="space-y-3">
                          {filtered.length === 0 ? (
                            <div className="p-12 border border-dashed border-[#dfd3c3] rounded-xl text-center text-[#5c4433] bg-white">
                              Nenhum agendamento encontrado neste filtro.
                            </div>
                          ) : (
                            filtered.map((booking) => (
                              <div 
                                key={booking.id}
                                className={`p-4 rounded-xl border transition-all duration-200 bg-white ${
                                  booking.status === 'confirmed' 
                                    ? 'border-[#1c5a3b]/40 shadow-sm' 
                                    : booking.status === 'cancelled'
                                      ? 'border-gray-200 opacity-60 bg-[#faf6f0]/50'
                                      : 'border-[#d4af37]/50 shadow-sm'
                                }`}
                              >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        booking.status === 'confirmed'
                                          ? 'bg-green-50 text-green-700 border border-green-200'
                                          : booking.status === 'cancelled'
                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}>
                                        {booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'cancelled' ? 'Cancelado' : 'Aguardando'}
                                      </span>
                                      <h4 className="font-serif text-base font-semibold text-[#3a271c]">{booking.clientName}</h4>
                                      <span className="text-xs text-[#5c4433] font-mono">#{booking.id}</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-[#5c4433]">
                                      <p className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#1c5a3b]" />
                                        <span>Agendamento: <strong className="text-[#3a271c]">{booking.date} às {booking.time}</strong></span>
                                      </p>
                                      <p className="flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-[#1c5a3b]" />
                                        <span>Serviço: <strong className="text-[#3a271c]">{booking.serviceName}</strong></span>
                                      </p>
                                      <p className="flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5 text-[#1c5a3b]" />
                                        <span>Valor: <strong className="text-[#3a271c]">R$ {booking.servicePrice.toFixed(2)}</strong></span>
                                      </p>
                                      <p className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-[#1c5a3b]" />
                                        <span>WhatsApp: <strong className="text-[#3a271c]">{booking.clientWhatsApp}</strong></span>
                                      </p>
                                    </div>

                                    {booking.observations && (
                                      <div className="p-2.5 bg-[#faf6f0] rounded-lg border border-[#dfd3c3] text-xs text-[#5c4433] italic">
                                        <strong>Obs:</strong> "{booking.observations}"
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-start">
                                    {/* Confirm Button */}
                                    {booking.status !== 'confirmed' && (
                                      <button
                                        onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                        className="p-1.5 bg-[#1b4332] text-white hover:bg-[#143f29] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                                        title="Confirmar Agendamento"
                                      >
                                        <Check className="w-3.5 h-3.5" /> Confirmar
                                      </button>
                                    )}

                                    {/* Automatic Receipt Button */}
                                    {booking.status === 'confirmed' && (
                                      <button
                                        onClick={() => setSelectedReceiptBooking(booking)}
                                        className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-amber-200 cursor-pointer shadow-sm"
                                        title="Emissão de Recibo / Comprovante"
                                      >
                                        <FileText className="w-3.5 h-3.5" /> Comprovante
                                      </button>
                                    )}

                                    {/* Cancel Button */}
                                    {booking.status !== 'cancelled' && (
                                      <button
                                        onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-red-200 cursor-pointer shadow-sm"
                                        title="Cancelar Agendamento"
                                      >
                                        <X className="w-3.5 h-3.5" /> Cancelar
                                      </button>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                      onClick={() => handleDeleteBooking(booking.id)}
                                      className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                                      title="Excluir Registro Permanentemente"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                                    </button>

                                    {/* Direct WhatsApp contact button */}
                                    <a
                                      href={`https://wa.me/${booking.clientWhatsApp.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(booking.clientName)}!%20Falo%20da%20%C3%82nima%20Zen.%20Gostaria%20de%20conversar%20sobre%20seu%20agendamento%20de%20${encodeURIComponent(booking.serviceName)}%20marcado%20para%20dia%20${booking.date}%20%C3%A0s%20${booking.time}.`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 bg-[#1c5a3b] hover:bg-[#143f29] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                                    >
                                      Contato
                                    </a>
                                  </div>
                                </div>

                            {/* WhatsApp Fast Automation Actions (User Request: Confirmation message and tomorrow reminder) */}
                            <div className="border-t border-[#dfd3c3]/60 pt-3 mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#faf6f0]/40 p-3 rounded-lg border border-[#dfd3c3]/30">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-[#8b7665] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Notificações Rápidas WhatsApp
                                </span>
                                <p className="text-[10px] text-[#5c4433] leading-tight">
                                  Envie mensagens prontas com um clique para agilizar o contato humanizado.
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {/* Button A: Confirm Payment & Session */}
                                <a
                                  href={`https://wa.me/${booking.clientWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Olá ${booking.clientName}, aqui é Ânima Zen! 🌸 Passando para confirmar que recebemos seu pagamento com sucesso e sua sessão de *${booking.serviceName}* está oficialmente confirmada para o dia *${booking.date.split('-').reverse().join('/')}* às *${booking.time}*. Estamos preparando um momento incrível de bem-estar e autocuidado para você. Até lá! 💆‍♀️✨`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    // Also automatically confirm on local dashboard for high-usability
                                    if (booking.status !== 'confirmed') {
                                      handleUpdateBookingStatus(booking.id, 'confirmed');
                                    }
                                  }}
                                  className="px-3 py-2 bg-[#2d9e6b] text-white hover:bg-[#238055] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                                  title="Enviar mensagem confirmando recebimento de pagamento e sessão agendada"
                                >
                                  <Check className="w-3.5 h-3.5" /> Confirmar Pagamento & Sessão
                                </a>

                                {/* Button B: Session Tomorrow Reminder */}
                                <a
                                  href={`https://wa.me/${booking.clientWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Olá ${booking.clientName}! 🌸 Aqui é a Ânima Zen passando para lembrar que amanhã é o dia do seu momento especial de autocuidado! ✨ de *${booking.serviceName}* às *${booking.time}*.\n\nPrepare-se para desacelerar e relaxar. Estamos te esperando com muito carinho! Não esqueça, combinado? Até amanhã! 🌿💆‍♀️`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-[#d4af37] text-[#3a271c] hover:bg-[#c29e2f] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                                  title="Enviar lembrete amigável avisando que amanhã é dia da sessão"
                                >
                                  <Bell className="w-3.5 h-3.5" /> Lembrar Sessão "É Amanhã!"
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

                {/* TAB 2: SERVICES & COMBOS */}
                {activeTab === 'services' && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#1c5a3b]" /> Catálogo de Serviços e Combos
                      </h3>
                      <button
                        onClick={() => startCreate('service')}
                        className="px-3.5 py-1.5 bg-[#1b4332] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-[#143f29] transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Novo Serviço/Combo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <div 
                          key={service.id} 
                          className="bg-white p-4 rounded-xl border border-[#dfd3c3] flex flex-col justify-between gap-3 shadow-sm"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded ${
                                service.category === 'combo' ? 'bg-[#d4af37]/10 text-amber-800 border border-amber-200' : 'bg-[#1b4332]/10 text-[#1c5a3b] border border-[#1c5a3b]/20'
                              }`}>
                                {service.category === 'combo' ? 'Combo Especial' : 'Individual'}
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => startEdit(service, 'service')}
                                  className="p-1 text-[#5c4433] hover:text-[#1c5a3b] transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(service.id, 'service')}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-serif text-base font-semibold text-[#3a271c]">{service.name}</h4>
                            <p className="text-xs text-[#5c4433] line-clamp-2">{service.description}</p>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#dfd3c3] pt-2 text-xs">
                            <span className="flex items-center gap-1 text-[#5c4433]">
                              <Clock className="w-3.5 h-3.5 text-[#1c5a3b]" /> {service.duration} min
                            </span>
                            <span className="font-serif font-bold text-[#1c5a3b] text-sm">
                              R$ {service.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: BANNERS PROMOTION */}
                {activeTab === 'banners' && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#1c5a3b]" /> Banners de Destaque
                      </h3>
                      <button
                        onClick={() => startCreate('banner')}
                        className="px-3.5 py-1.5 bg-[#1b4332] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-[#143f29] transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Novo Banner
                      </button>
                    </div>

                    <div className="space-y-4">
                      {banners.map((banner) => (
                        <div 
                          key={banner.id}
                          className={`p-4 rounded-xl border border-[#dfd3c3] bg-white flex flex-col md:flex-row items-center gap-4 shadow-sm ${
                            !banner.active ? 'opacity-50' : ''
                          }`}
                        >
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            className="w-full md:w-40 h-24 object-cover rounded-lg border border-[#dfd3c3] shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 space-y-1 w-full text-left">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                banner.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {banner.active ? 'Ativo' : 'Oculto'}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(banner, 'banner')}
                                  className="text-[#5c4433] hover:text-[#1c5a3b] transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(banner.id, 'banner')}
                                  className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-serif font-bold text-sm text-[#3a271c]">{banner.title}</h4>
                            <p className="text-xs text-[#5c4433] line-clamp-2">{banner.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: CURIOSITIES AND TESTIMONIALS */}
                {activeTab === 'curiosities_testimonials' && (
                  <div className="space-y-8 text-left">
                    
                    {/* CURIOSITIES */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-[#1c5a3b]" /> Benefícios e Curiosidades
                        </h3>
                        <button
                          onClick={() => startCreate('curiosity')}
                          className="px-3 py-1 bg-white border border-[#dfd3c3] text-[#1c5a3b] hover:bg-[#faf6f0] font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Curiosidade
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {curiosities.map((c) => (
                          <div key={c.id} className="bg-white p-4 rounded-xl border border-[#dfd3c3] flex flex-col justify-between gap-2 shadow-sm">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[#1c5a3b] font-bold text-xs">Ícone: {c.icon || 'Sparkles'}</span>
                                <div className="flex gap-2">
                                  <button onClick={() => startEdit(c, 'curiosity')} className="text-[#5c4433] hover:text-[#1c5a3b] cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeleteItem(c.id, 'curiosity')} className="text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                              <h4 className="font-serif font-bold text-sm text-[#3a271c]">{c.title}</h4>
                              <p className="text-xs text-[#5c4433] leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TESTIMONIALS */}
                    <div className="space-y-4 pt-6 border-t border-[#dfd3c3]">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-[#1c5a3b]" /> Depoimentos de Clientes Reais
                        </h3>
                        <button
                          onClick={() => startCreate('testimonial')}
                          className="px-3 py-1 bg-white border border-[#dfd3c3] text-[#1c5a3b] hover:bg-[#faf6f0] font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Depoimento
                        </button>
                      </div>

                      <div className="space-y-3">
                        {testimonials.map((t) => (
                          <div key={t.id} className="bg-white p-4 rounded-xl border border-[#dfd3c3] flex items-start gap-4 shadow-sm">
                            <img 
                              src={t.avatarUrl} 
                              alt={t.name} 
                              className="w-10 h-10 rounded-full object-cover border border-[#dfd3c3] shrink-0 bg-gray-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 space-y-1 text-left">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-serif font-bold text-sm text-[#3a271c]">{t.name}</h4>
                                  <span className="text-[10px] text-[#5c4433]">{t.role}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => startEdit(t, 'testimonial')} className="text-[#5c4433] hover:text-[#1c5a3b] cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeleteItem(t.id, 'testimonial')} className="text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                              <div className="text-amber-500 text-[10px]">
                                {'★'.repeat(t.rating)}
                              </div>
                              <p className="text-xs text-[#5c4433] italic leading-relaxed">"{t.content}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 5: USERS & PERMISSIONS */}
                {activeTab === 'users' && currentUser?.role === 'admin' && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#1c5a3b]" /> Usuários e Permissões do Sistema
                      </h3>
                      <button
                        onClick={() => startCreate('user')}
                        className="px-3.5 py-1.5 bg-[#1b4332] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-[#143f29] transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Novo Usuário
                      </button>
                    </div>

                    <div className="space-y-3">
                      {adminUsers.map((user) => (
                        <div key={user.id} className="bg-white p-4 rounded-xl border border-[#dfd3c3] flex items-center justify-between gap-4 shadow-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif font-bold text-sm text-[#3a271c]">{user.username}</h4>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                user.role === 'admin' ? 'bg-[#1b4332]/10 text-[#1c5a3b] border border-[#1c5a3b]/20' : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#5c4433] font-mono mt-1">Passcode de acesso: <strong className="text-[#3a271c] font-mono">{user.passcode}</strong></p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(user, 'user')}
                              className="p-1.5 hover:text-[#1c5a3b] text-[#5c4433] cursor-pointer"
                              title="Editar Usuário"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(user.id, 'user')}
                              disabled={adminUsers.length <= 1}
                              className="p-1.5 hover:text-red-600 text-[#5c4433] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: CLINIC SETTINGS */}
                {activeTab === 'settings' && currentUser?.role === 'admin' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#dfd3c3] pb-3 text-left">
                      <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#1c5a3b]" /> Configurações da Clínica & Identidade Visual
                      </h3>
                      <p className="text-xs text-[#5c4433] mt-1">
                        Gerencie as informações de contato, links de redes sociais, fotos do espaço, logomarca e chave de pagamento PIX.
                      </p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const updatedSettings: ClinicaSettings = {
                        address: formData.get('address') as string,
                        phone: formData.get('phone') as string,
                        instagramUrl: formData.get('instagramUrl') as string,
                        youtubeUrl: formData.get('youtubeUrl') as string,
                        logoUrl: formData.get('logoUrl') as string,
                        spaceImageUrl: formData.get('spaceImageUrl') as string,
                        spaceVideos: [formData.get('mainVideoUrl') as string],
                        musicUrl: formData.get('musicUrl') as string,
                        fontSans: formData.get('fontSans') as string,
                        fontSerif: formData.get('fontSerif') as string,
                        fontDisplay: formData.get('fontDisplay') as string,
                        primaryColor: formData.get('primaryColor') as string,
                        primaryHoverColor: formData.get('primaryHoverColor') as string,
                        bgColor: formData.get('bgColor') as string,
                        accentColor: formData.get('accentColor') as string,
                        textDarkColor: formData.get('textDarkColor') as string,
                        borderColor: formData.get('borderColor') as string
                      };
                       const updatedPix = formData.get('pixKey') as string;
                      onDataUpdate({ 
                        clinicaSettings: updatedSettings,
                        pixKey: updatedPix || undefined
                      });
                      
                      alert('Configurações salvas com sucesso e publicadas online!');
                    }} className="space-y-5 max-w-2xl text-left">
                      
                      {/* Identity Section */}
                      <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4 shadow-sm">
                        <h4 className="font-serif font-semibold text-sm text-[#3a271c] border-b border-[#dfd3c3] pb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#1c5a3b]" /> Identidade Visual & Fotos
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* LOGO */}
                          <div className="space-y-2">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block font-semibold">Logomarca da Clínica</label>
                            <div className="space-y-2">
                              <div>
                                <span className="text-[10px] text-[#5c4433]/80 block mb-1">Opção A: Colar link externo</span>
                                <input 
                                  type="text" 
                                  name="logoUrl"
                                  value={logoUrl}
                                  onChange={(e) => setLogoUrl(e.target.value)}
                                  className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-1.5 text-xs text-[#3a271c] outline-none"
                                  placeholder="Link ou caminho da imagem"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] text-[#5c4433]/80 block mb-1">Opção B: Enviar do computador</span>
                                <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#faf6f0] hover:bg-[#faf6f0]/80 border border-[#dfd3c3] rounded-lg text-xs text-[#3a271c] font-bold cursor-pointer transition-colors w-full h-[32px]">
                                  <Plus className="w-3.5 h-3.5 text-[#1c5a3b]" /> Selecionar Logomarca
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, (base64) => setLogoUrl(base64))}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                            <span className="text-[10px] text-[#5c4433] block mt-0.5">Sua logomarca principal exibida no topo e no rodapé.</span>
                          </div>

                          {/* SPACE IMAGE */}
                          <div className="space-y-2">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block font-semibold">Foto do Espaço / Clínica</label>
                            <div className="space-y-2">
                              <div>
                                <span className="text-[10px] text-[#5c4433]/80 block mb-1">Opção A: Colar link externo</span>
                                <input 
                                  type="text" 
                                  name="spaceImageUrl"
                                  value={spaceImageUrl}
                                  onChange={(e) => setSpaceImageUrl(e.target.value)}
                                  className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-1.5 text-xs text-[#3a271c] outline-none"
                                  placeholder="Link ou caminho da imagem"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] text-[#5c4433]/80 block mb-1">Opção B: Enviar do computador</span>
                                <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#faf6f0] hover:bg-[#faf6f0]/80 border border-[#dfd3c3] rounded-lg text-xs text-[#3a271c] font-bold cursor-pointer transition-colors w-full h-[32px]">
                                  <Plus className="w-3.5 h-3.5 text-[#1c5a3b]" /> Selecionar Foto
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, (base64) => setSpaceImageUrl(base64))}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                            <span className="text-[10px] text-[#5c4433] block mt-0.5">Essa foto aparecerá no banner de visita virtual da clínica.</span>
                          </div>
                        </div>

                        {/* Image Preview Row */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#5c4433] block">Pré-visualização do Logo:</span>
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-[#dfd3c3] bg-[#faf6f0] flex items-center justify-center">
                              <img src={logoUrl} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=100'; }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#5c4433] block">Pré-visualização do Espaço:</span>
                            <div className="w-24 h-16 rounded-lg overflow-hidden border border-[#dfd3c3] bg-[#faf6f0] flex items-center justify-center">
                              <img src={spaceImageUrl} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=200'; }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Section */}
                      <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4 shadow-sm">
                        <h4 className="font-serif font-semibold text-sm text-[#3a271c] border-b border-[#dfd3c3] pb-1.5 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-[#1c5a3b]" /> Informações de Contato & Localização
                        </h4>

                        <div className="space-y-1">
                          <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block">Endereço Completo</label>
                          <input 
                            type="text" 
                            name="address"
                            defaultValue={clinicaSettings.address}
                            className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block">WhatsApp (Somente números)</label>
                            <input 
                              type="text" 
                              name="phone"
                              defaultValue={clinicaSettings.phone}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none"
                              placeholder="ex: 85996341602"
                              required
                            />
                            <span className="text-[10px] text-[#5c4433] block mt-0.5">Usado para os botões "Tem Dúvidas?".</span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block">Chave PIX (Para reservas)</label>
                            <input 
                              type="text" 
                              name="pixKey"
                              defaultValue={pixKey}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none"
                              required
                            />
                            <span className="text-[10px] text-[#5c4433] block mt-0.5">Sua chave PIX para pagamentos na tela de confirmação.</span>
                          </div>
                        </div>
                      </div>

                      {/* Video & Social Section */}
                      <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4 shadow-sm">
                        <h4 className="font-serif font-semibold text-sm text-[#3a271c] border-b border-[#dfd3c3] pb-1.5 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-[#1c5a3b]" /> Links e Vídeos ("Não é Toque!")
                        </h4>

                        <div className="space-y-1">
                          <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block">Link do Instagram</label>
                          <input 
                            type="url" 
                            name="instagramUrl"
                            defaultValue={clinicaSettings.instagramUrl}
                            className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none"
                            placeholder="https://instagram.com/seu_perfil"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block">Canal ou Link do YouTube (Tema "Não é Toque!")</label>
                            <input 
                              type="url" 
                              name="youtubeUrl"
                              defaultValue={clinicaSettings.youtubeUrl}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none"
                              placeholder="https://youtube.com/@seu_canal"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block">Vídeo Principal de Demonstração (Link do YouTube)</label>
                            <input 
                              type="url" 
                              name="mainVideoUrl"
                              defaultValue={clinicaSettings.spaceVideos[0] || ''}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none"
                              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            />
                            <span className="text-[10px] text-[#5c4433] block mt-0.5">Insira o link de qualquer vídeo demonstrativo de suas massagens.</span>
                          </div>
                        </div>
                      </div>

                      {/* Música de Fundo / Playlist Section */}
                      <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4 shadow-sm">
                        <h4 className="font-serif font-semibold text-sm text-[#3a271c] border-b border-[#dfd3c3] pb-1.5 flex items-center gap-1.5">
                          <Music className="w-4 h-4 text-[#1c5a3b]" /> Música Ambiente do Aplicativo (YouTube ou Spotify)
                        </h4>

                        <div className="space-y-2">
                          <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block">Link da Música, Playlist ou Vídeo no YouTube/Spotify</label>
                          <input 
                            type="text" 
                            name="musicUrl"
                            defaultValue={clinicaSettings.musicUrl || ''}
                            className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none"
                            placeholder="Ex: https://www.youtube.com/watch?v=5qap5aO4i9A ou https://open.spotify.com/playlist/37i9dQZF1DWZqd5YICuS0g"
                          />
                          <p className="text-[10px] text-[#5c4433] leading-relaxed">
                            💡 <strong>Escolha a música que desejar!</strong> Cole um link do YouTube (como um vídeo de sons de chuva, lofi ou spa) ou link do Spotify (música ou playlist). Nós convertemos isso num player interativo para que seus clientes relaxem enquanto navegam pelo app!
                          </p>
                        </div>
                      </div>

                      {/* Personalização Visual (Cores & Fontes) */}
                      <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4 shadow-sm">
                        <h4 className="font-serif font-semibold text-sm text-[#3a271c] border-b border-[#dfd3c3] pb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#1c5a3b]" /> Personalização Visual (Cores & Fontes)
                        </h4>
                        <p className="text-[11px] text-[#5c4433] leading-relaxed">
                          Edite as cores e fontes de todo o portal. Modificações aqui são aplicadas instantaneamente em todas as páginas para combinar com a identidade visual desejada.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {/* Cor Primária */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Cor Primária (Verde)</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                name="primaryColor"
                                defaultValue={clinicaSettings.primaryColor || '#1b4332'}
                                className="w-8 h-8 rounded border border-[#dfd3c3] cursor-pointer"
                              />
                              <input 
                                type="text"
                                defaultValue={clinicaSettings.primaryColor || '#1b4332'}
                                onChange={(e) => {
                                  const sibling = e.target.previousElementSibling as HTMLInputElement;
                                  if (sibling) sibling.value = e.target.value;
                                }}
                                className="bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1 text-xs font-mono text-[#3a271c] w-20"
                              />
                            </div>
                          </div>

                          {/* Cor de Hover */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Cor Hover (Botões)</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                name="primaryHoverColor"
                                defaultValue={clinicaSettings.primaryHoverColor || '#143f29'}
                                className="w-8 h-8 rounded border border-[#dfd3c3] cursor-pointer"
                              />
                              <input 
                                type="text"
                                defaultValue={clinicaSettings.primaryHoverColor || '#143f29'}
                                onChange={(e) => {
                                  const sibling = e.target.previousElementSibling as HTMLInputElement;
                                  if (sibling) sibling.value = e.target.value;
                                }}
                                className="bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1 text-xs font-mono text-[#3a271c] w-20"
                              />
                            </div>
                          </div>

                          {/* Cor de Fundo */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Fundo (Santuário)</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                name="bgColor"
                                defaultValue={clinicaSettings.bgColor || '#fbfaf6'}
                                className="w-8 h-8 rounded border border-[#dfd3c3] cursor-pointer"
                              />
                              <input 
                                type="text"
                                defaultValue={clinicaSettings.bgColor || '#fbfaf6'}
                                onChange={(e) => {
                                  const sibling = e.target.previousElementSibling as HTMLInputElement;
                                  if (sibling) sibling.value = e.target.value;
                                }}
                                className="bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1 text-xs font-mono text-[#3a271c] w-20"
                              />
                            </div>
                          </div>

                          {/* Cor de Destaque */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Destaques (Gold)</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                name="accentColor"
                                defaultValue={clinicaSettings.accentColor || '#b5850b'}
                                className="w-8 h-8 rounded border border-[#dfd3c3] cursor-pointer"
                              />
                              <input 
                                type="text"
                                defaultValue={clinicaSettings.accentColor || '#b5850b'}
                                onChange={(e) => {
                                  const sibling = e.target.previousElementSibling as HTMLInputElement;
                                  if (sibling) sibling.value = e.target.value;
                                }}
                                className="bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1 text-xs font-mono text-[#3a271c] w-20"
                              />
                            </div>
                          </div>

                          {/* Cor de Texto Escuro */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Texto Principal (Escuro)</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                name="textDarkColor"
                                defaultValue={clinicaSettings.textDarkColor || '#3a271c'}
                                className="w-8 h-8 rounded border border-[#dfd3c3] cursor-pointer"
                              />
                              <input 
                                type="text"
                                defaultValue={clinicaSettings.textDarkColor || '#3a271c'}
                                onChange={(e) => {
                                  const sibling = e.target.previousElementSibling as HTMLInputElement;
                                  if (sibling) sibling.value = e.target.value;
                                }}
                                className="bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1 text-xs font-mono text-[#3a271c] w-20"
                              />
                            </div>
                          </div>

                          {/* Cor de Bordas */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Bordas & Divisórias</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                name="borderColor"
                                defaultValue={clinicaSettings.borderColor || '#dfd3c3'}
                                className="w-8 h-8 rounded border border-[#dfd3c3] cursor-pointer"
                              />
                              <input 
                                type="text"
                                defaultValue={clinicaSettings.borderColor || '#dfd3c3'}
                                onChange={(e) => {
                                  const sibling = e.target.previousElementSibling as HTMLInputElement;
                                  if (sibling) sibling.value = e.target.value;
                                }}
                                className="bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1 text-xs font-mono text-[#3a271c] w-20"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          {/* Fonte Títulos */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Fonte dos Títulos (Display)</label>
                            <select 
                              name="fontDisplay" 
                              defaultValue={clinicaSettings.fontDisplay || 'Cinzel'}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1.5 text-xs text-[#3a271c]"
                            >
                              <option value="Cinzel">Cinzel (Clássico SPA)</option>
                              <option value="Playfair Display">Playfair Display (Serifado Luxuoso)</option>
                              <option value="Space Grotesk">Space Grotesk (Moderno Tech)</option>
                              <option value="Outfit">Outfit (Contemporâneo)</option>
                              <option value="Marcellus">Marcellus (Romano Elegante)</option>
                            </select>
                          </div>

                          {/* Fonte Serif */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Fonte Elegante (Serif)</label>
                            <select 
                              name="fontSerif" 
                              defaultValue={clinicaSettings.fontSerif || 'Playfair Display'}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1.5 text-xs text-[#3a271c]"
                            >
                              <option value="Playfair Display">Playfair Display (Padrão)</option>
                              <option value="Cormorant Garamond">Cormorant Garamond (Elegância Extrema)</option>
                              <option value="Lora">Lora (Leitura Serena)</option>
                              <option value="Merriweather">Merriweather (Robusta)</option>
                            </select>
                          </div>

                          {/* Fonte Geral */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#5c4433] uppercase block font-semibold">Fonte Geral (Textos)</label>
                            <select 
                              name="fontSans" 
                              defaultValue={clinicaSettings.fontSans || 'Inter'}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] rounded px-2 py-1.5 text-xs text-[#3a271c]"
                            >
                              <option value="Inter">Inter (Padrão Clean)</option>
                              <option value="Roboto">Roboto (Limpo)</option>
                              <option value="Montserrat">Montserrat (Geométrico)</option>
                              <option value="Outfit">Outfit (Suave)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="submit" 
                          className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#143f29] border border-[#1c5a3b]/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4 text-white" /> Salvar Configurações Online
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 7: EDIT BIOGRAPHY (QUEM SOU) */}
                {activeTab === 'about' && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#dfd3c3] pb-3">
                      <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#1c5a3b]" /> Editar Biografia "Quem Sou" (Bia Lopes)
                      </h3>
                      <p className="text-xs text-[#5c4433] mt-1">
                        Esta biografia é exibida de forma luxuosa aos clientes no portal. Personalize as conquistas, formação e história da terapeuta.
                      </p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fData = new FormData(e.currentTarget);
                      const updatedAbout: AboutSettings = {
                        photoUrl: aboutPhotoUrl,
                        history: fData.get('history') as string,
                        education: fData.get('education') as string,
                        certificates: fData.get('certificates') as string,
                        specialties: fData.get('specialties') as string,
                        mission: fData.get('mission') as string,
                        values: fData.get('values') as string,
                      };
                      onDataUpdate({ aboutSettings: updatedAbout });
                      alert('Biografia do Quem Sou atualizada e publicada no site com sucesso!');
                    }} className="space-y-5 max-w-3xl">
                      
                      <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4 shadow-sm">
                        <h4 className="font-serif font-semibold text-sm text-[#3a271c] border-b border-[#dfd3c3] pb-1.5">
                          Foto Profissional
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                          <div className="space-y-2">
                            <div>
                              <span className="text-[10px] text-[#5c4433] block mb-1">Opção A: Colar URL externa de foto</span>
                              <input 
                                type="text"
                                value={aboutPhotoUrl}
                                onChange={(e) => setAboutPhotoUrl(e.target.value)}
                                className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-1.5 text-xs text-[#3a271c] outline-none"
                                placeholder="Link da foto no Unsplash ou servidor"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-[#5c4433] block mb-1">Opção B: Enviar foto do computador</span>
                              <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#faf6f0] hover:bg-[#faf6f0]/80 border border-[#dfd3c3] rounded-lg text-xs text-[#3a271c] font-bold cursor-pointer transition-colors w-full h-[32px]">
                                <Plus className="w-3.5 h-3.5 text-[#1c5a3b]" /> Selecionar Foto
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, (base64) => setAboutPhotoUrl(base64))}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 bg-[#faf6f0] p-3 rounded-xl border border-[#dfd3c3] items-center">
                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#d4af37]/40 bg-white shadow shrink-0">
                              <img src={aboutPhotoUrl} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200'; }} />
                            </div>
                            <span className="text-[10px] text-[#8b7665] leading-normal">
                              Essa foto representa Bia Lopes na seção <strong>"Quem Sou"</strong> do aplicativo institucional.
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4 shadow-sm">
                        <h4 className="font-serif font-semibold text-sm text-[#3a271c] border-b border-[#dfd3c3] pb-1.5">
                          História & Formação
                        </h4>

                        <div className="space-y-1">
                          <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block font-semibold">Nossa História / Sobre Mim</label>
                          <textarea 
                            name="history"
                            defaultValue={aboutSettings?.history}
                            rows={4}
                            className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none resize-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block font-semibold">Formação Profissional</label>
                            <textarea 
                              name="education"
                              defaultValue={aboutSettings?.education}
                              rows={3}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none resize-none"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block font-semibold">Certificados Acadêmicos</label>
                            <textarea 
                              name="certificates"
                              defaultValue={aboutSettings?.certificates}
                              rows={3}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none resize-none"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-[#dfd3c3] space-y-4 shadow-sm">
                        <h4 className="font-serif font-semibold text-sm text-[#3a271c] border-b border-[#dfd3c3] pb-1.5">
                          Especializações, Missão e Valores
                        </h4>

                        <div className="space-y-1">
                          <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block font-semibold">Especializações em Destaque</label>
                          <textarea 
                            name="specialties"
                            defaultValue={aboutSettings?.specialties}
                            rows={2}
                            className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none resize-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block font-semibold">Missão da Ânima Zen</label>
                            <textarea 
                              name="mission"
                              defaultValue={aboutSettings?.mission}
                              rows={2}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none resize-none"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-[#5c4433] uppercase tracking-wider block font-semibold">Valores Fundamentais</label>
                            <textarea 
                              name="values"
                              defaultValue={aboutSettings?.values}
                              rows={2}
                              className="w-full bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-lg px-3 py-2 text-xs text-[#3a271c] outline-none resize-none"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button 
                          type="submit" 
                          className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#143f29] border border-[#1c5a3b]/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4 text-white" /> Atualizar Informações Biográficas
                        </button>
                      </div>

                    </form>
                  </div>
                )}

                {/* TAB 8: LOYALTY CARD MANAGER */}
                {activeTab === 'loyalty' && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#dfd3c3] pb-3">
                      <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                        <Heart className="w-5 h-5 text-[#1c5a3b]" /> Programa de Fidelidade & Histórico de Clientes
                      </h3>
                      <p className="text-xs text-[#5c4433] mt-1">
                        Consulte o progresso de selos acumulados pelos clientes baseado em suas sessões <strong>confirmadas</strong> (A cada 10 sessões de massagem, eles ganham 1 sessão relaxante grátis!).
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#dfd3c3] shadow-sm flex flex-col sm:flex-row gap-3 items-center">
                      <div className="relative flex-1 w-full">
                        <input
                          type="text"
                          placeholder="Buscar cliente por telefone WhatsApp (ex: 8599634...)"
                          value={loyaltySearch}
                          onChange={(e) => setLoyaltySearch(e.target.value)}
                          className="w-full pl-3 pr-4 py-2 bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] rounded-xl text-xs text-[#3a271c] outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-[#8b7665] uppercase font-bold shrink-0">Buscando na base de dados</span>
                    </div>

                    {/* Group bookings by phone */}
                    <div className="space-y-4">
                      {(() => {
                        const uniquePhones = Array.from(new Set(bookings.map(b => b.clientWhatsApp)));
                        const filteredPhones = uniquePhones.filter(phone => 
                          phone.replace(/\D/g, '').includes(loyaltySearch.replace(/\D/g, ''))
                        );

                        if (filteredPhones.length === 0) {
                          return (
                            <div className="p-12 border border-dashed border-[#dfd3c3] bg-white rounded-xl text-center text-xs text-[#5c4433]">
                              Nenhum cliente fidelizado encontrado para os critérios de busca.
                            </div>
                          );
                        }

                        return filteredPhones.map(phone => {
                          const clientBookings = bookings.filter(b => b.clientWhatsApp === phone);
                          const lastBooking = clientBookings[clientBookings.length - 1];
                          const confirmedCount = clientBookings.filter(b => b.status === 'confirmed').length;
                          const currentStamps = confirmedCount % 10;
                          const freePassesCount = Math.floor(confirmedCount / 10);

                          return (
                            <div key={phone} className="bg-white p-5 rounded-2xl border border-[#dfd3c3] shadow-sm space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dfd3c3]/50 pb-3">
                                <div>
                                  <h4 className="font-serif font-bold text-base text-[#3a271c]">{lastBooking?.clientName || 'Cliente sem nome'}</h4>
                                  <p className="text-xs text-[#5c4433] font-mono mt-0.5">WhatsApp: <strong className="text-[#1c5a3b]">{phone}</strong></p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <div className="bg-[#1b4332]/10 border border-[#1b4332]/30 text-[#1c5a3b] px-3 py-1 rounded-xl text-center">
                                    <span className="text-[9px] uppercase tracking-wider font-semibold block leading-none">Sessões Confirmadas</span>
                                    <strong className="text-base font-bold font-display">{confirmedCount}</strong>
                                  </div>
                                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-xl text-center">
                                    <span className="text-[9px] uppercase tracking-wider font-semibold block leading-none">Prêmios Ganhos</span>
                                    <strong className="text-base font-bold font-display">{freePassesCount}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Stamp card visualizer */}
                              <div className="space-y-2">
                                <h5 className="text-[10px] uppercase font-bold tracking-wider text-[#8b7665]">Cartão Fidelidade Digital (Próxima cortesia: {10 - currentStamps} selos restantes):</h5>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                  {Array.from({ length: 10 }).map((_, stampIdx) => {
                                    const active = stampIdx < currentStamps;
                                    return (
                                      <div 
                                        key={stampIdx} 
                                        className={`aspect-square rounded-full border flex flex-col items-center justify-center relative shadow-sm transition-all duration-300 ${
                                          active 
                                            ? 'bg-gradient-to-br from-[#1c5a3b] to-[#143f29] border-[#d4af37] text-white' 
                                            : 'bg-[#faf6f0] border-[#dfd3c3] text-[#a08e82]'
                                        }`}
                                      >
                                        <Heart className={`w-4 h-4 ${active ? 'text-[#d4af37] fill-[#d4af37]/30 scale-110' : 'text-[#dfd3c3]'}`} />
                                        <span className="text-[9px] font-bold font-mono mt-0.5">{stampIdx + 1}</span>
                                        {active && (
                                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border border-white rounded-full flex items-center justify-center text-[7px] text-white font-extrabold">✓</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Histórico rápido */}
                              <div className="bg-[#faf6f0]/50 p-3 rounded-xl border border-[#dfd3c3]/50 text-xs">
                                <p className="font-semibold text-[#3a271c] mb-1.5 uppercase tracking-wider text-[9px] text-[#8b7665]">Registro de Atendimentos do Cliente:</p>
                                <div className="space-y-1 max-h-36 overflow-y-auto">
                                  {clientBookings.map(b => (
                                    <div key={b.id} className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-[#dfd3c3]/40 text-[11px]">
                                      <span>{b.date} às {b.time} — <strong>{b.serviceName}</strong></span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                        b.status === 'confirmed' ? 'bg-green-50 text-green-700' : b.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                      }`}>
                                        {b.status === 'confirmed' ? 'Confirmado' : b.status === 'cancelled' ? 'Cancelado' : 'Aguardando'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* TAB 9: FINANCIAL REPORTS */}
                {activeTab === 'reports' && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#dfd3c3] pb-3">
                      <h3 className="font-serif text-lg font-bold text-[#1c5a3b] flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#1c5a3b]" /> Painel de Relatórios Financeiros & Demanda
                      </h3>
                      <p className="text-xs text-[#5c4433] mt-1">
                        Analise o faturamento bruto, o status dos agendamentos e a popularidade de cada serviço oferecido por Bia Lopes.
                      </p>
                    </div>

                    {/* Stats summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-[#dfd3c3] shadow-sm">
                        <span className="text-[10px] text-[#8b7665] uppercase font-bold tracking-wider">Faturamento Confirmado</span>
                        <p className="font-display text-lg md:text-xl font-bold text-[#1c5a3b] mt-1">R$ {totalRevenue.toFixed(2)}</p>
                        <span className="text-[9px] text-[#5c4433] block mt-0.5">Dinheiro em caixa (sessões realizadas).</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#dfd3c3] shadow-sm">
                        <span className="text-[10px] text-[#8b7665] uppercase font-bold tracking-wider">Previsão em Aberto</span>
                        <p className="font-display text-lg md:text-xl font-bold text-amber-600 mt-1">
                          R$ {bookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.servicePrice, 0).toFixed(2)}
                        </p>
                        <span className="text-[9px] text-[#5c4433] block mt-0.5">Sessões aguardando atendimento.</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#dfd3c3] shadow-sm">
                        <span className="text-[10px] text-[#8b7665] uppercase font-bold tracking-wider">Taxa de Conversão</span>
                        <p className="font-display text-lg md:text-xl font-bold text-[#3a271c] mt-1">
                          {bookings.length > 0 ? `${Math.round((confirmedBookingsCount / bookings.length) * 100)}%` : '0%'}
                        </p>
                        <span className="text-[9px] text-[#5c4433] block mt-0.5">Aproveitamento de agendamentos solicitados.</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#dfd3c3] shadow-sm">
                        <span className="text-[10px] text-[#8b7665] uppercase font-bold tracking-wider">Média por Atendimento</span>
                        <p className="font-display text-lg md:text-xl font-bold text-[#1c5a3b] mt-1">
                          R$ {confirmedBookingsCount > 0 ? (totalRevenue / confirmedBookingsCount).toFixed(2) : '0.00'}
                        </p>
                        <span className="text-[9px] text-[#5c4433] block mt-0.5">Ticket médio de venda da clínica.</span>
                      </div>
                    </div>

                    {/* Services Demand Chart & Popularity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-white p-5 rounded-2xl border border-[#dfd3c3] shadow-sm space-y-4">
                        <h4 className="font-serif font-bold text-sm text-[#3a271c] border-b border-[#dfd3c3]/50 pb-2">
                          🏆 Ranking de Serviços e Combos Populares
                        </h4>

                        <div className="space-y-3.5">
                          {(() => {
                            // Map count
                            const popularityMap: { [key: string]: { count: number; value: number } } = {};
                            bookings.forEach(b => {
                              if (!popularityMap[b.serviceName]) {
                                popularityMap[b.serviceName] = { count: 0, value: 0 };
                              }
                              popularityMap[b.serviceName].count += 1;
                              if (b.status === 'confirmed') {
                                popularityMap[b.serviceName].value += b.servicePrice;
                              }
                            });

                            const sortedPopularity = Object.entries(popularityMap)
                              .sort((a, b) => b[1].count - a[1].count);

                            if (sortedPopularity.length === 0) {
                              return (
                                <p className="text-xs text-[#5c4433] py-4 text-center">Nenhum agendamento computado para o gráfico.</p>
                              );
                            }

                            const maxCount = Math.max(...sortedPopularity.map(s => s[1].count)) || 1;

                            return sortedPopularity.map(([name, stats]) => {
                              const percentage = Math.round((stats.count / maxCount) * 100);
                              return (
                                <div key={name} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-[#3a271c] truncate max-w-[70%]">{name}</span>
                                    <span className="text-[#1c5a3b] font-mono font-bold">{stats.count} agendamentos (R$ {stats.value})</span>
                                  </div>
                                  <div className="w-full bg-[#faf6f0] rounded-full h-2 border border-[#dfd3c3]/40 overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-[#1c5a3b] to-[#d4af37] h-full rounded-full transition-all duration-500" 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-[#dfd3c3] shadow-sm space-y-4">
                        <h4 className="font-serif font-bold text-sm text-[#3a271c] border-b border-[#dfd3c3]/50 pb-2">
                          📊 Estatística de Status de Agendamentos
                        </h4>
                        
                        <div className="space-y-4 pt-2">
                          {/* Confirmados */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-[#1c5a3b]">Confirmados / Realizados</span>
                              <span>{confirmedBookingsCount} ({bookings.length > 0 ? Math.round((confirmedBookingsCount / bookings.length) * 100) : 0}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div className="bg-[#1c5a3b] h-full" style={{ width: `${bookings.length > 0 ? (confirmedBookingsCount / bookings.length) * 100 : 0}%` }} />
                            </div>
                          </div>

                          {/* Aguardando */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-amber-600">Aguardando Aprovação</span>
                              <span>{pendingBookingsCount} ({bookings.length > 0 ? Math.round((pendingBookingsCount / bookings.length) * 100) : 0}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div className="bg-[#d4af37] h-full" style={{ width: `${bookings.length > 0 ? (pendingBookingsCount / bookings.length) * 100 : 0}%` }} />
                            </div>
                          </div>

                          {/* Cancelados */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-red-600">Cancelados / Ausentes</span>
                              <span>
                                {bookings.filter(b => b.status === 'cancelled').length} ({bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100) : 0}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div className="bg-red-400 h-full" style={{ width: `${bookings.length > 0 ? (bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100 : 0}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-[#faf6f0] border border-[#dfd3c3] rounded-xl text-[10.5px] text-[#5c4433] leading-relaxed mt-2">
                          <strong>Dica de Gestão:</strong> Se a taxa de cancelamento subir acima de 15%, recomendamos solicitar o adiantamento de uma taxa de reserva simbólica via PIX de sinal para evitar absenteísmo.
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>
          </>
        )}

      </div>

      {/* Render Automatic Receipt Modal if booking is selected */}
      <AnimatePresence>
        {selectedReceiptBooking && (
          <ReceiptModal
            booking={selectedReceiptBooking}
            onClose={() => setSelectedReceiptBooking(null)}
          />
        )}
      </AnimatePresence>

      {/* CUSTOM DELETION CONFIRMATION DIALOG (IFrame Safe) */}
      <AnimatePresence>
        {(bookingIdToDelete || itemIdToDelete) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-red-200 p-6 md:p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl text-[#3a271c]"
            >
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <Trash2 className="w-7 h-7" />
              </div>

              <h3 className="font-serif text-lg font-bold text-red-700">Apagar Registro Definitivamente</h3>
              
              <p className="text-xs text-[#5c4433] leading-relaxed">
                {bookingIdToDelete 
                  ? 'Tem certeza de que deseja apagar permanentemente este agendamento? Esta ação é definitiva e o agendamento sumirá do banco de dados.'
                  : 'Deseja realmente apagar este item de forma permanente? Esta ação removerá o registro do sistema imediatamente.'
                }
              </p>
 
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookingIdToDelete(null);
                    setItemIdToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-white border border-[#dfd3c3] text-[#5c4433] text-xs font-bold rounded-lg hover:bg-[#faf6f0] transition-colors cursor-pointer"
                >
                  Voltar (Não apagar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (bookingIdToDelete) {
                      confirmDeleteBooking();
                    } else {
                      confirmDeleteItem();
                    }
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  Apagar de Vez (Excluir)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
