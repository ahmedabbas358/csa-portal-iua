/**
 * CSA Portal API Service
 * Centralized API client for all backend communication.
 * Regular users need NO login to browse the site.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── Token Storage Helpers ──────────────────────────────────────────
const DEAN_TOKEN_KEY = 'csa_dean_token';
const ADMIN_TOKEN_KEY = 'csa_admin_token';

export const getDeanToken = (): string | null => localStorage.getItem(DEAN_TOKEN_KEY);
export const setDeanToken = (token: string) => localStorage.setItem(DEAN_TOKEN_KEY, token);
export const clearDeanToken = () => localStorage.removeItem(DEAN_TOKEN_KEY);

export const getAdminToken = (): string | null => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
export const clearAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

// ─── Generic Fetch Wrapper ──────────────────────────────────────────
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const { headers: optHeaders, ...restOptions } = options;
    const res = await fetch(`${API_BASE}${path}`, {
        ...restOptions,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(optHeaders as Record<string, string>),
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || `API Error ${res.status}`);
    }

    return res.json();
}


function authHeaders(token: string | null): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API (No auth needed)
// ═══════════════════════════════════════════════════════════════════

export const api = {
    // ─── Events ─────────────────────────────────────────────────────
    getEvents: () => apiFetch<any[]>('/api/events'),

    // ─── Members ────────────────────────────────────────────────────
    getMembers: () => apiFetch<any[]>('/api/members'),

    // ─── News ───────────────────────────────────────────────────────
    getNews: () => apiFetch<any[]>('/api/news'),
    likeNews: (id: string, action: 'like' | 'unlike') => apiFetch<{ success: boolean; likes: number }>(`/api/news/${id}/like`, { method: 'POST', body: JSON.stringify({ action }) }),

    // ─── Timeline ───────────────────────────────────────────────────
    getTimeline: () => apiFetch<any[]>('/api/timeline'),

    // ─── Settings ───────────────────────────────────────────────────
    getSettings: () => apiFetch<any>('/api/settings'),

    // ═══════════════════════════════════════════════════════════════
    // DEAN AUTH
    // ═══════════════════════════════════════════════════════════════

    deanLogin: async (masterKey: string) => {
        const result = await apiFetch<{ token: string; expiresAt: string }>('/api/auth/dean/login', {
            method: 'POST',
            body: JSON.stringify({ masterKey }),
        });
        setDeanToken(result.token);
        return result;
    },

    deanVerify: async (): Promise<boolean> => {
        const token = getDeanToken();
        if (!token) return false;
        try {
            const result = await apiFetch<{ valid: boolean }>('/api/auth/dean/verify', {
                method: 'POST',
                body: JSON.stringify({ token }),
            });
            return result.valid;
        } catch {
            return false;
        }
    },

    deanLogout: async () => {
        const token = getDeanToken();
        try {
            await apiFetch('/api/auth/dean/logout', {
                method: 'POST',
                body: JSON.stringify({ token }),
            });
        } catch { /* ignore */ }
        clearDeanToken();
    },

    // Recovery
    getSecurityQuestion: () =>
        apiFetch<{ question: string }>('/api/auth/dean/recover/question', { method: 'POST' }),

    verifySecurityAnswer: (answer: string) =>
        apiFetch<{ success: boolean; resetToken: string }>('/api/auth/dean/recover/verify-answer', {
            method: 'POST',
            body: JSON.stringify({ answer }),
        }),

    verifyBackupCode: (backupCode: string) =>
        apiFetch<{ success: boolean; resetToken: string }>('/api/auth/dean/recover/verify-backup', {
            method: 'POST',
            body: JSON.stringify({ backupCode }),
        }),

    resetMasterKey: (resetToken: string, newMasterKey: string) =>
        apiFetch<{ success: boolean }>('/api/auth/dean/recover/reset', {
            method: 'POST',
            body: JSON.stringify({ resetToken, newMasterKey }),
        }),

    // ═══════════════════════════════════════════════════════════════
    // ADMIN AUTH
    // ═══════════════════════════════════════════════════════════════

    adminLogin: async (token: string) => {
        const result = await apiFetch<{ token: string; role: string; sessionId: string }>('/api/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
        setAdminToken(result.token);
        return result;
    },

    adminVerify: async (): Promise<{ valid: boolean; role?: string }> => {
        const token = getAdminToken();
        if (!token) return { valid: false };
        try {
            return await apiFetch<{ valid: boolean; role?: string }>('/api/auth/admin/verify', {
                method: 'POST',
                body: JSON.stringify({ token }),
            });
        } catch {
            return { valid: false };
        }
    },

    adminLogout: async () => {
        const token = getAdminToken();
        try {
            await apiFetch('/api/auth/admin/logout', {
                method: 'POST',
                body: JSON.stringify({ token }),
            });
        } catch { /* ignore */ }
        clearAdminToken();
    },

    // ═══════════════════════════════════════════════════════════════
    // DEAN MANAGEMENT (requires Dean token)
    // ═══════════════════════════════════════════════════════════════

    dean: {
        getAccessKeys: () => apiFetch<any[]>('/api/dean/access-keys', {
            headers: authHeaders(getDeanToken()),
        }),

        createAccessKey: (role: string, expiresInDays: number = 30) => apiFetch<any>('/api/dean/access-keys', {
            method: 'POST',
            headers: authHeaders(getDeanToken()),
            body: JSON.stringify({ role, expiresInDays }),
        }),

        deleteAccessKey: (id: string) => apiFetch<any>(`/api/dean/access-keys/${id}`, {
            method: 'DELETE',
            headers: authHeaders(getDeanToken()),
        }),

        getSessions: () => apiFetch<{ deanSessions: any[]; adminSessions: any[] }>('/api/dean/sessions', {
            headers: authHeaders(getDeanToken()),
        }),

        revokeSession: (sessionId: string, type: 'dean' | 'admin') => apiFetch<any>('/api/dean/sessions/revoke', {
            method: 'POST',
            headers: authHeaders(getDeanToken()),
            body: JSON.stringify({ sessionId, type }),
        }),

        getConfig: () => apiFetch<any>('/api/dean/config', {
            headers: authHeaders(getDeanToken()),
        }),

        updateConfig: (data: { newMasterKey?: string; securityQuestion?: string; securityAnswer?: string; backupCode?: string }) =>
            apiFetch<any>('/api/dean/config', {
                method: 'PUT',
                headers: authHeaders(getDeanToken()),
                body: JSON.stringify(data),
            }),
    },

    // ═══════════════════════════════════════════════════════════════
    // CONTENT MANAGEMENT (requires Dean or Admin token)
    // ═══════════════════════════════════════════════════════════════

    manage: {
        _getToken: (): string | null => getDeanToken() || getAdminToken(),

        createEvent: function (data: any) { return apiFetch<any>('/api/events', { method: 'POST', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },
        updateEvent: function (id: string, data: any) { return apiFetch<any>(`/api/events/${id}`, { method: 'PUT', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },
        deleteEvent: function (id: string) { return apiFetch<any>(`/api/events/${id}`, { method: 'DELETE', headers: authHeaders(this._getToken()) }); },

        createMember: function (data: any) { return apiFetch<any>('/api/members', { method: 'POST', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },
        updateMember: function (id: string, data: any) { return apiFetch<any>(`/api/members/${id}`, { method: 'PUT', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },
        deleteMember: function (id: string) { return apiFetch<any>(`/api/members/${id}`, { method: 'DELETE', headers: authHeaders(this._getToken()) }); },

        createNews: function (data: any) { return apiFetch<any>('/api/news', { method: 'POST', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },
        updateNews: function (id: string, data: any) { return apiFetch<any>(`/api/news/${id}`, { method: 'PUT', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },
        deleteNews: function (id: string) { return apiFetch<any>(`/api/news/${id}`, { method: 'DELETE', headers: authHeaders(this._getToken()) }); },

        createTimeline: function (data: any) { return apiFetch<any>('/api/timeline', { method: 'POST', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },
        updateTimeline: function (id: string, data: any) { return apiFetch<any>(`/api/timeline/${id}`, { method: 'PUT', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },
        deleteTimeline: function (id: string) { return apiFetch<any>(`/api/timeline/${id}`, { method: 'DELETE', headers: authHeaders(this._getToken()) }); },

        updateSettings: function (data: any) { return apiFetch<any>('/api/settings', { method: 'PUT', headers: authHeaders(this._getToken()), body: JSON.stringify(data) }); },

        // File upload (uses FormData, not JSON)
        uploadFile: async function (file: File): Promise<{ url: string; filename: string }> {
            const formData = new FormData();
            formData.append('file', file);
            const token = this._getToken();
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({ error: res.statusText }));
                throw new Error(body.error || `Upload failed (${res.status})`);
            }
            return res.json();
        },
    },
};

export default api;
