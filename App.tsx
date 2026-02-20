
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import DeanDashboard from './pages/DeanDashboard';
import { Language, AppSettings, EventItem, Member, NewsPost, TimelineItem, AccessKey, ActiveSession, DeanSecurityConfig } from './types';
import { INITIAL_STATE, DEAN_MASTER_KEY } from './constants';
import { Lock, ShieldCheck, AlertCircle, ScanLine, X, QrCode, KeyRound, HelpCircle, RefreshCw } from 'lucide-react';
import Footer from './components/Footer';
import { BackgroundPattern } from './types';

import { getPatternStyle as getEnginePattern, getIconStyleCSS } from './utils/styleEngine';
import { api, getDeanToken, getAdminToken, clearDeanToken, clearAdminToken } from './services/api';

// --- PATTERN HELPER ---
const getPatternStyle = (pattern?: string, isDark?: boolean): React.CSSProperties => {
    // Solid base colors with 30-40% opacity handled in styleEngine
    const color = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    return getEnginePattern(pattern || 'none', color, isDark || false);
};

const App: React.FC = () => {
    // ─── Content State (loaded from API) ────────────────────────────
    const [events, setEvents] = useState<EventItem[]>(INITIAL_STATE.events);
    const [members, setMembers] = useState<Member[]>(INITIAL_STATE.members);
    const [news, setNews] = useState<NewsPost[]>(INITIAL_STATE.news);
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem('csa_app_settings');
            return stored ? { ...INITIAL_STATE.settings, ...JSON.parse(stored) } : INITIAL_STATE.settings;
        } catch { return INITIAL_STATE.settings; }
    });
    const [timeline, setTimeline] = useState<TimelineItem[]>(INITIAL_STATE.timeline);
    const [dataLoaded, setDataLoaded] = useState(false);

    // ─── Security State (kept for Admin panel compatibility) ────────
    const [accessKeys, setAccessKeys] = useState<AccessKey[]>(() => {
        try {
            const stored = localStorage.getItem('csa_access_keys');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    const [sessions, setSessions] = useState<ActiveSession[]>(() => {
        try {
            const stored = localStorage.getItem('csa_sessions');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    const [deanConfig, setDeanConfig] = useState<DeanSecurityConfig>({
        masterKey: DEAN_MASTER_KEY,
        securityQuestion: 'What is the default year?',
        securityAnswer: '2010',
        backupCode: 'CSA-BACKUP-INIT-2024',
        lastChanged: new Date().toISOString()
    });

    // ─── UI State ───────────────────────────────────────────────────
    const [lang, setLang] = useState<Language>('ar');
    const [currentPage, setCurrentPage] = useState('home');

    // Clear login input when switching pages to prevent state leakage
    useEffect(() => {
        setLoginInput('');
        setLoginError('');
    }, [currentPage]);

    const [isDarkMode, setIsDarkMode] = useState(false);

    // ─── Auth State ─────────────────────────────────────────────────
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDeanLoggedIn, setIsDeanLoggedIn] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    // ─── Login Inputs ───────────────────────────────────────────────
    const [loginInput, setLoginInput] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ─── Recovery Mode State ────────────────────────────────────────
    const [recoveryMode, setRecoveryMode] = useState<'none' | 'question' | 'backup' | 'reset'>('none');
    const [recoveryInput, setRecoveryInput] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');

    // Anti-autofill state
    const [isReadOnly, setIsReadOnly] = useState(true);

    // ═══════════════════════════════════════════════════════════════
    // DATA LOADING FROM API
    // ═══════════════════════════════════════════════════════════════


    const loadDataFromAPI = useCallback(async () => {
        try {
            const [eventsData, membersData, newsData, timelineData, settingsData] = await Promise.allSettled([
                api.getEvents(),
                api.getMembers(),
                api.getNews(),
                api.getTimeline(),
                api.getSettings(),
            ]);

            if (eventsData.status === 'fulfilled' && eventsData.value?.length > 0) setEvents(eventsData.value);
            if (membersData.status === 'fulfilled' && membersData.value?.length > 0) setMembers(membersData.value);
            if (newsData.status === 'fulfilled' && newsData.value?.length > 0) setNews(newsData.value);
            if (timelineData.status === 'fulfilled' && timelineData.value?.length > 0) setTimeline(timelineData.value);
            if (settingsData.status === 'fulfilled' && settingsData.value) {
                setSettings(prev => ({ ...prev, ...settingsData.value }));
            }
            setDataLoaded(true);
        } catch (e) {
            console.warn('API unavailable, using fallback data:', e);
            setDataLoaded(true);
        }
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION — Check sessions + load data
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        const init = async () => {
            // 1. Load data from API (falls back to INITIAL_STATE constants)
            await loadDataFromAPI();

            // 2. Check if Dean has a saved session (persistent device recognition)
            const deanToken = getDeanToken();
            if (deanToken) {
                try {
                    const isValid = await api.deanVerify();
                    if (isValid) {
                        setIsDeanLoggedIn(true);
                    } else {
                        clearDeanToken();
                    }
                } catch {
                    // API might be down, keep token for later
                    console.warn('Could not verify Dean session, keeping token.');
                }
            }

            // 3. Check if Admin has a saved session
            const adminToken = getAdminToken();
            if (adminToken) {
                try {
                    const result = await api.adminVerify();
                    if (result.valid) {
                        setIsLoggedIn(true);
                    } else {
                        clearAdminToken();
                    }
                } catch {
                    console.warn('Could not verify Admin session, keeping token.');
                }
            }

            setAuthChecked(true);
        };

        init();
    }, [loadDataFromAPI]);

    // ═══════════════════════════════════════════════════════════════
    // SETTINGS & CONTENT SYNC (REAL-TIME-ISH)
    // ═══════════════════════════════════════════════════════════════

    // 1. Persist settings to LocalStorage
    useEffect(() => {
        localStorage.setItem('csa_app_settings', JSON.stringify(settings));
    }, [settings]);

    // 2. Poll for ALL dynamic content updates everyone 10 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // Fetch critical dynamic data
                const [newSettings, newNews, newEvents] = await Promise.all([
                    api.getSettings(),
                    api.getNews(),
                    api.getEvents()
                ]);

                // Sync Settings
                if (newSettings) {
                    setSettings(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify({ ...prev, ...newSettings })) {
                            return { ...prev, ...newSettings };
                        }
                        return prev;
                    });
                }

                // Sync News (Likes, Comments, New Posts)
                if (newNews && newNews.length > 0) {
                    setNews(prev => {
                        // Deep compare to avoid flicker
                        if (JSON.stringify(prev) !== JSON.stringify(newNews)) {
                            return newNews;
                        }
                        return prev;
                    });
                }

                // Sync Events (Registrations, New Events)
                if (newEvents && newEvents.length > 0) {
                    setEvents(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(newEvents)) {
                            return newEvents;
                        }
                        return prev;
                    });
                }

            } catch { /* ignore polling errors */ }
        }, 4000); // 4 seconds Sync (Faster for real-time feel)

        return () => clearInterval(interval);
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // HISTORY / BACK BUTTON HANDLING
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state && event.state.page) {
                setCurrentPage(event.state.page);
            } else if (!event.state || !event.state.modal) {
                setCurrentPage('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);



    // Sync Page with History
    useEffect(() => {
        const currentState = window.history.state;
        if (!currentState || currentState.page !== currentPage) {
            window.history.pushState({ page: currentPage }, '', `?page=${currentPage}`);
        }
    }, [currentPage]);

    // Persist Settings (locally for offline theme)
    useEffect(() => {
        localStorage.setItem('csa_app_settings', JSON.stringify(settings));
    }, [settings]);

    // Persist Auth Data (backward compat)
    useEffect(() => localStorage.setItem('csa_access_keys', JSON.stringify(accessKeys)), [accessKeys]);
    useEffect(() => localStorage.setItem('csa_sessions', JSON.stringify(sessions)), [sessions]);

    const updateDeanConfig = (newConfig: DeanSecurityConfig) => {
        setDeanConfig(newConfig);
        localStorage.setItem('csa_dean_config', JSON.stringify(newConfig));
    };

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo(0, 0);
        setLoginError('');
        setLoginInput('');
        setIsScanning(false);
        setRecoveryMode('none');
        setRecoveryInput('');
    }, [currentPage]);

    // ═══════════════════════════════════════════════════════════════
    // THEME APPLICATION (unchanged logic)
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        const root = document.documentElement;

        if (isDarkMode) {
            root.classList.add('dark');
            document.body.style.backgroundColor = '#0f172a';
        } else {
            root.classList.remove('dark');
            document.body.style.backgroundColor = '#f8fafc';
        }

        root.style.setProperty('--primary-color', settings.primaryColor);
        root.style.setProperty('--secondary-color', settings.secondaryColor);

        const hex = settings.primaryColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        const contrastColor = yiq >= 128 ? '#0f172a' : '#ffffff';
        root.style.setProperty('--primary-contrast', contrastColor);

        const hexToRgb = (hexVal: string) => {
            const rr = parseInt(hexVal.slice(1, 3), 16);
            const gg = parseInt(hexVal.slice(3, 5), 16);
            const bb = parseInt(hexVal.slice(5, 7), 16);
            return `${rr} ${gg} ${bb}`;
        };

        if (settings.primaryColor.startsWith('#')) {
            const rgb = hexToRgb(settings.primaryColor);
            root.style.setProperty('--brand-500', rgb);
            root.style.setProperty('--brand-600', rgb);
        }

        if (settings.secondaryColor.startsWith('#')) {
            const rgb = hexToRgb(settings.secondaryColor);
            root.style.setProperty('--brand-900', rgb);
        }

        const radiusMap: Record<string, string> = {
            'none': '0px', 'sm': '0.25rem', 'md': '0.5rem', 'lg': '0.75rem',
            'xl': '1rem', '2xl': '1.5rem', 'glass': '1rem', 'prominent': '0.5rem'
        };
        const currentRadius = settings.borderRadius || 'xl';
        root.style.setProperty('--radius-base', radiusMap[currentRadius]);

        const speedMap = { 'slow': '500ms', 'normal': '300ms', 'fast': '150ms' };
        root.style.setProperty('--transition-speed', speedMap[settings.animationSpeed || 'normal']);

        const fontMap = {
            'sans': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            'serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
            'mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            'cairo': '"Cairo", sans-serif',
            'inter': '"Inter", sans-serif'
        };
        root.style.setProperty('--font-primary', fontMap[settings.fontStyle || 'sans']);

        const styleId = 'dynamic-theme-styles';
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }

        let extraCSS = '';
        if (currentRadius === 'glass') {
            extraCSS = `
                .bg-white, .dark .bg-slate-900, .bg-slate-900, .bg-gray-50, .bg-slate-50, .dark .bg-slate-950 {
                   background-color: ${isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)'} !important;
                   backdrop-filter: blur(12px) !important;
                   -webkit-backdrop-filter: blur(12px) !important;
                   border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'} !important;
                }
                .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl {
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
                }
            `;
        } else if (currentRadius === 'prominent') {
            extraCSS = `
                .rounded-3xl, .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded-sm, .rounded {
                    border: 2px solid ${isDarkMode ? '#334155' : '#e2e8f0'} !important;
                    box-shadow: 4px 4px 0px 0px ${isDarkMode ? '#1e293b' : '#cbd5e1'} !important;
                }
                button:active {
                    transform: translate(2px, 2px) !important;
                    box-shadow: 2px 2px 0px 0px ${isDarkMode ? '#1e293b' : '#cbd5e1'} !important;
                }
            `;
        }

        const iconCSS = getIconStyleCSS(settings.iconStyle);

        styleTag.innerHTML = `
            :root {
                --radius-base: ${radiusMap[currentRadius]};
                --transition-speed: ${speedMap[settings.animationSpeed || 'normal']};
            }
            body {
                font-family: var(--font-primary) !important;
            }
            .rounded-3xl, .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded-sm, .rounded {
                border-radius: var(--radius-base) !important;
            }
            .transition-all, .transition-colors, .transition-opacity, .transition-transform {
                transition-duration: var(--transition-speed) !important;
            }
            
            /* GLOBAL ICON STYLES */
            .lucide, .icon-wrapper svg {
                ${iconCSS}
                transition: all var(--transition-speed) ease-in-out;
            }

            ${extraCSS}
        `;

        if (settings.fontStyle === 'cairo' || settings.fontStyle === 'inter' || !settings.fontStyle) {
            const fontLinkId = 'dynamic-fonts';
            if (!document.getElementById(fontLinkId)) {
                const link = document.createElement('link');
                link.id = fontLinkId;
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Inter:wght@300;400;600;700;900&display=swap';
                document.head.appendChild(link);
            }
        }

    }, [settings, isDarkMode]);

    // ═══════════════════════════════════════════════════════════════
    // AUTHENTICATION LOGIC (API-backed)
    // ═══════════════════════════════════════════════════════════════

    const handleDeanLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            await api.deanLogin(loginInput);
            setIsDeanLoggedIn(true);
            setCurrentPage('dean-dashboard');
        } catch (err: any) {
            setLoginError(lang === 'ar' ? 'مفتاح العميد غير صحيح.' : (err.message || 'Invalid Master Key.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecoverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            if (recoveryMode === 'question') {
                const result = await api.verifySecurityAnswer(recoveryInput);
                if (result.success) {
                    setResetToken(result.resetToken);
                    setRecoveryMode('reset');
                }
            } else if (recoveryMode === 'backup') {
                const result = await api.verifyBackupCode(recoveryInput);
                if (result.success) {
                    setResetToken(result.resetToken);
                    setRecoveryMode('reset');
                }
            } else if (recoveryMode === 'reset') {
                if (recoveryInput.length < 8) {
                    setLoginError(lang === 'ar' ? 'الرمز قصير جداً' : 'Key too short');
                    setIsLoading(false);
                    return;
                }
                await api.resetMasterKey(resetToken, recoveryInput);
                alert(lang === 'ar' ? 'تم تغيير الرمز بنجاح! قم بتسجيل الدخول الآن.' : 'Key changed successfully! Login now.');
                setRecoveryMode('none');
                setLoginInput('');
                setRecoveryInput('');
            }
        } catch (err: any) {
            setLoginError(err.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            // Try admin login first
            const result = await api.adminLogin(loginInput);
            setIsLoggedIn(true);
            setCurrentPage('admin');
        } catch (adminErr: any) {
            // If admin login fails, try Dean login as fallback
            try {
                await api.deanLogin(loginInput);
                setIsDeanLoggedIn(true);
                setCurrentPage('dean-dashboard');
            } catch (deanErr: any) {
                // Both failed
                setLoginError(lang === 'ar' ? 'مفتاح الدخول غير صالح. تأكد من صحة الرمز.' : 'Invalid key. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        if (isDeanLoggedIn) {
            await api.deanLogout();
        }
        if (isLoggedIn) {
            await api.adminLogout();
        }
        setIsLoggedIn(false);
        setIsDeanLoggedIn(false);
        setCurrentPage('home');
        setCurrentSessionId(null);
    };

    // Start recovery flow
    const startRecovery = async (mode: 'question' | 'backup') => {
        setRecoveryMode(mode);
        setLoginError('');
        setRecoveryInput('');
        if (mode === 'question') {
            try {
                const result = await api.getSecurityQuestion();
                setSecurityQuestion(result.question);
            } catch {
                setSecurityQuestion(lang === 'ar' ? 'سؤال الأمان' : 'Security Question');
            }
        }
    };

    // QR Scanner
    useEffect(() => {
        let html5QrcodeScanner: any;
        if (isScanning && (window as any).Html5QrcodeScanner) {
            const onScanSuccess = (decodedText: string) => {
                setLoginInput(decodedText);
                setIsScanning(false);
            };

            html5QrcodeScanner = new (window as any).Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            html5QrcodeScanner.render(onScanSuccess, (err: any) => console.log(err));
        }

        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch((error: any) => console.error("Failed to clear html5QrcodeScanner. ", error));
            }
        };
    }, [isScanning]);


    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <Home lang={lang} news={news} setNews={setNews} setPage={setCurrentPage} settings={settings} />;
            case 'about':
                return <About lang={lang} settings={settings} timeline={timeline} />;
            case 'contact':
                return <Contact lang={lang} settings={settings} />;
            case 'events':
                return <Events lang={lang} events={events} />;
            case 'team':
                return <Team lang={lang} members={members} />;

            case 'dean-dashboard':
                return isDeanLoggedIn ? (
                    <DeanDashboard
                        lang={lang}
                        onLogout={handleLogout}
                        state={{ accessKeys, setAccessKeys, sessions, setSessions }}
                        security={{ config: deanConfig, updateConfig: updateDeanConfig }}
                    />
                ) : <div className="p-10 text-center dark:text-white">Unauthorized</div>;

            case 'admin':
                return isLoggedIn ? (
                    <Admin
                        lang={lang}
                        onLogout={handleLogout}
                        onGoHome={() => setCurrentPage('home')}
                        onRefresh={loadDataFromAPI}
                        state={{ events, setEvents, members, setMembers, news, setNews, settings, setSettings, timeline, setTimeline }}
                    />
                ) : (
                    <div className="dark:text-white">Access Denied</div>
                );

            case 'login':
                return (
                    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-500">
                        <button
                            onClick={() => setCurrentPage('home')}
                            className="absolute top-6 right-6 md:top-10 md:right-10 p-3 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-black/40 transition-all z-50 shadow-sm"
                        >
                            <X size={24} />
                        </button>

                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                            <div className="absolute top-10 left-10 w-64 h-64 bg-brand-500 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary-500 rounded-full blur-3xl"></div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 w-full max-w-md relative z-10 animate-slide-up transition-colors duration-500">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-brand-50 dark:bg-slate-700 rounded-full text-brand-600 dark:text-brand-400">
                                    <Lock size={32} />
                                </div>
                            </div>

                            <h2 className={`text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white ${lang === 'ar' ? 'font-arabic' : ''}`}>
                                {lang === 'ar' ? 'بوابة الدخول الآمن' : 'Secure Login Portal'}
                            </h2>
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
                                {lang === 'ar' ? 'يرجى إدخال مفتاح الوصول الخاص بك' : 'Please enter your generated access token'}
                            </p>

                            {isScanning ? (
                                <div className="mb-6">
                                    <div id="reader" className="w-full"></div>
                                    <button onClick={() => setIsScanning(false)} className="w-full mt-2 text-red-500 text-sm hover:underline">{lang === 'ar' ? 'إلغاء المسح' : 'Cancel Scan'}</button>
                                </div>
                            ) : (
                                <form onSubmit={handleAdminLogin} className="space-y-4">
                                    <div className="relative">
                                        <ScanLine className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={loginInput}
                                            onChange={(e) => setLoginInput(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                            placeholder="CSA-PRES-..."
                                        />
                                    </div>
                                    {loginError && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                            <AlertCircle size={16} />
                                            {loginError}
                                        </div>
                                    )}
                                    <button type="submit" disabled={isLoading} className="w-full font-bold py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60" style={{ backgroundColor: settings.primaryColor, color: 'var(--primary-contrast)' }}>
                                        {isLoading ? (lang === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (lang === 'ar' ? 'دخول النظام' : 'Access System')}
                                    </button>

                                    <button type="button" onClick={() => setIsScanning(true)} className="w-full font-bold py-3.5 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                        <QrCode size={18} /> {lang === 'ar' ? 'مسح رمز QR' : 'Scan QR Code'}
                                    </button>
                                </form>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
                                <button
                                    onClick={() => { setLoginInput(''); setLoginError(''); setCurrentPage('dean-login'); }}
                                    className="text-xs font-bold text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                                >
                                    <ShieldCheck size={14} /> {lang === 'ar' ? 'بوابة العميد' : 'Dean Portal'}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'dean-login':
                return (
                    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-900 relative">
                        <button
                            onClick={() => { setCurrentPage('home'); setRecoveryMode('none'); }}
                            className="absolute top-6 right-6 md:top-10 md:right-10 p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-50 shadow-sm"
                        >
                            <X size={24} />
                        </button>

                        <div className="bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg animate-fade-in">
                            {recoveryMode === 'none' ? (
                                <>
                                    <div className="flex justify-center mb-6">
                                        <div className="p-4 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20">
                                            <ShieldCheck size={40} />
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold text-center mb-2 text-white">
                                        {lang === 'ar' ? 'تصريح العميد' : 'Dean Authorization'}
                                    </h2>
                                    <p className="text-center text-slate-400 text-sm mb-8">
                                        {lang === 'ar' ? 'أدخل الرمز السري الخاص بالعميد' : 'Enter the Master Control Key'}
                                    </p>

                                    <form onSubmit={handleDeanLogin} className="space-y-6">
                                        <div>
                                            {/* Dummy hidden field to trick browser autofill */}
                                            <input type="password" style={{ display: 'none' }} />
                                            <input
                                                type="password"
                                                name={`dean-key-${Math.random().toString(36).slice(2)}`}
                                                value={loginInput}
                                                onChange={(e) => setLoginInput(e.target.value)}
                                                autoComplete="off"
                                                readOnly={isReadOnly}
                                                onFocus={() => setIsReadOnly(false)}
                                                autoFocus
                                                className="w-full p-4 bg-slate-900 border border-slate-700 text-amber-400 font-mono text-sm rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest"
                                                placeholder="****************"
                                            />
                                        </div>
                                        {loginError && (
                                            <p className="text-red-400 text-sm text-center font-bold">
                                                {loginError}
                                            </p>
                                        )}
                                        <button type="submit" disabled={isLoading} className="w-full text-slate-900 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors bg-amber-500 disabled:opacity-60">
                                            {isLoading ? (lang === 'ar' ? 'جاري المصادقة...' : 'Authenticating...') : (lang === 'ar' ? 'المصادقة والدخول' : 'Authenticate & Enter')}
                                        </button>
                                    </form>
                                    <div className="mt-4 flex justify-between text-sm">
                                        <button onClick={() => setCurrentPage('home')} className="text-slate-600 hover:text-slate-400">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                                        <button onClick={() => startRecovery('question')} className="text-amber-600 hover:text-amber-500">{lang === 'ar' ? 'فقدت الرمز؟' : 'Lost Key?'}</button>
                                    </div>
                                </>
                            ) : (
                                // RECOVERY FLOW
                                <>
                                    <div className="flex justify-center mb-6">
                                        <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-500 border border-indigo-500/20">
                                            {recoveryMode === 'reset' ? <RefreshCw size={32} /> : <HelpCircle size={32} />}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-center mb-2 text-white">
                                        {recoveryMode === 'question' ? (lang === 'ar' ? 'استعادة الأمان' : 'Security Recovery') :
                                            recoveryMode === 'backup' ? (lang === 'ar' ? 'الرمز الاحتياطي' : 'Backup Code') :
                                                (lang === 'ar' ? 'تعيين رمز جديد' : 'Set New Key')}
                                    </h2>

                                    <p className="text-center text-slate-400 text-sm mb-6">
                                        {recoveryMode === 'question' ? (securityQuestion || (lang === 'ar' ? 'سؤال الأمان' : 'Answer your security question')) :
                                            recoveryMode === 'backup' ? (lang === 'ar' ? 'أدخل الرمز الاحتياطي للطوارئ' : 'Enter emergency backup code') :
                                                (lang === 'ar' ? 'أدخل الرمز الجديد للدخول' : 'Enter your new master key')}
                                    </p>

                                    <form onSubmit={handleRecoverySubmit} className="space-y-6">
                                        <input
                                            type={recoveryMode === 'reset' ? 'text' : 'password'}
                                            value={recoveryInput}
                                            onChange={(e) => setRecoveryInput(e.target.value)}
                                            className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder={recoveryMode === 'question' ? (lang === 'ar' ? 'الإجابة...' : 'Answer...') : '...'}
                                        />
                                        {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}

                                        <button type="submit" disabled={isLoading} className="w-full text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-colors bg-indigo-700 disabled:opacity-60">
                                            {isLoading ? '...' : (recoveryMode === 'reset' ? (lang === 'ar' ? 'حفظ الرمز' : 'Save Key') : (lang === 'ar' ? 'تحقق' : 'Verify'))}
                                        </button>
                                    </form>

                                    <div className="mt-4 text-center">
                                        {recoveryMode === 'question' && (
                                            <button onClick={() => startRecovery('backup')} className="text-xs text-indigo-400 hover:text-indigo-300">
                                                {lang === 'ar' ? 'استخدام الرمز الاحتياطي بدلاً من ذلك' : 'Use Backup Code instead'}
                                            </button>
                                        )}
                                        <button onClick={() => { setRecoveryMode('none'); setLoginError(''); }} className="block w-full mt-4 text-sm text-slate-600 hover:text-slate-400">
                                            {lang === 'ar' ? 'عودة' : 'Back'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );

            default:
                return <Home lang={lang} news={news} setNews={setNews} setPage={setCurrentPage} settings={settings} />;
        }
    };

    // Helper to get RGB from hex for CSS vars
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '0, 0, 0';
    };

    return (
        <div
            className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 ${lang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            style={{
                '--primary-color': settings.primaryColor,
                '--primary-rgb': hexToRgb(settings.primaryColor),
                '--secondary-color': settings.secondaryColor,
                '--secondary-rgb': hexToRgb(settings.secondaryColor),
            } as React.CSSProperties}
        >
            {/* Global Pattern Overlay */}
            {currentPage !== 'login' && currentPage !== 'dean-login' && currentPage !== 'dean-dashboard' && settings.backgroundPattern && settings.backgroundPattern !== 'none' && (
                <div
                    className="fixed inset-0 z-0 pointer-events-none opacity-100 transition-all duration-700"
                    style={getPatternStyle(settings.backgroundPattern, isDarkMode)}
                />
            )}

            {currentPage !== 'login' && currentPage !== 'dean-login' && currentPage !== 'dean-dashboard' && currentPage !== 'admin' && (
                <Navbar
                    lang={lang}
                    setLang={setLang}
                    currentPage={currentPage}
                    setPage={setCurrentPage}
                    isLoggedIn={isLoggedIn}
                    settings={settings}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                />
            )}
            <main className="flex-grow">
                {renderPage()}
            </main>

            {currentPage !== 'login' && currentPage !== 'dean-login' && currentPage !== 'dean-dashboard' && currentPage !== 'admin' && (
                <Footer lang={lang} onNavigate={setCurrentPage} />
            )}
        </div>
    );
};

export default App;
