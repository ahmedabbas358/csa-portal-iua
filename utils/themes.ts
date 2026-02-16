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
];

const secondaryVariations = [
    { name: 'Dark Contrast', modifier: (hex: string) => adjustBrightness(hex, -40) },
    { name: 'Soft Complement', modifier: (hex: string) => adjustBrightness(hex, 40) },
    { name: 'Deep Accent', modifier: (hex: string) => adjustBrightness(hex, -60) },
];

const patterns: BackgroundPattern[] = [
    'circles', 'cubes', 'dots', 'lines', 'waves', 'grid', 'hexagons', 'circuit', 'topography', 'texture', 'gradient-radial', 'gradient-linear'
];

// Helper to darken/lighten hex
function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    const newHex = (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    return `#${newHex}`;
}

export const generateThemes = (): ThemePreset[] => {
    const themes: ThemePreset[] = [];
    let idCounter = 1;

    baseColors.forEach((primary) => {
        secondaryVariations.forEach((secondary) => {
            // Use almost all patterns cyclically
            // 16 colors * 3 variations = 48 base combos.
            // We want 128 themes. 128 / 48 approx 2.6 patterns per combo.
            // Let's use 3 patterns per combo to get 144, then slice.
            // BUT to ensure ALL patterns are used, we should rotate the start index.

            const numPatterns = patterns.length;
            const startIndex = (idCounter % numPatterns);

            // Pick 3 patterns per color combo cyclically
            for (let i = 0; i < 3; i++) {
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

    return themes.slice(0, 128);
};

export const PRESET_THEMES = generateThemes();
