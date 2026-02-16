import { AppSettings } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
    auth: {
        register: async (email: string, password: string) => {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
            return res.json();
        },
        login: async (email: string, password: string) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
            return res.json();
        },
        me: async () => {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: getAuthHeader()
            });
            if (!res.ok) throw new Error('Session invalid');
            return res.json();
        }
    },
    theme: {
        get: async (): Promise<Partial<AppSettings>> => {
            const res = await fetch(`${API_URL}/theme`, {
                headers: getAuthHeader()
            });
            if (!res.ok) return {};
            return res.json();
        },
        update: async (settings: AppSettings) => {
            const res = await fetch(`${API_URL}/theme`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(settings)
            });
            if (!res.ok) throw new Error('Failed to save theme');
            return res.json();
        }
    }
};
