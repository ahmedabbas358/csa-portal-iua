
import React from 'react';
import { Language, AppSettings, TimelineItem } from '../types';
import { Target, Eye, BookOpen, Layers, ChevronRight, Zap, Star, Trophy, Globe, Users, Award } from 'lucide-react';

interface AboutProps {
  lang: Language;
  settings: AppSettings;
  timeline: TimelineItem[];
}

const About: React.FC<AboutProps> = ({ lang, settings, timeline }) => {
  const isRtl = lang === 'ar';

  const getIcon = (iconName: string) => {
      switch (iconName) {
          case 'Layers': return Layers;
          case 'BookOpen': return BookOpen;
          case 'Zap': return Zap;
          case 'Target': return Target;
          case 'Star': return Star;
          case 'Trophy': return Trophy;
          case 'Globe': return Globe;
          case 'Users': return Users;
          case 'Award': return Award;
          default: return Layers;
      }
  };

  return (
    <div className={`min-h-screen ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'} bg-white dark:bg-slate-900 transition-colors duration-500`}>
      
      {/* Header */}
      <div className="bg-brand-900 text-white pt-28 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 md:w-96 md:h-96 bg-brand-500 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-secondary-500 rounded-full blur-[100px] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-xs md:text-sm font-bold mb-6 text-brand-200 backdrop-blur-md shadow-lg animate-fade-in">
                {isRtl ? 'منذ 2010' : 'Established 2010'}
            </span>
            <h1 className="text-4xl md:text-7xl font-black mb-6 md:mb-8 leading-tight tracking-tight drop-shadow-sm">
                {lang === 'ar' ? 'من نحن؟' : 'Who We Are'}
            </h1>
            <p className="text-lg md:text-2xl text-brand-100 max-w-4xl mx-auto leading-relaxed font-light opacity-90 px-4">
                {lang === 'ar' ? settings.aboutTextAr : settings.aboutTextEn}
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24 md:mb-32 -mt-10 md:-mt-20 relative z-20">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-brand-900/5 dark:shadow-black/30 border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-24 md:p-32 bg-brand-50 dark:bg-brand-900/20 rounded-bl-[10rem] -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 md:mb-8 relative z-10 shadow-sm">
                    <Target size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 relative z-10">{lang === 'ar' ? 'الرسالة' : 'Our Mission'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-loose relative z-10 font-medium">
                    {lang === 'ar' ? settings.missionAr : settings.missionEn}
                </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-brand-900/5 dark:shadow-black/30 border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-24 md:p-32 bg-amber-50 dark:bg-amber-900/20 rounded-bl-[10rem] -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                 <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 md:mb-8 relative z-10 shadow-sm">
                    <Eye size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 relative z-10">{lang === 'ar' ? 'الرؤية' : 'Our Vision'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-loose relative z-10 font-medium">
                     {lang === 'ar' ? settings.visionAr : settings.visionEn}
                </p>
            </div>
        </div>

        {/* Timeline Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-32">
                <div className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider text-xs md:text-sm mb-4 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full">
                    <Layers size={16}/> {lang === 'ar' ? 'تاريخنا' : 'Timeline'}
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                    {lang === 'ar' ? 'مسيرة العطاء والتميز' : 'A Legacy of Excellence'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg leading-relaxed mb-8">
                    {lang === 'ar' 
                        ? 'انطلقت الجمعية برؤية طموحة لتطوير الطالب الجامعي، وواصلت النمو عاماً بعد عام لتحقق إنجازات ملموسة في المجال التقني والأكاديمي.' 
                        : 'The association started with an ambitious vision to develop university students and continued to grow year after year, achieving tangible achievements in the technical and academic fields.'}
                </p>
                <div className="hidden lg:block">
                     <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200">
                        {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'} <ChevronRight size={18} className={isRtl ? 'rotate-180' : ''}/>
                     </button>
                </div>
            </div>
            
            <div className="lg:col-span-8">
                 <div className="relative border-l-4 border-gray-100 dark:border-slate-800 ml-3 md:ml-10 space-y-12 md:space-y-16">
                    {timeline.map((item, idx) => {
                        const IconComponent = getIcon(item.icon);
                        return (
                        <div key={item.id} className="relative pl-8 md:pl-16 group">
                             {/* Timeline Dot */}
                             <div className="absolute -left-[11px] top-1 md:-left-[14px] md:top-1 w-6 h-6 md:w-7 md:h-7 bg-white dark:bg-slate-900 rounded-full border-[5px] md:border-[6px] border-gray-200 dark:border-slate-700 group-hover:border-brand-500 dark:group-hover:border-brand-400 transition-colors shadow-sm z-10"></div>
                            
                            <div className="group-hover:translate-x-2 transition-transform duration-300">
                                 <div className="flex items-center gap-4 mb-2 md:mb-4">
                                     <span className="text-4xl md:text-5xl font-black text-gray-200 dark:text-slate-700 group-hover:text-brand-200 dark:group-hover:text-brand-900 transition-colors">{item.year}</span>
                                     <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-400 dark:text-gray-500 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                                         <IconComponent size={20} />
                                     </div>
                                 </div>
                                 <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">{lang === 'ar' ? item.titleAr : item.titleEn}</h3>
                                 <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg leading-relaxed">{lang === 'ar' ? item.descAr : item.descEn}</p>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default About;
