
export type Language = 'en' | 'ar';

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export type MemberRole = 'executive' | 'head' | 'member';

export interface Member {
  id: string;
  name: string;
  role: string; // The specific job title (e.g., "Content Creator")
  roleAr: string;
  office: string; // The Office/Department (e.g., "Media Office", "Academic Office")
  officeAr: string;
  category: MemberRole; // Hierarchy level
  term: string; // e.g., "2023-2024", "2024-2025" for archiving
  image?: string;
  email?: string;
  phone?: string;
}

export interface EventItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  date: string;
  time: string;
  image?: string; // treated as media url
  mediaType?: 'image' | 'video';
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'story'; // New: Control display size
  isCompleted: boolean; // Manual override
  location: string;
  locationAr: string;
  type?: string;
  registrationLink?: string;
  isOnline?: boolean; // New: Support for electronic events
  meetingLink?: string; // Zoom or Google Meet link for online events
}

export interface PostDesignConfig {
  overlayText?: string;
  fontStyle: 'modern' | 'classic' | 'typewriter' | 'neon' | 'strong';
  textColor: string;
  textAlignment: 'left' | 'center' | 'right';
  overlayOpacity: number; // 0 to 100
  // New: Image Manipulation
  imagePosition?: {
    x: number; // 0-100%
    y: number; // 0-100%
    scale: number; // 1-2
  };
  // New: Image Filters
  filters?: {
    brightness: number; // 100 base
    contrast: number;   // 100 base
    saturate: number;   // 100 base
    grayscale: number;  // 0 base
    sepia: number;      // 0 base
  };
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  image?: string; // Legacy support
  mediaType?: 'image' | 'video'; // Legacy support
  media?: MediaItem[]; // New: Supports multiple media items
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'story';
  design?: PostDesignConfig;
  views: number;
  likes: number;
  likedByCurrentUser?: boolean;
  datePublished?: string;
  status: 'published' | 'draft' | 'scheduled';
  scheduledDate?: string;
  lastUpdated?: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: 'Layers' | 'BookOpen' | 'Zap' | 'Target' | 'Star' | 'Trophy' | 'Globe' | 'Users';
}

export interface AppSettings {
  siteNameEn: string;
  siteNameAr: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  aboutTextAr: string;
  aboutTextEn: string;
  visionAr: string;
  visionEn: string;
  missionAr: string;
  missionEn: string;
  backgroundPattern?: BackgroundPattern;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // New: Border Radius Control
  animationSpeed?: 'slow' | 'normal' | 'fast'; // New: Animation Speed
  fontStyle?: 'sans' | 'serif' | 'mono' | 'cairo' | 'inter'; // New: Font Family
}

export type BackgroundPattern = 'none' | 'cubes' | 'dots' | 'lines' | 'waves' | 'grid' | 'hexagons' | 'circuit' | 'leaf' | 'diamond' | 'zigzag' | 'circles' | 'topography' | 'texture' | 'gradient-radial' | 'gradient-linear';

export interface ThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: BackgroundPattern;
}

// --- SECURITY TYPES ---

export type AdminRole = 'President' | 'Vice President' | 'General Secretary' | 'Media Head';

export interface AccessKey {
  token: string;
  role: AdminRole;
  generatedAt: string;
  expiresAt: string;
  isUsed: boolean;
  generatedBy: string;
}

export interface ActiveSession {
  sessionId: string;
  tokenUsed: string;
  role: AdminRole;
  deviceInfo: string;
  ipAddress: string;
  loginTime: string;
  isActive: boolean;
}

// New: Dean Security Configuration for persistence
export interface DeanSecurityConfig {
  masterKey: string;
  securityQuestion: string;
  securityAnswer: string; // In real app, hash this
  backupCode: string;
  lastChanged: string;
}

export interface AppState {
  events: EventItem[];
  members: Member[];
  news: NewsPost[];
  settings: AppSettings;
  accessKeys: AccessKey[];
  sessions: ActiveSession[];
  timeline: TimelineItem[];
  deanConfig?: DeanSecurityConfig; // Added this
}
