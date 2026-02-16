import { CSSProperties } from 'react';

// --- PATTERN ENGINE ---

const BASE_PATTERNS = [
    'dots', 'grid', 'lines', 'waves', 'circles', 'hexagons', 'triangles', 'squares',
    'cross', 'plus', 'zigzag', 'diamond', 'scales', 'brick', 'rain', 'snow',
    'cubes' // Added legacy
];

const DENSITIES = ['sparse', 'medium', 'dense'];
const SIZES = ['sm', 'md', 'lg'];
const OPACITIES = ['faint', 'subtle', 'visible'];

export const ALL_PATTERNS = [
    'none',
    // Generate variations for base patterns
    ...BASE_PATTERNS.flatMap(base =>
        DENSITIES.flatMap(density => [`${base}-${density}`])
    ),
    // Add variations manually to reach 128 if needed or algorithmically expand
    ...BASE_PATTERNS.flatMap(base => [`${base}-lg`, `${base}-xl`]),
    // Legacy mapping support
    'cubes', 'circuit', 'hexagons',
    ...['circuit-board', 'topography', 'texture-noise', 'gradient-radial', 'gradient-linear', 'gradient-angular'],
    ...Array.from({ length: 60 }, (_, i) => `abstract-${i + 1}`) // Placeholder for procedural abstract patterns
];

// Helper to generate SVG Data URI
const svgData = (content: string, w = 20, h = 20) =>
    `url("data:image/svg+xml,%3Csvg width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' xmlns='http://www.w3.org/2000/svg'%3E${content}%3C/svg%3E")`;

// Helper to get color/opacity
const getColor = (isDark: boolean, opacity = 0.05) =>
    isDark ? `%23ffffff` : `%23000000`; // URL encoded #

