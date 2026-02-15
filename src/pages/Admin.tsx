import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, Trash2, LogOut, Sparkles, Loader2, Calendar, Users, Newspaper, LayoutDashboard, Settings as SettingsIcon, Save, X, Edit, Eye, Image as ImageIcon, FileText, Check, Search, Video, Mic, Paperclip, MonitorPlay, Upload, Link as LinkIcon, Smartphone, Square, RectangleHorizontal, RectangleVertical, Share2, Filter, ChevronLeft, ChevronRight, Wifi, MapPin, Globe, Tag, ExternalLink, Palette, Type, Layout, AlignLeft, AlignCenter, AlignRight, Sliders, ZoomIn, Move, Maximize, PlayCircle, Clock, Send, Sun, Contrast, Droplet } from 'lucide-react';
import { Language, EventItem, Member, NewsPost, AppSettings, MemberRole, PostDesignConfig, AppState } from '../types';
import { LABELS } from '../constants';
import { generateContentHelper } from '../services/geminiService';

// --- HELPER FUNCTIONS ---

const getAspectClass = (r?: string) => {
    switch(r) {
        case 'portrait': return 'aspect-[4/5]';
        case 'landscape': return 'aspect-video';
        default: return 'aspect-square';
    }
};

// --- HELPER COMPONENTS ---

const PaginationControls = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
    if (total <= 1) return null;
    return (
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 dark:border-slate-700">
            <button onClick={() => onPageChange(current - 1)} disabled={current === 1} className="p-2 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-gray-600 dark:text-gray-300"><ChevronLeft size={16}/></button>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Page {current} of {total}</span>
            <button onClick={() => onPageChange(current + 1)} disabled={current === total} className="p-2 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-gray-600 dark:text-gray-300"><ChevronRight size={16}/></button>
        </div>
    );
};

