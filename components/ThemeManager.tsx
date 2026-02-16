import React, { useState, useEffect } from 'react';
import { AppSettings, BackgroundPattern, ThemePreset } from '../types';
import { PRESET_THEMES } from '../utils/themes';
import {
    Check, Palette, Grid, Layers, Zap, CheckCircle2, RotateCcw,
    Undo2, Redo2, Sliders, Type, MousePointerClick,
    BoxSelect, Search, Minus
} from 'lucide-react';
import { INITIAL_STATE } from '../constants';

interface ThemeManagerProps {
    settings: AppSettings;
    onUpdateSettings: (newSettings: AppSettings) => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ settings, onUpdateSettings }) => {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<'presets' | 'style' | 'features'>('presets');
    const [searchQuery, setSearchQuery] = useState('');

    // History Management
    const [history, setHistory] = useState<AppSettings[]>([settings]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isInternalUpdate, setIsInternalUpdate] = useState(false);

    // Sync external settings changes to history if not internal configuration
    useEffect(() => {
        if (!isInternalUpdate) {
            // only updates if deep different to avoid loops
            if (JSON.stringify(history[historyIndex]) !== JSON.stringify(settings)) {
                const newHistory = [...history.slice(0, historyIndex + 1), settings];
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
        }
        setIsInternalUpdate(false);
    }, [settings]);

    const updateWithHistory = (newSettings: AppSettings) => {
        setIsInternalUpdate(true);
        const newHistory = [...history.slice(0, historyIndex + 1), newSettings];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        onUpdateSettings(newSettings);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setIsInternalUpdate(true);
            const prev = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            onUpdateSettings(prev);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setIsInternalUpdate(true);
            const next = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            onUpdateSettings(next);
        }
    };

    const resetDefaults = () => {
        if (window.confirm('Reset all theme settings to default?')) {
            updateWithHistory(INITIAL_STATE.settings);
        }
    };

    const applyPreset = (theme: ThemePreset) => {
        updateWithHistory({
            ...settings,
            primaryColor: theme.primaryColor,
            secondaryColor: theme.secondaryColor,
            backgroundPattern: theme.pattern
        });
    };

    // --- DATA ---
    const patterns: BackgroundPattern[] = [
        'none', 'circles', 'cubes', 'dots', 'lines', 'waves',
        'grid', 'hexagons', 'circuit', 'topography', 'texture',
        'gradient-radial', 'gradient-linear', 'leaf', 'diamond', 'zigzag'
    ];

    const filteredPresets = PRESET_THEMES.filter(
        t => t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- RENDER HELPERS ---
    const renderFeatureControl = (label: string, icon: React.ReactNode, content: React.ReactNode) => (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 space-y-4 animate-fade-in shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="p-2 bg-brand-50 dark:bg-slate-800 rounded-lg text-brand-600 dark:text-brand-400">
                    {icon}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">{label}</h4>
            </div>
            {content}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden rounded-3xl pb-20 md:pb-0">
            {/* TOOLBAR */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-600 rounded-xl text-white shadow-lg shadow-brand-500/30">
                        <Palette size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Theme Studio</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Professional Suite</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl">
                    <button onClick={() => setActiveTab('presets')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'presets' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-md' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}><Zap size={16} /> Presets</button>
                    <button onClick={() => setActiveTab('style')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'style' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-md' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}><Layers size={16} /> Style</button>
                    <button onClick={() => setActiveTab('features')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'features' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-md' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}><Sliders size={16} /> Features</button>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={undo} disabled={historyIndex <= 0} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors" title="Undo"><Undo2 size={20} /></button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors" title="Redo"><Redo2 size={20} /></button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-slate-700 mx-2"></div>
                    <button onClick={resetDefaults} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Reset to Defaults"><RotateCcw size={20} /></button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">

                {/* PRESETS TAB */}
                {activeTab === 'presets' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-slate-700">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="p-3 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-500/30">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Quick Start</h3>
                                    <p className="text-sm text-blue-800 dark:text-blue-200 opacity-80">
                                        Select from 256+ professionally curated themes to instantly transform your portal.
                                    </p>
                                </div>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/50 bg-white focus:bg-white transition-all text-sm outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
                                    placeholder="Keywords (e.g. Dark, Blue, Corporate)..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {filteredPresets.map((theme) => {
                                const isActive = settings.primaryColor === theme.primaryColor && settings.secondaryColor === theme.secondaryColor;
                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => applyPreset(theme)}
                                        className={`group relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${isActive ? 'ring-4 ring-brand-500 shadow-2xl scale-105 z-10' : 'bg-gray-100 dark:bg-slate-800 hover:ring-2 hover:ring-gray-200 dark:hover:ring-slate-700'}`}
                                    >
                                        <div className="absolute inset-0 flex flex-col">
                                            <div className="flex-1 w-full" style={{ backgroundColor: theme.primaryColor }}></div>
                                            <div className="h-1/3 w-full relative" style={{ backgroundColor: theme.secondaryColor }}>
                                                {/* Mini Pattern Preview */}
                                                <div className="absolute inset-0 opacity-20 bg-black/10"></div>
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12 text-left">
                                            <p className="text-white font-bold text-sm line-clamp-1">{theme.name}</p>
                                            <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider opacity-80">{theme.pattern}</p>
                                        </div>
                                        {isActive && <div className="absolute top-3 right-3 bg-white text-brand-600 p-1.5 rounded-full shadow-lg z-20"><Check size={14} strokeWidth={4} /></div>}
                                    </button>
                                );
                            })}
                        </div>

                        {filteredPresets.length === 0 && (
                            <div className="text-center py-20 text-gray-400">
                                <p>No themes found matching "{searchQuery}"</p>
                                <button onClick={() => setSearchQuery('')} className="text-brand-600 font-bold hover:underline mt-2">Clear Search</button>
                            </div>
                        )}
                    </div>
                )}

                {/* STYLE TAB */}
                {activeTab === 'style' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
                        {/* Colors */}
                        <div className="xl:col-span-1 space-y-6">
                            {renderFeatureControl("Brand Identity", <Palette size={20} />, (
                                <div className="space-y-6">
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Primary Color</label>
                                        <div className="flex gap-3 items-center">
                                            <div className="relative">
                                                <input type="color" value={settings.primaryColor} onChange={e => updateWithHistory({ ...settings, primaryColor: e.target.value })} className="h-14 w-14 rounded-xl cursor-pointer border-0 p-0 overflow-hidden" style={{ visibility: 'hidden' }} id="primaryColorPicker" />
                                                <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none" style={{ backgroundColor: settings.primaryColor }} onClick={() => document.getElementById('primaryColorPicker')?.click()}></div>
                                            </div>
                                            <input type="text" value={settings.primaryColor} onChange={e => updateWithHistory({ ...settings, primaryColor: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm uppercase tracking-wider shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Secondary Color</label>
                                        <div className="flex gap-3 items-center">
                                            <div className="relative">
                                                <input type="color" value={settings.secondaryColor} onChange={e => updateWithHistory({ ...settings, secondaryColor: e.target.value })} className="h-14 w-14 rounded-xl cursor-pointer border-0 p-0 overflow-hidden" style={{ visibility: 'hidden' }} id="secondaryColorPicker" />
                                                <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none" style={{ backgroundColor: settings.secondaryColor }} onClick={() => document.getElementById('secondaryColorPicker')?.click()}></div>
                                            </div>
                                            <input type="text" value={settings.secondaryColor} onChange={e => updateWithHistory({ ...settings, secondaryColor: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm uppercase tracking-wider shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-center shadow-sm">
                                        <div className="flex justify-center -space-x-4 mb-4">
                                            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 shadow-md transform -translate-x-2" style={{ backgroundColor: settings.primaryColor }}></div>
                                            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 shadow-md transform translate-x-2" style={{ backgroundColor: settings.secondaryColor }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Active Combo</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Patterns */}
                        <div className="xl:col-span-2">
                            {renderFeatureControl("Background Pattern", <Layers size={20} />, (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {patterns.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => updateWithHistory({ ...settings, backgroundPattern: p })}
                                            className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 overflow-hidden group ${settings.backgroundPattern === p ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 bg-gray-50/50 dark:bg-slate-800/50'}`}
                                        >
                                            <div className="w-full h-20 bg-white dark:bg-slate-900 rounded-lg overflow-hidden relative border border-gray-100 dark:border-slate-700">
                                                <div className="absolute inset-0 opacity-10" style={{
                                                    backgroundImage: p === 'dots' ? 'radial-gradient(currentColor 1px, transparent 1px)' : undefined,
                                                    backgroundSize: '10px 10px'
                                                }}>
                                                    {/* Simple visual proxy for pattern */}
                                                    <div className={`w-full h-full ${p === 'none' ? '' : 'pattern-preview'}`}></div>
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-slate-600">
                                                    {p === 'none' ? <Minus size={24} /> : <Grid size={24} />}
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold capitalize text-gray-600 dark:text-gray-400 group-hover:text-brand-600 transition-colors">{p.replace('-', ' ')}</span>
                                            {settings.backgroundPattern === p && <div className="absolute top-2 right-2 text-brand-600 bg-white dark:bg-slate-800 rounded-full shadow-sm"><CheckCircle2 size={18} fill="currentColor" className="text-white" /></div>}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FEATURES TAB */}
                {activeTab === 'features' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                        {renderFeatureControl("Interface Geometry", <BoxSelect size={20} />, (
                            <div className="space-y-6">
                                <div className="p-6 bg-brand-50 dark:bg-brand-900/10 rounded-2xl flex items-center justify-center h-32 mb-4">
                                    <div className="w-20 h-20 bg-brand-500 shadow-xl transition-all duration-300" style={{
                                        borderRadius: settings.borderRadius === 'none' ? '0' :
                                            settings.borderRadius === 'sm' ? '0.25rem' :
                                                settings.borderRadius === 'md' ? '0.5rem' :
                                                    settings.borderRadius === 'lg' ? '0.75rem' :
                                                        settings.borderRadius === 'xl' ? '1rem' :
                                                            settings.borderRadius === '2xl' ? '1.5rem' :
                                                                settings.borderRadius === 'glass' ? '1rem' : '4px'
                                    }}></div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase mb-4">
                                        <span>Sharp</span>
                                        <span>Round</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="7"
                                        step="1"
                                        value={['none', 'sm', 'md', 'lg', 'xl', '2xl', 'glass', 'prominent'].indexOf(settings.borderRadius || 'xl')}
                                        onChange={(e) => {
                                            const vals = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'glass', 'prominent'] as const;
                                            updateWithHistory({ ...settings, borderRadius: vals[parseInt(e.target.value)] });
                                        }}
                                        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                    />
                                    <div className="text-center font-bold text-brand-600 bg-white dark:bg-slate-800 border border-brand-100 dark:border-brand-900/30 py-3 rounded-xl capitalize mt-4 shadow-sm">
                                        {(settings.borderRadius || 'xl').replace('xl', 'Extra Large').replace('2xl', 'Full Round').replace('sm', 'Small').replace('md', 'Medium').replace('lg', 'Large').replace('glass', 'Glass Design').replace('prominent', 'Bold & Prominent')}
                                    </div>
                                    <p className="text-xs text-center text-gray-400 mt-2">
                                        {settings.borderRadius === 'glass' && 'High blur, translucent backgrounds.'}
                                        {settings.borderRadius === 'prominent' && 'Thick borders, heavy shadows.'}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {renderFeatureControl("Animation Dynamics", <MousePointerClick size={20} />, (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Control how fast the interface reacts to interactions.</p>
                                <div className="space-y-3">
                                    {(['slow', 'normal', 'fast'] as const).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateWithHistory({ ...settings, animationSpeed: s })}
                                            className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${settings.animationSpeed === s ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'}`}
                                        >
                                            <span className="font-bold capitalize">{s}</span>
                                            {s === 'slow' && <span className="text-xs opacity-70">Cinematic (500ms)</span>}
                                            {s === 'normal' && <span className="text-xs opacity-70">Balanced (300ms)</span>}
                                            {s === 'fast' && <span className="text-xs opacity-70">Snappy (150ms)</span>}
                                            {settings.animationSpeed === s && <CheckCircle2 size={18} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {renderFeatureControl("Global Typography", <Type size={20} />, (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Select the primary font family for the entire portal.</p>
                                <div className="space-y-2">
                                    {(['cairo', 'inter', 'sans', 'serif', 'mono'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => updateWithHistory({ ...settings, fontStyle: f })}
                                            className={`w-full py-4 px-5 rounded-xl text-left flex justify-between items-center border-2 transition-all ${settings.fontStyle === f ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-700' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:border-gray-200'}`}
                                        >
                                            <span className={`text-base ${(f === 'cairo' || f === 'inter') ? 'font-bold' : ''} ${f === 'mono' ? 'font-mono' : f === 'serif' ? 'font-serif' : 'font-sans'}`}>
                                                {f === 'cairo' ? 'Cairo (Modern Arabic)' : f === 'inter' ? 'Inter (Clean UI)' : f === 'mono' ? 'Monospace Code' : f.charAt(0).toUpperCase() + f.slice(1)}
                                            </span>
                                            {settings.fontStyle === f && <CheckCircle2 size={18} className="text-brand-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThemeManager;