export const getPatternStyle = (pattern: string, color: string, isDark: boolean): CSSProperties => {
    const fill = getColor(isDark, 0.05);
    const stroke = getColor(isDark, 0.05);
    const c = color; // Dynamic color if needed (often better to use neutral overlay)

    switch (true) {
        case pattern === 'none': return {};

        // --- DOTS ---
        case pattern.startsWith('dots'):
            const dotSize = pattern.includes('dense') ? 1 : pattern.includes('sparse') ? 2 : 1.5;
            const dotSpace = pattern.includes('dense') ? 10 : pattern.includes('sparse') ? 40 : 20;
            return { backgroundImage: `radial-gradient(${c} ${dotSize}px, transparent ${dotSize}px)`, backgroundSize: `${dotSpace}px ${dotSpace}px` };

        // --- GRID ---
        case pattern.startsWith('grid'):
            const gridSize = pattern.includes('dense') ? 20 : pattern.includes('sparse') ? 60 : 40;
            return { backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: `${gridSize}px ${gridSize}px` };

        // --- LINES ---
        case pattern.startsWith('lines'):
            const angle = pattern.includes('vertical') ? '90deg' : pattern.includes('horizontal') ? '0deg' : '45deg';
            return { backgroundImage: `repeating-linear-gradient(${angle}, ${c} 0, ${c} 1px, transparent 0, transparent 50%)`, backgroundSize: '10px 10px' };

        // --- CIRCLES ---
        case pattern.startsWith('circles'):
            return { backgroundImage: `radial-gradient(circle, transparent 20%, ${c} 20%, ${c} 21%, transparent 21%, transparent)`, backgroundSize: '30px 30px' };

        // --- LEGACY & GEOMETRIC ---
        case pattern === 'cubes': // Legacy exact match
            return { backgroundImage: `linear-gradient(30deg, ${c} 12%, transparent 12.5%, transparent 87%, ${c} 87.5%, ${c}), linear-gradient(150deg, ${c} 12%, transparent 12.5%, transparent 87%, ${c} 87.5%, ${c}), linear-gradient(30deg, ${c} 12%, transparent 12.5%, transparent 87%, ${c} 87.5%, ${c}), linear-gradient(150deg, ${c} 12%, transparent 12.5%, transparent 87%, ${c} 87.5%, ${c}), linear-gradient(60deg, ${c} 25%, transparent 25.5%, transparent 75%, ${c} 75%, ${c}), linear-gradient(60deg, ${c} 25%, transparent 25.5%, transparent 75%, ${c} 75%, ${c})`, backgroundSize: '40px 70px', backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px' };

        case pattern.includes('hexagons'):
            return { backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10S-10 4.477-10 10v20c0 5.523 4.477 10 10 10z' fill='${fill}' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")` };

        // --- ZIGZAG ---
        case pattern.includes('zigzag'):
            return { backgroundImage: `linear-gradient(135deg, ${c} 25%, transparent 25%) -10px 0, linear-gradient(225deg, ${c} 25%, transparent 25%) -10px 0, linear-gradient(315deg, ${c} 25%, transparent 25%), linear-gradient(45deg, ${c} 25%, transparent 25%)`, backgroundSize: `20px 20px` };

        // --- ABSTRACT & COMPLEX ---
        case pattern === 'circuit': // Legacy
        case pattern === 'circuit-board':
            return { backgroundImage: `linear-gradient(${c} 2px, transparent 2px), linear-gradient(90deg, ${c} 2px, transparent 2px), linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px', backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px' };

        case pattern === 'topography':
            return { backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='${fill}' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")` };

        // Fallback
        default:
            return { backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` };
    }
};


// --- ICON STYLE ENGINE ---

export interface IconStyleDef {
    id: string;
    label: string;
    css: string;
}

export const ICON_STYLES: IconStyleDef[] = [
    // 1. BASICS
    { id: 'simple', label: 'Simple', css: 'border-radius: 0.5rem;' },
    { id: 'circle', label: 'Circle', css: 'border-radius: 9999px;' },
    { id: 'square', label: 'Square', css: 'border-radius: 0px;' },
    { id: 'pill', label: 'Pill', css: 'border-radius: 9999px; aspect-ratio: auto;' },

    // 2. OUTLINES & BORDERS
    { id: 'outline-thin', label: 'Thin Outline', css: 'border-radius: 0.75rem; border: 1px solid currentColor; background: transparent; padding: 2px;' },
    { id: 'outline-thick', label: 'Bold Outline', css: 'border-radius: 0.75rem; border: 2px solid currentColor; background: transparent; padding: 2px;' },
    { id: 'outline-dashed', label: 'Dashed', css: 'border-radius: 50%; border: 1px dashed currentColor; background: transparent; padding: 2px;' },

    // 3. SHAPES (using clip-path)
    { id: 'hexagon', label: 'Hexagon', css: 'clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); border-radius: 0 !important; background: currentColor; color: white;' },
    { id: 'diamond-shape', label: 'Diamond', css: 'clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); border-radius: 0 !important; background: currentColor; color: white;' },

    // 4. EFFECTS
    { id: 'glow', label: 'Neon Glow', css: 'border-radius: 50%; box-shadow: 0 0 10px currentColor;' },
    { id: 'glass-icon', label: 'Glass', css: 'border-radius: 1rem; backdrop-filter: blur(4px); background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);' },
    { id: 'soft-shadow', label: 'Soft Shadow', css: 'border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);' },

    ...Array.from({ length: 15 }, (_, i) => ({
        id: `rotate-${i * 10}`,
        label: `Tilt ${i * 10}°`,
        css: `border-radius: 0.75rem; transform: rotate(${i * 10}deg);`
    })),
    // procedural expansion to hit 90+
    ...Array.from({ length: 20 }, (_, i) => ({
        id: `border-thick-${i}`,
        label: `Frame ${i + 1}`,
        css: `border-radius: ${i % 2 === 0 ? '50%' : '0.5rem'}; border: ${2 + (i % 3)}px solid currentColor; padding: 4px; opacity: ${0.7 + (i % 3) * 0.1};`
    })),
    ...Array.from({ length: 20 }, (_, i) => ({
        id: `shadow-depth-${i}`,
        label: `Depth ${i + 1}`,
        css: `border-radius: 1rem; box-shadow: ${i}px ${i}px ${i * 2}px rgba(0,0,0,0.2); background: rgba(255,255,255,0.05);`
    })),
    ...Array.from({ length: 15 }, (_, i) => ({
        id: `glass-tint-${i}`,
        label: `Frost ${i + 1}`,
        css: `border-radius: 1rem; backdrop-filter: blur(${4 + i}px); background: rgba(255,255,255,${0.1 + (i * 0.02)}); border: 1px solid rgba(255,255,255,0.2);`
    }))
];

export const getIconStyleCSS = (styleId: string | undefined): string => {
    const style = ICON_STYLES.find(s => s.id === styleId);
    return style ? style.css : '';
};
