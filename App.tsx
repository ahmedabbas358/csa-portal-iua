
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import DeanDashboard from './pages/DeanDashboard';
import { Language, AppState, AccessKey, ActiveSession, DeanSecurityConfig } from './types';
import { INITIAL_STATE, DEAN_MASTER_KEY } from './constants';
import { Lock, ShieldCheck, AlertCircle, ScanLine, X, QrCode, KeyRound, HelpCircle, RefreshCw } from 'lucide-react';
import Footer from './components/Footer';
import { BackgroundPattern } from './types';

// --- PATTERN HELPER ---
const getPatternStyle = (pattern?: BackgroundPattern, isDark?: boolean): React.CSSProperties => {
    const color = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    switch (pattern) {
        case 'dots': return { backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '24px 24px' };
        case 'grid': return { backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '32px 32px' };
        case 'circles': return { backgroundImage: `radial-gradient(circle, ${color} 2px, transparent 2.5px)`, backgroundSize: '24px 24px' };
        case 'lines': return { backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: '20px 20px' };
        case 'waves': return { backgroundImage: `radial-gradient(circle at 100% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent) `, backgroundSize: '40px 40px' };
        case 'hexagons': return { backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10S-10 4.477-10 10v20c0 5.523 4.477 10 10 10z' fill='${isDark ? '%23ffffff' : '%23000000'}' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")` };
        case 'cubes': return { backgroundImage: `linear-gradient(30deg, ${color} 12%, transparent 12.5%, transparent 87%, ${color} 87.5%, ${color}), linear-gradient(150deg, ${color} 12%, transparent 12.5%, transparent 87%, ${color} 87.5%, ${color}), linear-gradient(30deg, ${color} 12%, transparent 12.5%, transparent 87%, ${color} 87.5%, ${color}), linear-gradient(150deg, ${color} 12%, transparent 12.5%, transparent 87%, ${color} 87.5%, ${color}), linear-gradient(60deg, ${color} 25%, transparent 25.5%, transparent 75%, ${color} 75%, ${color}), linear-gradient(60deg, ${color} 25%, transparent 25.5%, transparent 75%, ${color} 75%, ${color})`, backgroundSize: '40px 70px', backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px' };
        case 'circuit': return { backgroundImage: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px), linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px', backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px' };
        case 'texture': return { backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${isDark ? '0.1' : '0.05'}'/%3E%3C/svg%3E")` };
        case 'topography': return { backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${isDark ? '%23ffffff' : '%23000000'}' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")` };
        case 'gradient-radial': return { backgroundImage: `radial-gradient(circle at center, ${color}, transparent 70%)` };
        case 'gradient-linear': return { backgroundImage: `linear-gradient(135deg, ${color} 0%, transparent 100%)` };
        case 'leaf': return { backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1h2v2H1V1zm4 0h2v2H5V1zm4 0h2v2H9V1zm4 0h2v2h-2V1zm4 0h2v2h-2V1zM1 5h2v2H1V5zm4 0h2v2H5V5zm4 0h2v2H9V5zm4 0h2v2h-2V5zm4 0h2v2h-2V5zM1 9h2v2H1V9zm4 0h2v2H5V9zm4 0h2v2H9V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zM1 13h2v2H1v-2zm4 0h2v2H5v-2zm4 0h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z' fill='${isDark ? '%23ffffff' : '%23000000'}' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")` }; // Using placeholder grid for leaf for simplicity in this context or replace with actual leaf SVG
        case 'diamond': return { backgroundImage: `linear-gradient(135deg, ${color} 25%, transparent 25%) -10px 0, linear-gradient(225deg, ${color} 25%, transparent 25%) -10px 0, linear-gradient(315deg, ${color} 25%, transparent 25%), linear-gradient(45deg, ${color} 25%, transparent 25%)`, backgroundSize: `20px 20px` };
        case 'zigzag': return { backgroundImage: `linear-gradient(135deg, ${color} 25%, transparent 25%) -10px 0, linear-gradient(225deg, ${color} 25%, transparent 25%) -10px 0`, backgroundSize: `20px 20px` };
        default: return {};
    }
};

const App: React.FC = () => {
    // State for content
    const [events, setEvents] = useState(INITIAL_STATE.events);
    const [members, setMembers] = useState(INITIAL_STATE.members);
    const [news, setNews] = useState(INITIAL_STATE.news);
    const [settings, setSettings] = useState(INITIAL_STATE.settings);
    const [timeline, setTimeline] = useState(INITIAL_STATE.timeline);

    // Security State
    const [accessKeys, setAccessKeys] = useState<AccessKey[]>([]);
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [deanConfig, setDeanConfig] = useState<DeanSecurityConfig>({
        masterKey: DEAN_MASTER_KEY,
        securityQuestion: 'What is the default year?',
        securityAnswer: '2010',
        backupCode: 'CSA-BACKUP-INIT-2024',
        lastChanged: new Date().toISOString()
    });

    // UI State
    const [lang, setLang] = useState<Language>('ar');
    const [currentPage, setCurrentPage] = useState('home');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Regular Admin
    const [isDeanLoggedIn, setIsDeanLoggedIn] = useState(false); // Dean
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // Login Inputs
    const [loginInput, setLoginInput] = useState(''); // Used for both password and Token
    const [loginError, setLoginError] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    // Recovery Mode State
    const [recoveryMode, setRecoveryMode] = useState<'none' | 'question' | 'backup' | 'reset'>('none');
    const [recoveryInput, setRecoveryInput] = useState('');

    // --- INITIALIZATION ---
    useEffect(() => {
        // Load Dean Config
        const storedConfig = localStorage.getItem('csa_dean_config');
        if (storedConfig) {
            try {
                setDeanConfig(JSON.parse(storedConfig));
            } catch (e) {
                console.error("Failed to parse dean config");
            }
        }

        // Load App Settings (Theme, etc.)
        const storedSettings = localStorage.getItem('csa_app_settings');
        if (storedSettings) {
            try {
                setSettings(JSON.parse(storedSettings));
            } catch (e) {
                console.error("Failed to parse app settings");
            }
        }
    }, []);

    // Persist Settings
    useEffect(() => {
        localStorage.setItem('csa_app_settings', JSON.stringify(settings));
    }, [settings]);

    // Update Dean Config Wrapper (to persist to localStorage)
    const updateDeanConfig = (newConfig: DeanSecurityConfig) => {
        setDeanConfig(newConfig);
        localStorage.setItem('csa_dean_config', JSON.stringify(newConfig));
    };

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
        setLoginError('');
        setLoginInput('');
        setIsScanning(false);
        setRecoveryMode('none');
        setRecoveryInput('');
    }, [currentPage]);

    // CONTRAST ALGORITHM & THEME APPLICATION
    useEffect(() => {
        const root = document.documentElement;

        // 1. Apply Dark Mode Class
        if (isDarkMode) {
            root.classList.add('dark');
            document.body.style.backgroundColor = '#0f172a'; // Slate 900
        } else {
            root.classList.remove('dark');
            document.body.style.backgroundColor = '#f8fafc'; // Slate 50
        }

        // 2. Set Theme Variables
        root.style.setProperty('--primary-color', settings.primaryColor);
        root.style.setProperty('--secondary-color', settings.secondaryColor);

        // 3. Contrast Algorithm
        const hex = settings.primaryColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        const contrastColor = yiq >= 128 ? '#0f172a' : '#ffffff';

        root.style.setProperty('--primary-contrast', contrastColor);

        // 4. Update Tailwind Colors Helper
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

        // 5. Border Radius & Interface Geometry
        // Handle basic radius, but also complex styles
        const radiusMap: Record<string, string> = {
            'none': '0px',
            'sm': '0.25rem',
            'md': '0.5rem',
            'lg': '0.75rem',
            'xl': '1rem',
            '2xl': '1.5rem',
            'glass': '1rem', // Glass uses large radius
            'prominent': '0.5rem' // Prominent uses medium radius
        };
        const currentRadius = settings.borderRadius || 'xl';
        root.style.setProperty('--radius-base', radiusMap[currentRadius]);

        // 6. Animation Speed
        const speedMap = {
            'slow': '500ms',
            'normal': '300ms',
            'fast': '150ms'
        };
        root.style.setProperty('--transition-speed', speedMap[settings.animationSpeed || 'normal']);

        // 7. Font Family
        const fontMap = {
            'sans': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            'serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
            'mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            'cairo': '"Cairo", sans-serif',
            'inter': '"Inter", sans-serif'
        };
        root.style.setProperty('--font-primary', fontMap[settings.fontStyle || 'sans']);

        // Inject Dynamic Styles for Radius, Transition, Glass, & Prominent Overrides
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
                .rounded-xl, .rounded-2xl, .rounded-lg, .rounded-md, .rounded-sm, .rounded {
                    border: 2px solid ${isDarkMode ? '#334155' : '#e2e8f0'} !important;
                    box-shadow: 4px 4px 0px 0px ${isDarkMode ? '#1e293b' : '#cbd5e1'} !important;
                }
                button:active {
                    transform: translate(2px, 2px) !important;
                    box-shadow: 2px 2px 0px 0px ${isDarkMode ? '#1e293b' : '#cbd5e1'} !important;
                }
            `;
        }

        styleTag.innerHTML = `
            :root {
                --radius-base: ${radiusMap[currentRadius]};
                --transition-speed: ${speedMap[settings.animationSpeed || 'normal']};
            }
            body {
                font-family: var(--font-primary) !important;
            }
            .rounded-xl, .rounded-2xl, .rounded-lg, .rounded-md, .rounded-sm, .rounded {
                border-radius: var(--radius-base) !important;
            }
            .transition-all, .transition-colors, .transition-opacity, .transition-transform {
                transition-duration: var(--transition-speed) !important;
            }
            ${extraCSS}
        `;

        // Inject Fonts
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

    // --- AUTHENTICATION LOGIC ---

    const handleDeanLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Check against Dynamic Dean Config
        if (loginInput === deanConfig.masterKey) {
            setIsDeanLoggedIn(true);
            setCurrentPage('dean-dashboard');
            setLoginError('');
        } else {
            setLoginError(lang === 'ar' ? 'مفتاح العميد غير صحيح.' : 'Invalid Master Key.');
        }
    };

    const handleRecoverySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (recoveryMode === 'question') {
            if (recoveryInput.trim().toLowerCase() === deanConfig.securityAnswer.trim().toLowerCase()) {
                setRecoveryMode('reset');
                setLoginError('');
            } else {
                setLoginError(lang === 'ar' ? 'إجابة خاطئة' : 'Incorrect Answer');
            }
        } else if (recoveryMode === 'backup') {
            if (recoveryInput.trim() === deanConfig.backupCode) {
                setRecoveryMode('reset');
                setLoginError('');
            } else {
                setLoginError(lang === 'ar' ? 'رمز احتياطي غير صحيح' : 'Invalid Backup Code');
            }
        } else if (recoveryMode === 'reset') {
            // Setting new key
            if (recoveryInput.length < 8) {
                setLoginError(lang === 'ar' ? 'الرمز قصير جداً' : 'Key too short');
                return;
            }
            updateDeanConfig({ ...deanConfig, masterKey: recoveryInput });
            alert(lang === 'ar' ? 'تم تغيير الرمز بنجاح! قم بتسجيل الدخول الآن.' : 'Key changed successfully! Login now.');
            setRecoveryMode('none');
            setLoginInput('');
            setRecoveryInput('');
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const validKeyIndex = accessKeys.findIndex(k => k.token === loginInput && !k.isUsed);
        const validKey = accessKeys[validKeyIndex];

        if (validKey) {
            const updatedKeys = [...accessKeys];
            updatedKeys[validKeyIndex] = { ...validKey, isUsed: true };
            setAccessKeys(updatedKeys);

            const newSessionId = `sess-${Date.now()}`;
            const newSession: ActiveSession = {
                sessionId: newSessionId,
                tokenUsed: validKey.token,
                role: validKey.role,
                deviceInfo: navigator.userAgent,
                ipAddress: '192.168.1.x',
                loginTime: new Date().toLocaleString(),
                isActive: true
            };
            setSessions([newSession, ...sessions]);
            setCurrentSessionId(newSessionId);

            setIsLoggedIn(true);
            setCurrentPage('admin');
            setLoginError('');
        } else {
            if (loginInput === 'admin123') {
                setLoginError(lang === 'ar' ? 'تم تعطيل الدخول بكلمة المرور القديمة.' : 'Legacy login disabled.');
            } else {
                setLoginError(lang === 'ar' ? 'مفتاح الدخول غير صالح.' : 'Invalid access token.');
            }
        }
    };

    const handleLogout = () => {
        if (isLoggedIn && currentSessionId) {
            setSessions(sessions.map(s => s.sessionId === currentSessionId ? { ...s, isActive: false } : s));
        }
        setIsLoggedIn(false);
        setIsDeanLoggedIn(false);
        setCurrentPage('home');
        setCurrentSessionId(null);
    };

    useEffect(() => {
        if (isLoggedIn && currentSessionId) {
            const session = sessions.find(s => s.sessionId === currentSessionId);
            if (!session || !session.isActive) {
                alert(lang === 'ar' ? 'تم إنهاء جلستك من قبل العميد.' : 'Your session was revoked by the Dean.');
                handleLogout();
            }
        }
    }, [sessions, isLoggedIn, currentSessionId]);

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
                                    <button type="submit" className="w-full font-bold py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all" style={{ backgroundColor: settings.primaryColor, color: 'var(--primary-contrast)' }}>
                                        {lang === 'ar' ? 'دخول النظام' : 'Access System'}
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
                                            <input
                                                type="password"
                                                value={loginInput}
                                                onChange={(e) => setLoginInput(e.target.value)}
                                                className="w-full p-4 bg-slate-900 border border-slate-700 text-amber-400 font-mono text-sm rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest"
                                                placeholder="****************"
                                            />
                                        </div>
                                        {loginError && (
                                            <p className="text-red-400 text-sm text-center font-bold">
                                                {loginError}
                                            </p>
                                        )}
                                        <button type="submit" className="w-full text-slate-900 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors bg-amber-500">
                                            {lang === 'ar' ? 'المصادقة والدخول' : 'Authenticate & Enter'}
                                        </button>
                                    </form>
                                    <div className="mt-4 flex justify-between text-sm">
                                        <button onClick={() => setCurrentPage('home')} className="text-slate-600 hover:text-slate-400">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                                        <button onClick={() => { setRecoveryMode('question'); setLoginError(''); setRecoveryInput(''); }} className="text-amber-600 hover:text-amber-500">{lang === 'ar' ? 'فقدت الرمز؟' : 'Lost Key?'}</button>
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
                                        {recoveryMode === 'question' ? (lang === 'ar' ? deanConfig.securityQuestion : 'Answer your security question') :
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

                                        <button type="submit" className="w-full text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-colors bg-indigo-700">
                                            {recoveryMode === 'reset' ? (lang === 'ar' ? 'حفظ الرمز' : 'Save Key') : (lang === 'ar' ? 'تحقق' : 'Verify')}
                                        </button>
                                    </form>

                                    <div className="mt-4 text-center">
                                        {recoveryMode === 'question' && (
                                            <button onClick={() => { setRecoveryMode('backup'); setLoginError(''); setRecoveryInput(''); }} className="text-xs text-indigo-400 hover:text-indigo-300">
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

    return (
        <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 ${lang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Global Pattern Overlay */}
            {currentPage !== 'login' && currentPage !== 'dean-login' && currentPage !== 'dean-dashboard' && settings.backgroundPattern && settings.backgroundPattern !== 'none' && (
                <div
                    className="fixed inset-0 z-0 pointer-events-none opacity-100 transition-all duration-700 mix-blend-soft-light dark:mix-blend-overlay"
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
