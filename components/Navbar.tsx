
import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, UserCircle, LogIn, Moon, Sun } from 'lucide-react';
import { Language, AppSettings } from '../types';
import { LABELS } from '../constants';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  currentPage: string;
  setPage: (p: string) => void;
  isLoggedIn: boolean;
  settings: AppSettings;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ lang, setLang, currentPage, setPage, isLoggedIn, settings, isDarkMode, setIsDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isRtl = lang === 'ar';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: LABELS.home[lang] },
    { id: 'about', label: LABELS.about[lang] },
    { id: 'events', label: LABELS.events[lang] },
    { id: 'team', label: LABELS.team[lang] },
    { id: 'contact', label: isRtl ? 'اتصل بنا' : 'Contact' },
  ];

  if (isLoggedIn) {
    navItems.push({ id: 'admin', label: LABELS.admin[lang] });
  }

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
    setIsOpen(false);
  };

  // Smart Glass Button Style - High Contrast for White Backgrounds
  const glassButtonStyle = isScrolled 
    ? 'bg-white/70 dark:bg-slate-800/80 backdrop-blur-md border border-gray-300/60 dark:border-slate-600 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500' 
    : 'bg-black/10 dark:bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 shadow-lg';

  return (
    <nav 
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${isRtl ? 'font-arabic' : 'font-sans'} ${isScrolled ? 'glass dark:bg-slate-900/80 dark:border-slate-800 shadow-sm py-3' : 'bg-transparent py-5'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer group" onClick={() => setPage('home')}>
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                 <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})` }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  CSA
                </div>
              )}
              <div className="hidden lg:block">
                <h1 className={`text-lg font-bold leading-tight transition-colors ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white md:text-white md:drop-shadow-md'}`}>
                  {lang === 'ar' ? settings.siteNameAr : settings.siteNameEn}
                </h1>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center p-1.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50' : 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg'}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                  currentPage === item.id
                    ? 'shadow-md transform scale-105'
                    : isScrolled ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-700/50' : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
                style={{ 
                    backgroundColor: currentPage === item.id ? (isScrolled ? 'var(--primary-color)' : 'white') : 'transparent',
                    color: currentPage === item.id ? (isScrolled ? 'var(--primary-contrast)' : settings.primaryColor) : undefined
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
             {/* Dark Mode Toggle */}
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all backdrop-blur-md border ${glassButtonStyle}`}
             >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>

            <button
              onClick={toggleLang}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold border backdrop-blur-md ${glassButtonStyle}`}
            >
              <Globe size={14} />
              <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
            </button>
            
            {!isLoggedIn ? (
               <button
               onClick={() => setPage('login')}
               className="hidden md:flex items-center gap-2 text-white px-5 py-2 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold text-sm relative overflow-hidden group border border-white/10"
               style={{ backgroundColor: settings.secondaryColor }}
             >
               <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
               <LogIn size={16} className="relative z-10"/>
               <span className="relative z-10">{LABELS.login[lang]}</span>
             </button>
            ) : (
                <button
                onClick={() => setPage('admin')}
                className={`hidden md:flex items-center gap-2 font-medium p-2 rounded-full transition-colors shadow-md border backdrop-blur-md ${glassButtonStyle}`}
                title={LABELS.admin[lang]}
              >
                <UserCircle size={24} />
              </button>
            )}

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-colors backdrop-blur-md border ${glassButtonStyle}`}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-fade-in flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Menu</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"><X size={24}/></button>
          </div>
          <div className="p-6 space-y-2 flex-grow overflow-y-auto">
            {navItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-6 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform ${
                   currentPage === item.id
                    ? 'bg-brand-50 dark:bg-slate-800 shadow-sm translate-x-2'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:translate-x-2'
                }`}
                style={{ 
                    animationDelay: `${idx * 50}ms`,
                    color: currentPage === item.id ? settings.primaryColor : undefined,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 space-y-4">
             {!isLoggedIn ? (
                <button
                  onClick={() => {
                    setPage('login');
                    setIsOpen(false);
                  }}
                  className={`w-full text-center px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg`}
                  style={{ backgroundColor: settings.secondaryColor }}
                >
                  {LABELS.login[lang]}
                </button>
             ) : (
                <button
                  onClick={() => {
                    setPage('admin');
                    setIsOpen(false);
                  }}
                   className={`w-full text-center px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg`}
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {LABELS.admin[lang]}
                </button>
             )}
             <div className="flex gap-4">
                 <button
                    onClick={toggleLang}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-200 dark:border-slate-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <Globe size={20} /> {lang === 'en' ? 'عربي' : 'English'}
                  </button>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-200 dark:border-slate-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>} {isDarkMode ? 'Light' : 'Dark'}
                  </button>
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;