// --- MEDIA UPLOADER COMPONENT ---
interface MediaUploaderProps {
    value: string;
    mediaType?: 'image' | 'video';
    onChange: (url: string) => void;
    onMediaTypeChange?: (type: 'image' | 'video') => void;
    aspectRatio?: 'square' | 'portrait' | 'landscape';
    onAspectRatioChange?: (ratio: 'square' | 'portrait' | 'landscape') => void;
    label?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ value, mediaType = 'image', onChange, onMediaTypeChange, aspectRatio = 'square', onAspectRatioChange, label = "Media" }) => {
    const [tab, setTab] = useState<'upload' | 'link'>('upload');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit.');
                return;
            }
            setError('');
            if (file.type.startsWith('video/')) {
                onMediaTypeChange?.('video');
            } else {
                onMediaTypeChange?.('image');
            }
            const reader = new FileReader();
            reader.onloadend = () => onChange(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{label}</label>
                {value && (
                    <button onClick={() => onChange('')} className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1">
                        <Trash2 size={12}/> Remove
                    </button>
                )}
            </div>

            {!value ? (
                <div className={`bg-gray-50 dark:bg-slate-800 border-2 border-dashed ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-slate-700'} rounded-xl p-4 transition-all hover:border-brand-400`}>
                    <div className="flex gap-2 mb-4 bg-white dark:bg-slate-900 p-1 rounded-lg w-fit mx-auto border dark:border-slate-700">
                        <button onClick={() => { setTab('upload'); setError(''); }} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${tab === 'upload' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}>Upload</button>
                        <button onClick={() => { setTab('link'); setError(''); }} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${tab === 'link' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}>Link</button>
                    </div>
                    {tab === 'upload' ? (
                        <div className="text-center py-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-500"><Upload size={20}/></div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Click to upload</p>
                            <p className="text-xs text-gray-400 mt-1">Images or Videos (Max 5MB)</p>
                            {error && <p className="text-xs text-red-500 font-bold mt-2">{error}</p>}
                            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <input type="text" placeholder="Paste URL (https://...)" className="w-full p-2 text-sm border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900" onBlur={(e) => onChange(e.target.value)} />
                            <p className="text-[10px] text-gray-400 text-center">Supports images & videos</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-100 dark:bg-slate-950 rounded-xl p-3 border border-gray-200 dark:border-slate-700">
                    <div className={`relative w-full bg-black rounded-lg overflow-hidden mx-auto shadow-inner ${getAspectClass(aspectRatio)}`}>
                        {mediaType === 'video' ? <video src={value} className="w-full h-full object-cover" controls playsInline /> : <img src={value} className="w-full h-full object-cover" alt="Preview" />}
                    </div>
                    {onAspectRatioChange && (
                        <div className="flex justify-center gap-2 mt-3">
                            <button onClick={() => onAspectRatioChange('square')} className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${aspectRatio === 'square' ? 'bg-white shadow text-black' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800'}`}><Square size={14}/> 1:1</button>
                            <button onClick={() => onAspectRatioChange('portrait')} className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${aspectRatio === 'portrait' ? 'bg-white shadow text-black' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800'}`}><RectangleVertical size={14}/> 4:5</button>
                            <button onClick={() => onAspectRatioChange('landscape')} className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${aspectRatio === 'landscape' ? 'bg-white shadow text-black' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800'}`}><RectangleHorizontal size={14}/> 16:9</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- SETTINGS COMPONENT ---
const SettingsEditor = ({ settings, onSave }: { settings: AppSettings, onSave: (s: AppSettings) => void }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const handleChange = (key: keyof AppSettings, value: string) => setLocalSettings({ ...localSettings, [key]: value });
    const handleSave = () => { onSave(localSettings); alert('Settings Saved!'); };
    const updateColor = (key: 'primaryColor' | 'secondaryColor', value: string) => {
        handleChange(key, value);
        if(key === 'primaryColor') document.documentElement.style.setProperty('--primary-color', value);
        if(key === 'secondaryColor') document.documentElement.style.setProperty('--secondary-color', value);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12 animate-fade-in">
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b dark:border-slate-700 pb-2"><Palette/> Theme Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['primaryColor', 'secondaryColor'].map(key => (
                         <div key={key}>
                            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{key}</label>
                            <div className="flex items-center gap-4">
                                <input type="color" value={localSettings[key as keyof AppSettings] as string} onChange={(e) => updateColor(key as any, e.target.value)} className="w-16 h-16 rounded-xl border-4 cursor-pointer"/>
                                <input type="text" value={localSettings[key as keyof AppSettings] as string} onChange={(e) => updateColor(key as any, e.target.value)} className="w-full p-3 border rounded-xl font-mono text-sm bg-white dark:bg-slate-700 dark:text-white"/>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b dark:border-slate-700 pb-2"><Layout/> General Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['siteNameEn', 'siteNameAr', 'logoUrl'].map(key => (
                        <div key={key}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{key}</label>
                            <input className="w-full p-3 border rounded-xl bg-white dark:bg-slate-700 dark:text-white" value={localSettings[key as keyof AppSettings] as string} onChange={(e) => handleChange(key as any, e.target.value)} />
                        </div>
                    ))}
                </div>
            </section>
            <div className="pt-6 border-t dark:border-slate-700">
                <button onClick={handleSave} className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    <Save size={20} /> Save All Changes
                </button>
            </div>
        </div>
    );
};

// --- NEWS EDITOR ---
const NewsEditor = ({ item, onSave, onCancel, primaryColor }: { item?: NewsPost, onSave: (i: NewsPost) => void, onCancel: () => void, primaryColor: string }) => {
    const [formData, setFormData] = useState<NewsPost>(item || {
        id: Date.now().toString(), title: '', content: '', date: new Date().toISOString().split('T')[0], author: 'Admin', tags: ['News'], image: '', mediaType: 'image', aspectRatio: 'square',
        design: { fontStyle: 'modern', textColor: '#ffffff', textAlignment: 'center', overlayText: '', overlayOpacity: 30, imagePosition: { x: 50, y: 50, scale: 1 }, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 } },
        likes: 0, views: 0, status: 'published', datePublished: new Date().toLocaleString(), scheduledDate: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [editorTab, setEditorTab] = useState<'content' | 'design'>('content');

    useEffect(() => {
        const defDesign: PostDesignConfig = { fontStyle: 'modern', textColor: '#ffffff', textAlignment: 'center', overlayText: '', overlayOpacity: 30, imagePosition: { x: 50, y: 50, scale: 1 }, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 } };
        if (!formData.design) setFormData(p => ({ ...p, design: defDesign }));
        else setFormData(p => ({ ...p, design: { ...defDesign, ...p.design } }));
        if (!formData.status) setFormData(p => ({ ...p, status: 'published' }));
    }, []);

    const handleAI = async () => {
        if (!formData.title) return alert('Enter Title');
        setIsGenerating(true);
        const text = await generateContentHelper(`Write a news post about: ${formData.title}`, 'en');
        setFormData(p => ({ ...p, content: text }));
        setIsGenerating(false);
    };

    const addTag = () => { if(tagInput && !formData.tags.includes(tagInput)) { setFormData(p => ({...p, tags: [...p.tags, tagInput]})); setTagInput(''); }};

    return (
        <div className="flex flex-col md:flex-row w-full h-full bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
                    <button onClick={() => setEditorTab('content')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${editorTab === 'content' ? 'text-brand-600 border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'text-gray-400 border-transparent'}`}><FileText size={18}/> Details</button>
                    <button onClick={() => setEditorTab('design')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${editorTab === 'design' ? 'text-brand-600 border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'text-gray-400 border-transparent'}`}><Sparkles size={18}/> Design</button>
                </div>
                <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
                    {editorTab === 'content' ? (
                        <div className="space-y-6">
                            {/* Inputs */}
                            <input className="w-full p-4 border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-bold text-xl" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Post Title" />
                            <textarea className="w-full p-4 border dark:border-slate-700 rounded-xl h-48 bg-white dark:bg-slate-800 text-sm" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Content..." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="p-3 border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="Author" />
                                <select className="p-3 border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}><option value="published">Published</option><option value="draft">Draft</option></select>
                            </div>
                            <div className="flex gap-2"><input className="flex-grow p-3 border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add Tag" onKeyDown={e => e.key === 'Enter' && addTag()}/><button onClick={addTag} className="px-4 bg-gray-100 dark:bg-slate-700 rounded-xl"><Plus/></button></div>
                            <div className="flex flex-wrap gap-2">{formData.tags.map(t => <span key={t} className="px-2 py-1 bg-brand-100 text-brand-700 rounded text-xs">{t}</span>)}</div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Design Controls Simplified for brevity */}
                            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-4">
                                <label className="text-xs font-bold text-gray-500">Overlay Text</label>
                                <input className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700" value={formData.design?.overlayText} onChange={e => setFormData({...formData, design: {...formData.design!, overlayText: e.target.value}})} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="range" min="1" max="2" step="0.1" value={formData.design?.imagePosition?.scale} onChange={e => setFormData({...formData, design: {...formData.design!, imagePosition: {...formData.design?.imagePosition!, scale: parseFloat(e.target.value)}}})} />
                                    <input type="color" value={formData.design?.textColor} onChange={e => setFormData({...formData, design: {...formData.design!, textColor: e.target.value}})} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full md:w-[400px] bg-gray-50 dark:bg-slate-800 p-6 border-l border-gray-100 dark:border-slate-700 flex flex-col h-full md:h-auto overflow-y-auto">
                <MediaUploader value={formData.image || ''} mediaType={formData.mediaType} onChange={u => setFormData({...formData, image: u})} aspectRatio={formData.aspectRatio} onAspectRatioChange={r => setFormData({...formData, aspectRatio: r})} />
                <div className="mt-auto pt-6 space-y-3">
                    <button onClick={() => onSave(formData)} className="w-full py-3 text-white font-bold rounded-xl" style={{ backgroundColor: primaryColor }}>Save</button>
                    <button onClick={onCancel} className="w-full py-3 bg-white dark:bg-slate-700 font-bold rounded-xl border dark:border-slate-600">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const EventEditor = ({ item, onSave, onCancel, primaryColor }: { item?: EventItem, onSave: (i: EventItem) => void, onCancel: () => void, primaryColor: string }) => {
    const [formData, setFormData] = useState<EventItem>(item || { id: Date.now().toString(), title: '', titleAr: '', description: '', descriptionAr: '', date: '', time: '', location: '', locationAr: '', image: '', isCompleted: false, isOnline: false, type: 'Event' });
    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 h-full overflow-y-auto">
            <div className="flex-1 space-y-4">
                <input className="w-full p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title (EN)" />
                <input className="w-full p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-right" value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} placeholder="العنوان (عربي)" />
                <div className="grid grid-cols-2 gap-4"><input type="date" className="p-3 border rounded-lg bg-white dark:bg-slate-800 dark:text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /><input type="time" className="p-3 border rounded-lg bg-white dark:bg-slate-800 dark:text-white" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
            </div>
            <div className="w-full md:w-80 space-y-4">
                <MediaUploader value={formData.image || ''} onChange={u => setFormData({...formData, image: u})} />
                <button onClick={() => onSave(formData)} className="w-full py-3 text-white font-bold rounded-xl" style={{ backgroundColor: primaryColor }}>Save</button>
                <button onClick={onCancel} className="w-full py-3 border rounded-xl font-bold dark:text-white">Cancel</button>
            </div>
        </div>
    );
};

const MemberEditor = ({ item, onSave, onCancel, primaryColor }: { item?: Member, onSave: (i: Member) => void, onCancel: () => void, primaryColor: string }) => {
    const [formData, setFormData] = useState<Member>(item || { id: Date.now().toString(), name: '', role: '', roleAr: '', office: '', officeAr: '', category: 'member', term: '2024-2025' });
    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 h-full overflow-y-auto">
            <div className="flex-1 space-y-4">
                <input className="w-full p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" />
                <div className="grid grid-cols-2 gap-4">
                    <input className="p-3 border rounded-lg bg-white dark:bg-slate-800" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Role (EN)" />
                    <input className="p-3 border rounded-lg bg-white dark:bg-slate-800 text-right" value={formData.roleAr} onChange={e => setFormData({...formData, roleAr: e.target.value})} placeholder="المسمى (عربي)" />
                </div>
            </div>
            <div className="w-full md:w-80 space-y-4">
                <MediaUploader value={formData.image || ''} onChange={u => setFormData({...formData, image: u})} label="Photo" />
                <button onClick={() => onSave(formData)} className="w-full py-3 text-white font-bold rounded-xl" style={{ backgroundColor: primaryColor }}>Save</button>
                <button onClick={onCancel} className="w-full py-3 border rounded-xl font-bold dark:text-white">Cancel</button>
            </div>
        </div>
    );
};

// --- MAIN ADMIN DASHBOARD ---

interface AdminProps {
  lang: Language;
  onLogout: () => void;
  state: {
      events: EventItem[]; setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
      members: Member[]; setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
      news: NewsPost[]; setNews: React.Dispatch<React.SetStateAction<NewsPost[]>>;
      settings: AppSettings; setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  }
}

const Admin: React.FC<AdminProps> = ({ lang, onLogout, state }) => {
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'events' | 'team' | 'settings'>('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
      setEditingItem(null);
      setViewMode('create');
  };

  const handleEdit = (item: any) => {
      setEditingItem(item);
      setViewMode('edit');
  };

  const handleSave = (item: any) => {
      if (activeTab === 'news') { viewMode === 'create' ? state.setNews([item, ...state.news]) : state.setNews(state.news.map(i => i.id === item.id ? item : i)); } 
      else if (activeTab === 'events') { viewMode === 'create' ? state.setEvents([item, ...state.events]) : state.setEvents(state.events.map(i => i.id === item.id ? item : i)); } 
      else if (activeTab === 'team') { viewMode === 'create' ? state.setMembers([item, ...state.members]) : state.setMembers(state.members.map(i => i.id === item.id ? item : i)); }
      setViewMode('list');
  };

  const handleDelete = (id: string) => {
      if(!window.confirm('Delete this item?')) return;
      if (activeTab === 'news') state.setNews(state.news.filter(i => i.id !== id));
      else if (activeTab === 'events') state.setEvents(state.events.filter(i => i.id !== id));
      else if (activeTab === 'team') state.setMembers(state.members.filter(i => i.id !== id));
  };

  const getFilteredData = () => {
      let data: any[] = activeTab === 'news' ? state.news : activeTab === 'events' ? state.events : state.members;
      if (searchQuery) data = data.filter(item => (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-300">
        <aside className={`fixed top-0 h-full z-20 w-20 md:w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'}`}>
            <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b dark:border-slate-800 h-20">
                <LayoutDashboard className="text-brand-600" size={28} />
                <span className="font-black text-xl hidden md:block dark:text-white">Admin</span>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {[{ id: 'dashboard', icon: LayoutDashboard }, { id: 'news', icon: Newspaper }, { id: 'events', icon: Calendar }, { id: 'team', icon: Users }, { id: 'settings', icon: SettingsIcon }].map(item => (
                    <button key={item.id} onClick={() => { setActiveTab(item.id as any); setViewMode('list'); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-brand-50 dark:bg-slate-800 text-brand-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        <item.icon size={20} /><span className="hidden md:block text-sm capitalize">{item.id}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t dark:border-slate-800"><button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 font-bold"><LogOut size={20} /><span className="hidden md:block text-sm">Logout</span></button></div>
        </aside>

        <main className={`flex-1 min-h-screen transition-all duration-300 ${isRtl ? 'mr-20 md:mr-64' : 'ml-20 md:ml-64'}`}>
            <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-10 px-8 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{activeTab}</h2>
            </header>
            <div className="p-6 md:p-8">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><div className="flex items-center gap-4"><Newspaper size={24} className="text-blue-600"/><div><p className="text-sm font-bold text-gray-400">Total Posts</p><h3 className="text-2xl font-black dark:text-white">{state.news.length}</h3></div></div></div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><div className="flex items-center gap-4"><Calendar size={24} className="text-purple-600"/><div><p className="text-sm font-bold text-gray-400">Events</p><h3 className="text-2xl font-black dark:text-white">{state.events.length}</h3></div></div></div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"><div className="flex items-center gap-4"><Users size={24} className="text-amber-600"/><div><p className="text-sm font-bold text-gray-400">Members</p><h3 className="text-2xl font-black dark:text-white">{state.members.length}</h3></div></div></div>
                    </div>
                )}
                {activeTab === 'settings' && <SettingsEditor settings={state.settings} onSave={state.setSettings} />}
                {['news', 'events', 'team'].includes(activeTab) && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 min-h-[500px] flex flex-col overflow-hidden">
                        {viewMode === 'list' ? (
                            <>
                                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between gap-4">
                                    <div className="relative w-full md:w-96">
                                        <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-xl bg-gray-50 dark:bg-slate-800 dark:border-slate-700`}
                                        />
                                    </div>
                                    <button onClick={handleCreate} className="px-6 py-2 bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2"><Plus size={18}/> Add</button>
                                </div>
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                                            <tr>
                                                <th className={`p-4 md:p-6 ${isRtl ? 'text-right' : 'text-left'}`}>Item</th>
                                                <th className={`p-4 md:p-6 ${isRtl ? 'text-right' : 'text-left'}`}>Info</th>
                                                <th className={`p-4 md:p-6 ${isRtl ? 'text-left' : 'text-right'}`}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                            {paginatedData.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                    <td className="p-4 md:p-6"><div className="flex items-center gap-4">{item.image && <img src={item.image} className="w-10 h-10 rounded-lg object-cover"/>}<span className="font-bold text-sm dark:text-white line-clamp-1">{item.title || item.name}</span></div></td>
                                                    <td className="p-4 md:p-6"><span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs font-bold">{item.status || (item.isCompleted ? 'Completed' : 'Active') || item.category}</span></td>
                                                    <td className={`p-4 md:p-6 ${isRtl ? 'text-left' : 'text-right'}`}>
                                                        <div className={`flex items-center gap-2 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                                                            <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-brand-600"><Edit size={18}/></button>
                                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
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
                            <div className="flex-1 flex flex-col h-full">
                                <div className="p-4 border-b dark:border-slate-800 flex items-center gap-4"><button onClick={() => setViewMode('list')}><ChevronLeft/></button><h3 className="font-bold dark:text-white">{viewMode === 'create' ? 'New' : 'Edit'}</h3></div>
                                <div className="flex-1 overflow-hidden">{renderEditor()}</div>
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