import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, Trash2, LogOut, Sparkles, Loader2, Calendar, Users, Newspaper, LayoutDashboard, Settings as SettingsIcon, Save, X, Edit, Eye, Image as ImageIcon, FileText, Check, Search, Video, Mic, Paperclip, MonitorPlay, Upload, Link as LinkIcon, Smartphone, Square, RectangleHorizontal, RectangleVertical, Share2, Filter, ChevronLeft, ChevronRight, Wifi, MapPin, Globe, Tag, ExternalLink, Palette, Type, Layout, AlignLeft, AlignCenter, AlignRight, Sliders, ZoomIn, Move, Maximize, PlayCircle, Clock, Send, Sun, Contrast, Droplet, Info, ChevronDown, ChevronUp, Layers, Ticket, BarChart2, TrendingUp, CalendarClock, Activity, Crop, RefreshCcw, Grid3X3, Heart } from 'lucide-react';
import { Language, EventItem, Member, NewsPost, AppSettings, MemberRole, PostDesignConfig, AppState, TimelineItem } from '../types';
import { LABELS } from '../constants';
import { generateContentHelper } from '../services/geminiService';
import ThemeManager from '../components/ThemeManager';
import { api } from '../services/api';

// --- HELPER FUNCTIONS ---

const getAspectClass = (r?: string) => {
    switch (r) {
        case 'portrait': return 'aspect-[4/5]';
        case 'landscape': return 'aspect-video';
        case 'story': return 'aspect-[9/16]'; // Added Story/Reel ratio
        default: return 'aspect-square';
    }
};

// --- HELPER COMPONENTS ---

const PaginationControls = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
    if (total <= 1) return null;
    return (
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 dark:border-slate-700">
            <button onClick={() => onPageChange(current - 1)} disabled={current === 1} className="p-2 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-gray-600 dark:text-gray-300"><ChevronLeft size={16} /></button>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Page {current} of {total}</span>
            <button onClick={() => onPageChange(current + 1)} disabled={current === total} className="p-2 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-gray-600 dark:text-gray-300"><ChevronRight size={16} /></button>
        </div>
    );
};

