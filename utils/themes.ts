import { ThemePreset, BackgroundPattern } from '../types';

const baseColors = [
    { name: 'Classic Blue', hex: '#2563eb' },
    { name: 'Ocean Teal', hex: '#0d9488' },
    { name: 'Midnight Navy', hex: '#1e3a8a' },
    { name: 'Royal Purple', hex: '#7c3aed' },
    { name: 'Vibrant Orange', hex: '#f97316' },
    { name: 'Nature Green', hex: '#16a34a' },
    { name: 'Crimson Red', hex: '#dc2626' },
    { name: 'Hot Pink', hex: '#db2777' },
    { name: 'Golden Amber', hex: '#d97706' },
    { name: 'Slate Gray', hex: '#475569' },
    { name: 'Cyan Sky', hex: '#0891b2' },
    { name: 'Deep Indigo', hex: '#4338ca' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Violet', hex: '#5b21b6' },
    { name: 'Sky', hex: '#0284c7' },
    { name: 'Lime', hex: '#84cc16' }, // New
    { name: 'Fuchsia', hex: '#d946ef' }, // New
    { name: 'Zinc', hex: '#52525b' }, // New
    { name: 'Neutral', hex: '#737373' }, // New
];

const secondaryVariations = [
    { name: 'Dark Contrast', modifier: (hex: string) => adjustBrightness(hex, -40) },
    { name: 'Soft Complement', modifier: (hex: string) => adjustBrightness(hex, 40) },
    { name: 'Deep Accent', modifier: (hex: string) => adjustBrightness(hex, -60) },
    { name: 'Vivid Pop', modifier: (hex: string) => adjustBrightness(hex, 10) }, // New
];

const patterns: BackgroundPattern[] = [
    'circles', 'cubes', 'dots', 'lines', 'waves', 'grid', 'hexagons', 'circuit',
    'topography', 'texture', 'gradient-radial', 'gradient-linear', 'leaf', 'diamond', 'zigzag' // Added leaf, diamond, zigzag
];

// Helper to darken/lighten hex
function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    // Clamp
    const newR = R < 255 ? R < 1 ? 0 : R : 255;
    const newG = G < 255 ? G < 1 ? 0 : G : 255;
    const newB = B < 255 ? B < 1 ? 0 : B : 255;

    const newHex = (0x1000000 + newR * 0x10000 + newG * 0x100 + newB).toString(16).slice(1);
    return `#${newHex}`;
}

export const generateThemes = (): ThemePreset[] => {
    const themes: ThemePreset[] = [];
    let idCounter = 1;

    // 20 colors * 4 variations = 80 combos
    // We want 256 themes.
    // 256 / 80 = 3.2 patterns per combo.
    // Let's generate 4 patterns for each combo -> 320 themes, then slice to 256.

    baseColors.forEach((primary) => {
        secondaryVariations.forEach((secondary) => {
            const numPatterns = patterns.length;
            const startIndex = (idCounter % numPatterns);

            // Generate 4 variants per color pair
            for (let i = 0; i < 4; i++) {
                const pIndex = (startIndex + i) % numPatterns;
                const pattern = patterns[pIndex];

                themes.push({
                    id: `theme-${idCounter++}`,
                    name: `${primary.name} ${secondary.name} ${i + 1}`,
                    primaryColor: primary.hex,
                    secondaryColor: secondary.modifier(primary.hex),
                    pattern: pattern
                });
            }
        });
    });

    return themes.slice(0, 256);
};

export const PRESET_THEMES = generateThemes();
