import { Service, Banner, Curiosity, Testimonial, Booking, AdminUser, ClinicaSettings, AboutSettings } from '../types';

export const initialServices: Service[] = [
  {
    id: 'individual-1',
    name: 'Massagem Relaxante Ânima',
    description: 'Uma massagem suave que utiliza óleos essenciais aquecidos para aliviar a tensão muscular, promover relaxamento profundo e restaurar o equilíbrio físico e mental.',
    duration: 60,
    price: 120,
    category: 'individual',
    imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'individual-2',
    name: 'Massagem Terapêutica Profunda',
    description: 'Focada na liberação de pontos de gatilho e tensões musculares crônicas. Ideal para alívio de dores intensas, estresse acumulado e reabilitação postural.',
    duration: 60,
    price: 140,
    category: 'individual',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac9283ca47?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'individual-3',
    name: 'Drenagem Linfática Corporal',
    description: 'Técnica suave de massagem que estimula o sistema linfático, auxiliando na eliminação de toxinas, melhora da circulação e redução significativa do inchaço corporal.',
    duration: 75,
    price: 130,
    category: 'individual',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'individual-4',
    name: 'Massagem Integrativa com Pedras Quentes',
    description: 'A sinergia perfeita entre a massagem terapêutica e o calor de pedras vulcânicas polidas, proporcionando relaxamento profundo das fibras musculares e bem-estar espiritual.',
    duration: 80,
    price: 160,
    category: 'individual',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'individual-5',
    name: 'Reflexologia Podal',
    description: 'Massagem terapêutica e precisa nos pontos reflexos dos pés que correspondem a diferentes órgãos e sistemas corporais, equilibrando a energia vital e combatendo o estresse.',
    duration: 45,
    price: 90,
    category: 'individual',
    imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop'
  }
];

export const initialCombos: Service[] = [
  {
    id: 'combo-1',
    name: 'Combo Bem-Estar Supremo',
    description: 'Massagem Relaxante Ânima (60 min) + Escalda-pés terapêutico com sais de lavanda, óleos essenciais e calêndula (20 min) + Servido com Chá de Ervas Orgânico.',
    duration: 80,
    price: 170,
    category: 'combo',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'combo-2',
    name: 'Combo Renovação Absoluta',
    description: 'Massagem Terapêutica Profunda (60 min) + Reflexologia Podal Express (30 min) + Alinhamento Energético com Cristais e Difusão de Aromaterapia Personalizada.',
    duration: 90,
    price: 210,
    category: 'combo',
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'combo-3',
    name: 'Combo Spa Detox & Face',
    description: 'Drenagem Linfática Corporal Completa (75 min) + Massagem Facial Revitalizante e Hidratação profunda (20 min) + Escalda-pés purificante com argila verde e menta.',
    duration: 110,
    price: 230,
    category: 'combo',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac9283ca47?q=80&w=600&auto=format&fit=crop'
  }
];

export const initialBanners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Combo Bem-Estar com Desconto Especial',
    subtitle: 'Massagem Relaxante + Escalda-pés com ervas e sais minerais para acalmar a mente e o corpo neste mês.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    active: true
  },
  {
    id: 'banner-2',
    title: 'Desperte sua Energia Vital',
    subtitle: 'Massagens terapêuticas profundas personalizadas para aliviar o estresse acumulado da semana.',
    imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1200&auto=format&fit=crop',
    active: true
  },
  {
    id: 'banner-3',
    title: 'Ritual com Pedras Quentes',
    subtitle: 'Aqueça seu corpo e sua alma com o poder terapêutico das pedras vulcânicas aquecidas e óleos florais.',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=1200&auto=format&fit=crop',
    active: true
  }
];

export const initialCuriosities: Curiosity[] = [
  {
    id: 'curio-1',
    title: 'Reduz o Cortisol',
    content: 'Você sabia? Estudos comprovam que uma única sessão de massoterapia reduz significativamente os níveis de cortisol, o hormônio do estresse, trazendo calma instantânea.',
    icon: 'Sparkles'
  },
  {
    id: 'curio-2',
    title: 'Melhora Profundamente o Sono',
    content: 'A massagem estimula a produção de serotonina, neurotransmissor que é precursor da melatonina, regulando os ciclos de sono e combatendo a insônia crônica.',
    icon: 'Moon'
  },
  {
    id: 'curio-3',
    title: 'Fortalece o Sistema Imunológico',
    content: 'Ao estimular a circulação e o fluxo linfático, a massoterapia ajuda o corpo a produzir mais glóbulos brancos, aumentando a defesa contra vírus e bactérias.',
    icon: 'Shield'
  },
  {
    id: 'curio-4',
    title: 'Alivia Dores de Cabeça',
    content: 'Massagens focadas nas escápulas, pescoço e crânio aliviam a tensão muscular profunda que frequentemente causa cefaleia tensional e enxaqueca.',
    icon: 'Activity'
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Mariana Souza',
    role: 'Cliente Mensal',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    content: 'O atendimento da Ânima Zen é simplesmente indescritível! Desde o escalda-pés cortesia com ervas de boas-vindas até o toque humanizado das profissionais. Saí flutuando e renovada!'
  },
  {
    id: 'test-2',
    name: 'Carlos Eduardo',
    role: 'Atleta Amador',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    content: 'Como praticante de corrida de rua, sofro muito com contraturas acumuladas. A massagem terapêutica deles é cirúrgica, focando exatamente nos meus pontos de dor com muito cuidado.'
  },
  {
    id: 'test-3',
    name: 'Beatriz Vasconcelos',
    role: 'Advogada',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    content: 'O ambiente é impecável, com cores de terra acolhedoras, incensos suaves e luz baixa. É um verdadeiro portal de tranquilidade no meio da correria urbana de Fortaleza.'
  }
];

