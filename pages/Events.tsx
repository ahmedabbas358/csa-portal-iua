import React, { useState, useMemo } from 'react';
import { MapPin, Clock, ArrowRight, Filter, X, Calendar as CalendarIcon, ExternalLink, Ticket, Share2, CheckCircle, ChevronLeft, ChevronRight, Sparkles, MonitorPlay, Wifi, Globe, CalendarPlus, ZoomIn, ZoomOut, Move, Download, Video } from 'lucide-react';
import { Language, EventItem } from '../types';

interface EventsProps {
    lang: Language;
    events: EventItem[];
}

// --- IMAGE VIEWER COMPONENT ---
const ImageViewer = ({ src, alt, onClose }: { src: string, alt: string, onClose: () => void }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    const handleZoomToggle = () => {
        if (scale > 1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        } else {
            setScale(2.5);
        }
    };

    const downloadMedia = async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `csa-event-download-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
            window.open(src, '_blank');
        }
    };

    const onPointerDown = (e: React.PointerEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setLastPos({ x: e.clientX, y: e.clientY });
            e.currentTarget.setPointerCapture(e.pointerId);
        }
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (isDragging && scale > 1) {
            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;
            setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastPos({ x: e.clientX, y: e.clientY });
        }
    };

    const onPointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden animate-fade-in touch-none">
            <div className="absolute top-4 right-4 z-50 flex gap-4">
                <button onClick={downloadMedia} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-colors" title="Download High Quality">
                    <Download size={24} />
                </button>
                <button onClick={handleZoomToggle} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-colors">
                    {scale > 1 ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
                </button>
                <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div
                className="w-full h-full flex items-center justify-center"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onDoubleClick={handleZoomToggle}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-move select-none"
                    style={{
                        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                        cursor: scale > 1 ? 'grab' : 'zoom-in'
                    }}
                    draggable={false}
                />
            </div>
        </div>
    );
};

// --- EVENT CARD COMPONENT ---
const EventCard = ({ event, lang, onClick, isRtl }: { event: EventItem, lang: Language, onClick: () => void, isRtl: boolean }) => {

    const handleImageClick = (e: React.MouseEvent) => {
        // Allow bubbling to open modal, unless specifically zoom needed?
        // Actually, let the card click open modal usually.
    };

    const handleJoinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (event.meetingLink) window.open(event.meetingLink, '_blank');
    };

    return (
        <div
            onClick={onClick}
            className="group bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-col h-full cursor-pointer relative"
        >
            {/* Image Section */}
            <div className="h-60 relative overflow-hidden bg-gray-100 dark:bg-slate-700">
                <img
                    src={event.image || `https://picsum.photos/400/300?random=${event.id}`}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay Gradient (Subtle) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                {/* Badges - Top Right */}
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm text-gray-900 dark:text-white border border-white/20 dark:border-slate-600">
                        {event.type}
                    </span>
                    {event.isOnline && (
                        <span className="px-3 py-1 bg-red-600/90 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm text-white flex items-center gap-1 border border-red-500/50">
                            <Wifi size={10} /> Online
                        </span>
                    )}
                </div>

                {/* Date Badge - Bottom Left (Moved to avoid overlap) */}
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg text-center border border-gray-100 dark:border-slate-700">
                    <span className="block text-xl font-black leading-none text-gray-900 dark:text-white">{event.date.split('-')[2]}</span>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-grow flex flex-col relative">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight">
                    {lang === 'ar' ? event.titleAr : event.title}
                </h3>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Clock size={16} className="text-brand-500" />
                        <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        {event.isOnline ? <Video size={16} className="text-red-500" /> : <MapPin size={16} className="text-gray-400" />}
                        <span className="truncate font-medium">
                            {event.isOnline
                                ? <span className="text-red-600 dark:text-red-400 font-bold">{isRtl ? 'اجتماع أونلاين' : 'Online Meeting'}</span>
                                : (lang === 'ar' ? event.locationAr : event.location)
                            }
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-3">
                    {event.isOnline && event.meetingLink && !event.isCompleted ? (
                        <button
                            onClick={handleJoinClick}
                            className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <MonitorPlay size={16} />
                            {isRtl ? 'انضمام' : 'Join'}
                        </button>
                    ) : (
                        <div className="text-xs font-bold text-gray-400 px-2">{isRtl ? 'عرض المزيد' : 'View More'}</div>
                    )}

                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 group-hover:bg-brand-600 dark:group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center transition-all text-gray-400 dark:text-gray-300 shadow-sm">
                        {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Events: React.FC<EventsProps> = ({ lang, events }) => {
    const isRtl = lang === 'ar';
    const primaryColor = 'var(--primary-color)';

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // --- LOGIC: Auto-Archive based on Date & Time ---
    const now = new Date();

    const { upcoming, past } = useMemo(() => {
        const up: EventItem[] = [];
        const pst: EventItem[] = [];

        events.forEach(ev => {
            const eventDate = new Date(ev.date);
            const endOfEventDay = new Date(eventDate);
            endOfEventDay.setHours(23, 59, 59, 999);

            if (endOfEventDay < now || ev.isCompleted) {
                pst.push(ev);
            } else {
                up.push(ev);
            }
        });

        up.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        pst.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { upcoming: up, past: pst };
    }, [events]);

    const baseEvents = activeTab === 'upcoming' ? upcoming : past;
    const featuredEvent = activeTab === 'upcoming' && upcoming.length > 0 ? upcoming[0] : null;
    const listToFilter = (activeTab === 'upcoming' && featuredEvent) ? baseEvents.slice(1) : baseEvents;

    const displayedEvents = filterType === 'all'
        ? listToFilter
        : listToFilter.filter(ev => ev.type === filterType);

    const totalPages = Math.ceil(displayedEvents.length / itemsPerPage);
    const paginatedEvents = displayedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const eventTypes = Array.from(new Set(events.map(e => e.type || 'Event')));

    const openModal = (event: EventItem) => {
        setSelectedEvent(event);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedEvent(null);
        document.body.style.overflow = 'unset';
    };

    const handleShare = (id: string) => {
        const dummyLink = `${window.location.origin}/event/${id}`;
        navigator.clipboard.writeText(dummyLink);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleAddToCalendar = (event: EventItem) => {
        try {
            if (!event.date) return;
            const dateParts = event.date.split('-');
            if (dateParts.length !== 3) return;
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            let hours = 9; let minutes = 0;
            if (event.time) {
                const timeMatch = event.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                if (timeMatch) {
                    hours = parseInt(timeMatch[1]);
                    minutes = parseInt(timeMatch[2]);
                    const period = timeMatch[3]?.toUpperCase();
                    if (period === 'PM' && hours < 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                }
            }
            const startDate = new Date(year, month, day, hours, minutes);
            const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
            const format = (d: Date) => d.getFullYear().toString() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0') + 'T' + d.getHours().toString().padStart(2, '0') + d.getMinutes().toString().padStart(2, '0') + '00';
            const dates = `${format(startDate)}/${format(endDate)}`;
            const title = encodeURIComponent(lang === 'ar' ? event.titleAr : event.title);
            const details = encodeURIComponent(lang === 'ar' ? event.descriptionAr : event.description);
            const location = encodeURIComponent(event.isOnline ? (event.meetingLink || 'Online') : (lang === 'ar' ? event.locationAr : event.location));
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
            window.open(url, '_blank');
        } catch (e) { console.error(e); alert(isRtl ? 'خطأ في التاريخ' : 'Date Error'); }
    };

    return (
        <div className={`min-h-screen py-12 md:py-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-500 ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'}`}>

            {viewingImage && <ImageViewer src={viewingImage} alt="Full View" onClose={() => setViewingImage(null)} />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <span className="text-brand-600 dark:text-brand-400 font-extrabold tracking-widest uppercase text-xs mb-3 block animate-fade-in">{isRtl ? 'الرزنامة' : 'Schedule'}</span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight animate-fade-in">{isRtl ? 'الفعاليات القادمة' : 'Upcoming Events'}</h1>
                    <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in">
                        {isRtl ? 'اكتشف الفرص القادمة، ورش العمل، والمؤتمرات التقنية.' : 'Discover upcoming opportunities, workshops, and tech conferences.'}
                    </p>
                </div>

                {/* Featured Event */}
                {featuredEvent && activeTab === 'upcoming' && (
                    <div className="mb-16 animate-fade-in">
                        <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-gray-900 dark:bg-slate-950 text-white min-h-[500px] flex items-end md:items-center group cursor-pointer transform hover:scale-[1.01] transition-all duration-500" onClick={() => openModal(featuredEvent)}>
                            <div className="absolute inset-0">
                                <img
                                    src={featuredEvent.image || `https://picsum.photos/1200/600`}
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/60 to-transparent pointer-events-none"></div>
                            </div>
                            <div className="relative z-10 p-8 md:p-16 max-w-4xl w-full pointer-events-none">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1">
                                        <Sparkles size={12} /> {isRtl ? 'مميز' : 'Featured'}
                                    </span>
                                    {featuredEvent.isOnline && (
                                        <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1">
                                            <Wifi size={12} /> Online
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-4xl md:text-7xl font-black mb-6 leading-none drop-shadow-2xl">
                                    {lang === 'ar' ? featuredEvent.titleAr : featuredEvent.title}
                                </h2>

                                <div className="flex flex-wrap gap-4 md:gap-8 text-gray-100 mb-10 font-bold text-sm md:text-lg">
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20"><CalendarIcon size={20} className="text-brand-300" /> {featuredEvent.date}</div>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20"><Clock size={20} className="text-brand-300" /> {featuredEvent.time}</div>
                                    {featuredEvent.isOnline && featuredEvent.meetingLink ? (
                                        <div className="flex items-center gap-2 bg-red-600/80 px-4 py-2 rounded-xl backdrop-blur-md border border-red-500/50 text-white"><Video size={20} /> {isRtl ? 'رابط الاجتماع متاح' : 'Meeting Link Available'}</div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20"><MapPin size={20} className="text-brand-300" /> {lang === 'ar' ? featuredEvent.locationAr : featuredEvent.location}</div>
                                    )}
                                </div>

                                <button className="w-full md:w-auto px-8 py-4 bg-white text-gray-900 rounded-2xl font-black hover:bg-brand-50 transition-colors shadow-xl text-lg pointer-events-auto flex items-center justify-center gap-2">
                                    {isRtl ? 'عرض التفاصيل' : 'View Details'}
                                    {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 mb-12 sticky top-20 z-30 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-xl py-4 border-b border-gray-100 dark:border-slate-800 lg:border-none lg:rounded-2xl transition-all">
                    <div className="bg-white dark:bg-black/20 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex w-full lg:w-auto">
                        <button
                            onClick={() => { setActiveTab('upcoming'); setCurrentPage(1); }}
                            className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {isRtl ? 'القادمة' : 'Upcoming'}
                        </button>
                        <button
                            onClick={() => { setActiveTab('past'); setCurrentPage(1); }}
                            className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {isRtl ? 'الأرشيف' : 'Archive'}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
                        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-300 font-bold text-xs uppercase">
                            <Filter size={14} />
                        </div>
                        <button onClick={() => { setFilterType('all'); setCurrentPage(1); }} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-colors ${filterType === 'all' ? 'bg-white dark:bg-slate-800 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>{isRtl ? 'الكل' : 'All'}</button>
                        {eventTypes.map(type => (
                            <button key={type} onClick={() => { setFilterType(type); setCurrentPage(1); }} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-colors ${filterType === type ? 'bg-brand-600 dark:bg-brand-600 text-white border-transparent shadow-md' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>{type}</button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {paginatedEvents.length > 0 ? (
                        paginatedEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                lang={lang}
                                isRtl={isRtl}
                                onClick={() => openModal(event)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <CalendarIcon size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-500">{isRtl ? 'لا توجد فعاليات' : 'No events found'}</h3>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-16">
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        <span className="font-bold text-gray-500 dark:text-gray-400">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </button>
                    </div>
                )}

            </div>

            {/* MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={closeModal}>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button onClick={closeModal} className="absolute top-6 right-6 z-20 p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-colors">
                            <X size={20} />
                        </button>

                        <div className="relative h-[350px] md:h-[450px]">
                            <img src={selectedEvent.image || `https://picsum.photos/800/600`} className="w-full h-full object-cover" onClick={() => setViewingImage(selectedEvent.image || '')} />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white w-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-brand-600 rounded-lg text-sm font-bold shadow-sm">{selectedEvent.type}</span>
                                    {selectedEvent.isOnline && <span className="px-3 py-1 bg-red-600 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2"><Wifi size={14} /> Online Event</span>}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black leading-tight">{lang === 'ar' ? selectedEvent.titleAr : selectedEvent.title}</h2>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Sparkles size={20} className="text-brand-500" />
                                        {isRtl ? 'عن الفعالية' : 'About Event'}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 leading-loose text-lg whitespace-pre-line">
                                        {lang === 'ar' ? selectedEvent.descriptionAr : selectedEvent.description}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-700 rounded-xl text-brand-600 dark:text-brand-400 shadow-sm"><CalendarIcon size={24} /></div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-1">{isRtl ? 'التاريخ' : 'Date'}</span>
                                            <span className="block font-bold text-gray-900 dark:text-white text-lg">{selectedEvent.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-700 rounded-xl text-brand-600 dark:text-brand-400 shadow-sm"><Clock size={24} /></div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-1">{isRtl ? 'الوقت' : 'Time'}</span>
                                            <span className="block font-bold text-gray-900 dark:text-white text-lg">{selectedEvent.time}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-700 rounded-xl text-brand-600 dark:text-brand-400 shadow-sm">
                                            {selectedEvent.isOnline ? <Video size={24} /> : <MapPin size={24} />}
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-1">{isRtl ? 'الموقع' : 'Location'}</span>
                                            <span className="block font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                                {selectedEvent.isOnline ? (isRtl ? 'أونلاين' : 'Online') : (lang === 'ar' ? selectedEvent.locationAr : selectedEvent.location)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedEvent.isOnline && selectedEvent.meetingLink && (
                                    <a href={selectedEvent.meetingLink} target="_blank" className="block w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-center shadow-lg transition-all flex items-center justify-center gap-2">
                                        <MonitorPlay size={20} />
                                        {isRtl ? 'الانضمام للاجتماع' : 'Join Meeting'}
                                    </a>
                                )}

                                {!selectedEvent.isCompleted && (
                                    <button onClick={() => handleAddToCalendar(selectedEvent)} className="w-full py-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-white font-bold hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all flex items-center justify-center gap-2">
                                        <CalendarPlus size={20} />
                                        {isRtl ? 'إضافة للتقويم' : 'Add to Calendar'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
