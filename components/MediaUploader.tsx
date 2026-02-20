import React, { useState, useRef } from 'react';
import { Trash2, Loader2, Upload, RefreshCcw, Square, RectangleHorizontal, RectangleVertical, Smartphone } from 'lucide-react';
import { api } from '../services/api';
import { PostDesignConfig } from '../types';

const getAspectClass = (r?: string) => {
    switch (r) {
        case 'portrait': return 'aspect-[4/5]';
        case 'landscape': return 'aspect-video';
        case 'story': return 'aspect-[9/16]';
        default: return 'aspect-square';
    }
};

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

export default MediaUploader;
