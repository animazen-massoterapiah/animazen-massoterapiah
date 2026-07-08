import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Calendar, Clock, ChevronLeft, ChevronRight, HelpCircle, 
  MessageSquare, Heart, Shield, Moon, Activity, ArrowRight, 
  MapPin, Phone, CreditCard, ExternalLink, KeyRound, Copy, Check,
  MessageCircle, Youtube, Play, Image, Video, Settings, Instagram,
  Volume2, VolumeX, Music
} from 'lucide-react';

import Header from './components/Header';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AdminPanel from './components/AdminPanel';
import AmbientPlayer from './components/AmbientPlayer';
import AnamneseModal from './components/AnamneseModal';
import AIAssistantChat from './components/AIAssistantChat';
import CatalogModal from './components/CatalogModal';
import ReviewsModal from './components/ReviewsModal';
import LocationModal from './components/LocationModal';

import { Service, Banner, Curiosity, Testimonial, Booking, AdminUser, ClinicaSettings, AboutSettings } from './types';
import { 
  initialServices, initialCombos, initialBanners, 
  initialCuriosities, initialTestimonials, initialBookings, initialAdminUsers,
  initialClinicaSettings, initialAboutSettings
} from './data/initialData';

// Helper to extract YouTube video ID from normal or watch links
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function App() {
  // --- STATE FOR MAIN DATA ---
  const [services, setServices] = useState<Service[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [curiosities, setCuriosities] = useState<Curiosity[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [clinicaSettings, setClinicaSettings] = useState<ClinicaSettings>(initialClinicaSettings);
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>(initialAboutSettings);
  
  // --- DYNAMIC PIX KEY STATE ---
  const [pixKey, setPixKey] = useState<string>("85996341602");

  // --- COMPONENT VIEW/MODAL STATES ---
  const [isAnamneseOpen, setIsAnamneseOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | undefined>(undefined);
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPixInfoOpen, setIsPixInfoOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSpaceGalleryOpen, setIsSpaceGalleryOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  
  // --- NON-SCROLLING CATALOG MODAL STATES ---
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState<'individual' | 'combo'>('individual');

  // --- CATALOG TABS ---
  const [activeCatalogTab, setActiveCatalogTab] = useState<'individual' | 'combo'>('individual');

  // --- ROTATING BANNER CAROUSEL ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSlideDir, setCurrentSlideDir] = useState(0); // 1 = next, -1 = prev

  // --- SEED AND HYDRATE DATA FROM LOCALSTORAGE & SERVER ---
  useEffect(() => {
    const loadAllData = async () => {
      // 1. Initial quick load from local browser state to prevent any screen flash
      const getStored = (key: string, defaultValue: any) => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try { return JSON.parse(stored); } catch (e) { console.error(e); }
        }
        return defaultValue;
      };

      const localServices = getStored('anima_zen_services', [...initialServices, ...initialCombos]);
      const localBanners = getStored('anima_zen_banners', initialBanners);
      const localCuriosities = getStored('anima_zen_curiosities', initialCuriosities);
      const localTestimonials = getStored('anima_zen_testimonials', initialTestimonials);
      const localBookings = getStored('anima_zen_bookings', initialBookings);
      const localAdminUsers = getStored('anima_zen_admin_users', initialAdminUsers);
      const localPixKey = localStorage.getItem('anima_zen_pix_key') || "85996341602";
      const localSettings = getStored('anima_zen_clinica_settings', initialClinicaSettings);
      const localAboutSettings = getStored('anima_zen_about_settings', initialAboutSettings);

      setServices(localServices);
      setBanners(localBanners);
      setCuriosities(localCuriosities);
      setTestimonials(localTestimonials);
      setBookings(localBookings);
      setAdminUsers(localAdminUsers);
      setPixKey(localPixKey);
      setClinicaSettings(localSettings);
      setAboutSettings(localAboutSettings);

      // 2. Load live updates from full-stack Express backend
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        
        if (result.success && result.data) {
          const sData = result.data;
          
          if (sData.services) {
            setServices(sData.services);
            localStorage.setItem('anima_zen_services', JSON.stringify(sData.services));
          }
          if (sData.banners) {
            setBanners(sData.banners);
            localStorage.setItem('anima_zen_banners', JSON.stringify(sData.banners));
          }
          if (sData.curiosities) {
            setCuriosities(sData.curiosities);
            localStorage.setItem('anima_zen_curiosities', JSON.stringify(sData.curiosities));
          }
          if (sData.testimonials) {
            setTestimonials(sData.testimonials);
            localStorage.setItem('anima_zen_testimonials', JSON.stringify(sData.testimonials));
          }
          if (sData.bookings) {
            setBookings(sData.bookings);
            localStorage.setItem('anima_zen_bookings', JSON.stringify(sData.bookings));
          }
          if (sData.adminUsers) {
            setAdminUsers(sData.adminUsers);
            localStorage.setItem('anima_zen_admin_users', JSON.stringify(sData.adminUsers));
          }
          if (sData.pixKey) {
            setPixKey(sData.pixKey);
            localStorage.setItem('anima_zen_pix_key', sData.pixKey);
          }
          if (sData.clinicaSettings) {
            setClinicaSettings(sData.clinicaSettings);
            localStorage.setItem('anima_zen_clinica_settings', JSON.stringify(sData.clinicaSettings));
          }
          if (sData.aboutSettings) {
            setAboutSettings(sData.aboutSettings);
            localStorage.setItem('anima_zen_about_settings', JSON.stringify(sData.aboutSettings));
          }
        } else {
          // If server database doesn't exist yet, seed it with our current values
          const payload = {
            services: localServices,
            banners: localBanners,
            curiosities: localCuriosities,
            testimonials: localTestimonials,
            bookings: localBookings,
            adminUsers: localAdminUsers,
            pixKey: localPixKey,
            clinicaSettings: localSettings,
            aboutSettings: localAboutSettings
          };
          await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (error) {
        console.warn("Express full-stack backend is offline. Operating in client-side fallback.", error);
      }
    };

    loadAllData();
  }, []);

  // --- DYNAMICALLY APPLY CLINICA VISUAL STYLE CUSTOMIZATIONS (COLORS & FONTS) ---
  useEffect(() => {
    let styleTag = document.getElementById('anima-zen-custom-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'anima-zen-custom-styles';
      document.head.appendChild(styleTag);
    }

    const {
      primaryColor,
      primaryHoverColor,
      bgColor,
      accentColor,
      textDarkColor,
      borderColor,
      fontSans,
      fontSerif,
      fontDisplay
    } = clinicaSettings;

    let css = '';

    // Primary Brand Color Overrides (e.g. green buttons & badges)
    if (primaryColor) {
      css += `
        :root {
          --primary-custom: ${primaryColor} !important;
        }
        .bg-\\[\\#1c5a3b\\] { background-color: ${primaryColor} !important; }
        .bg-gradient-to-r.from-\\[\\#1c5a3b\\] { --tw-gradient-from: ${primaryColor} !important; }
        .text-\\[\\#1c5a3b\\] { color: ${primaryColor} !important; }
        .border-\\[\\#1c5a3b\\] { border-color: ${primaryColor} !important; }
        .bg-\\[\\#1b4332\\] { background-color: ${primaryColor} !important; }
        .text-\\[\\#1b4332\\] { color: ${primaryColor} !important; }
        .border-\\[\\#1b4332\\] { border-color: ${primaryColor} !important; }
      `;
    }

    // Hover Color Overrides
    if (primaryHoverColor) {
      css += `
        .hover\\:bg-\\[\\#143f29\\]:hover, .hover\\:bg-\\[\\#153527\\]:hover { background-color: ${primaryHoverColor} !important; }
      `;
    }

    // Page Background Color Override
    if (bgColor) {
      css += `
        body, .bg-\\[\\#faf6f0\\], .bg-white { background-color: ${bgColor} !important; }
        ::-webkit-scrollbar-track { background-color: ${bgColor} !important; }
      `;
    }

    // Accent Highlight Color Override (e.g. gold outlines & icons)
    if (accentColor) {
      css += `
        .text-\\[\\#d4af37\\] { color: ${accentColor} !important; }
        .border-\\[\\#d4af37\\] { border-color: ${accentColor} !important; }
        .bg-\\[\\#d4af37\\]\\/10 { background-color: ${accentColor}1c !important; }
        .bg-\\[\\#d4af37\\]\\/15 { background-color: ${accentColor}24 !important; }
        .bg-\\[\\#d4af37\\]\\/20 { background-color: ${accentColor}33 !important; }
      `;
    }

    // Text Dark Color Override
    if (textDarkColor) {
      css += `
        .text-\\[\\#3a271c\\], .text-\\[\\#1c2620\\] { color: ${textDarkColor} !important; }
      `;
    }

    // Border Lines Color Override
    if (borderColor) {
      css += `
        .border-\\[\\#dfd3c3\\], .border-\\[\\#dfd8cb\\] { border-color: ${borderColor} !important; }
      `;
    }

    // Font family overrides (San-Serif, Serif, Display)
    if (fontSans) {
      css += `
        body, :root { --font-sans: "${fontSans}", sans-serif !important; }
      `;
    }
    if (fontSerif) {
      css += `
        :root { --font-serif: "${fontSerif}", serif !important; }
      `;
    }
    if (fontDisplay) {
      css += `
        :root { --font-display: "${fontDisplay}", sans-serif !important; }
      `;
    }

    styleTag.innerHTML = css;
  }, [clinicaSettings]);

  // --- ROTATING BANNER AUTO-PLAY ---
  const activeBanners = banners.filter(b => b.active);
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  // Helper to post consolidated data to server
  const saveAllToServer = async (
    sList = services,
    bList = banners,
    cList = curiosities,
    tList = testimonials,
    bkList = bookings,
    aList = adminUsers,
    pKey = pixKey,
    cSettings = clinicaSettings,
    abSettings = aboutSettings
  ) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: sList,
          banners: bList,
          curiosities: cList,
          testimonials: tList,
          bookings: bkList,
          adminUsers: aList,
          pixKey: pKey,
          clinicaSettings: cSettings,
          aboutSettings: abSettings
        })
      });
    } catch (e) {
      console.error("Error pushing data update to server", e);
    }
  };

  // --- DATA SYNCHRONIZER (ADMIN TRIGGERS) ---
  const handleDataUpdate = (updatedData: {
    services?: Service[];
    banners?: Banner[];
    curiosities?: Curiosity[];
    testimonials?: Testimonial[];
    bookings?: Booking[];
    adminUsers?: AdminUser[];
    pixKey?: string;
    clinicaSettings?: ClinicaSettings;
    aboutSettings?: AboutSettings;
  }) => {
    let nextServices = services;
    let nextBanners = banners;
    let nextCuriosities = curiosities;
    let nextTestimonials = testimonials;
    let nextBookings = bookings;
    let nextAdminUsers = adminUsers;
    let nextPixKey = pixKey;
    let nextClinicaSettings = clinicaSettings;
    let nextAboutSettings = aboutSettings;

    if (updatedData.services) {
      nextServices = updatedData.services;
      setServices(nextServices);
      localStorage.setItem('anima_zen_services', JSON.stringify(nextServices));
    }
    if (updatedData.banners) {
      nextBanners = updatedData.banners;
      setBanners(nextBanners);
      localStorage.setItem('anima_zen_banners', JSON.stringify(nextBanners));
    }
    if (updatedData.curiosities) {
      nextCuriosities = updatedData.curiosities;
      setCuriosities(nextCuriosities);
      localStorage.setItem('anima_zen_curiosities', JSON.stringify(nextCuriosities));
    }
    if (updatedData.testimonials) {
      nextTestimonials = updatedData.testimonials;
      setTestimonials(nextTestimonials);
      localStorage.setItem('anima_zen_testimonials', JSON.stringify(nextTestimonials));
    }
    if (updatedData.bookings) {
      nextBookings = updatedData.bookings;
      setBookings(nextBookings);
      localStorage.setItem('anima_zen_bookings', JSON.stringify(nextBookings));
    }
    if (updatedData.adminUsers) {
      nextAdminUsers = updatedData.adminUsers;
      setAdminUsers(nextAdminUsers);
      localStorage.setItem('anima_zen_admin_users', JSON.stringify(nextAdminUsers));
    }
    if (updatedData.pixKey !== undefined) {
      nextPixKey = updatedData.pixKey;
      setPixKey(nextPixKey);
      localStorage.setItem('anima_zen_pix_key', nextPixKey);
    }
    if (updatedData.clinicaSettings) {
      nextClinicaSettings = updatedData.clinicaSettings;
      setClinicaSettings(nextClinicaSettings);
      localStorage.setItem('anima_zen_clinica_settings', JSON.stringify(nextClinicaSettings));
    }
    if (updatedData.aboutSettings) {
      nextAboutSettings = updatedData.aboutSettings;
      setAboutSettings(nextAboutSettings);
      localStorage.setItem('anima_zen_about_settings', JSON.stringify(nextAboutSettings));
    }

    saveAllToServer(
      nextServices, nextBanners, nextCuriosities, nextTestimonials, 
      nextBookings, nextAdminUsers, nextPixKey, nextClinicaSettings, nextAboutSettings
    );
  };

  // --- OPEN BOOKING WITH SPECIFIC SERVICE ---
  const handleBookService = (serviceId: string) => {
    setPreSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  const handleOpenBookingGeneral = () => {
    setPreSelectedServiceId(undefined);
    setIsBookingOpen(true);
  };

  const handleAddReview = (newReview: Testimonial) => {
    const updatedTestimonials = [newReview, ...testimonials];
    setTestimonials(updatedTestimonials);
    handleDataUpdate({ testimonials: updatedTestimonials });
  };

  // --- RENDER ICON HELPERS FOR CURIOSITIES ---
  const renderCuriosityIcon = (iconName?: string) => {
    const defaultClass = "w-6 h-6 text-[#1c5a3b]";
    switch (iconName) {
      case 'Moon': return <Moon className={defaultClass} />;
      case 'Shield': return <Shield className={defaultClass} />;
      case 'Activity': return <Activity className={defaultClass} />;
      case 'Heart': return <Heart className={defaultClass} />;
      default: return <Sparkles className={defaultClass} />;
    }
  };

  // Copy Pix Key Helper
  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  // Categorized services
  const individualServices = services.filter(s => s.category === 'individual');
  const comboServices = services.filter(s => s.category === 'combo');

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#3a271c] font-sans flex flex-col relative overflow-x-hidden selection:bg-[#1b4332] selection:text-white">
      
      {/* 1. Header (Dynamic links, and action buttons) */}
      <Header 
        onOpenBooking={handleOpenBookingGeneral} 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        logoUrl={clinicaSettings.logoUrl}
        instagramUrl={clinicaSettings.instagramUrl}
      />

      {/* Main Sanctuary Area */}
      <main className="flex-1 space-y-16 md:space-y-24 pb-16">
        
        {/* HERO SECTION / SPA WATERMARK LAYER */}
        <section id="hero-banner-section" className="relative h-[85vh] md:h-[75vh] flex items-center overflow-hidden border-b border-[#dfd3c3]">
          
          {/* Main background spa visual */}
          <div className="absolute inset-0 z-0">
            <img 
              src={clinicaSettings.spaceImageUrl} 
              alt="Spa Sanctuary" 
              className="w-full h-full object-cover object-center filter brightness-[0.45] sepia-[10%]"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600"; }}
              referrerPolicy="no-referrer"
            />
            {/* Luxurious deep warm sand/cream gradient overlay to blend perfectly and provide high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#faf6f0] via-black/55 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Title / Brand values */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-[#1b4332]/40 border border-[#d4af37]/30 rounded-full text-xs text-[#d4af37] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" /> Estúdio de Bem-Estar & Massoterapia
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-display text-4xl md:text-6xl font-extrabold tracking-wider text-[#f7efe9] leading-tight"
              >
                Atendimento <br />
                <span className="text-[#d4af37] font-serif italic font-normal">Humanizado</span> que <br />
                restaura sua <span className="text-[#2d9e6b]">alma</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-sm md:text-base text-[#a08e82] max-w-lg leading-relaxed"
              >
                Descubra o verdadeiro refúgio de paz em Fortaleza. Agende uma sessão personalizada na <strong>Ânima Zen</strong> e sinta o estresse derreter sob o toque de terapeutas experientes.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button
                  id="hero-agendar-btn"
                  onClick={handleOpenBookingGeneral}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] border-2 border-[#d4af37]/40 hover:border-[#d4af37] text-white font-bold rounded-xl text-sm tracking-wide shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  Agendar Sessão Agora
                </button>
                <button
                  onClick={() => {
                    setCatalogCategory('individual');
                    setIsCatalogOpen(true);
                  }}
                  className="px-6 py-3.5 bg-[#2d1e16] border border-[#3e2719] hover:bg-[#322016] text-[#f7efe9] font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Ver Serviços
                </button>
              </motion.div>
            </div>

            {/* ROTATING BANNER CAROUSEL (Offers & Combos of the Month) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="lg:col-span-5 bg-[#2d1e16] border border-[#d4af37]/30 rounded-2xl overflow-hidden shadow-2xl relative h-[280px] md:h-[350px] group flex flex-col justify-end"
            >
              <AnimatePresence mode="wait">
                {activeBanners.length > 0 && (
                  <motion.div
                    key={activeBanners[currentSlide].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-0"
                  >
                    <img 
                      src={activeBanners[currentSlide].imageUrl} 
                      alt={activeBanners[currentSlide].title} 
                      className="w-full h-full object-cover filter brightness-[0.4]"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Gradient card accent */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d1e16] via-[#2d1e16]/30 to-transparent z-10 pointer-events-none" />

              {/* Carousel controls */}
              {activeBanners.length > 1 && (
                <div className="absolute top-4 right-4 z-20 flex gap-1">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1))}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-[#1b4332] text-white hover:text-[#d4af37] transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-[#1b4332] text-white hover:text-[#d4af37] transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Banner Text overlay */}
              {activeBanners.length > 0 && (
                <div className="relative z-20 p-6 md:p-8 space-y-2 text-left">
                  <span className="px-2.5 py-0.5 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] rounded text-[10px] font-bold tracking-wider uppercase inline-block">
                    Destaque do Mês
                  </span>
                  <h3 className="font-serif text-lg md:text-xl font-bold text-white tracking-wide">
                    {activeBanners[currentSlide].title}
                  </h3>
                  <p className="text-xs text-[#a08e82] line-clamp-2">
                    {activeBanners[currentSlide].subtitle}
                  </p>
                  <button
                    onClick={handleOpenBookingGeneral}
                    className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] font-bold group mt-2"
                  >
                    Quero Garantir <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Slide indicators */}
              {activeBanners.length > 1 && (
                <div className="absolute bottom-4 left-6 z-20 flex gap-1.5">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentSlide === idx ? 'w-6 bg-[#d4af37]' : 'w-1.5 bg-[#a08e82]/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </section>

        {/* --- DOCK DE BOTÕES RÁPIDOS --- */}
        <section id="botoes-rapidos-dock" className="max-w-7xl mx-auto px-6 -mt-12 md:-mt-16 relative z-30">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-[#dfd3c3]/65 p-4 md:p-6 shadow-2xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 text-center">
            
            {/* 📅 Agendar */}
            <button
              onClick={handleOpenBookingGeneral}
              className="p-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all hover:-translate-y-1 shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#1b4332]/10 flex items-center justify-center border border-[#1b4332]/25 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-[#1b4332]" />
              </div>
              <span className="text-xs font-bold text-[#3a271c]">📅 Agendar</span>
            </button>

            {/* 💬 WhatsApp */}
            <a
              href={`https://wa.me/${clinicaSettings.phone.replace(/\D/g, '')}?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20da%20%C3%82nima%20Zen.`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-[#25d366]/10 flex items-center justify-center border border-[#25d366]/25 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-[#25d366]" />
              </div>
              <span className="text-xs font-bold text-[#3a271c]">💬 WhatsApp</span>
            </a>

            {/* 📍 Localização */}
            <button
              onClick={() => setIsLocationOpen(true)}
              className="p-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all hover:-translate-y-1 shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/25 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-xs font-bold text-[#3a271c]">📍 Localização</span>
            </button>

            {/* 💆 Serviços */}
            <button
              onClick={() => {
                setCatalogCategory('individual');
                setIsCatalogOpen(true);
              }}
              className="p-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all hover:-translate-y-1 shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#1b4332]/10 flex items-center justify-center border border-[#1b4332]/25 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-[#1b4332]" />
              </div>
              <span className="text-xs font-bold text-[#3a271c]">💆 Serviços</span>
            </button>

            {/* 🎁 Combos */}
            <button
              onClick={() => {
                setCatalogCategory('combo');
                setIsCatalogOpen(true);
              }}
              className="p-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all hover:-translate-y-1 shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#d4af37]/15 flex items-center justify-center border border-[#d4af37]/25 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 text-[#d4af37]" />
              </div>
              <span className="text-xs font-bold text-[#3a271c]">🎁 Combos</span>
            </button>

            {/* 🤖 Assistente IA */}
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="p-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all hover:-translate-y-1 shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-[#3a271c]">🤖 Assistente IA</span>
            </button>

            {/* 📋 Anamnese */}
            <button
              onClick={() => setIsAnamneseOpen(true)}
              className="p-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all hover:-translate-y-1 shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#1c5a3b]/10 flex items-center justify-center border border-[#1c5a3b]/25 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-[#1c5a3b]" />
              </div>
              <span className="text-xs font-bold text-[#3a271c]">📋 Anamnese</span>
            </button>

            {/* ⭐ Avaliações */}
            <button
              onClick={() => setIsReviewsOpen(true)}
              className="p-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all hover:-translate-y-1 shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/25 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-bold text-[#3a271c]">⭐ Avaliações</span>
            </button>

          </div>
        </section>

        {/* 2. CURIOSIDADES SECTION (BENEFITS OF MASSOTHERAPY) */}
        <section id="curiosidades-section" className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-wider text-[#3a271c]">
              Benefícios do <span className="text-[#1c5a3b] font-serif italic font-normal">Toque Humano</span>
            </h3>
            <p className="text-xs md:text-sm text-[#5c4433]">
              Você sabia que a massoterapia vai muito além do relaxamento? Conheça os impactos terapêuticos e comprovados cientificamente que uma sessão traz para sua saúde física e mental.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {curiosities.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-[#dfd3c3] flex flex-col justify-start text-left space-y-4 hover:border-[#1c5a3b]/60 hover:shadow-xl transition-all relative group shadow-sm"
              >
                {/* Gold glowing border ornament */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#d4af37]/30 group-hover:bg-[#d4af37] rounded-t-2xl transition-all" />
                
                <div className="w-11 h-11 rounded-full bg-[#faf6f0] flex items-center justify-center border border-[#dfd3c3] shrink-0">
                  {renderCuriosityIcon(item.icon)}
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm md:text-base text-[#3a271c]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#5c4433] leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- SEÇÃO MÃO AMIGA (MÃES ATÍPICAS) --- */}
        <section id="mao-amiga-section" className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#1c5a3b] to-[#143f29] rounded-3xl p-8 md:p-12 border-2 border-[#dfd3c3] text-[#faf6f0] shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Background design accents */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#faf6f0_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#d4af37]/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            
            <div className="space-y-4 max-w-3xl text-left z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                🤝 Projeto Mão Amiga
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold tracking-wider text-white">
                Acolhimento para <span className="text-[#d4af37] font-serif italic font-normal">Mães Atípicas</span>
              </h3>
              <p className="text-xs md:text-sm text-[#ebdcd0] leading-relaxed font-medium">
                O projeto <strong>Mão Amiga</strong> nasceu do desejo profundo de oferecer uma rede de apoio, carinho e autocuidado para mães que dedicam suas vidas ao cuidado integral de filhos com necessidades especiais. Sabemos que a jornada atípica exige muito física e mentalmente, e acreditamos que quem cuida também precisa ser cuidado. Oferecemos sessões com condições especiais e escuta atenta para renovar suas forças.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#ebdcd0]/90">
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                  <Heart className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Condições Especiais</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                  <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Ambiente Acolhedor</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                  <Shield className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Cuidado Personalizado</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 z-10 w-full lg:w-auto flex flex-col gap-3">
              <button
                onClick={() => setIsAnamneseOpen(true)}
                className="w-full lg:w-auto px-6 py-4 bg-[#d4af37] hover:bg-[#c29e2f] text-[#3a271c] font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 group cursor-pointer border border-[#faf6f0]/20"
              >
                <span>Fazer Anamnese & Agendar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[10px] text-center text-[#ebdcd0]/60 uppercase tracking-widest font-semibold">
                *Preencha para personalizar seu atendimento
              </p>
            </div>
          </div>
        </section>

        {/* 3. CATÁLOGO DE SERVIÇOS & COMBOS */}
        <section id="servicos-section" className="max-w-7xl mx-auto px-6">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-wider text-[#3a271c]">
              Experiências <span className="text-[#1c5a3b] font-serif italic font-normal">Terapêuticas</span>
            </h3>
            <p className="text-xs md:text-sm text-[#5c4433]">
              Escolha entre sessões de foco individualizado ou nossos combos especiais focados no rejuvenescimento integral de quem você ama.
            </p>

            {/* TAB SELECTOR */}
            <div className="inline-flex p-1 bg-[#ebdcd0]/40 border border-[#dfd3c3] rounded-xl mt-4">
              <button
                onClick={() => setActiveCatalogTab('individual')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeCatalogTab === 'individual'
                    ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-md'
                    : 'text-[#5c4433] hover:text-[#3a271c]'
                }`}
              >
                Massagens Individuais
              </button>
              <button
                onClick={() => setActiveCatalogTab('combo')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeCatalogTab === 'combo'
                    ? 'bg-[#1b4332] text-white border border-[#1b4332] shadow-md'
                    : 'text-[#5c4433] hover:text-[#3a271c]'
                }`}
              >
                Combos Especiais (Descontos)
              </button>
            </div>
          </div>

          {/* CATÁLOGO CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <AnimatePresence mode="wait">
              {activeCatalogTab === 'individual' ? (
                individualServices.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[#a08e82]">Nenhum serviço individual cadastrado.</div>
                ) : (
                  individualServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl overflow-hidden border border-[#dfd3c3] flex flex-col justify-between hover:border-[#1c5a3b] hover:shadow-xl transition-all"
                    >
                      {/* Card visual thumb */}
                      <div className="h-44 overflow-hidden relative">
                        <img 
                          src={service.imageUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop'} 
                          alt={service.name} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 border border-[#dfd3c3] rounded-lg px-2.5 py-1 text-[10px] font-bold text-[#1c5a3b] flex items-center gap-1 shadow-sm">
                          <Clock className="w-3.5 h-3.5" /> {service.duration} min
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2 text-left">
                          <h4 className="font-serif text-lg font-bold text-[#3a271c]">{service.name}</h4>
                          <p className="text-xs text-[#5c4433] leading-relaxed">{service.description}</p>
                        </div>

                        <div className="flex flex-col gap-2.5 w-full mt-auto">
                          <div className="flex items-center justify-between border-t border-[#dfd3c3]/50 pt-4">
                            <div>
                              <span className="text-[10px] text-[#5c4433] uppercase block text-left">Investimento</span>
                              <span className="font-display text-xl font-extrabold text-[#1c5a3b]">R$ {service.price.toFixed(2)}</span>
                            </div>
                            <button
                              onClick={() => handleBookService(service.id)}
                              className="px-4 py-2 bg-[#1b4332] hover:bg-[#153527] border border-[#1b4332] text-white text-xs font-bold rounded-lg tracking-wide transition-all cursor-pointer"
                            >
                              Reservar
                            </button>
                          </div>
                          <a 
                            href={`https://wa.me/${clinicaSettings.phone}?text=Ol%C3%A1%20%C3%82nima%20Zen!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20servi%C3%A7o%20"${encodeURIComponent(service.name)}"`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#1c5a3b] hover:text-[#123b26] font-semibold flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-[#dfd3c3] hover:border-[#1c5a3b]/40 rounded-lg transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#25d366]" /> Tem dúvidas? Fale conosco
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              ) : (
                comboServices.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[#a08e82]">Nenhum combo cadastrado.</div>
                ) : (
                  comboServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl overflow-hidden border border-[#dfd3c3] flex flex-col justify-between hover:border-[#1c5a3b] hover:shadow-xl transition-all shadow-sm"
                    >
                      {/* Card visual thumb */}
                      <div className="h-44 overflow-hidden relative">
                        <img 
                           src={service.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop'} 
                           alt={service.name} 
                           className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                           referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 border border-[#dfd3c3] rounded-lg px-2.5 py-1 text-[10px] font-bold text-[#1c5a3b] flex items-center gap-1 shadow-sm">
                          <Clock className="w-3.5 h-3.5" /> {service.duration} min
                        </div>
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-amber-600 border border-red-500 rounded-lg px-2.5 py-1 text-[9px] font-bold text-white uppercase tracking-wider">
                          Combo Desconto
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2 text-left">
                          <h4 className="font-serif text-lg font-bold text-[#3a271c] flex items-center gap-1.5">
                            {service.name}
                          </h4>
                          <p className="text-xs text-[#5c4433] leading-relaxed">{service.description}</p>
                        </div>

                        <div className="flex flex-col gap-2.5 w-full mt-auto">
                          <div className="flex items-center justify-between border-t border-[#dfd3c3]/50 pt-4">
                            <div>
                              <span className="text-[10px] text-[#5c4433] uppercase block text-left">Valor Promocional</span>
                              <span className="font-display text-xl font-extrabold text-[#1b4332]">R$ {service.price.toFixed(2)}</span>
                            </div>
                            <button
                              onClick={() => handleBookService(service.id)}
                              className="px-4 py-2 bg-[#1b4332] hover:bg-[#153527] border border-[#1b4332] text-white text-xs font-bold rounded-lg tracking-wide transition-all hover:scale-[1.03] cursor-pointer"
                            >
                              Reservar Combo
                            </button>
                          </div>
                          <a 
                            href={`https://wa.me/${clinicaSettings.phone}?text=Ol%C3%A1%20%C3%82nima%20Zen!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20Combo%20"${encodeURIComponent(service.name)}"`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#1c5a3b] hover:text-[#123b26] font-semibold flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-[#dfd3c3] hover:border-[#1c5a3b]/40 rounded-lg transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#25d366]" /> Tem dúvidas? Fale conosco
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 3. CONHEÇA NOSSO ESPAÇO (Dynamic visual tour) */}
        <section id="espaco-section" className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white rounded-3xl border border-[#dfd3c3] p-8 md:p-12 overflow-hidden relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left shadow-sm">
            <div className="lg:col-span-7 space-y-5">
              <span className="px-2.5 py-0.5 bg-[#1b4332]/10 border border-[#1b4332]/30 text-[#1c5a3b] rounded-full text-[10px] font-bold tracking-wider uppercase inline-block">
                Conheça Nosso Espaço
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-[#3a271c] tracking-wider leading-tight">
                Um refúgio de paz no coração de Fortaleza
              </h3>
              <p className="text-xs md:text-sm text-[#5c4433] leading-relaxed">
                O espaço da Ânima Zen foi planejado nos mínimos detalhes para induzir um estado imediato de paz e relaxamento profundo. Das cores suaves, aromas naturais e sons calmos de floresta à iluminação indireta relaxante, cada momento em nossa clínica é um convite para você se reconectar consigo mesmo.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => setIsSpaceGalleryOpen(true)}
                  className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#153527] border border-[#1b4332] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Image className="w-4 h-4 text-[#d4af37]" /> Tour por Nosso Espaço
                </button>
                
                {clinicaSettings.instagramUrl && (
                  <a 
                    href={clinicaSettings.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-white hover:bg-[#faf6f0] border border-[#dfd3c3] text-[#3a271c] text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Instagram className="w-4 h-4 text-[#d4af37]" /> Acompanhar no Instagram
                  </a>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-5 relative group cursor-pointer" onClick={() => setIsSpaceGalleryOpen(true)}>
              <div className="absolute inset-0 bg-[#d4af37]/10 rounded-2xl filter blur-xl opacity-30 group-hover:opacity-50 transition-all" />
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#3e2719] group-hover:border-[#d4af37]/60 shadow-2xl transition-all aspect-[4/3]">
                <img 
                  src={clinicaSettings.spaceImageUrl || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800"} 
                  alt="Espaço Ânima Zen" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800'; }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-[11px] font-medium text-[#d4af37] flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-lg border border-[#3e2719]">
                    <Sparkles className="w-3.5 h-3.5" /> Ampliar Foto do Espaço
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3.1 VÍDEOS DE MASSAGENS: NÃO É TOQUE! (Educational and concept videos) */}
        <section id="videos-section" className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
            <span className="px-2.5 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-[10px] font-bold tracking-wider uppercase inline-block">
              Não é Toque! É Massoterapia
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-wider text-[#3a271c]">
              Demonstração & Conteúdo de Valor
            </h3>
            <p className="text-xs md:text-sm text-[#5c4433]">
              Assista aos nossos vídeos demonstrativos e entenda os conceitos científicos, a anatomia e a seriedade do trabalho de massagem terapêutica profissional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Video Card 1: Demonstration Loop */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#dfd3c3] flex flex-col justify-between hover:border-[#1c5a3b] hover:shadow-lg transition-all shadow-sm group">
              {getYouTubeId(clinicaSettings.spaceVideos[0]) ? (
                <div className="relative aspect-video overflow-hidden bg-black border-b border-[#dfd3c3]">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(clinicaSettings.spaceVideos[0])}`}
                    title="Demonstração Prática"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <div className="relative aspect-video overflow-hidden bg-black flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600" 
                    alt="Demonstração Prática" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <a 
                    href={clinicaSettings.spaceVideos[0] || "https://www.youtube.com"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative z-10 w-14 h-14 bg-red-600 hover:bg-red-700 hover:scale-110 rounded-full flex items-center justify-center text-white shadow-xl transition-all"
                  >
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </a>
                </div>
              )}
              <div className="p-5 text-left space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#3a271c] flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-500" /> Demonstração das Massagens
                  </h4>
                  <p className="text-xs text-[#5c4433] mt-1">
                    Assista à técnica de toque suave, pressão e manobras musculares de reabilitação física realizadas pela nossa especialista Bia Lopes.
                  </p>
                </div>
                <div className="pt-2">
                  <a 
                    href={clinicaSettings.spaceVideos[0] || "https://www.youtube.com"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-[#1c5a3b] hover:text-[#123b26] font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    Assistir no YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Video Card 2: Concept Talk / "Não é Toque!" channel link */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#dfd3c3] flex flex-col justify-between hover:border-[#1c5a3b] hover:shadow-lg transition-all shadow-sm group">
              {getYouTubeId(clinicaSettings.youtubeUrl) ? (
                <div className="relative aspect-video overflow-hidden bg-black border-b border-[#dfd3c3]">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(clinicaSettings.youtubeUrl)}`}
                    title="Tema Não é Toque!"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <div className="relative aspect-video overflow-hidden bg-black flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600" 
                    alt="Palestra Educativa" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <a 
                    href={clinicaSettings.youtubeUrl || "https://www.youtube.com"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative z-10 w-14 h-14 bg-red-600 hover:bg-red-700 hover:scale-110 rounded-full flex items-center justify-center text-white shadow-xl transition-all"
                  >
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </a>
                </div>
              )}
              <div className="p-5 text-left space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#3a271c] flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-500" /> Tema "Não é Toque!"
                  </h4>
                  <p className="text-xs text-[#5c4433] mt-1">
                    Uma iniciativa educativa para promover a massoterapia de forma ética, respeitosa e puramente focada na saúde física, mental e bem-estar corporal.
                  </p>
                </div>
                <div className="pt-2">
                  <a 
                    href={clinicaSettings.youtubeUrl || "https://www.youtube.com"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-[#1c5a3b] hover:text-[#123b26] font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    Visitar Nosso Canal de Vídeos <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3.2 QUEM SOU / BIOGRAFIA EDITÁVEL --- */}
        <section id="quem-sou-section" className="max-w-7xl mx-auto px-6 py-12 md:py-16 text-left">
          <div className="bg-white rounded-3xl border border-[#dfd3c3] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 items-stretch text-left">
            
            {/* Foto e Mini-Info */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-2.5 py-0.5 bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#c29b25] rounded-full text-[10px] font-bold tracking-wider uppercase inline-block">
                  Profissional Responsável
                </span>
                <h3 className="font-display text-3xl font-bold text-[#3a271c] tracking-wide">
                  Conheça <span className="font-serif italic font-normal text-[#1c5a3b]">Bia Lopes</span>
                </h3>
                <p className="text-xs text-[#5c4433] leading-relaxed">
                  Alma e sensibilidade por trás do método Ânima Zen de massoterapia humanizada.
                </p>
              </div>

              <div className="relative group">
                {/* Gold glowing backing shadow */}
                <div className="absolute inset-0 bg-[#d4af37]/20 rounded-2xl filter blur-xl opacity-30 group-hover:opacity-55 transition-all" />
                <div className="relative rounded-2xl overflow-hidden border-4 border-[#faf6f0] shadow-2xl aspect-[3/4] bg-neutral-100">
                  <img 
                    src={aboutSettings.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400"} 
                    alt="Bia Lopes - Massoterapeuta" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400'; }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-center">
                    <p className="font-serif text-lg font-bold text-[#d4af37] tracking-wider">Bia Lopes</p>
                    <p className="text-[10px] text-white/90 uppercase tracking-widest font-semibold">Fundadora & Terapeuta Corporal Integrativa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Detalhadas (História, Formação, Especialidades, Missão, Valores) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6 md:pl-4">
              
              {/* História */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-lg text-[#1c5a3b] border-b border-[#dfd3c3]/60 pb-1.5">
                  Minha História
                </h4>
                <p className="text-sm text-[#5c4433] leading-relaxed italic">
                  "{aboutSettings.history}"
                </p>
              </div>

              {/* Formação & Certificados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#faf6f0] p-4 rounded-xl border border-[#dfd3c3]/50 space-y-2">
                  <h5 className="font-serif font-bold text-xs text-[#3a271c] flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Formação Acadêmica
                  </h5>
                  <p className="text-xs text-[#5c4433] leading-relaxed">
                    {aboutSettings.education}
                  </p>
                </div>

                <div className="bg-[#faf6f0] p-4 rounded-xl border border-[#dfd3c3]/50 space-y-2">
                  <h5 className="font-serif font-bold text-xs text-[#3a271c] flex items-center gap-1.5 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-[#1c5a3b]" /> Certificados & Especializações
                  </h5>
                  <p className="text-xs text-[#5c4433] leading-relaxed">
                    {aboutSettings.certificates}
                  </p>
                </div>
              </div>

              {/* Especialidades do Método */}
              <div className="space-y-2">
                <h5 className="font-serif font-bold text-xs text-[#3a271c] uppercase tracking-wider">
                  Especializações Técnicas
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {aboutSettings.specialties.split(',').map((spec, i) => (
                    <span 
                      key={i}
                      className="px-2.5 py-1 bg-[#1b4332]/5 border border-[#1b4332]/20 text-[#1c5a3b] rounded-full text-[10px] font-semibold"
                    >
                      ✓ {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missão e Valores */}
              <div className="bg-gradient-to-br from-[#1b4332] to-[#113224] p-5 md:p-6 rounded-2xl text-white shadow-lg space-y-3 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4">
                  <Heart className="w-40 h-40" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">Nossa Filosofia</span>
                  <p className="text-xs text-emerald-100 leading-relaxed font-serif italic">
                    "{aboutSettings.mission}"
                  </p>
                </div>

                <div className="border-t border-emerald-800 pt-3">
                  <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-1">Valores Fundamentais</span>
                  <p className="text-[11px] text-emerald-50/95 leading-relaxed">
                    {aboutSettings.values}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 4. DEPOIMENTOS / AVALIAÇÕES (Humane feedback) */}
        <section id="avaliacoes-section" className="bg-[#f5ede4]/50 py-16 border-y border-[#dfd3c3] relative">
          
          <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none">
            <img 
              src="/src/assets/images/spa_background_1783303723602.jpg" 
              alt="Spa Watermark" 
              className="w-full h-full object-cover filter sepia-[20%] hue-rotate-15"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
              <span className="px-2.5 py-0.5 bg-[#1b4332]/10 border border-[#1b4332]/20 text-[#1c5a3b] rounded-full text-[10px] font-bold tracking-wider uppercase inline-block">
                Espaço de Acolhimento
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold tracking-wider text-[#3a271c]">
                Depoimentos do Coração
              </h3>
              <p className="text-xs md:text-sm text-[#5c4433]">
                Acreditamos na massoterapia feita por pessoas para pessoas. Veja os relatos reais de quem escolheu a Ânima Zen para reconectar-se consigo mesmo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  className="bg-white p-6 rounded-2xl border border-[#dfd3c3] flex flex-col justify-between text-left space-y-4 shadow-sm"
                >
                  <p className="text-xs text-[#5c4433] leading-relaxed italic flex-1">
                    "{test.content}"
                  </p>

                  <div className="flex items-center gap-3 border-t border-[#dfd3c3]/50 pt-4 mt-auto">
                    <img 
                      src={test.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'} 
                      alt={test.name} 
                      className="w-10 h-10 rounded-full object-cover border border-[#dfd3c3]/40"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-xs text-[#3a271c]">{test.name}</h4>
                      <span className="text-[10px] text-[#5c4433]">{test.role || 'Cliente'}</span>
                      <div className="flex text-yellow-500 text-[10px] mt-0.5">
                        {'★'.repeat(test.rating || 5)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

      </main>

      {/* 5. Contatos & Localização / Rodapé */}
      <Footer 
        onOpenBooking={handleOpenBookingGeneral} 
        onOpenPixInfo={() => setIsPixInfoOpen(true)} 
        pixKey={pixKey}
        clinicaSettings={clinicaSettings}
      />

      {/* --- FLOATING BOOKING MODAL --- */}
      <AnimatePresence>
        {isBookingOpen && (
          <BookingModal 
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            services={services}
            initialSelectedServiceId={preSelectedServiceId}
            bookings={bookings}
            onBookingCreated={(newBooking) => {
              const stored = localStorage.getItem('anima_zen_bookings');
              let updatedBookings = bookings;
              if (stored) {
                try {
                  updatedBookings = JSON.parse(stored);
                } catch (e) {
                  console.error(e);
                }
              } else if (newBooking) {
                updatedBookings = [newBooking, ...bookings];
              }
              handleDataUpdate({ bookings: updatedBookings });
            }}
            pixKey={pixKey}
          />
        )}
      </AnimatePresence>

      {/* --- NON-SCROLLING SERVICES & COMBOS CATALOG MODAL --- */}
      <AnimatePresence>
        {isCatalogOpen && (
          <CatalogModal
            isOpen={isCatalogOpen}
            onClose={() => setIsCatalogOpen(false)}
            services={services}
            initialCategory={catalogCategory}
            onBookService={(serviceId) => {
              setPreSelectedServiceId(serviceId);
              setIsCatalogOpen(false);
              setIsBookingOpen(true);
            }}
            clinicaSettings={clinicaSettings}
          />
        )}
      </AnimatePresence>

      {/* --- FLOATING SPACE GALLERY LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {isSpaceGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl w-full bg-[#1c120c] border border-[#3e2719] rounded-2xl overflow-hidden p-6 text-center space-y-4">
              <button 
                onClick={() => setIsSpaceGalleryOpen(false)}
                className="absolute top-4 right-4 text-[#a08e82] hover:text-white p-2 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
              
              <h3 className="font-serif text-lg font-bold text-[#d4af37]">Santuário Ânima Zen</h3>
              <p className="text-xs text-[#a08e82] max-w-xl mx-auto">Confira os detalhes de acolhimento em nossa clínica de massoterapia terapêutica de alto padrão.</p>
              
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#3e2719] bg-black">
                <img 
                  src={clinicaSettings.spaceImageUrl || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800"} 
                  className="w-full h-full object-contain"
                  alt="Espaço da Clínica"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex justify-center gap-4 pt-2">
                <a 
                  href={`https://wa.me/${clinicaSettings.phone}?text=Ol%C3%A1!%20Vi%20as%20fotos%20do%20espa%C3%A7o%20e%20gostaria%20de%20agendar%20um%20hor%C3%A1rio.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#153527] border border-[#d4af37]/30 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Calendar className="w-4 h-4 text-[#d4af37]" /> Agendar uma Visita / Sessão
                </a>
                <button 
                  onClick={() => setIsSpaceGalleryOpen(false)}
                  className="px-5 py-2.5 bg-[#2d1e16] border border-[#3e2719] text-[#a08e82] hover:text-[#1c120c] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Fechar Galeria
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING ADMINISTRATIVE PANEL --- */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel 
            services={services}
            banners={banners}
            curiosities={curiosities}
            testimonials={testimonials}
            bookings={bookings}
            adminUsers={adminUsers}
            clinicaSettings={clinicaSettings}
            aboutSettings={aboutSettings}
            onDataUpdate={handleDataUpdate}
            onClose={() => setIsAdminOpen(false)}
            pixKey={pixKey}
            onPixKeyUpdate={(key) => handleDataUpdate({ pixKey: key })}
          />
        )}
      </AnimatePresence>

      {/* --- FLOATING PIX INSTRUCTIONS MODAL (FOOTER SHORTCUT) --- */}
      <AnimatePresence>
        {isPixInfoOpen && (
          <div id="pix-info-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#241710] border border-[#d4af37]/30 p-6 md:p-8 rounded-2xl max-w-md w-full relative space-y-4 shadow-2xl text-center"
            >
              <button 
                onClick={() => setIsPixInfoOpen(false)} 
                className="absolute top-4 right-4 text-[#a08e82] hover:text-[#d4af37]"
              >
                <XButton />
              </button>

              <div className="w-14 h-14 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto border border-[#d4af37]/30">
                <CreditCard className="w-7 h-7 text-[#d4af37]" />
              </div>

              <h3 className="font-display text-lg font-bold text-[#d4af37]">Pagamento Instantâneo via PIX</h3>
              <p className="text-xs text-[#a08e82] leading-relaxed">
                Utilize nossa chave PIX oficial para efetuar pagamentos ou adiantar o sinal do seu agendamento na Ânima Zen.
              </p>

              <div className="bg-[#1c120c] p-4 rounded-xl border border-[#3e2719] space-y-3">
                
                {/* QR Code */}
                <div className="bg-white p-2 rounded-lg inline-block mx-auto shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020101021126430014BR.GOV.BCB.PIX0111${encodeURIComponent(pixKey)}520400005303986540550.005802BR5909Anima_Zen6009Fortaleza62070503***6304724A`}
                    alt="PIX QR Code" 
                    className="w-[120px] h-[120px]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-left space-y-1">
                  <span className="text-[10px] text-[#a08e82] font-semibold">Chave PIX (WhatsApp / Celular):</span>
                  <div className="flex items-center gap-2 bg-[#2d1e16] p-2 rounded border border-[#3e2719] justify-between">
                    <span className="font-mono text-xs text-[#f7efe9]">{pixKey}</span>
                    <button 
                      onClick={copyPixKey}
                      className="px-2.5 py-1 bg-[#d4af37] text-[#1c120c] rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPix ? 'Copiado!' : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <div className="text-[10px] text-[#a08e82] leading-relaxed">
                * Após a transação, envie o comprovante para o número <strong className="text-[#d4af37]">(85) 99634-1602</strong> junto com seu nome para liberação imediata.
              </div>

              <button
                onClick={() => setIsPixInfoOpen(false)}
                className="w-full py-2 bg-[#1c120c] border border-[#3e2719] text-[#f7efe9] text-xs font-bold rounded-lg hover:bg-[#2d1e16] transition-colors"
              >
                Fechar Janela
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Zen Ambient Music Player */}
      <AmbientPlayer musicUrl={clinicaSettings.musicUrl} />

      {/* --- FLOATING COGNITIVE AI ASSISTANT CHAT ENGINE --- */}
      <AIAssistantChat 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
        clinicaSettings={clinicaSettings} 
      />

      {/* --- CLINICAL HEALTH ANAMNESE FORM MODAL --- */}
      <AnimatePresence>
        {isAnamneseOpen && (
          <AnamneseModal 
            isOpen={isAnamneseOpen} 
            onClose={() => setIsAnamneseOpen(false)} 
            phoneClinica={clinicaSettings.phone} 
          />
        )}
      </AnimatePresence>

      {/* --- CLIENT REVIEWS & TESTIMONIALS MODAL --- */}
      <AnimatePresence>
        {isReviewsOpen && (
          <ReviewsModal
            isOpen={isReviewsOpen}
            onClose={() => setIsReviewsOpen(false)}
            testimonials={testimonials}
            onAddReview={handleAddReview}
          />
        )}
      </AnimatePresence>

      {/* --- CLINICAL LOCATION MAP MODAL --- */}
      <AnimatePresence>
        {isLocationOpen && (
          <LocationModal
            isOpen={isLocationOpen}
            onClose={() => setIsLocationOpen(false)}
            clinicaSettings={clinicaSettings}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple internal helper component to avoid JSX errors
function XButton() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
