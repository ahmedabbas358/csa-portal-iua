import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowRight, Calendar, Users, Award, Eye, Share2, Search, PlayCircle, CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Tag, X, MousePointer, Copy, Facebook, Twitter, Linkedin, MessageCircle, Mail, Send, Link as LinkIcon, Instagram, MoreHorizontal, ZoomIn, ZoomOut, Move, Download, Heart } from 'lucide-react';
import { Language, NewsPost, AppSettings, MediaItem } from '../types';

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
            const response = await fetch(src);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `csa-download-${Date.now()}.jpg`;
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
        { name: 'X (Twitter)', icon: Twitter, color: 'bg-black' },
        { name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]' },
        { name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0077B5]' },
        { name: 'Telegram', icon: Send, color: 'bg-[#0088cc]' },
        { name: 'Reddit', icon: null, label: 'Rd', color: 'bg-[#FF4500]' },
        { name: 'Email', icon: Mail, color: 'bg-gray-600' },
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
                        <X size={20} className="text-gray-600 dark:text-gray-300" />
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
                    <LinkIcon size={18} className="text-gray-400 ml-2" />
                    <input readOnly value={url} className="flex-grow bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none font-mono" />
                    <button onClick={copyLink} className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">
                        {isRtl ? 'نسخ' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEWS CARD COMPONENT ---
interface NewsCardProps {
    post: NewsPost;
    isRtl: boolean;
    onExpand: (id: string) => void;
    isExpanded: boolean;
    onShare: (id: string) => void;
    onLike: (id: string) => void;
    isLiked: boolean;
    onViewImage: (url: string) => void;
    formatDate: (date: string) => string;
}

const NewsCard: React.FC<NewsCardProps> = ({ post, isRtl, onExpand, isExpanded, onShare, onLike, isLiked, onViewImage, formatDate }) => {
    const hasLongContent = post.content.length > 150;
    const [currentSlide, setCurrentSlide] = useState(0);

    // Normalize Media Items
    const mediaItems: MediaItem[] = useMemo(() => {
        if (post.media && post.media.length > 0) return post.media;
        if (post.image) return [{ type: post.mediaType || 'image', url: post.image }];
        return [];
    }, [post]);

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide(prev => (prev + 1) % mediaItems.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide(prev => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    };

    const getAspectRatioClass = (ratio: string | undefined) => {
        switch (ratio) {
            case 'portrait': return 'aspect-[4/5]';
            case 'landscape': return 'aspect-video';
            case 'story': return 'aspect-[9/16]';
            default: return 'aspect-square';
        }
    };

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

    // Handle triple click for viewing image
    const handleImageClick = (e: React.MouseEvent, url: string) => {
        if (e.detail === 3) {
            onViewImage(url);
        }
    };

    return (
        <div data-id={post.id} className="news-card bg-white dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 p-[2px] flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                        <span className="font-bold text-brand-600 dark:text-brand-400 text-xs md:text-sm">{post.author.substring(0, 2).toUpperCase()}</span>
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
                        onClick={() => onExpand(post.id)}
                        className="text-xs md:text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors flex items-center gap-1 mt-2"
                    >
                        {isExpanded
                            ? (isRtl ? 'إخفاء النص' : 'Show Less')
                            : (isRtl ? 'قراءة المزيد' : 'Read More')}
                    </button>
                )}
            </div>

            {/* Media Carousel */}
            {mediaItems.length > 0 && (
                <div
                    className={`relative bg-black w-full overflow-hidden group ${getAspectRatioClass(post.aspectRatio)}`}
                >
                    {mediaItems.map((item, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            {item.type === 'video' ? (
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                    controls={idx === currentSlide}
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
                                    src={item.url}
                                    alt={post.title}
                                    className="w-full h-full object-cover cursor-zoom-in"
                                    onClick={(e) => handleImageClick(e, item.url)}
                                    style={{
                                        objectPosition: `${post.design?.imagePosition?.x || 50}% ${post.design?.imagePosition?.y || 50}%`,
                                        transform: `scale(${post.design?.imagePosition?.scale || 1})`,
                                        filter: `brightness(${post.design?.filters?.brightness || 100}%) contrast(${post.design?.filters?.contrast || 100}%) saturate(${post.design?.filters?.saturate || 100}%)`
                                    }}
                                />
                            )}
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    {mediaItems.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                            >
                                <ChevronRight size={24} />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {mediaItems.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${idx === currentSlide ? 'bg-white scale-125' : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>

                            {/* Counter Chip */}
                            <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white">
                                {currentSlide + 1}/{mediaItems.length}
                            </div>
                        </>
                    )}

                    {/* DESIGN OVERLAY LAYER (Only on first slide or simplified) */}
                    <div
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{ backgroundColor: `rgba(0,0,0, ${post.design?.overlayOpacity ? post.design.overlayOpacity / 100 : 0})` }}
                    ></div>
                    {post.design?.overlayText && (
                        <div className={`absolute inset-0 p-6 flex flex-col pointer-events-none z-10 ${alignmentStyles[post.design.textAlignment || 'center']} justify-center`}>
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
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Like Button - Real & Interactive */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike(post.id);
                        }}
                        className={`flex items-center gap-2 group transition-all text-sm font-bold ${isLiked ? 'text-red-500 scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
                    >
                        <Heart
                            size={24}
                            className={`transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`}
                        />
                        <span>{post.likes ? post.likes.toLocaleString() : '0'}</span>
                    </button>

                    {/* Views Count */}
                    <div className="flex items-center gap-2 group text-gray-400 dark:text-gray-500" title="Views">
                        <Eye size={22} />
                        <span className="text-xs md:text-sm font-semibold">{post.views ? post.views.toLocaleString() : '0'}</span>
                    </div>
                </div>

                <button onClick={() => onShare(post.id)} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Share2 size={24} />
                </button>
            </div>
        </div>
    );
};

const Home: React.FC<HomeProps> = ({ lang, news, setNews, setPage, settings }) => {
    const isRtl = lang === 'ar';

    // --- PAGINATION CONFIGURATION ---
    const [currentPageNum, setCurrentPageNum] = useState(1);
    const itemsPerPage = 20;

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
            if (post.status === 'scheduled') {
                if (!post.scheduledDate) return false;
                const scheduledTime = new Date(post.scheduledDate);
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

    // --- LIKE FUNCTIONALITY ---
    const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('csa_user_likes');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (e) {
            console.error("Failed to load likes from localStorage", e);
            return new Set();
        }
    });

    useEffect(() => {
        localStorage.setItem('csa_user_likes', JSON.stringify(Array.from(likedPosts)));
    }, [likedPosts]);

    const handleLike = (id: string) => {
        if (likedPosts.has(id)) {
            // Unlike
            setLikedPosts(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            setNews(prev => prev.map(p =>
                p.id === id ? { ...p, likes: Math.max(0, (p.likes || 0) - 1) } : p
            ));
        } else {
            // Like
            setLikedPosts(prev => {
                const next = new Set(prev);
                next.add(id);
                return next;
            });
            setNews(prev => prev.map(p =>
                p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p
            ));
        }
    };

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
        }, { threshold: 0.5 });

        const elements = document.querySelectorAll('.news-card');
        elements.forEach(el => observer.current?.observe(el));

        return () => observer.current?.disconnect();
    }, [displayedNews]);

    // 5. Smart Pagination Algorithm
    const paginationRange = useMemo(() => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPageNum - delta && i <= currentPageNum + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    }, [currentPageNum, totalPages]);

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
            <div className="relative bg-[#0B1120] overflow-hidden text-white shadow-2xl pb-20">
                {/* High Fidelity Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e40af] via-[#0f172a] to-[#020617]"></div>

                {/* CSS-only Grid Pattern for Sharpness */}
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Glowing Orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-8 text-blue-50 shadow-lg animate-fade-in hover:bg-white/15 transition-colors cursor-default">
                        <span>✨</span>
                        <span>{isRtl ? 'البوابة الرسمية للجمعية' : 'Official Association Portal'}</span>
                    </div>

                    {/* Main Title */}
                    <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-50 to-blue-200 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
                        {heroTitle}
                    </h1>

                    {/* Subtitle */}
                    <p className={`text-lg md:text-2xl text-blue-200/80 mb-12 leading-relaxed max-w-2xl font-light px-4 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
                        {heroSubtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
                        <button
                            onClick={() => setPage('events')}
                            className="group relative px-10 py-4 rounded-2xl font-bold text-white transition-all transform hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(14,165,233,0.5)] shadow-2xl flex items-center justify-center gap-3 overflow-hidden bg-brand-600"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mixed-blend-overlay"></div>
                            <span className="relative">{isRtl ? 'استكشف الفعاليات' : 'Explore Events'}</span>
                            {isRtl ? <ArrowRight className="rotate-180 relative" size={20} /> : <ArrowRight className="relative" size={20} />}
                        </button>

                        <button
                            onClick={() => setPage('about')}
                            className="px-8 py-4 rounded-2xl font-bold bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-blue-900 transition-all transform hover:-translate-y-1 shadow-lg"
                        >
                            {isRtl ? 'تعرف علينا' : 'About Us'}
                        </button>
                    </div>
                </div>

                {/* Decorative curve at bottom */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px] fill-gray-50 dark:fill-slate-900 transition-colors duration-500">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-white dark:fill-slate-800"></path>
                        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-white dark:fill-slate-800"></path>
                        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
                    </svg>
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
                                {displayedNews.map((post) => (
                                    <NewsCard
                                        key={post.id}
                                        post={post}
                                        isRtl={isRtl}
                                        isExpanded={expandedPosts.has(post.id)}
                                        onExpand={toggleExpand}
                                        onShare={handleShareClick}
                                        onLike={handleLike}
                                        isLiked={likedPosts.has(post.id)}
                                        onViewImage={setViewingImage}
                                        formatDate={formatDate}
                                    />
                                ))}

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
                                                {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
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
                                                {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
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
                                <Calendar size={20} />
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