import { AppSettings } from '../types';

const STORAGE_KEY = 'csa_app_settings';

// robust service for handling local persistence
export const saveSettings = async (settings: AppSettings): Promise<boolean> => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error("Failed to save settings:", error);
        return false;
    }
};

export const loadSettings = async (): Promise<AppSettings | null> => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as AppSettings;
        }
        return null;
    } catch (error) {
        console.error("Failed to load settings:", error);
        return null;
    }
};
