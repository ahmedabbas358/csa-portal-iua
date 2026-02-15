import React from 'react';
import { Phone, Info, GraduationCap, MapPin } from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  const isAr = lang === 'ar';

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-start">
          {/* Identity Section */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h3 className={`text-white text-lg font-bold ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'جمعية الحاسوب' : 'Computer Student Association'}
            </h3>
            <p className="flex items-center gap-2 text-sm">
              <GraduationCap size={16} className="text-brand-500" />
              <span>{isAr ? 'كلية دراسات الحاسوب' : 'Faculty of Computer Studies'}</span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-brand-500" />
              <span>{isAr ? 'جامعة إفريقيا العالمية' : 'International University of Africa'}</span>
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <button 
              onClick={() => {
                onNavigate('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 hover:text-brand-400 transition-colors"
            >
              <Phone size={16} />
              <span>{isAr ? 'اتصل بنا' : 'Contact Us'}</span>
            </button>
            <button 
              onClick={() => {
                onNavigate('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 hover:text-brand-400 transition-colors"
            >
              <Info size={16} />
              <span>{isAr ? 'من نحن' : 'About Us'}</span>
            </button>
          </div>
          
           {/* Copyright / Extra */}
           <div className="flex flex-col items-center md:items-end justify-center space-y-2">
             <div className="text-xs text-slate-500">
               &copy; {new Date().getFullYear()} {isAr ? 'جمعية طلاب الحاسوب' : 'CS Student Association'}.
             </div>
             <div className="text-xs text-slate-600">
               {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
             </div>
           </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
