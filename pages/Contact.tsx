
import React from 'react';
import { Language, AppSettings } from '../types';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, Globe, MessageCircle, AlertCircle } from 'lucide-react';

interface ContactProps {
    lang: Language;
    settings: AppSettings;
}

const Contact: React.FC<ContactProps> = ({ lang, settings }) => {
    const isRtl = lang === 'ar';

    return (
        <div className={`min-h-screen pt-24 md:pt-32 pb-12 ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'} bg-gray-50 dark:bg-slate-900 transition-colors duration-500`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
                    <h2 className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-sm mb-4">
                        {isRtl ? 'تواصل معنا' : 'Get in Touch'}
                    </h2>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                        {isRtl ? 'نحن هنا للاستماع إليك' : 'We are here to hear from you'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl leading-relaxed">
                        {isRtl
                            ? 'سواء كان لديك استفسار، اقتراح، أو ترغب في الانضمام إلينا، لا تتردد في التواصل.'
                            : 'Whether you have a question, suggestion, or want to join us, feel free to reach out.'}
                    </p>
                </div>

                {/* Content Availability Placeholder */}
                <div className="max-w-2xl mx-auto mb-12 animate-fade-in delay-100">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-4">
                        <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1">{isRtl ? 'ملاحظة هامة' : 'Important Notice'}</h4>
                            <p className="text-amber-700/80 dark:text-amber-400/70 text-xs leading-relaxed">
                                {isRtl
                                    ? 'نعمل حالياً على تحديث قنوات التواصل المباشر. قد يتأخر الرد قليلاً خلال هذه الفترة الانتقالية.'
                                    : 'We are currently updating our direct communication channels. Responses might be delayed during this transition period.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-brand-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{isRtl ? 'البريد الإلكتروني' : 'Email Us'}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                                {isRtl ? 'فريقنا متاح للرد على استفساراتكم.' : 'Our team is here to help.'}
                            </p>
                            <a href="mailto:info@csa.edu.sd" className="text-brand-600 dark:text-brand-400 font-bold hover:underline dir-ltr block">info@csa.edu.sd</a>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-accent-500/10 rounded-2xl flex items-center justify-center text-accent-600 mb-6 group-hover:scale-110 transition-transform">
                                <MapPin size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{isRtl ? 'الموقع' : 'Location'}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                                {isRtl ? 'جامعة أفريقيا العالمية، كلية دراسات الحاسوب' : 'International University of Africa, Faculty of Computer Studies'}
                            </p>
                            <a href="https://maps.google.com" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-2">
                                {isRtl ? 'عرض على الخريطة' : 'View on Map'}
                            </a>
                        </div>

                        <div className="bg-gradient-to-br from-brand-900 to-brand-700 p-8 rounded-[2rem] shadow-xl text-white">
                            <h3 className="text-xl font-bold mb-6">{isRtl ? 'تابعنا على التواصل' : 'Follow Us'}</h3>
                            <div className="flex gap-4 flex-wrap">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Facebook"><Facebook size={20} /></a>
                                {/* X Icon (formerly Twitter) */}
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="X (Twitter)">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Instagram"><Instagram size={20} /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="LinkedIn"><Linkedin size={20} /></a>
                                {/* WhatsApp Channel */}
                                <a href="#" className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors" title="WhatsApp Channel"><MessageCircle size={20} /></a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-slate-700 transition-all">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <MessageCircle className="text-brand-500" />
                                {isRtl ? 'أرسل لنا رسالة' : 'Send us a Message'}
                            </h3>

                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message Sent!'); }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                                        <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-gray-900 dark:text-white" placeholder={isRtl ? "مثال: محمد أحمد" : "e.g. John Doe"} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                                        <input type="email" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-gray-900 dark:text-white" placeholder="email@example.com" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isRtl ? 'الموضوع' : 'Subject'}</label>
                                    <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-gray-900 dark:text-white" placeholder={isRtl ? "كيف يمكننا مساعدتك؟" : "How can we help?"} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isRtl ? 'الرسالة' : 'Message'}</label>
                                    <textarea rows={6} className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-gray-900 dark:text-white" placeholder={isRtl ? "اكتب رسالتك هنا..." : "Write your message here..."}></textarea>
                                </div>

                                <div className="pt-4">
                                    <button type="submit" className="w-full md:w-auto px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                        {isRtl ? 'إرسال الرسالة' : 'Send Message'}
                                        <Send size={20} className={isRtl ? 'rotate-180' : ''} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
