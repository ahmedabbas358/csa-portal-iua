
import React, { useState, useMemo } from 'react';
import { MapPin, Clock, ArrowRight, Filter, X, Calendar as CalendarIcon, ExternalLink, Tag, Map, Ticket, Share2, CheckCircle, ChevronLeft, ChevronRight, Sparkles, MonitorPlay, Wifi, Globe, CalendarPlus, ZoomIn, ZoomOut, Move, Download } from 'lucide-react';
import { Language, EventItem } from '../types';

interface EventsProps {
  lang: Language;
  events: EventItem[];
}

// --- IMAGE VIEWER COMPONENT (PAN & ZOOM) ---
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

    // Drag Logic
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
                    <Download size={24}/>
                </button>
                <button onClick={handleZoomToggle} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-colors">
                    {scale > 1 ? <ZoomOut size={24}/> : <ZoomIn size={24}/>}
                </button>
                <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-colors">
                    <X size={24}/>
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
            {scale > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full backdrop-blur-md pointer-events-none">
                    <Move size={12} /> Drag to pan
                </div>
            )}
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
  
  // Image Viewer State
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
      // Create a valid date object from string (YYYY-MM-DD)
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

        // 1. Parse Date safely (YYYY-MM-DD)
        const dateParts = event.date.split('-');
        if (dateParts.length !== 3) return;
        
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
        const day = parseInt(dateParts[2]);

        let hours = 9; // Default start time
        let minutes = 0;

        // 2. Parse Time safely (Handle "14:30" and "02:30 PM")
        if (event.time) {
            const timeMatch = event.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (timeMatch) {
                hours = parseInt(timeMatch[1]);
                minutes = parseInt(timeMatch[2]);
                const period = timeMatch[3]?.toUpperCase();
                
                // Convert 12h to 24h
                if (period === 'PM' && hours < 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
            }
        }

        const startDate = new Date(year, month, day, hours, minutes);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default duration: 2 hours

        // 3. Format for Google Calendar (YYYYMMDDTHHMMSS)
        const format = (d: Date) => {
            return d.getFullYear().toString() +
            (d.getMonth() + 1).toString().padStart(2, '0') +
            d.getDate().toString().padStart(2, '0') +
            'T' +
            d.getHours().toString().padStart(2, '0') +
            d.getMinutes().toString().padStart(2, '0') +
            '00';
        };

        const dates = `${format(startDate)}/${format(endDate)}`;
        
        const title = encodeURIComponent(lang === 'ar' ? event.titleAr : event.title);
        const details = encodeURIComponent(lang === 'ar' ? event.descriptionAr : event.description);
        const location = encodeURIComponent(event.isOnline ? (event.meetingLink || 'Online') : (lang === 'ar' ? event.locationAr : event.location));
        
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
        
        window.open(url, '_blank');
      } catch (e) {
          console.error("Calendar Error:", e);
          alert(isRtl ? 'عذراً، حدث خطأ في تنسيق التاريخ.' : 'Sorry, invalid date format.');
      }
  };

  const handleImageClick = (e: React.MouseEvent, imgUrl?: string) => {
        e.stopPropagation(); // Prevent opening modal if it's the card
        if (e.detail === 3 && imgUrl) {
            setViewingImage(imgUrl);
        } else if (e.detail === 1) {
            // Usually single click opens event details
        }
  };

  return (
    <div className={`min-h-screen py-12 md:py-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-500 ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'}`}>
      
      {/* Full Screen Image Viewer */}
      {viewingImage && <ImageViewer src={viewingImage} alt="Full View" onClose={() => setViewingImage(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
             <span className="text-brand-600 dark:text-brand-400 font-extrabold tracking-widest uppercase text-xs mb-3 block">{isRtl ? 'الرزنامة' : 'Calendar'}</span>
             <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">{isRtl ? 'الفعاليات والأنشطة' : 'Events & Activities'}</h1>
             <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                 {isRtl ? 'اكتشف الفرص القادمة، ورش العمل، والمؤتمرات التقنية.' : 'Discover upcoming opportunities, workshops, and tech conferences.'}
             </p>
        </div>

        {/* Featured Event (Desktop & Mobile) */}
        {featuredEvent && activeTab === 'upcoming' && (
            <div className="mb-16 animate-fade-in">
                <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-gray-900 dark:bg-slate-950 text-white min-h-[450px] flex items-end md:items-center group cursor-pointer transform hover:scale-[1.01] transition-all duration-500" onClick={() => openModal(featuredEvent)}>
                    <div className="absolute inset-0">
                        <img 
                            src={featuredEvent.image || `https://picsum.photos/1200/600`} 
                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                            onClick={(e) => handleImageClick(e, featuredEvent.image)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/50 to-transparent pointer-events-none"></div>
                    </div>
                    <div className="relative z-10 p-8 md:p-16 max-w-3xl w-full pointer-events-none">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-full flex items-center gap-1">
                                <Sparkles size={12} /> {isRtl ? 'مميز' : 'Featured'}
                            </span>
                            {featuredEvent.isOnline && (
                                <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center gap-1">
                                    <Wifi size={12} /> Online
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl md:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
                            {lang === 'ar' ? featuredEvent.titleAr : featuredEvent.title}
                        </h2>
                        <div className="flex flex-wrap gap-4 md:gap-8 text-gray-200 mb-8 font-medium text-sm md:text-lg">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"><CalendarIcon size={20}/> {featuredEvent.date}</div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"><Clock size={20}/> {featuredEvent.time}</div>
                            {!featuredEvent.isOnline && <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"><MapPin size={20}/> {lang === 'ar' ? featuredEvent.locationAr : featuredEvent.location}</div>}
                        </div>
                        <button className="w-full md:w-auto px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors shadow-xl text-lg pointer-events-auto">
                            {isRtl ? 'عرض التفاصيل' : 'View Details'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 mb-12 sticky top-20 z-30 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-4 border-b border-gray-100 dark:border-slate-800 lg:border-none lg:rounded-2xl">
            {/* Tabs - Enhanced with Glassmorphism and Border to solve white-on-white */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-200/60 dark:border-slate-700/60 flex w-full lg:w-auto transition-colors">
                <button
                    onClick={() => { setActiveTab('upcoming'); setCurrentPage(1); }}
                    className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-gray-900 dark:bg-slate-950 text-white shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                >
                    {isRtl ? 'القادمة' : 'Upcoming'}
                </button>
                <button
                    onClick={() => { setActiveTab('past'); setCurrentPage(1); }}
                    className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-gray-900 dark:bg-slate-950 text-white shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                >
                    {isRtl ? 'الأرشيف' : 'Archive'}
                </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar no-scrollbar">
                <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-200/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-full text-gray-600 dark:text-gray-300 font-bold text-xs uppercase">
                    <Filter size={14} /> {isRtl ? 'تصفية' : 'Filter'}
                </div>
                <button 
                    onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold border transition-colors whitespace-nowrap ${filterType === 'all' ? 'bg-white dark:bg-slate-800 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm' : 'bg-white/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'}`}
                >
                    {isRtl ? 'الكل' : 'All'}
                </button>
                {eventTypes.map(type => (
                    <button 
                        key={type}
                        onClick={() => { setFilterType(type); setCurrentPage(1); }}
                        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold border transition-colors whitespace-nowrap ${filterType === type ? 'bg-brand-600 dark:bg-brand-600 text-white border-transparent shadow-md' : 'bg-white/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {paginatedEvents.length > 0 ? (
                paginatedEvents.map((event) => (
                    <div 
                        key={event.id} 
                        onClick={() => openModal(event)}
                        className="group bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-col h-full cursor-pointer relative"
                    >
                        {/* Type & Status Badges */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-none">
                             <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm text-gray-900 dark:text-white border border-white/20 dark:border-slate-600">
                                {event.type}
                             </span>
                             {event.isOnline && (
                                <span className="px-3 py-1 bg-red-600/90 backdrop-blur-md rounded-lg text-xs font-bold shadow-sm text-white flex items-center gap-1">
                                    <Globe size={10} /> Online
                                </span>
                             )}
                        </div>

                        <div className="h-64 relative overflow-hidden bg-gray-100 dark:bg-slate-700">
                            <img 
                                src={event.image || `https://picsum.photos/400/300?random=${event.id}`} 
                                alt={event.title}
                                className={`w-full h-full object-cover transition-transform duration-700 ${activeTab === 'past' ? 'grayscale group-hover:grayscale-0' : 'group-hover:scale-110'}`}
                                onClick={(e) => handleImageClick(e, event.image)}
                            />
                            {/* Date Badge */}
                            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg text-center min-w-[70px] pointer-events-none">
                                <span className="block text-2xl font-black leading-none mb-1 text-gray-900 dark:text-white">{event.date.split('-')[2]}</span>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                        </div>

                        <div className="p-8 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                                {lang === 'ar' ? event.titleAr : event.title}
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    {event.isOnline ? <Wifi size={16} className="text-red-500" /> : <MapPin size={16} className="text-gray-400" />}
                                    <span className="truncate">{event.isOnline ? (isRtl ? 'حدث إلكتروني' : 'Online Event') : (lang === 'ar' ? event.locationAr : event.location)}</span>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-6 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isRtl ? 'التفاصيل' : 'Details'}</span>
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 group-hover:bg-brand-600 dark:group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center transition-all text-gray-400 dark:text-gray-400">
                                    {isRtl ? <ArrowRight size={18} className="rotate-180"/> : <ArrowRight size={18}/>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-32 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-slate-700">
                    <CalendarIcon size={64} className="text-gray-200 dark:text-slate-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {isRtl ? 'لا توجد فعاليات' : 'No events found'}
                    </h3>
                    <p className="text-gray-400">{isRtl ? 'حاول تغيير معايير البحث' : 'Try adjusting your filters'}</p>
                </div>
            )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-16">
                 <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all text-gray-600 dark:text-gray-300"
                >
                    {isRtl ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
                </button>
                <div className="flex gap-2">
                    {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-12 h-12 rounded-2xl font-bold transition-all ${currentPage === page ? 'bg-gray-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-110' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all text-gray-600 dark:text-gray-300"
                >
                    {isRtl ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
                </button>
            </div>
        )}

      </div>

      {/* Detailed Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={closeModal}>
            <div 
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar transition-colors" 
                onClick={e => e.stopPropagation()}
            >
                {/* Close/Share Buttons - Glassmorphism Applied */}
                <div className="absolute top-6 right-6 z-20 flex gap-3">
                    <button 
                        onClick={() => handleShare(selectedEvent.id)}
                        className="bg-white/20 backdrop-blur-xl border border-white/30 text-white p-3 rounded-full hover:bg-white/40 transition-all shadow-lg group"
                        title="Share"
                    >
                        {copiedId === selectedEvent.id ? <CheckCircle size={20} className="text-green-300"/> : <Share2 size={20} className="group-hover:scale-110 transition-transform"/>}
                    </button>
                    <button 
                        onClick={closeModal} 
                        className="bg-white/20 backdrop-blur-xl border border-white/30 text-white p-3 rounded-full hover:bg-white/40 transition-all shadow-lg group"
                        title="Close"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform"/>
                    </button>
                </div>
                
                <div className="h-[300px] md:h-[450px] relative group">
                     <img 
                        src={selectedEvent.image || `https://picsum.photos/800/600?random=${selectedEvent.id}`} 
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105 cursor-zoom-in"
                        onClick={(e) => handleImageClick(e, selectedEvent.image)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white pointer-events-none">
                        <div className="flex gap-3 mb-4">
                             <span className="px-4 py-1.5 bg-brand-600 rounded-xl text-sm font-bold shadow-lg border border-brand-500/50 backdrop-blur-md">
                                {selectedEvent.type}
                             </span>
                             {selectedEvent.isOnline && (
                                <span className="px-4 py-1.5 bg-red-600 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 border border-red-500/50 backdrop-blur-md">
                                    <Wifi size={16}/> Online
                                </span>
                             )}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-2xl">
                            {lang === 'ar' ? selectedEvent.titleAr : selectedEvent.title}
                        </h2>
                    </div>
                </div>

                 <div className="p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                             <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Sparkles size={24} className="text-brand-500"/>
                                    {isRtl ? 'حول الفعالية' : 'About Event'}
                                </h3>
                                <div className="prose max-w-none text-gray-600 dark:text-gray-300 text-lg leading-loose whitespace-pre-line">
                                    {lang === 'ar' ? selectedEvent.descriptionAr : selectedEvent.description}
                                </div>
                             </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-brand-600 dark:text-brand-400"><CalendarIcon size={24} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">{isRtl ? 'التاريخ' : 'Date'}</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedEvent.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-brand-600 dark:text-brand-400"><Clock size={24} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">{isRtl ? 'الوقت' : 'Time'}</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedEvent.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-brand-600 dark:text-brand-400">
                                        {selectedEvent.isOnline ? <MonitorPlay size={24}/> : <MapPin size={24} />}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">{isRtl ? 'المكان' : 'Location'}</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                            {selectedEvent.isOnline ? (isRtl ? 'حدث أونلاين' : 'Online Event') : (lang === 'ar' ? selectedEvent.locationAr : selectedEvent.location)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {selectedEvent.isOnline && selectedEvent.meetingLink && (
                                    <a 
                                        href={selectedEvent.meetingLink} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-full py-4 rounded-2xl font-bold text-white shadow-xl shadow-red-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-center bg-red-600 hover:bg-red-700"
                                    >
                                        <MonitorPlay size={22} />
                                        {isRtl ? 'انضم للاجتماع' : 'Join Meeting'}
                                    </a>
                                )}
                                
                                {selectedEvent.registrationLink && !selectedEvent.isCompleted && (
                                    <a 
                                        href={selectedEvent.registrationLink} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-full py-4 rounded-2xl font-bold text-white shadow-xl shadow-brand-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-center"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {isRtl ? 'سجل الآن' : 'Register Now'}
                                        <Ticket size={22} />
                                    </a>
                                )}

                                {/* Add To Calendar Button */}
                                {!selectedEvent.isCompleted && (
                                    <button 
                                        onClick={() => handleAddToCalendar(selectedEvent)}
                                        className="w-full py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CalendarPlus size={20} />
                                        {isRtl ? 'إضافة للتقويم' : 'Add to Calendar'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Events;
