import { AppSettings } from '../types';
import { api } from './api';

const STORAGE_KEY = 'csa_app_settings';

export const saveSettings = async (settings: AppSettings): Promise<boolean> => {
    try {
        // Always save locally for instant feedback
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

        // If logged in, sync with backend
        const token = localStorage.getItem('token');
        if (token) {
            await api.theme.update(settings);
        }

        return true;
    } catch (error) {
        console.error("Failed to save settings:", error);
        return false;
    }
};

export const loadSettings = async (): Promise<AppSettings | null> => {
    try {
        // If logged in, try to fetch from backend
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const remoteSettings = await api.theme.get();
                if (remoteSettings && Object.keys(remoteSettings).length > 0) {
                    const merged = { ...remoteSettings } as AppSettings;
                    // Cache it
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                    return merged;
                }
            } catch (e) {
                console.warn("Backend sync failed, falling back to local");
            }
        }

        // Fallback to local storage
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
