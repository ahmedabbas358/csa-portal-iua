
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowRight, Calendar, Users, Award, Eye, Share2, Search, PlayCircle, CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Tag, X, MousePointer, Copy, Facebook, Twitter, Linkedin, MessageCircle, Mail, Send, Link, Instagram, MoreHorizontal, ZoomIn, ZoomOut, Move, Download } from 'lucide-react';
import { Language, NewsPost, AppSettings } from '../types';

interface HomeProps {
  lang: Language;
  news: NewsPost[];
  setNews: React.Dispatch<React.SetStateAction<NewsPost[]>>;
  setPage: (p: string) => void;
  settings: AppSettings;
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
            // For Blob URLs (uploaded by Admin), this works directly.
            // For external URLs, we fetch it as a blob first to force download.
            const response = await fetch(src);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `csa-download-${Date.now()}.jpg`; // Defaulting to jpg, could improve with mimetype check
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
            // Fallback
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

// --- SHARE MODAL COMPONENT ---
const ShareModal = ({ isOpen, onClose, url, isRtl }: { isOpen: boolean, onClose: () => void, url: string, isRtl: boolean }) => {
    if (!isOpen) return null;

    const platforms = [
        { name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]' },
        { name: 'X (Twitter)', icon: Twitter, color: 'bg-black' }, // X Icon placeholder
        { name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]' },
        { name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0077B5]' },
        { name: 'Telegram', icon: Send, color: 'bg-[#0088cc]' },
        { name: 'Reddit', icon: null, label: 'Rd', color: 'bg-[#FF4500]' },
        { name: 'Email', icon: Mail, color: 'bg-gray-600' },
        { name: 'Pinterest', icon: null, label: 'Pt', color: 'bg-[#E60023]' },
        { name: 'Tumblr', icon: null, label: 'Tb', color: 'bg-[#36465D]' },
        { name: 'VK', icon: null, label: 'Vk', color: 'bg-[#4680C2]' },
        { name: 'Line', icon: null, label: 'Ln', color: 'bg-[#00C300]' },
        { name: 'Viber', icon: null, label: 'Vb', color: 'bg-[#665CAC]' },
        { name: 'Skype', icon: null, label: 'Sk', color: 'bg-[#00AFF0]' },
        { name: 'Trello', icon: null, label: 'Tr', color: 'bg-[#0079BF]' },
        { name: 'Slack', icon: null, label: 'Sl', color: 'bg-[#4A154B]' },
        { name: 'Discord', icon: null, label: 'Dc', color: 'bg-[#5865F2]' },
        { name: 'Weibo', icon: null, label: 'Wb', color: 'bg-[#E6162D]' },
        { name: 'Kakao', icon: null, label: 'Ka', color: 'bg-[#FEE500]' },
        { name: 'Teams', icon: null, label: 'Tm', color: 'bg-[#6264A7]' },
        { name: 'Signal', icon: null, label: 'Sg', color: 'bg-[#3A76F0]' },
    ];

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert(isRtl ? 'تم نسخ الرابط!' : 'Link copied!');
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 md:p-8 relative shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isRtl ? 'مشاركة عبر' : 'Share via'}</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={20} className="text-gray-600 dark:text-gray-300"/>
                    </button>
                </div>
                
