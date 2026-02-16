
import React, { useState, useMemo } from 'react';
import { Language, Member } from '../types';
import { Mail, Briefcase, Calendar, ChevronDown, Users, User, History, Archive, ChevronRight, ChevronLeft, Building } from 'lucide-react';

interface TeamProps {
    lang: Language;
    members: Member[];
}

interface MemberCardProps {
    member: Member;
    large?: boolean;
    lang: Language;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, large = false, lang }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-slate-700 group ${large ? 'md:col-span-1' : ''} flex flex-col`}>
        <div className={`relative overflow-hidden bg-gray-200 dark:bg-slate-700 ${large ? 'aspect-[4/5]' : 'aspect-square'}`}>
            <img
                src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                {member.email && (
                    <a href={`mailto:${member.email}`} className="text-white/90 hover:text-white flex items-center justify-center gap-2 text-xs md:text-sm mb-2 opacity-0 group-hover:opacity-100 transition-all delay-75 backdrop-blur-md bg-white/10 py-2 rounded-xl border border-white/20">
                        <Mail size={14} /> {member.email}
                    </a>
                )}
            </div>
        </div>
        <div className="p-4 md:p-6 text-center relative bg-white dark:bg-slate-800 flex-grow flex flex-col justify-center transition-colors">
            <h3 className={`${large ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} font-bold text-gray-900 dark:text-white mb-2 leading-tight`}>{member.name}</h3>
            <p className="text-brand-600 dark:text-brand-400 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-brand-50 dark:bg-brand-900/30 inline-block px-3 py-1 rounded-full mb-2">
                {lang === 'ar' ? member.roleAr : member.role}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                {lang === 'ar' ? member.officeAr : member.office}
            </p>
        </div>
    </div>
);

const Team: React.FC<TeamProps> = ({ lang, members }) => {
    const isRtl = lang === 'ar';

    // 1. Extract Years for Archiving
    const years = useMemo(() => {
        const y = Array.from(new Set(members.map(m => m.term || 'Current')));
        return y.sort().reverse();
    }, [members]);

    const [selectedYear, setSelectedYear] = useState<string>(years[0] || '2024-2025');

    // Check if viewing archive
    const isArchiveView = selectedYear !== years[0];

    // 2. Filter Members by Year
    const yearMembers = useMemo(() => members.filter(m => (m.term || 'Current') === selectedYear), [members, selectedYear]);

    // 3. Extract Offices for Tabs
    const offices = useMemo(() => {
        const o = Array.from(new Set(yearMembers.map(m => isRtl ? m.officeAr || m.office : m.office || m.officeAr)));
        return ['All', ...o.filter(Boolean)];
    }, [yearMembers, isRtl]);

    const [selectedOffice, setSelectedOffice] = useState('All');

    // 4. Final Display List
    const displayedMembers = useMemo(() => {
        if (selectedOffice === 'All') return yearMembers;
        return yearMembers.filter(m => (isRtl ? m.officeAr || m.office : m.office || m.officeAr) === selectedOffice);
    }, [yearMembers, selectedOffice, isRtl]);

    const executives = displayedMembers.filter(m => m.category === 'executive');
    const heads = displayedMembers.filter(m => m.category === 'head');
    const regularMembers = displayedMembers.filter(m => m.category === 'member');

    return (
        <div className={`pt-24 md:pt-32 pb-20 ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'} bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-500`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header with Archive Selector */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <span className="text-brand-600 dark:text-brand-400 font-extrabold tracking-widest uppercase text-xs mb-3 block flex items-center gap-2">
                            <Users size={16} />
                            {lang === 'ar' ? 'الهيكل الإداري' : 'Organization Structure'}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                            {lang === 'ar' ? 'أعضاء الجمعية' : 'Our Team'}
                        </h2>
                        {isArchiveView && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-bold mt-2 border border-amber-200 dark:border-amber-800">
                                <Archive size={16} /> {lang === 'ar' ? 'أرشيف الإدارات السابقة' : 'Archive View'}
                            </div>
                        )}
                    </div>

                    {/* Year Archive Filter */}
                    <div className="relative group w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <History size={18} className={`${isArchiveView ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'} group-hover:text-brand-500 transition-colors`} />
                        </div>
                        <select
                            value={selectedYear}
                            onChange={(e) => { setSelectedYear(e.target.value); setSelectedOffice('All'); }}
                            className={`appearance-none w-full md:w-64 border-2 hover:border-brand-500 text-gray-900 dark:text-white font-bold py-4 pl-12 pr-10 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-500/20 cursor-pointer text-lg transition-all ${isArchiveView ? 'border-amber-400 bg-amber-50 dark:bg-slate-800 shadow-amber-500/10' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                            <ChevronDown size={18} />
                        </div>
                        <label className="absolute -top-3 left-4 bg-slate-50 dark:bg-slate-900 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors">
                            {lang === 'ar' ? 'اختر الدورة' : 'Select Term'}
                        </label>
                    </div>
                </div>

                {/* Office Tabs (Scrollable Strip) */}
                <div className="mb-16 sticky top-20 z-20">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-gray-200 dark:border-slate-700 py-3 px-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 max-w-full overflow-hidden transition-colors">
                        <div className="flex overflow-x-auto gap-2 custom-scrollbar no-scrollbar items-center px-2">
                            {offices.map(office => (
                                <button
                                    key={office}
                                    onClick={() => setSelectedOffice(office)}
                                    className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border ${selectedOffice === office
                                            ? 'border-brand-600 text-white bg-brand-600 shadow-md transform scale-[1.02]'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                                        } text-sm flex items-center gap-2`}
                                >
                                    {office === 'All' ? <Building size={16} /> : null}
                                    {office === 'All' ? (isRtl ? 'عرض الكل' : 'View All Offices') : office}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Scroll hint indicators could go here */}
                </div>

                {/* Members Grid */}
                <div className="animate-fade-in space-y-20 min-h-[50vh]">

                    {/* Executives Section (Always show unless filtered out) */}
                    {executives.length > 0 && selectedOffice === 'All' && (
                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-12 shadow-xl shadow-brand-900/5 dark:shadow-black/20 border border-gray-100 dark:border-slate-700 relative overflow-hidden transition-all">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                            <div className="flex items-center gap-4 mb-10 justify-center">
                                <div className="h-px bg-gray-200 dark:bg-slate-600 w-12 md:w-24"></div>
                                <h3 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white text-center tracking-tight">{isRtl ? 'المكتب التنفيذي' : 'Executive Board'}</h3>
                                <div className="h-px bg-gray-200 dark:bg-slate-600 w-12 md:w-24"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 justify-center max-w-6xl mx-auto px-4">
                                {executives.map(m => <MemberCard key={m.id} member={m} lang={lang} large />)}
                            </div>
                        </div>
                    )}

                    {/* Heads Section */}
                    {heads.length > 0 && (
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-4">
                                <div className="p-2 bg-brand-100 dark:bg-slate-800 text-brand-700 dark:text-brand-400 rounded-lg"><Briefcase size={20} /></div>
                                {isRtl ? 'رؤساء المكاتب' : 'Office Heads'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {heads.map(m => <MemberCard key={m.id} member={m} lang={lang} />)}
                            </div>
                        </div>
                    )}

                    {/* Members Section */}
                    {regularMembers.length > 0 && (
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-4">
                                <div className="p-2 bg-brand-100 dark:bg-slate-800 text-brand-700 dark:text-brand-400 rounded-lg"><Users size={20} /></div>
                                {isRtl ? 'أعضاء المكاتب' : 'Office Members'}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                                {regularMembers.map(m => <MemberCard key={m.id} member={m} lang={lang} />)}
                            </div>
                        </div>
                    )}

                    {displayedMembers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-slate-700">
                            <User size={64} className="mb-6 opacity-20" />
                            <p className="text-xl font-bold">{isRtl ? 'لا يوجد أعضاء في هذا التصنيف' : 'No members found in this category'}</p>
                            <p className="text-sm mt-2">Try changing the year or office filter.</p>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default Team;
