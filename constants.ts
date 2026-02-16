
import { Translation, AppState } from './types';

// THE DEAN'S MASTER KEY (56 Characters)
export const DEAN_MASTER_KEY = "CSA_MASTER_KEY_2024_AFRICA_UNI_SECURE_ACCESS_V1_X99_AB7_KL2";

export const LABELS: Translation = {
  home: { en: 'Feed', ar: 'الرئيسية' },
  about: { en: 'About', ar: 'عن الجمعية' },
  events: { en: 'Events', ar: 'الفعاليات' },
  team: { en: 'Team', ar: 'الأعضاء' },
  admin: { en: 'Dashboard', ar: 'لوحة التحكم' },
  login: { en: 'Login', ar: 'دخول' },
  logout: { en: 'Logout', ar: 'خروج' },
  upcomingEvents: { en: 'Upcoming', ar: 'القادمة' },
  pastEvents: { en: 'Past', ar: 'السابقة' },
  readMore: { en: 'View Details', ar: 'التفاصيل' },
  createPost: { en: 'Create Post', ar: 'منشور جديد' },
  createEvent: { en: 'Create Event', ar: 'فعالية جديدة' },
  addMember: { en: 'Add Member', ar: 'إضافة عضو' },
  aiAssist: { en: 'AI Magic', ar: 'الذكاء الاصطناعي' },
  joinUs: { en: 'Join Us', ar: 'انضم إلينا' },
  stats_members: { en: 'Members', ar: 'الأعضاء' },
  stats_events: { en: 'Events', ar: 'الفعاليات' },
  stats_years: { en: 'Years', ar: 'السنوات' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  save: { en: 'Save', ar: 'حفظ' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  likes: { en: 'Likes', ar: 'إعجاب' },
  comments: { en: 'Comments', ar: 'تعليق' },
};

export const INITIAL_STATE: AppState = {
  settings: {
    siteNameEn: 'CS Student Association',
    siteNameAr: 'جمعية طلاب الحاسوب',
    logoUrl: '',
    primaryColor: '#0284c7',
    secondaryColor: '#0c4a6e',
    aboutTextAr: 'جمعية طلابية متخصصة في مجال الحاسب الآلي تم إنشائها في 2010 بواسطة طلاب من كلية دراسات الحاسوب بجامعة أفريقيا العالمية. نسعى لتمكين الطالب التقني من خلال بيئة تعليمية وعملية محفزة.',
    aboutTextEn: 'A student association specialized in the field of Computer Science, established in 2010 by students from the Faculty of Computer Studies at the International University of Africa.',
    visionAr: 'أن نكون المنصة الرائدة في تمكين طلاب الحاسوب وبناء قادة المستقبل التقني.',
    visionEn: 'To be the leading platform in empowering computer students and building future tech leaders.',
    missionAr: 'سد الفجوة بين المنهج الأكاديمي وسوق العمل من خلال ورش العمل والمشاريع.',
    missionEn: 'Bridging the gap between academic curriculum and the job market through workshops and projects.',
    borderRadius: 'xl',
    animationSpeed: 'normal',
    fontStyle: 'cairo',
    backgroundPattern: 'none'
  },
  events: [
    {
      id: '1',
      title: 'AI Summit 2024',
      titleAr: 'قمة الذكاء الاصطناعي',
      description: 'Join us for a day full of innovation and AI talks.',
      descriptionAr: 'انضم إلينا في يوم مليء بالابتكار ومحاضرات الذكاء الاصطناعي.',
      date: '2024-12-15',
      time: '09:00 AM',
      isCompleted: false,
      location: 'Main Hall',
      locationAr: 'القاعة الرئيسية',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
      type: 'Summit'
    },
    {
      id: '2',
      title: 'Web Dev Workshop',
      titleAr: 'ورشة تطوير الويب',
      description: 'Learn React from scratch.',
      descriptionAr: 'تعلم React من الصفر.',
      date: '2024-11-20',
      time: '11:00 AM',
      isCompleted: true,
      location: 'Lab 3',
      locationAr: 'معمل 3',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      type: 'Workshop'
    }
  ],
  members: [
    {
      id: 'm1',
      name: 'Ahmed Ali',
      role: 'President',
      roleAr: 'رئيس الجمعية',
      office: 'Executive Office',
      officeAr: 'المكتب التنفيذي',
      category: 'executive',
      term: '2024-2025',
      image: 'https://i.pravatar.cc/300?img=11',
      email: 'pres@csa.edu'
    },
    {
      id: 'm2',
      name: 'Sarah Omer',
      role: 'Media Head',
      roleAr: 'رئيس المكتب الإعلامي',
      office: 'Media Office',
      officeAr: 'المكتب الإعلامي',
      category: 'head',
      term: '2024-2025',
      image: 'https://i.pravatar.cc/300?img=5',
      email: 'media@csa.edu'
    }
  ],
  news: [
    {
      id: 'n1',
      title: 'Tech Week is coming!',
      content: 'Get ready for the biggest tech event of the year. #TechWeek #CSA',
      date: '2024-10-15',
      author: 'Media Team',
      tags: ['Events'],
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
      views: 1240,
      likes: 124,
      likedByCurrentUser: false,
      status: 'published',
      design: {
        fontStyle: 'modern',
        textColor: '#ffffff',
        textAlignment: 'center',
        overlayText: '',
        overlayOpacity: 30,
        imagePosition: { x: 50, y: 50, scale: 1 },
        filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 }
      }
    },
    {
      id: 'n2',
      title: 'New Board Members',
      content: 'Welcoming our new executive board for the 2024 term. We are excited for what is to come!',
      date: '2024-09-01',
      author: 'Admin',
      tags: ['News'],
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
      views: 3420,
      likes: 89,
      likedByCurrentUser: true,
      status: 'published',
      design: {
        fontStyle: 'modern',
        textColor: '#ffffff',
        textAlignment: 'center',
        overlayText: '',
        overlayOpacity: 30,
        imagePosition: { x: 50, y: 50, scale: 1 },
        filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 }
      }
    }
  ],
  timeline: [
    { id: 't1', year: '2010', icon: 'Layers', titleAr: 'التأسيس', titleEn: 'The Beginning', descAr: 'انطلاق الجمعية بكلية دراسات الحاسوب، جامعة أفريقيا العالمية.', descEn: 'The association was founded at the Faculty of Computer Studies, IUA.' },
    { id: 't2', year: '2015', icon: 'BookOpen', titleAr: 'النقلة النوعية', titleEn: 'Major Expansion', descAr: 'إطلاق أول مؤتمر تقني سنوي وتوسيع قاعدة العضوية.', descEn: 'Launch of the first annual tech conference and membership expansion.' },
    { id: 't3', year: '2020', icon: 'Zap', titleAr: 'التحول الرقمي', titleEn: 'Digital Shift', descAr: 'التركيز على الفعاليات الافتراضية والمسابقات البرمجية العالمية.', descEn: 'Focus on virtual events and global programming competitions.' },
    { id: 't4', year: '2024', icon: 'Target', titleAr: 'نحو المستقبل', titleEn: 'Future Horizons', descAr: 'إطلاق المنصة الجديدة وتوسيع الشراكات مع سوق العمل.', descEn: 'Launching the new platform and expanding partnerships with the job market.' },
  ],
  accessKeys: [],
  sessions: []
};