                <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mb-8">
                    {platforms.map((p, idx) => (
                        <button key={idx} className="flex flex-col items-center gap-2 group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform ${p.color}`}>
                                {p.icon ? <p.icon size={24} /> : <span className="font-bold text-lg">{p.label}</span>}
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{p.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl">
                    <Link size={18} className="text-gray-400 ml-2" />
                    <input readOnly value={url} className="flex-grow bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none font-mono" />
                    <button onClick={copyLink} className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">
                        {isRtl ? 'نسخ' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Home: React.FC<HomeProps> = ({ lang, news, setNews, setPage, settings }) => {
  const isRtl = lang === 'ar';
  
  // --- PAGINATION CONFIGURATION ---
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 20; // Exact request: 20 posts per page

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeShareId, setActiveShareId] = useState<string>('');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  
  // View Image State
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // View counting refs
  const viewedSession = useRef<Set<string>>(new Set());
  const observer = useRef<IntersectionObserver | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPageNum(1);
  }, [searchQuery, selectedTag]);

  // Extract unique tags from all news
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    news.forEach(post => post.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [news]);

  // Hero Section Data
  const heroTitle = isRtl ? settings.siteNameAr : settings.siteNameEn;
  const heroSubtitle = isRtl 
    ? 'منصتك الشاملة للتطوير التقني، التواصل الأكاديمي، وبناء المستقبل.' 
    : 'Your comprehensive platform for technical development, academic networking, and building the future.';

  // 1. Filter News (Drafts & Future Schedule Logic)
  const visibleNews = useMemo(() => {
      const now = new Date();
      return news.filter(post => {
          if (post.status === 'draft') return false;
          // IMPORTANT: Check scheduled date
          if (post.status === 'scheduled') {
              if (!post.scheduledDate) return false;
              const scheduledTime = new Date(post.scheduledDate);
              // Only show if current time is past scheduled time
              if (now < scheduledTime) return false;
          }
          return true;
      });
  }, [news]);

  // 2. Filter News (Search & Tags)
  const filteredNews = useMemo(() => {
    return visibleNews.filter(post => {
        const lowerSearch = searchQuery.toLowerCase();
        const matchesSearch = post.title.toLowerCase().includes(lowerSearch) ||
                              post.content.toLowerCase().includes(lowerSearch) ||
                              post.author.toLowerCase().includes(lowerSearch);
        const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    });
  }, [visibleNews, searchQuery, selectedTag]);

  // 3. Calculate Real Total Pages
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // 4. Slice Data for Display
  const displayedNews = useMemo(() => {
      const start = (currentPageNum - 1) * itemsPerPage;
      return filteredNews.slice(start, start + itemsPerPage);
  }, [filteredNews, currentPageNum]);

  // --- VIEW COUNTING LOGIC ---
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            if (id && !viewedSession.current.has(id)) {
                viewedSession.current.add(id);
                // Update view count in state
                setNews(prev => prev.map(p => 
                    p.id === id ? { ...p, views: (p.views || 0) + 1 } : p
                ));
            }
        }
      });
    }, { threshold: 0.5 }); // Count view when 50% of card is visible

    const elements = document.querySelectorAll('.news-card');
    elements.forEach(el => observer.current?.observe(el));

    return () => observer.current?.disconnect();
  }, [displayedNews]); // Re-run when displayed news changes

  // 5. Smart Pagination Algorithm (Generates range with dots)
  const paginationRange = useMemo(() => {
    const delta = 1; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
        // Condition: Always show first, last, current, and neighbors of current
        if (i === 1 || i === totalPages || (i >= currentPageNum - delta && i <= currentPageNum + delta)) {
            range.push(i);
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1); // If gap is small (1 number), just show the number
            } else if (i - l !== 1) {
                rangeWithDots.push('...'); // If gap is large, show dots
            }
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
  }, [currentPageNum, totalPages]);


  const getAspectRatioClass = (ratio: string | undefined) => {
    switch(ratio) {
        case 'portrait': return 'aspect-[4/5]';
        case 'landscape': return 'aspect-video';
        case 'story': return 'aspect-[9/16]';
        default: return 'aspect-square';
    }
  };

    // Helper for styles (duplicated from Admin for consistency)
    const fontStyles = {
        modern: 'font-sans',
        classic: 'font-serif',
        typewriter: 'font-mono tracking-tighter',
        neon: 'font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]',
        strong: 'font-black uppercase tracking-widest'
    };

    const alignmentStyles = {
        left: 'justify-start text-left',
        center: 'justify-center text-center',
        right: 'justify-end text-right'
    };

  const handleShareClick = (id: string) => {
    setActiveShareId(id);
    setShareModalOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedPosts(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // --- TRIPLE CLICK HANDLER ---
  const handleImageClick = (e: React.MouseEvent, imgUrl?: string) => {
      // e.detail gives the click count. 3 means triple click.
      if (e.detail === 3 && imgUrl) {
          setViewingImage(imgUrl);
      }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500 ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'}`}>
      
      {/* Full Screen Image Viewer */}
      {viewingImage && <ImageViewer src={viewingImage} alt="Full View" onClose={() => setViewingImage(null)} />}

      {/* Share Modal */}
      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        url={`${window.location.origin}/post/${activeShareId}`}
        isRtl={isRtl}
      />

      {/* --- Hero Section --- */}
      <div className="relative bg-brand-900 overflow-hidden text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 flex flex-col items-center text-center">
            <div className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm font-bold mb-6 md:mb-8 text-brand-100 shadow-lg animate-fade-in">
               {isRtl ? '✨ البوابة الرسمية للجمعية' : '✨ Official Association Portal'}
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-lg">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-3xl font-light px-2">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <button 
                onClick={() => setPage('events')}
                className="px-8 py-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-2"
                style={{ backgroundColor: settings.primaryColor, boxShadow: `0 10px 20px -5px ${settings.primaryColor}80`, color: 'var(--primary-contrast)' }}
              >
                {isRtl ? 'استكشف الفعاليات' : 'Explore Events'}
                {isRtl ? <ArrowRight className="rotate-180" size={20}/> : <ArrowRight size={20}/>}
              </button>
              <button 
                onClick={() => setPage('about')}
                className="px-8 py-4 rounded-xl font-bold bg-white text-brand-900 hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-lg"
              >
                {isRtl ? 'تعرف علينا' : 'About Us'}
              </button>
            </div>
        </div>
      </div>

      {/* --- Main Feed Area --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Sidebar (Stats) - Hidden on Mobile */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 sticky top-24 transition-colors">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-slate-700 pb-4">{isRtl ? 'إحصائيات سريعة' : 'Quick Stats'}</h3>
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Users size={24} />
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-gray-900 dark:text-white">500+</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{isRtl ? 'عضو' : 'Members'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-slate-700 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-gray-900 dark:text-white">{news.length}+</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{isRtl ? 'منشور' : 'Posts'}</span>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Award size={24} />
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-gray-900 dark:text-white">2010</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{isRtl ? 'تأسست' : 'Founded'}</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Center Feed */}
            <div className="lg:col-span-6">
                 {/* Search & Header */}
                <div className="mb-6">
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isRtl ? 'آخر المستجدات' : 'News Feed'}</h2>
                        <div className="relative w-full sm:w-auto group">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isRtl ? "بحث في الأخبار..." : "Search news..."}
                                className={`pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full sm:w-64 transition-all shadow-sm focus:shadow-md text-gray-900 dark:text-white`}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                     </div>
                     
                     {/* Tag Filters */}
                     {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100 dark:border-slate-800">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!selectedTag ? 'bg-gray-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'}`}
                            >
                                {isRtl ? 'الكل' : 'All'}
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${selectedTag === tag ? 'bg-brand-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'}`}
                                >
                                    {tag}
                                    {selectedTag === tag && <X size={10} />}
                                </button>
                            ))}
                        </div>
                     )}
                </div>

                {displayedNews.length > 0 ? (
                    <div className="space-y-8 md:space-y-10">
                        {displayedNews.map((post) => {
                            const isExpanded = expandedPosts.has(post.id);
                            const hasLongContent = post.content.length > 150;

                            return (
                            <div key={post.id} data-id={post.id} className="news-card bg-white dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                                {/* Header */}
                                <div className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
                                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 p-[2px] flex-shrink-0">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                                            <span className="font-bold text-brand-600 dark:text-brand-400 text-xs md:text-sm">{post.author.substring(0,2).toUpperCase()}</span>
                                        </div>
                                     </div>
                                     <div className="flex-grow">
                                        <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-none mb-1">{post.author}</h4>
                                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                                            <span>{formatDate(post.date)}</span>
                                            <span>•</span>
                                            {post.tags?.map(tag => (
                                                 <span key={tag} className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                     </div>
                                </div>

                                {/* Text Content */}
                                <div className="px-4 md:px-5 pb-4">
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                                        {post.title}
                                    </h3>
                                    <div className={`text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed relative whitespace-pre-line ${!isExpanded && hasLongContent ? 'line-clamp-3' : ''}`}>
                                        {post.content}
                                    </div>
                                    {hasLongContent && (
                                        <button 
                                            onClick={() => toggleExpand(post.id)}
                                            className="text-xs md:text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors flex items-center gap-1 mt-2"
                                        >
                                            {isExpanded 
                                            ? (isRtl ? 'إخفاء النص' : 'Show Less') 
                                            : (isRtl ? 'قراءة المزيد' : 'Read More')}
                                        </button>
                                    )}
                                </div>

                                {/* Media */}
                                {post.image && (
                                    <div 
                                        className={`relative bg-black w-full overflow-hidden ${getAspectRatioClass(post.aspectRatio)}`}
                                        onClick={(e) => handleImageClick(e, post.image)}
                                    >
                                        {post.mediaType === 'video' ? (
                                            <video 
                                                src={post.image} 
                                                className="w-full h-full object-cover transition-transform" 
                                                controls 
                                                playsInline 
                                                preload="metadata" 
                                                style={{
                                                    objectPosition: `${post.design?.imagePosition?.x || 50}% ${post.design?.imagePosition?.y || 50}%`,
                                                    transform: `scale(${post.design?.imagePosition?.scale || 1})`,
                                                    filter: `brightness(${post.design?.filters?.brightness || 100}%) contrast(${post.design?.filters?.contrast || 100}%) saturate(${post.design?.filters?.saturate || 100}%)`
                                                }}
                                            />
                                        ) : (
                                            <img 
                                                src={post.image} 
                                                alt={post.title} 
                                                className="w-full h-full object-cover transition-transform cursor-zoom-in"
                                                style={{
                                                    objectPosition: `${post.design?.imagePosition?.x || 50}% ${post.design?.imagePosition?.y || 50}%`,
                                                    transform: `scale(${post.design?.imagePosition?.scale || 1})`,
                                                    filter: `brightness(${post.design?.filters?.brightness || 100}%) contrast(${post.design?.filters?.contrast || 100}%) saturate(${post.design?.filters?.saturate || 100}%)`
                                                }}
                                            />
                                        )}
                                        
                                        {/* DESIGN OVERLAY LAYER */}
                                        <div 
                                            className="absolute inset-0 pointer-events-none"
                                            style={{ backgroundColor: `rgba(0,0,0, ${post.design?.overlayOpacity ? post.design.overlayOpacity / 100 : 0})` }}
                                        ></div>
                                        {post.design?.overlayText && (
                                             <div className={`absolute inset-0 p-6 flex flex-col pointer-events-none ${alignmentStyles[post.design.textAlignment || 'center']} justify-center`}>
                                                <p 
                                                    className={`${fontStyles[post.design.fontStyle || 'modern']} text-2xl font-bold break-words whitespace-pre-line`}
                                                    style={{ color: post.design.textColor || '#ffffff', lineHeight: '1.2' }}
                                                >
                                                    {post.design.overlayText}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div className="p-3 md:p-4 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 group text-gray-500 dark:text-gray-400" title="Views">
                                            <Eye size={20} />
                                            <span className="text-xs md:text-sm font-bold">{post.views ? post.views.toLocaleString() : '0'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 group text-gray-500 dark:text-gray-400" title="Interactions">
                                            <MousePointer size={20} />
                                            <span className="text-xs md:text-sm font-bold">{Math.floor((post.views || 0) * 0.15).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleShareClick(post.id)} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                        <Share2 size={20} />
                                        <span className="text-xs font-bold hidden md:inline">{isRtl ? 'مشاركة' : 'Share'}</span>
                                    </button>
                                </div>
                            </div>
                            );
                        })}

                         {/* SMART PAGINATION CONTROLS */}
                         {/* Only show if we have more than 1 page of content */}
                         {totalPages > 1 && (
                            <div className="flex flex-col items-center gap-4 pt-8 pb-8">
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                                    <button 
                                        onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))}
                                        disabled={currentPageNum === 1}
                                        className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isRtl ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
                                    </button>
                                    
                                    <div className="flex gap-1 items-center px-2">
                                        {paginationRange.map((page, idx) => {
                                            if (page === '...') {
                                                return <span key={`dots-${idx}`} className="text-gray-400 px-2 font-bold select-none">...</span>
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPageNum(Number(page))}
                                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPageNum === page ? 'bg-brand-600 text-white shadow-lg scale-110' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <button 
                                        onClick={() => setCurrentPageNum(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPageNum === totalPages}
                                        className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isRtl ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
                                    </button>
                                </div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {isRtl 
                                        ? `عرض ${((currentPageNum - 1) * itemsPerPage) + 1}-${Math.min(currentPageNum * itemsPerPage, filteredNews.length)} من ${filteredNews.length} منشور` 
                                        : `Showing ${((currentPageNum - 1) * itemsPerPage) + 1}-${Math.min(currentPageNum * itemsPerPage, filteredNews.length)} of ${filteredNews.length} posts`
                                    }
                                </div>
                            </div>
                         )}

                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-slate-800 mb-4 text-gray-400">
                            <Search size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">{isRtl ? 'لا توجد نتائج' : 'No posts found'}</h3>
                        <p className="text-gray-400 text-sm">Try searching for something else or changing tags.</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar (Events) - Hidden on Mobile */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
                <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 shadow-lg text-white sticky top-24">
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                         <Calendar size={20}/>
                         {isRtl ? 'القادمة قريباً' : 'Coming Up'}
                     </h3>
                     <p className="text-brand-100 text-sm mb-6">
                         {isRtl ? 'لا تفوت الفعاليات القادمة! سجل الآن.' : 'Don\'t miss out on upcoming events. Register now.'}
                     </p>
                     <button 
                        onClick={() => setPage('events')}
                        className="w-full py-3 bg-white text-brand-700 font-bold rounded-xl shadow-md hover:bg-gray-50 transition-colors text-sm"
                     >
                         {isRtl ? 'عرض التقويم' : 'View Calendar'}
                     </button>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
};

export default Home;