// --- MEDIA UPLOADER COMPONENT ---
interface MediaUploaderProps {
    value: string;
    mediaType?: 'image' | 'video';
    onChange: (url: string) => void;
    onMediaTypeChange?: (type: 'image' | 'video') => void;
    aspectRatio?: 'square' | 'portrait' | 'landscape' | 'story';
    onAspectRatioChange?: (ratio: 'square' | 'portrait' | 'landscape' | 'story') => void;
    label?: string;
    previewConfig?: PostDesignConfig;
    onUpdateDesign?: (updates: Partial<PostDesignConfig>) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
    value,
    mediaType = 'image',
    onChange,
    onMediaTypeChange,
    aspectRatio = 'square',
    onAspectRatioChange,
    label = "Media",
    previewConfig,
    onUpdateDesign
}) => {
    const [tab, setTab] = useState<'upload' | 'link'>('upload');
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                setError('File size exceeds 50MB limit.');
                return;
            }
            setError('');
            if (file.type.startsWith('video/')) {
                onMediaTypeChange?.('video');
            } else {
                onMediaTypeChange?.('image');
            }

            // Upload to server for permanent storage
            setIsUploading(true);
            try {
                const result = await api.manage.uploadFile(file);
                onChange(result.url);
            } catch (err: any) {
                setError('Upload failed: ' + (err.message || 'Unknown error'));
                // Fallback to blob URL for preview
                const objectUrl = URL.createObjectURL(file);
                onChange(objectUrl);
            } finally {
                setIsUploading(false);
            }
        }
    };

    // --- DRAG TO PAN LOGIC ---
    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !onUpdateDesign || !previewConfig?.imagePosition) return;

        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;

        const sensitivity = 0.2;
        const currentX = previewConfig.imagePosition.x;
        const currentY = previewConfig.imagePosition.y;

        const newX = Math.min(100, Math.max(0, currentX - (dx * sensitivity)));
        const newY = Math.min(100, Math.max(0, currentY - (dy * sensitivity)));

        onUpdateDesign({
            imagePosition: {
                ...previewConfig.imagePosition,
                x: newX,
                y: newY
            }
        });

        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const mediaStyle = previewConfig ? {
        objectPosition: `${previewConfig.imagePosition?.x || 50}% ${previewConfig.imagePosition?.y || 50}%`,
        transform: `scale(${previewConfig.imagePosition?.scale || 1})`,
        filter: `brightness(${previewConfig.filters?.brightness || 100}%) contrast(${previewConfig.filters?.contrast || 100}%) saturate(${previewConfig.filters?.saturate || 100}%) grayscale(${previewConfig.filters?.grayscale || 0}%) sepia(${previewConfig.filters?.sepia || 0}%)`
    } : {};

    const resetImage = () => {
        if (onUpdateDesign) {
            onUpdateDesign({
                imagePosition: { x: 50, y: 50, scale: 1 },
                filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 }
            });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                    {label} {value && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full dark:bg-green-900/30">Active</span>}
                </label>
                {value && (
                    <button onClick={() => onChange('')} className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1">
                        <Trash2 size={12} /> Remove
                    </button>
                )}
            </div>

            {!value ? (
                <div className={`bg-gray-50 dark:bg-slate-800 border-2 border-dashed ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-slate-700'} rounded-xl p-6 transition-all hover:border-brand-400 group`}>
                    <div className="flex gap-2 mb-6 bg-white dark:bg-slate-900 p-1 rounded-lg w-fit mx-auto border dark:border-slate-700 shadow-sm">
                        <button onClick={() => { setTab('upload'); setError(''); }} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${tab === 'upload' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}>Upload</button>
                        <button onClick={() => { setTab('link'); setError(''); }} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${tab === 'link' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}>Link</button>
                    </div>
                    {tab === 'upload' ? (
                        <div className="text-center py-2 cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-500 group-hover:scale-110 transition-transform">
                                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                            </div>
                            <p className="text-base font-bold text-gray-700 dark:text-gray-200">
                                {isUploading ? 'Uploading...' : 'Tap to upload media'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{isUploading ? 'Please wait' : 'Images or Videos (Max 50MB)'}</p>
                            {error && <p className="text-xs text-red-500 font-bold mt-2">{error}</p>}
                            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <input type="text" placeholder="https://example.com/image.jpg" className="w-full p-3 text-sm border dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-brand-500" onBlur={(e) => onChange(e.target.value)} />
                            <p className="text-[10px] text-gray-400 text-center">Supports direct image & video links</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* PREVIEW CONTAINER */}
                    <div className="bg-slate-900 rounded-2xl p-1 border border-slate-700 shadow-inner relative group">
                        <div
                            ref={containerRef}
                            className={`relative w-full bg-black rounded-xl overflow-hidden mx-auto shadow-2xl cursor-move touch-none ${getAspectClass(aspectRatio)}`}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        >
                            {/* Grid Overlay (Shows on drag/hover) */}
                            <div className={`absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 grid grid-cols-3 grid-rows-3`}>
                                <div className="border-r border-b border-white/20"></div>
                                <div className="border-r border-b border-white/20"></div>
                                <div className="border-b border-white/20"></div>
                                <div className="border-r border-b border-white/20"></div>
                                <div className="border-r border-b border-white/20"></div>
                                <div className="border-b border-white/20"></div>
                                <div className="border-r border-white/20"></div>
                                <div className="border-r border-white/20"></div>
                                <div></div>
                            </div>

                            {mediaType === 'video' ? (
                                <video
                                    src={value}
                                    className="w-full h-full object-cover transition-all duration-100 select-none pointer-events-none"
                                    // controls={false} // Disable controls while editing to allow drag
                                    playsInline
                                    style={mediaStyle}
                                />
                            ) : (
                                <img
                                    src={value}
                                    className="w-full h-full object-cover transition-all duration-100 select-none pointer-events-none"
                                    alt="Preview"
                                    style={mediaStyle}
                                    draggable={false}
                                />
                            )}

                            {/* Text Overlay Preview */}
                            {previewConfig?.overlayText && (
                                <div className={`absolute inset-0 pointer-events-none flex flex-col p-4 z-10 ${previewConfig.textAlignment === 'left' ? 'justify-start items-start text-left' : previewConfig.textAlignment === 'right' ? 'justify-end items-end text-right' : 'justify-center items-center text-center'}`} style={{ backgroundColor: `rgba(0,0,0,${(previewConfig.overlayOpacity || 0) / 100})` }}>
                                    <p className={`text-xl break-words whitespace-pre-line ${previewConfig.fontStyle === 'typewriter' ? 'font-mono' : previewConfig.fontStyle === 'classic' ? 'font-serif' : 'font-sans font-bold'}`} style={{ color: previewConfig.textColor }}>{previewConfig.overlayText}</p>
                                </div>
                            )}
                        </div>

                        <div className="absolute top-3 right-3 z-30">
                            <button onClick={resetImage} className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors" title="Reset Image">
                                <RefreshCcw size={14} />
                            </button>
                        </div>
                    </div>

                    {/* ASPECT RATIO CONTROLS */}
                    {onAspectRatioChange && (
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 overflow-x-auto custom-scrollbar">
                            <button onClick={() => onAspectRatioChange('square')} className={`flex-1 p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${aspectRatio === 'square' ? 'bg-gray-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}><Square size={16} /> 1:1</button>
                            <button onClick={() => onAspectRatioChange('portrait')} className={`flex-1 p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${aspectRatio === 'portrait' ? 'bg-gray-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}><RectangleVertical size={16} /> 4:5</button>
                            <button onClick={() => onAspectRatioChange('landscape')} className={`flex-1 p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${aspectRatio === 'landscape' ? 'bg-gray-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}><RectangleHorizontal size={16} /> 16:9</button>
                            <button onClick={() => onAspectRatioChange('story')} className={`flex-1 p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${aspectRatio === 'story' ? 'bg-gray-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}><Smartphone size={16} /> 9:16</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- SETTINGS COMPONENT ---
const SettingsEditor = ({ settings, onSave, timeline, onSaveTimeline }: {
    settings: AppSettings,
    onSave: (s: AppSettings) => void,
    timeline: TimelineItem[],
    onSaveTimeline: (t: TimelineItem[]) => void
}) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [localTimeline, setLocalTimeline] = useState(timeline);

    const [newTimelineItem, setNewTimelineItem] = useState<TimelineItem>({
        id: '', year: '', titleAr: '', titleEn: '', descAr: '', descEn: '', icon: 'Layers'
    });
    const [isAddingTimeline, setIsAddingTimeline] = useState(false);

    const handleChange = (key: keyof AppSettings, value: string) => setLocalSettings({ ...localSettings, [key]: value });
    const handleSave = () => {
        onSave(localSettings);
        onSaveTimeline(localTimeline);
        alert('Settings & Timeline Saved!');
    };

    const updateColor = (key: 'primaryColor' | 'secondaryColor', value: string) => {
        handleChange(key, value);
        if (key === 'primaryColor') document.documentElement.style.setProperty('--primary-color', value);
        if (key === 'secondaryColor') document.documentElement.style.setProperty('--secondary-color', value);
    };

    const addTimelineItem = () => {
        if (!newTimelineItem.year || !newTimelineItem.titleEn) return alert('Year and Title are required');
        setLocalTimeline([...localTimeline, { ...newTimelineItem, id: Date.now().toString() }]);
        setNewTimelineItem({ id: '', year: '', titleAr: '', titleEn: '', descAr: '', descEn: '', icon: 'Layers' });
        setIsAddingTimeline(false);
    };

    const removeTimelineItem = (id: string) => {
        setLocalTimeline(localTimeline.filter(t => t.id !== id));
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b dark:border-slate-700 pb-2"><Palette /> Theme & Brand</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['siteNameEn', 'siteNameAr'].map(key => (
                        <div key={key}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{key.replace('siteName', 'Site Name ')}</label>
                            <input className="w-full p-3 text-base border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" value={localSettings[key as keyof AppSettings] as string} onChange={(e) => handleChange(key as any, e.target.value)} />
                        </div>
                    ))}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo URL</label>
                        <input className="w-full p-3 text-base border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" value={localSettings.logoUrl} onChange={(e) => handleChange('logoUrl', e.target.value)} />
                    </div>
                    {['primaryColor', 'secondaryColor'].map(key => (
                        <div key={key}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{key.replace('Color', ' Color')}</label>
                            <div className="flex items-center gap-4">
                                <input type="color" value={localSettings[key as keyof AppSettings] as string} onChange={(e) => updateColor(key as any, e.target.value)} className="w-16 h-12 rounded-lg border-2 border-gray-200 dark:border-slate-700 cursor-pointer" />
                                <input type="text" value={localSettings[key as keyof AppSettings] as string} onChange={(e) => updateColor(key as any, e.target.value)} className="w-full p-3 text-base border rounded-xl font-mono text-sm bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 uppercase" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b dark:border-slate-700 pb-2"><Info /> About Page Content</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">About The Association (Arabic)</label>
                        <textarea rows={3} className="w-full p-4 text-base border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 text-right font-arabic" value={localSettings.aboutTextAr} onChange={(e) => handleChange('aboutTextAr', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">About The Association (English)</label>
                        <textarea rows={3} className="w-full p-4 text-base border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" value={localSettings.aboutTextEn} onChange={(e) => handleChange('aboutTextEn', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vision (Arabic)</label>
                        <textarea rows={3} className="w-full p-3 text-base border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 text-right font-arabic" value={localSettings.visionAr} onChange={(e) => handleChange('visionAr', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vision (English)</label>
                        <textarea rows={3} className="w-full p-3 text-base border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" value={localSettings.visionEn} onChange={(e) => handleChange('visionEn', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mission (Arabic)</label>
                        <textarea rows={3} className="w-full p-3 text-base border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 text-right font-arabic" value={localSettings.missionAr} onChange={(e) => handleChange('missionAr', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mission (English)</label>
                        <textarea rows={3} className="w-full p-3 text-base border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" value={localSettings.missionEn} onChange={(e) => handleChange('missionEn', e.target.value)} />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b dark:border-slate-700 pb-2"><Layers /> Timeline History</h3>
                <div className="space-y-4">
                    {localTimeline.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm group hover:border-brand-300 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-black text-gray-300 dark:text-slate-600">{item.year}</span>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{item.titleEn} / {item.titleAr}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">{item.descEn}</p>
                                </div>
                            </div>
                            <button onClick={() => removeTimelineItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {!isAddingTimeline ? (
                        <button onClick={() => setIsAddingTimeline(true)} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-gray-500 hover:border-brand-500 hover:text-brand-500 font-bold transition-all flex items-center justify-center gap-2">
                            <Plus size={20} /> Add Milestone
                        </button>
                    ) : (
                        <div className="bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 p-6 rounded-xl space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Year (e.g. 2024)" className="p-3 text-base border rounded-lg dark:bg-slate-800" value={newTimelineItem.year} onChange={e => setNewTimelineItem({ ...newTimelineItem, year: e.target.value })} />
                                <select className="p-3 text-base border rounded-lg dark:bg-slate-800" value={newTimelineItem.icon} onChange={e => setNewTimelineItem({ ...newTimelineItem, icon: e.target.value as any })}>
                                    <option value="Layers">Layers</option>
                                    <option value="BookOpen">BookOpen</option>
                                    <option value="Zap">Zap</option>
                                    <option value="Target">Target</option>
                                    <option value="Star">Star</option>
                                    <option value="Trophy">Trophy</option>
                                    <option value="Globe">Globe</option>
                                    <option value="Users">Users</option>
                                    <option value="Award">Award</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Title (EN)" className="p-3 text-base border rounded-lg dark:bg-slate-800" value={newTimelineItem.titleEn} onChange={e => setNewTimelineItem({ ...newTimelineItem, titleEn: e.target.value })} />
                                <input placeholder="Title (AR)" className="p-3 text-base border rounded-lg dark:bg-slate-800 text-right" value={newTimelineItem.titleAr} onChange={e => setNewTimelineItem({ ...newTimelineItem, titleAr: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Description (EN)" className="p-3 text-base border rounded-lg dark:bg-slate-800" value={newTimelineItem.descEn} onChange={e => setNewTimelineItem({ ...newTimelineItem, descEn: e.target.value })} />
                                <input placeholder="Description (AR)" className="p-3 text-base border rounded-lg dark:bg-slate-800 text-right" value={newTimelineItem.descAr} onChange={e => setNewTimelineItem({ ...newTimelineItem, descAr: e.target.value })} />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={addTimelineItem} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-lg">Add</button>
                                <button onClick={() => setIsAddingTimeline(false)} className="flex-1 py-3 bg-white border font-bold rounded-lg dark:bg-slate-800 dark:border-slate-600">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <div className="pt-6 border-t dark:border-slate-700 sticky bottom-0 bg-slate-50 dark:bg-slate-950 pb-4">
                <button onClick={handleSave} className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    <Save size={20} /> Save All Settings
                </button>
            </div>
        </div>
    );
};

// --- POST PREVIEW COMPONENT ---
const PostPreview = ({ item, design, aspectRatio }: { item: any, design: PostDesignConfig | undefined, aspectRatio: string }) => {
    const mediaUrl = item?.url || '';
    const mediaType = item?.type || 'image';
    const mediaStyle: React.CSSProperties = {
        transform: `scale(${design?.imagePosition?.scale || 1}) translate(${-(50 - (design?.imagePosition?.x || 50))}%, ${-(50 - (design?.imagePosition?.y || 50))}%)`,
        filter: `brightness(${design?.filters?.brightness || 100}%) contrast(${design?.filters?.contrast || 100}%) saturate(${design?.filters?.saturate || 100}%) grayscale(${design?.filters?.grayscale || 0}%) sepia(${design?.filters?.sepia || 0}%)`,
        objectFit: 'cover',
        transformOrigin: 'center center'
    };

    return (
        <div className={`relative w-full overflow-hidden bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 group ${getAspectClass(aspectRatio)}`}>
            {mediaUrl ? (
                mediaType === 'video' ? (
                    <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline style={mediaStyle} />
                ) : (
                    <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" style={mediaStyle} />
                )
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-100 dark:bg-slate-800">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-xs font-bold">No Media</span>
                </div>
            )}

            {/* Text Overlay */}
            {design?.overlayText && (
                <div className={`absolute inset-0 pointer-events-none flex flex-col p-4 z-10 ${design.textAlignment === 'left' ? 'justify-start items-start text-left' : design.textAlignment === 'right' ? 'justify-end items-end text-right' : 'justify-center items-center text-center'}`} style={{ backgroundColor: `rgba(0,0,0,${(design.overlayOpacity || 0) / 100})` }}>
                    <p className={`text-xl md:text-2xl break-words whitespace-pre-line ${design.fontStyle === 'typewriter' ? 'font-mono' : design.fontStyle === 'classic' ? 'font-serif' : 'font-sans font-bold'}`} style={{ color: design.textColor }}>{design.overlayText}</p>
                </div>
            )}
        </div>
    );
};

// --- NEWS EDITOR ---
const NewsEditor = ({ item, onSave, onCancel, primaryColor }: { item?: NewsPost, onSave: (i: NewsPost) => void, onCancel: () => void, primaryColor: string }) => {
    const [formData, setFormData] = useState<NewsPost>(item || {
        id: Date.now().toString(), title: '', content: '', date: new Date().toISOString().split('T')[0], author: 'Admin', tags: ['News'], image: '', mediaType: 'image', media: [], aspectRatio: 'square',
        design: { fontStyle: 'modern', textColor: '#ffffff', textAlignment: 'center', overlayText: '', overlayOpacity: 30, imagePosition: { x: 50, y: 50, scale: 1 }, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 } },
        likes: 0, views: 0, status: 'published', datePublished: new Date().toLocaleString(), scheduledDate: '', lastUpdated: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [editorTab, setEditorTab] = useState<'content' | 'design'>('content');

    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    useEffect(() => {
        const defDesign: PostDesignConfig = { fontStyle: 'modern', textColor: '#ffffff', textAlignment: 'center', overlayText: '', overlayOpacity: 30, imagePosition: { x: 50, y: 50, scale: 1 }, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 } };
        // Ensure media array exists and has updated structure
        let initialMedia = formData.media && formData.media.length > 0 ? formData.media : (formData.image ? [{ type: formData.mediaType || 'image', url: formData.image }] : []);

        // Migrate existing media to have design config if missing
        initialMedia = initialMedia.map(m => ({
            ...m,
            design: m.design || { ...defDesign, overlayText: '' } // clone default
        }));

        if (!formData.design) setFormData(p => ({ ...p, design: defDesign, media: initialMedia }));
        else setFormData(p => ({ ...p, design: { ...defDesign, ...p.design }, media: initialMedia }));

        if (!formData.status) setFormData(p => ({ ...p, status: 'published' }));
    }, []);

    const handleAI = async () => {
        if (!formData.title) return alert('Enter Title');
        setIsGenerating(true);
        const text = await generateContentHelper(`Write a news post about: ${formData.title}`, 'en');
        setFormData(p => ({ ...p, content: text }));
        setIsGenerating(false);
    };

    const addTag = () => { if (tagInput && !formData.tags.includes(tagInput)) { setFormData(p => ({ ...p, tags: [...p.tags, tagInput] })); setTagInput(''); } };

    const updateDesign = (section: keyof PostDesignConfig, key: string, value: any) => {
        // Update the ACTIVE media item's design
        setFormData(prev => {
            const newMedia = [...(prev.media || [])];
            if (!newMedia[activeMediaIndex]) return prev;

            const currentDesign = newMedia[activeMediaIndex].design || { ...prev.design! }; // Fallback to global if missing

            const sectionValue = (currentDesign as any)[section] || {};

            newMedia[activeMediaIndex] = {
                ...newMedia[activeMediaIndex],
                design: {
                    ...currentDesign,
                    [section]: { ...sectionValue, [key]: value }
                }
            };

            return { ...prev, media: newMedia };
        });
    };

    // New helper to update design directly from MediaUploader props for specific index
    const handleMediaDesignUpdate = (idx: number, updates: Partial<PostDesignConfig>) => {
        setFormData(prev => {
            const newMedia = [...(prev.media || [])];
            if (!newMedia[idx]) return prev;

            newMedia[idx] = {
                ...newMedia[idx],
                design: { ...(newMedia[idx].design || prev.design!), ...updates }
            };
            return { ...prev, media: newMedia };
        });
    };

    // Global design update for text overlays (optional: keep text global or per-slide? User asked for image control. Let's keep text global for now or sync it? 
    // Actually, user problem was "linkage". Let's make text global but image params local.
    // WAIT: The code above `updateDesign` is used by the sliders. The sliders should control the ACTIVE image.
    // For text overlay inputs (which use `setFormData({ ...formData, design: ... })`), we should probably keep them global OR make them active-item specific. 
    // Let's make EVERYTHING active-item specific for maximum control, but maybe fallback to global for text if undefined.

    // Helper for Text/Color updates (Global or Active?)
    // Let's stick to: Sliders/Pan = Active Item. Text = Global (usually title overlay).
    // Reviewing previous code: Text inputs explicitly updated `formData.design`.
    // I will leave Text inputs updating `formData.design` (Global Overlay) but Image Params updating `formData.media[i].design`.

    // --- GALLERY HELPERS ---
    const addMedia = () => {
        if ((formData.media?.length || 0) >= 128) {
            alert("Maximum 128 media items allowed.");
            return;
        }
        setFormData(p => ({
            ...p,
            media: [...(p.media || []), { type: 'image', url: '' }]
        }));
    };

    const removeMedia = (index: number) => {
        setFormData(p => {
            const newMedia = [...(p.media || [])];
            newMedia.splice(index, 1);
            // Sync legacy fields
            const first = newMedia[0];
            return { ...p, media: newMedia, image: first?.url || '', mediaType: first?.type || 'image' };
        });
    };

    const updateMediaItem = (index: number, url: string, type?: 'image' | 'video') => {
        setFormData(p => {
            const newMedia = [...(p.media || [])];
            // Auto-detect video if type not explicit
            const newType = type || (url.includes('.mp4') || url.includes('video') ? 'video' : 'image');

            newMedia[index] = { ...newMedia[index], url, type: newType };

            // Sync legacy fields if first item
            if (index === 0) {
                return { ...p, media: newMedia, image: url, mediaType: newType };
            }
            return { ...p, media: newMedia };
        });
    };

    // Use first media item for preview or fallback
    const activeMedia = formData.media && formData.media.length > 0 ? formData.media[0] : (formData.image ? { url: formData.image, type: formData.mediaType } : null);

    return (
        <div className="flex flex-col md:flex-row w-full min-h-full bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
            {/* MOBILE PREVIEW (Visible only on mobile) */}
            <div className="md:hidden bg-gray-50 dark:bg-slate-950 p-4 border-b dark:border-slate-800 flex-shrink-0">
                <PostPreview item={activeMedia} design={formData.design} aspectRatio={formData.aspectRatio || 'square'} />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
                    <button onClick={() => setEditorTab('content')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${editorTab === 'content' ? 'text-brand-600 border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'text-gray-400 border-transparent'}`}><FileText size={18} /> Details</button>
                    <button onClick={() => setEditorTab('design')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${editorTab === 'design' ? 'text-brand-600 border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'text-gray-400 border-transparent'}`}><Crop size={18} /> Studio</button>
                </div>
                <div className="flex-1 p-4 md:p-6 space-y-4 pb-32 md:pb-6">
                    {editorTab === 'content' ? (
                        <div className="space-y-6">
                            {/* Title & Content */}
                            <input className="w-full p-4 border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-bold text-lg md:text-xl" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Post Title" />
                            <textarea className="w-full p-4 border dark:border-slate-700 rounded-xl h-48 bg-white dark:bg-slate-800 text-base" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Content..." />

                            {/* Meta & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="p-4 border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-base" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} placeholder="Author" />

                                <div className="space-y-2">
                                    <select
                                        className="w-full p-4 border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-base"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="published">Published Immediately</option>
                                        <option value="draft">Save as Draft</option>
                                        <option value="scheduled">Schedule for Later</option>
                                    </select>

                                    {/* SCHEDULING INPUT */}
                                    {formData.status === 'scheduled' && (
                                        <div className="animate-fade-in bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-slate-600">
                                            <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">Publish Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full p-3 rounded border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-base"
                                                value={formData.scheduledDate || ''}
                                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2"><input className="flex-grow p-4 border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-base" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add Tag" onKeyDown={e => e.key === 'Enter' && addTag()} /><button onClick={addTag} className="px-6 bg-gray-100 dark:bg-slate-700 rounded-xl"><Plus /></button></div>
                            <div className="flex flex-wrap gap-2">{formData.tags.map(t => <span key={t} className="px-3 py-1 bg-brand-100 text-brand-700 rounded-lg text-sm">{t}</span>)}</div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Text Overlay Controls */}
                            <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl space-y-4 border border-gray-100 dark:border-slate-700">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white border-b dark:border-slate-700 pb-2">Caption Overlay (Global)</h4>
                                <div className="space-y-4">
                                    <input className="w-full p-3 border rounded-xl bg-white dark:bg-slate-900 dark:border-slate-600 text-base" value={formData.design?.overlayText} onChange={e => setFormData({ ...formData, design: { ...formData.design!, overlayText: e.target.value } })} placeholder="Enter text to overlay..." />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Color</label>
                                            <input type="color" className="w-full h-10 rounded cursor-pointer" value={formData.design?.textColor} onChange={e => setFormData({ ...formData, design: { ...formData.design!, textColor: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Opacity</label>
                                            <input type="range" min="0" max="100" className="w-full" value={formData.design?.overlayOpacity} onChange={e => setFormData({ ...formData, design: { ...formData.design!, overlayOpacity: parseInt(e.target.value) } })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Adjustments (Zoom & Filters) - Controls ACTIVE Media Item */}
                            <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl space-y-6 border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center justify-between border-b dark:border-slate-700 pb-2">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Sliders size={14} /> Adjustments (Image {activeMediaIndex + 1})</h4>
                                    <button onClick={() => updateDesign('imagePosition', 'scale', 1)} className="text-xs text-brand-600 hover:text-brand-700 font-bold">Reset Zoom</button>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                        <div className="flex justify-between mb-2"><label className="text-xs font-bold text-gray-500 flex items-center gap-1"><ZoomIn size={14} /> Zoom Scale</label><span className="text-xs text-gray-400 font-mono">{formData.media?.[activeMediaIndex]?.design?.imagePosition?.scale || formData.design?.imagePosition?.scale}x</span></div>
                                        <input type="range" min="1" max="3" step="0.05" value={formData.media?.[activeMediaIndex]?.design?.imagePosition?.scale || formData.design?.imagePosition?.scale} onChange={e => updateDesign('imagePosition', 'scale', parseFloat(e.target.value))} className="w-full h-2 bg-brand-100 rounded-lg appearance-none cursor-pointer dark:bg-brand-900 accent-brand-600" />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Color Grading</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-gray-400">Brightness</label></div>
                                                <input type="range" min="0" max="200" value={formData.media?.[activeMediaIndex]?.design?.filters?.brightness ?? 100} onChange={e => updateDesign('filters', 'brightness', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 accent-gray-500" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-gray-400">Contrast</label></div>
                                                <input type="range" min="0" max="200" value={formData.media?.[activeMediaIndex]?.design?.filters?.contrast ?? 100} onChange={e => updateDesign('filters', 'contrast', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 accent-gray-500" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-gray-400">Saturation</label></div>
                                                <input type="range" min="0" max="200" value={formData.media?.[activeMediaIndex]?.design?.filters?.saturate ?? 100} onChange={e => updateDesign('filters', 'saturate', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 accent-gray-500" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-gray-400">Grayscale</label></div>
                                                <input type="range" min="0" max="100" value={formData.media?.[activeMediaIndex]?.design?.filters?.grayscale ?? 0} onChange={e => updateDesign('filters', 'grayscale', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 accent-gray-500" />
                                            </div>
                                        </div>
                                        <input type="range" min="0" max="200" value={formData.design?.filters?.saturate} onChange={e => updateDesign('filters', 'saturate', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 accent-gray-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-gray-400">B&W</label></div>
                                        <input type="range" min="0" max="100" value={formData.design?.filters?.grayscale} onChange={e => updateDesign('filters', 'grayscale', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 accent-gray-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                            </div>
            </div>
                    )}
        </div>
            </div >
    <div className="w-full md:w-[340px] xl:w-[420px] bg-gray-50 dark:bg-slate-800 border-l border-gray-100 dark:border-slate-700 flex flex-col h-auto overflow-visible pb-32 md:pb-0">
        {/* DESKTOP PREVIEW (Type: Content/Design) */}
        <div className="hidden md:block p-6 border-b dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
            <h4 className="font-bold text-gray-500 text-xs uppercase mb-3 px-1">Live Preview ({activeMediaIndex + 1}/{formData.media?.length})</h4>
            <PostPreview
                item={formData.media?.[activeMediaIndex]}
                design={{ ...formData.design!, ...(formData.media?.[activeMediaIndex]?.design || {}) }}
                aspectRatio={formData.aspectRatio || 'square'}
            />
        </div>

        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-700 dark:text-gray-300">Media Gallery</h4>
                <button onClick={() => {
                    const newMediaItem: any = {
                        type: 'image',
                        url: '',
                        design: { fontStyle: 'modern', textColor: '#ffffff', textAlignment: 'center', overlayText: '', overlayOpacity: 30, imagePosition: { x: 50, y: 50, scale: 1 }, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 } }
                    };
                    setFormData(prev => ({ ...prev, media: [...(prev.media || []), newMediaItem] }));
                    setActiveMediaIndex((formData.media?.length || 0));
                }} className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1">
                    <Plus size={14} /> Add Media
                </button>
            </div>

            <div className="space-y-4">
                {formData.media?.map((item, idx) => (
                    <div key={idx} className={`relative bg-white dark:bg-slate-900 p-2 rounded-xl border shadow-sm group ${activeMediaIndex === idx ? 'border-brand-500' : 'border-gray-200 dark:border-slate-700'}`}>
                        <div className="absolute top-2 right-2 z-20">
                            <button onClick={() => removeMedia(idx)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Remove">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <span className={`absolute top-2 left-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md cursor-pointer ${activeMediaIndex === idx ? 'bg-brand-500 text-white' : 'bg-black/50 text-white'}`} onClick={() => setActiveMediaIndex(idx)}>
                            Item {idx + 1} {activeMediaIndex === idx && '(Editing)'}
                        </span>

                        <div onClick={() => setActiveMediaIndex(idx)} className={`transition-all ${activeMediaIndex === idx ? 'ring-2 ring-brand-500 rounded-lg' : ''}`}>
                            <MediaUploader
                                value={item.url}
                                mediaType={item.type as any}
                                onChange={(u) => updateMediaItem(idx, u)}
                                onMediaTypeChange={(t) => updateMediaItem(idx, item.url, t)}
                                aspectRatio={formData.aspectRatio}
                                onAspectRatioChange={idx === 0 ? r => setFormData({ ...formData, aspectRatio: r }) : undefined}
                                previewConfig={item.design || formData.design}
                                onUpdateDesign={(updates) => handleMediaDesignUpdate(idx, updates)}
                                label=""
                            />
                        </div>
                    </div>
                ))}
                {(!formData.media || formData.media.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                        <ImageIcon className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
                        <p className="text-sm text-gray-400">No media added yet.</p>
                        <button onClick={addMedia} className="mt-2 text-brand-600 font-bold text-sm hover:underline">Add First Image</button>
                    </div>
                )}
            </div>

            <div className="hidden md:block pt-4 border-t dark:border-slate-700 mt-auto space-y-3 flex-shrink-0 sticky bottom-0 bg-gray-50 dark:bg-slate-800 pb-6 z-10 transition-all opacity-100">
                <button onClick={() => onSave({ ...formData, lastUpdated: new Date().toISOString() })} className="w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm md:text-base" style={{ backgroundColor: primaryColor }}>Save Post</button>
                <button onClick={onCancel} className="w-full py-4 bg-white dark:bg-slate-700 font-bold rounded-xl border dark:border-slate-600 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-sm md:text-base">Cancel</button>
            </div>
        </div>
    </div>

{/* MOBILE ACTION BAR (Floating Dock) */ }
<div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-gray-200 dark:border-slate-700 p-2 z-[60] flex gap-2 shadow-2xl rounded-2xl">
    <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 font-bold rounded-xl text-gray-600 dark:text-gray-300">Cancel</button>
    <button onClick={() => onSave({ ...formData, lastUpdated: new Date().toISOString() })} className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg" style={{ backgroundColor: primaryColor }}>Save</button>
</div>
        </div >
    );
};

const EventEditor = ({ item, onSave, onCancel, primaryColor }: { item?: EventItem, onSave: (i: EventItem) => void, onCancel: () => void, primaryColor: string }) => {
    const [formData, setFormData] = useState<EventItem>(item || { id: Date.now().toString(), title: '', titleAr: '', description: '', descriptionAr: '', date: '', time: '', location: '', locationAr: '', image: '', isCompleted: false, isOnline: false, type: 'Event' });

    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 h-auto md:h-full md:overflow-y-auto">
            <div className="flex-1 space-y-6 pb-20 md:pb-0">

                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Type className="absolute top-4 left-3 text-gray-400" size={16} />
                        <input className="w-full pl-9 pr-3 py-4 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-base" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Event Title (English)" />
                    </div>
                    <div className="relative">
                        <AlignLeft className="absolute top-4 right-3 text-gray-400" size={16} />
                        <input className="w-full pr-9 pl-3 py-4 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-right text-base" value={formData.titleAr} onChange={e => setFormData({ ...formData, titleAr: e.target.value })} placeholder="عنوان الفعالية (عربي)" dir="rtl" />
                    </div>
                </div>

                {/* Description Text Areas */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Event Description & General Info</label>
                    <textarea
                        className="w-full p-4 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 h-24 text-base"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed description in English..."
                    />
                    <textarea
                        className="w-full p-4 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 h-24 text-base text-right"
                        value={formData.descriptionAr}
                        onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })}
                        placeholder="وصف تفصيلي بالعربية..."
                        dir="rtl"
                    />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Calendar className="absolute top-4 left-3 text-gray-400" size={16} />
                        <input type="date" className="w-full pl-9 pr-3 py-4 border rounded-lg bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 text-base" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="relative">
                        <Clock className="absolute top-4 left-3 text-gray-400" size={16} />
                        <input type="time" className="w-full pl-9 pr-3 py-4 border rounded-lg bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 text-base" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                    </div>
                </div>

                {/* Location / Online Toggle */}
                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            {formData.isOnline ? <Wifi size={16} className="text-red-500" /> : <MapPin size={16} className="text-gray-500" />}
                            {formData.isOnline ? 'Online Event' : 'Physical Location'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={formData.isOnline || false} onChange={e => setFormData({ ...formData, isOnline: e.target.checked })} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                        </label>
                    </div>

                    {formData.isOnline ? (
                        <div className="relative animate-fade-in">
                            <Video className="absolute top-4 left-3 text-red-400" size={16} />
                            <input className="w-full pl-9 pr-3 py-4 border rounded-lg bg-white dark:bg-slate-800 text-base" value={formData.meetingLink || ''} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="Meeting Link (Zoom, Google Meet, etc.)" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                            <div className="relative">
                                <MapPin className="absolute top-4 left-3 text-gray-400" size={16} />
                                <input className="w-full pl-9 pr-3 py-4 border rounded-lg bg-white dark:bg-slate-800 text-base" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Location Name (EN)" />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute top-4 right-3 text-gray-400" size={16} />
                                <input className="w-full pr-9 pl-3 py-4 border rounded-lg bg-white dark:bg-slate-800 text-right text-base" value={formData.locationAr} onChange={e => setFormData({ ...formData, locationAr: e.target.value })} placeholder="اسم الموقع (عربي)" dir="rtl" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Extra Links */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase">External Links</label>
                    <div className="relative">
                        <Ticket className="absolute top-4 left-3 text-gray-400" size={16} />
                        <input className="w-full pl-9 pr-3 py-4 border rounded-lg bg-white dark:bg-slate-800 text-base" value={formData.registrationLink || ''} onChange={e => setFormData({ ...formData, registrationLink: e.target.value })} placeholder="Registration / Tickets URL" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Event Type</label>
                    <select
                        className="w-full p-4 border rounded-lg bg-white dark:bg-slate-800 text-base"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="Event">Event (General)</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Summit">Summit</option>
                        <option value="Competition">Competition</option>
                        <option value="Webinar">Webinar</option>
                        <option value="Hackathon">Hackathon</option>
                    </select>
                </div>
            </div>

            <div className="w-full md:w-80 space-y-4">
                <MediaUploader value={formData.image || ''} onChange={u => setFormData({ ...formData, image: u })} />
                <button onClick={() => onSave(formData)} className="w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ backgroundColor: primaryColor }}>Save Event</button>
                <button onClick={onCancel} className="w-full py-4 border rounded-xl font-bold dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            </div>
        </div>
    );
};

const MemberEditor = ({ item, onSave, onCancel, primaryColor }: { item?: Member, onSave: (i: Member) => void, onCancel: () => void, primaryColor: string }) => {
    const [formData, setFormData] = useState<Member>(item || { id: Date.now().toString(), name: '', role: '', roleAr: '', office: '', officeAr: '', category: 'member', term: '2024-2025' });
    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 h-auto md:h-full md:overflow-y-auto">
            <div className="flex-1 space-y-4 pb-20 md:pb-0">
                <input className="w-full p-4 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-base" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="p-4 border rounded-lg bg-white dark:bg-slate-800 text-base" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Role (EN)" />
                    <input className="p-4 border rounded-lg bg-white dark:bg-slate-800 text-right text-base" value={formData.roleAr} onChange={e => setFormData({ ...formData, roleAr: e.target.value })} placeholder="المسمى (عربي)" />
                </div>
            </div>
            <div className="w-full md:w-80 space-y-4">
                <MediaUploader value={formData.image || ''} onChange={u => setFormData({ ...formData, image: u })} label="Photo" />
                <button onClick={() => onSave(formData)} className="w-full py-4 text-white font-bold rounded-xl" style={{ backgroundColor: primaryColor }}>Save</button>
                <button onClick={onCancel} className="w-full py-4 border rounded-xl font-bold dark:text-white">Cancel</button>
            </div>
        </div>
    );
};

const AnalyticsModal = ({ item, onClose }: { item: NewsPost, onClose: () => void }) => {
    const engagementRate = item.views > 0 ? ((item.likes / item.views) * 100).toFixed(1) : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 md:p-8 relative shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Post Analytics</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    {item.image && <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover shadow-sm" />}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Published on {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                            <Eye size={20} />
                            <span className="text-xs font-bold uppercase">Total Views</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{item.views.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2 text-red-500">
                            <Heart size={20} />
                            <span className="text-xs font-bold uppercase">Likes</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{item.likes.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Engagement Rate</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{engagementRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className="bg-brand-600 h-full rounded-full" style={{ width: `${Math.min(100, parseFloat(engagementRate as string) * 5)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        Calculated based on views vs likes ratio.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN ADMIN DASHBOARD ---

interface AdminProps {
    lang: Language;
    onLogout: () => void;
    onGoHome: () => void;
    onRefresh?: () => Promise<void>;
    state: {
        events: EventItem[]; setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
        members: Member[]; setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
        news: NewsPost[]; setNews: React.Dispatch<React.SetStateAction<NewsPost[]>>;
        settings: AppSettings; setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
        timeline: TimelineItem[]; setTimeline: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
    }
}

const Admin: React.FC<AdminProps> = ({ lang, onLogout, onGoHome, onRefresh, state }) => {
    const isRtl = lang === 'ar';
    const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'events' | 'team' | 'settings' | 'themes'>('dashboard');
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [searchQuery, setSearchQuery] = useState('');

    // Analytics Modal State
    const [analyticsItem, setAnalyticsItem] = useState<NewsPost | null>(null);

    // ADVANCED SEARCH FILTERS STATE
    const [showFilters, setShowFilters] = useState(false);
    const [filterAuthor, setFilterAuthor] = useState('');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');
    const [filterTags, setFilterTags] = useState('');

    const handleCreate = () => {
        setEditingItem(null);
        setViewMode('create');
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setViewMode('edit');
    };

    const handleSave = async (item: any) => {
        try {
            if (activeTab === 'news') {
                if (viewMode === 'create') {
                    const created = await api.manage.createNews(item);
                    state.setNews([created, ...state.news]);
                } else {
                    const updated = await api.manage.updateNews(item.id, item);
                    state.setNews(state.news.map(i => i.id === item.id ? updated : i));
                }
            } else if (activeTab === 'events') {
                if (viewMode === 'create') {
                    const created = await api.manage.createEvent(item);
                    state.setEvents([created, ...state.events]);
                } else {
                    const updated = await api.manage.updateEvent(item.id, item);
                    state.setEvents(state.events.map(i => i.id === item.id ? updated : i));
                }
            } else if (activeTab === 'team') {
                if (viewMode === 'create') {
                    const created = await api.manage.createMember(item);
                    state.setMembers([created, ...state.members]);
                } else {
                    const updated = await api.manage.updateMember(item.id, item);
                    state.setMembers(state.members.map(i => i.id === item.id ? updated : i));
                }
            }
            setViewMode('list');
            if (onRefresh) await onRefresh();
        } catch (err: any) {
            alert('Failed to save: ' + (err.message || 'Unknown error'));
            console.error('Save error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            if (activeTab === 'news') {
                await api.manage.deleteNews(id);
                state.setNews(state.news.filter(i => i.id !== id));
            } else if (activeTab === 'events') {
                await api.manage.deleteEvent(id);
                state.setEvents(state.events.filter(i => i.id !== id));
            } else if (activeTab === 'team') {
                await api.manage.deleteMember(id);
                state.setMembers(state.members.filter(i => i.id !== id));
            }
            if (onRefresh) await onRefresh();
        } catch (err: any) {
            alert('Failed to delete: ' + (err.message || 'Unknown error'));
            console.error('Delete error:', err);
        }
    };

    const getFilteredData = () => {
        let data: any[] = activeTab === 'news' ? state.news : activeTab === 'events' ? state.events : state.members;

        // Basic Search
        if (searchQuery) data = data.filter(item => (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

        // Advanced Filters (News Only)
        if (activeTab === 'news') {
            if (filterAuthor) data = data.filter(i => i.author.toLowerCase().includes(filterAuthor.toLowerCase()));
            if (filterDateStart) data = data.filter(i => new Date(i.date) >= new Date(filterDateStart));
            if (filterDateEnd) data = data.filter(i => new Date(i.date) <= new Date(filterDateEnd));
            if (filterTags) data = data.filter(i => i.tags?.some((t: string) => t.toLowerCase().includes(filterTags.toLowerCase())));
        }

        return data;
    };

    const filteredData = getFilteredData();
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const renderEditor = () => {
        const props = { onCancel: () => setViewMode('list'), primaryColor: state.settings.primaryColor };
        if (activeTab === 'news') return <NewsEditor item={editingItem} onSave={handleSave} {...props} />;
        if (activeTab === 'events') return <EventEditor item={editingItem} onSave={handleSave} {...props} />;
        if (activeTab === 'team') return <MemberEditor item={editingItem} onSave={handleSave} {...props} />;
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

            {/* Analytics Overlay */}
            {analyticsItem && <AnalyticsModal item={analyticsItem} onClose={() => setAnalyticsItem(null)} />}

            <aside className={`fixed top-0 h-full z-20 w-20 md:w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out transform ${isRtl ? 'right-0 border-l' : 'left-0 border-r'}`}>
                <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b dark:border-slate-800 h-20">
                    <LayoutDashboard className="text-brand-600" size={28} />
                    <span className="font-black text-xl hidden md:block dark:text-white">Admin</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {[{ id: 'dashboard', icon: LayoutDashboard }, { id: 'news', icon: Newspaper }, { id: 'events', icon: Calendar }, { id: 'team', icon: Users }, { id: 'themes', icon: Palette }, { id: 'settings', icon: SettingsIcon }].map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id as any); setViewMode('list'); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-brand-50 dark:bg-slate-800 text-brand-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                            <item.icon size={20} /><span className="hidden md:block text-sm capitalize">{item.id}</span>
                        </button>
                    ))}

                    {/* WEBSITE BUTTON */}
                    <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-800">
                        <button onClick={onGoHome} className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-all">
                            <Globe size={20} />
                            <span className="hidden md:block text-sm font-bold">{isRtl ? 'تصفح الموقع' : 'Visit Website'}</span>
                        </button>
                    </div>
                </nav>
                <div className="p-4 border-t dark:border-slate-800"><button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 font-bold"><LogOut size={20} /><span className="hidden md:block text-sm">Logout</span></button></div>
            </aside>

            <main className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${isRtl ? 'mr-20 md:mr-64' : 'ml-20 md:ml-64'}`}>
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-10 px-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{activeTab}</h2>
                </header>
                <div className="p-6 md:p-8">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><div className="flex items-center gap-4"><Newspaper size={24} className="text-blue-600" /><div><p className="text-sm font-bold text-gray-400">Total Posts</p><h3 className="text-2xl font-black dark:text-white">{state.news.length}</h3></div></div></div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><div className="flex items-center gap-4"><Calendar size={24} className="text-purple-600" /><div><p className="text-sm font-bold text-gray-400">Events</p><h3 className="text-2xl font-black dark:text-white">{state.events.length}</h3></div></div></div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><div className="flex items-center gap-4"><Users size={24} className="text-amber-600" /><div><p className="text-sm font-bold text-gray-400">Members</p><h3 className="text-2xl font-black dark:text-white">{state.members.length}</h3></div></div></div>
                        </div>
                    )}
                    {activeTab === 'themes' && <ThemeManager settings={state.settings} onUpdateSettings={async (s: AppSettings) => { state.setSettings(s); try { await api.manage.updateSettings(s); if (onRefresh) await onRefresh(); } catch (e) { console.error('Theme save error:', e); } }} />}
                    {activeTab === 'settings' && <SettingsEditor settings={state.settings} onSave={async (s: AppSettings) => { state.setSettings(s); try { await api.manage.updateSettings(s); if (onRefresh) await onRefresh(); } catch (e: any) { alert('Settings save failed: ' + e.message); } }} timeline={state.timeline} onSaveTimeline={async (t: TimelineItem[]) => { state.setTimeline(t); try { for (const item of t) { if (item.id && !state.timeline.find(old => old.id === item.id)) { await api.manage.createTimeline(item); } } if (onRefresh) await onRefresh(); } catch (e: any) { alert('Timeline save failed: ' + e.message); } }} />}
                    {['news', 'events', 'team'].includes(activeTab) && (
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-auto animate-fade-in">
                            {viewMode === 'list' ? (
                                <>
                                    <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800">
                                        <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
                                            {/* Search Bar */}
                                            <div className="relative w-full md:w-96 order-1 md:order-1">
                                                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                                                <input
                                                    type="text"
                                                    placeholder={isRtl ? "بحث..." : "Search..."}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 md:py-2 border rounded-xl bg-gray-50 dark:bg-slate-800 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                                                />
                                            </div>

                                            {/* Actions Buttons */}
                                            <div className="flex gap-2 order-2 md:order-2 w-full md:w-auto">
                                                {activeTab === 'news' && (
                                                    <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none justify-center px-3 py-2 border rounded-xl flex items-center gap-1.5 transition-all text-xs md:text-sm font-bold ${showFilters ? 'bg-brand-50 text-brand-600 border-brand-200' : 'bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 hover:bg-gray-50'}`}>
                                                        <Filter size={16} />
                                                        {isRtl ? 'تصفية' : 'Filters'}
                                                        {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                )}
                                                <button onClick={handleCreate} className="flex-1 md:flex-none justify-center px-4 py-2 bg-brand-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-xs md:text-sm">
                                                    <Plus size={16} />
                                                    {isRtl ? 'جديد' : 'Add'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* ADVANCED FILTERS PANEL */}
                                        {showFilters && activeTab === 'news' && (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 animate-slide-up">
                                                <input placeholder="Filter by Author" className="p-2 rounded border dark:bg-slate-800 dark:border-slate-600" value={filterAuthor} onChange={e => setFilterAuthor(e.target.value)} />
                                                <input placeholder="Tag (e.g. Events)" className="p-2 rounded border dark:bg-slate-800 dark:border-slate-600" value={filterTags} onChange={e => setFilterTags(e.target.value)} />
                                                <input type="date" className="p-2 rounded border dark:bg-slate-800 dark:border-slate-600" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
                                                <input type="date" className="p-2 rounded border dark:bg-slate-800 dark:border-slate-600" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className={`p-4 md:p-6 ${isRtl ? 'text-right' : 'text-left'}`}>Item</th>
                                                    <th className={`p-4 md:p-6 ${isRtl ? 'text-right' : 'text-left'}`}>Info</th>
                                                    {activeTab === 'news' && <th className={`p-4 md:p-6 ${isRtl ? 'text-right' : 'text-left'}`}>Stats</th>}
                                                    <th className={`p-4 md:p-6 ${isRtl ? 'text-left' : 'text-right'}`}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                                {paginatedData.map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                        <td className="p-4 md:p-6"><div className="flex items-center gap-4">{item.image && <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />}<span className="font-bold text-sm dark:text-white line-clamp-1">{item.title || item.name}</span></div></td>
                                                        <td className="p-4 md:p-6"><span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs font-bold">{item.status || (item.isCompleted ? 'Completed' : 'Active') || item.category}</span></td>
                                                        {activeTab === 'news' && (
                                                            <td className="p-4 md:p-6">
                                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-bold">
                                                                    <Eye size={14} /> {item.views || 0}
                                                                </div>
                                                            </td>
                                                        )}
                                                        <td className={`p-4 md:p-6 ${isRtl ? 'text-left' : 'text-right'}`}>
                                                            <div className={`flex items-center gap-2 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                                                                {activeTab === 'news' && (
                                                                    <button onClick={() => setAnalyticsItem(item)} className="p-2 rounded-lg bg-white/50 border border-gray-200/60 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm text-gray-500" title="Analytics"><BarChart2 size={16} /></button>
                                                                )}
                                                                <button onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-white/50 border border-gray-200/60 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 transition-all shadow-sm text-gray-500"><Edit size={16} /></button>
                                                                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-white/50 border border-gray-200/60 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm text-gray-500"><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <PaginationControls current={currentPage} total={Math.ceil(filteredData.length / itemsPerPage)} onPageChange={setCurrentPage} />
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-full">
                                    <div className="p-4 border-b dark:border-slate-800 flex items-center gap-4">
                                        <button onClick={() => setViewMode('list')} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300">
                                            {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                                        </button>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewMode === 'create' ? (isRtl ? 'إضافة جديد' : 'Create New') : (isRtl ? 'تعديل العنصر' : 'Edit Item')}</h3>
                                    </div>
                                    <div className="flex-1">{renderEditor()}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;