export const initialBookings: Booking[] = [
  {
    id: 'booking-1',
    serviceId: 'combo-1',
    serviceName: 'Combo Bem-Estar Supremo',
    servicePrice: 170,
    clientName: 'Ana Clara Silva',
    clientWhatsApp: '(85) 98765-4321',
    date: '2026-07-08',
    time: '14:30',
    observations: 'Gostaria de foco nos ombros devido à tensão do trabalho.',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'booking-2',
    serviceId: 'individual-2',
    serviceName: 'Massagem Terapêutica Profunda',
    servicePrice: 140,
    clientName: 'Marcos Oliveira',
    clientWhatsApp: '(85) 99122-3344',
    date: '2026-07-09',
    time: '10:00',
    observations: 'Muita tensão na região cervical.',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'user-1',
    username: 'Larissa',
    role: 'admin',
    passcode: '1234'
  },
  {
    id: 'user-2',
    username: 'Atendente Zen',
    role: 'collaborator',
    passcode: '4321'
  }
];

export const initialClinicaSettings: ClinicaSettings = {
  address: 'Rua Joana Angélica, 13 - Conj. Maria Tomasia, Fortaleza - CE',
  phone: '85996341602',
  instagramUrl: 'https://instagram.com/animazen_massoterapia',
  youtubeUrl: 'https://www.youtube.com/@Naoetoque_massagens', // Canal "Não é Toque!"
  logoUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400',
  spaceImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800',
  spaceVideos: [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Vídeo de exemplo que pode ser alterado
  ],
  musicUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A', // Link de música relaxante padrão
  anamneseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScyO-84mC_m5h28K-N9n7Q5nSUp16x741h-Anamnese/viewform?usp=sf_link',
  fontSans: 'Inter',
  fontSerif: 'Playfair Display',
  fontDisplay: 'Cinzel',
  primaryColor: '#1b4332',
  primaryHoverColor: '#143f29',
  bgColor: '#fbfaf6',
  accentColor: '#b5850b',
  textDarkColor: '#3a271c',
  borderColor: '#dfd3c3'
};

export const initialAboutSettings: AboutSettings = {
  photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
  history: 'Olá! Sou Bia Lopes, terapeuta integrativa e fundadora da Ânima Zen. Minha jornada com o cuidado corporal começou há mais de uma década, motivada pela crença profunda de que o toque terapêutico e respeitoso tem o poder de curar não apenas o corpo físico, mas também as tensões mentais e emocionais acumuladas. Na Ânima Zen, desenvolvemos o conceito de massoterapia humanizada, onde cada cliente é recebido em sua totalidade, acolhido com presença absoluta, respeito e empatia profunda.',
  education: 'Graduação em Fisioterapia pela Universidade Federal, Especialização em Terapias Integrativas do Bem-Estar e Psicossomática.',
  certificates: 'Certificação Internacional em Massagem Sueca Clássica, Curso Avançado de Liberação Miofascial Instrumental e Manual, e Aperfeiçoamento em Shiatsu Tradicional e Massagem Ayurvédica.',
  specialties: 'Massoterapia Integrativa de Alta Performance, Alívio Clínico de Dores Musculares e Escapulares, Escalda-pés Aromaterápico com Sais Purificantes, Massagem com Pedras Quentes Vulcânicas e Drenagem Linfática Terapêutica.',
  mission: 'Proporcionar um verdadeiro santuário de bem-estar através do toque consciente e humanizado, restabelecendo a harmonia integral, aliviando o estresse severo e promovendo o autocuidado como um estilo de vida sustentável.',
  values: 'Acolhimento Humanizado e Incondicional, Presença Absoluta no Atendimento, Ética e Respeito Inegociáveis (Filosofia "Não é Toque!"), Excelência Técnica Terapêutica, e Personalização Absoluta de Cada Sessão.'
};

