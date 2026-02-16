import React, { useState } from 'react';
import { AppSettings, BackgroundPattern, ThemePreset } from '../types';
import { PRESET_THEMES } from '../utils/themes';
import { Check, Palette, Grid, Layers, Zap, CheckCircle2 } from 'lucide-react';

interface ThemeManagerProps {
    settings: AppSettings;
    onUpdateSettings: (newSettings: AppSettings) => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ settings, onUpdateSettings }) => {
    const [selectedPattern, setSelectedPattern] = useState<BackgroundPattern>(settings.backgroundPattern || 'none');
    const [searchQuery, setSearchQuery] = useState('');

    const applyTheme = (theme: ThemePreset) => {
        onUpdateSettings({
            ...settings,
            primaryColor: theme.primaryColor,
            secondaryColor: theme.secondaryColor,
            backgroundPattern: selectedPattern !== 'none' ? selectedPattern : theme.pattern // Use selected override or theme default
        });
    };

    const patterns: BackgroundPattern[] = ['none', 'circles', 'cubes', 'dots', 'lines', 'waves', 'grid', 'hexagons', 'circuit', 'topography', 'texture', 'gradient-radial', 'gradient-linear'];

    const filteredThemes = PRESET_THEMES.filter(
        t => t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette className="text-brand-600" /> Theme Studio
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Select from 128+ professionally curated themes or customize your own.
                    </p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search themes..."
                        className="p-3 pl-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Grid size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Pattern Selector */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Layers size={20} className="text-brand-500" /> Background Patterns
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {patterns.map(p => (
                        <button
                            key={p}
                            onClick={() => setSelectedPattern(p)}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden group ${selectedPattern === p
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className="w-full h-12 bg-gray-100 dark:bg-slate-800 rounded-lg mb-2 relative overflow-hidden">
                                {/* Pattern Preview Mini */}
                                <div className={`absolute inset-0 opacity-50 pattern-${p}}`}></div>
                                {/* We will rely on global CSS for pattern classes or just names for now */}
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 uppercase font-bold">
                                    {p.replace('-', ' ')}
                                </div>
                            </div>
                            <span className="text-xs font-bold capitalize text-gray-700 dark:text-gray-300">{p.replace('-', ' ')}</span>
                            {selectedPattern === p && (
                                <div className="absolute top-2 right-2 text-brand-600">
                                    <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme Grid */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Zap size={20} className="text-amber-500" /> 128+ Pro Presets
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {filteredThemes.map((theme) => {
                        const isActive = settings.primaryColor === theme.primaryColor && settings.secondaryColor === theme.secondaryColor;
                        return (
                            <button
                                key={theme.id}
                                onClick={() => applyTheme(theme)}
                                className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isActive
                                    ? 'border-brand-500 ring-4 ring-brand-500/10 scale-105 z-10'
                                    : 'border-transparent hover:border-gray-200 dark:hover:border-slate-700'
                                    }`}
                            >
                                <div className="aspect-[4/5] flex flex-col">
                                    {/* Color Split */}
                                    <div className="flex-1 w-full" style={{ backgroundColor: theme.primaryColor }}></div>
                                    <div className="h-1/3 w-full" style={{ backgroundColor: theme.secondaryColor }}></div>

                                    {/* Info Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white text-left">
                                        <span className="text-xs font-bold line-clamp-2">{theme.name}</span>
                                        <span className="text-[10px] opacity-75">{theme.pattern}</span>
                                    </div>

                                    {/* Active Badge */}
                                    {isActive && (
                                        <div className="absolute top-2 right-2 bg-white text-brand-600 rounded-full p-1 shadow-lg">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {filteredThemes.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                        <p className="text-gray-400 font-bold">No themes found matching "{searchQuery}"</p>
                        <button onClick={() => setSearchQuery('')} className="mt-2 text-brand-600 hover:underline">Clear Search</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThemeManager;
