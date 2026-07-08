export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes, e.g., 60
  price: number;
  category: 'individual' | 'combo';
  imageUrl?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  active: boolean;
}

export interface Curiosity {
  id: string;
  title: string;
  content: string;
  icon?: string; // name of a lucide icon
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatarUrl: string;
  rating: number; // 1 to 5
  content: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  clientName: string;
  clientWhatsApp: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  observations?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'collaborator';
  passcode: string; // simpler credential entry
}

export interface ClinicaSettings {
  address: string;
  phone: string;
  instagramUrl: string;
  youtubeUrl: string; // Theme "Não é toque!"
  logoUrl: string;
  spaceImageUrl: string;
  spaceVideos: string[];
  musicUrl?: string;
  anamneseUrl?: string; // Google Forms link
  fontSans?: string;
  fontSerif?: string;
  fontDisplay?: string;
  primaryColor?: string;
  primaryHoverColor?: string;
  bgColor?: string;
  accentColor?: string;
  textDarkColor?: string;
  borderColor?: string;
}

export interface AboutSettings {
  photoUrl: string;
  history: string;
  education: string;
  certificates: string;
  specialties: string;
  mission: string;
  values: string;
}

