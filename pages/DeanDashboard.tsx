import React, { useState, useEffect } from 'react';
import { Shield, Key, RefreshCw, Smartphone, QrCode, LogOut, CheckCircle, AlertTriangle, Copy, X, AlertOctagon, Laptop, Lock, HelpCircle, Save, Eye, EyeOff, FileKey, Download, Share2, Facebook, Twitter, Linkedin, MessageCircle, Mail, Send, Link } from 'lucide-react';
import { Language, AdminRole, AccessKey, ActiveSession, DeanSecurityConfig } from '../types';
import { api } from '../services/api';

interface DeanDashboardProps {
    lang: Language;
    onLogout: () => void;
    state: {
        accessKeys: AccessKey[];
        setAccessKeys: React.Dispatch<React.SetStateAction<AccessKey[]>>;
        sessions: ActiveSession[];
        setSessions: React.Dispatch<React.SetStateAction<ActiveSession[]>>;
    };
    security: {
        config: DeanSecurityConfig;
        updateConfig: (c: DeanSecurityConfig) => void;
    }
}

// --- SHARE MODAL COMPONENT ---
const ShareModal = ({ isOpen, onClose, content, isRtl }: { isOpen: boolean, onClose: () => void, content: string, isRtl: boolean }) => {
    if (!isOpen) return null;

    const platforms = [
        { name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]' },
        { name: 'Email', icon: Mail, color: 'bg-gray-600' },
        { name: 'Telegram', icon: Send, color: 'bg-[#0088cc]' },
        { name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]' },
        { name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0077B5]' },
        { name: 'Twitter', icon: Twitter, color: 'bg-black' },
    ];

    const copyContent = () => {
        navigator.clipboard.writeText(content);
        alert(isRtl ? 'تم النسخ!' : 'Copied!');
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-lg rounded-3xl p-6 md:p-8 relative shadow-2xl animate-slide-up border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{isRtl ? 'مشاركة المفتاح' : 'Share Access Key'}</h3>
                    <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                        <X size={20} className="text-slate-300" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {platforms.map((p, idx) => (
                        <button key={idx} className="flex flex-col items-center gap-2 group" onClick={() => copyContent()}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform ${p.color}`}>
                                <p.icon size={24} />
                            </div>
                            <span className="text-xs font-medium text-slate-400">{p.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <Key size={18} className="text-slate-400 ml-2" />
                    <input readOnly value={content} className="flex-grow bg-transparent text-sm text-slate-300 outline-none font-mono" />
                    <button onClick={copyContent} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                        {isRtl ? 'نسخ' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeanDashboard: React.FC<DeanDashboardProps> = ({ lang, onLogout, state, security }) => {
    const isRtl = lang === 'ar';
    const [activeTab, setActiveTab] = useState<'generate' | 'sessions' | 'security'>('generate');
    const [selectedRole, setSelectedRole] = useState<AdminRole>('President');
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Security Form State
    const [currentKeyInput, setCurrentKeyInput] = useState('');
    const [newKeyInput, setNewKeyInput] = useState('');
    const [newQuestion, setNewQuestion] = useState(security.config.securityQuestion);
    const [newAnswer, setNewAnswer] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [securityMessage, setSecurityMessage] = useState({ text: '', type: '' });

    // Share Modal State
    const [shareModalOpen, setShareModalOpen] = useState(false);

    // Modal State
    const [revokeModalOpen, setRevokeModalOpen] = useState(false);
    const [sessionToRevoke, setSessionToRevoke] = useState<ActiveSession | null>(null);

    // Load existing keys and sessions from API on mount
    useEffect(() => {
        api.dean.getAccessKeys()
            .then(keys => state.setAccessKeys(keys))
            .catch(err => console.error('Failed to load access keys:', err));

        api.dean.getSessions()
            .then(data => {
                // Map sessions to the format the UI expects
                const allSessions: ActiveSession[] = [
                    ...data.adminSessions.map((s: any) => ({
                        sessionId: s.id,
                        tokenUsed: s.accessKeyToken || '',
                        role: s.role || 'Admin',
                        deviceInfo: s.deviceInfo || 'Unknown',
                        ipAddress: s.ipAddress || '',
                        loginTime: new Date(s.createdAt).toLocaleString(),
                        isActive: s.isActive,
                    })),
                ];
                state.setSessions(allSessions);
            })
            .catch(err => console.error('Failed to load sessions:', err));
    }, []);

    const generateKey = async () => {
        setIsGenerating(true);
        try {
            const newKey = await api.dean.createAccessKey(selectedRole, 1); // 1 day expiry

            const mappedKey: AccessKey = {
                token: newKey.token,
                role: newKey.role as AdminRole,
                generatedAt: new Date(newKey.createdAt).toLocaleString(),
                expiresAt: new Date(newKey.expiresAt).toLocaleString(),
                isUsed: newKey.isUsed,
                generatedBy: 'Dean',
            };

            state.setAccessKeys([mappedKey, ...state.accessKeys]);
            setGeneratedToken(newKey.token);
        } catch (err: any) {
            alert(isRtl ? 'فشل في توليد المفتاح: ' + err.message : 'Failed to generate key: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadQR = async () => {
        if (!generatedToken) return;
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(generatedToken)}`;
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `csa-access-qr-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error(e);
            window.open(url, '_blank');
        }
    };

    const shareQR = async () => {
        if (!generatedToken) return;
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(generatedToken)}`;

        // Try Native Sharing First (Mobile/Tablet)
        if (navigator.share) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const file = new File([blob], 'access-key.png', { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'CSA Access Key',
                        text: `Access Token for ${selectedRole}`,
                        files: [file]
                    });
                    return;
                }
            } catch (e) {
                console.log('Native file share failed, falling back to text share or modal', e);
            }
        }

        // Fallback to Modal
        setShareModalOpen(true);
    };

    const handleRevokeClick = (session: ActiveSession) => {
        setSessionToRevoke(session);
        setRevokeModalOpen(true);
    };

    const confirmRevoke = async () => {
        if (sessionToRevoke) {
            try {
                await api.dean.revokeSession(sessionToRevoke.sessionId, 'admin');
                state.setSessions(state.sessions.map(s => s.sessionId === sessionToRevoke.sessionId ? { ...s, isActive: false } : s));
            } catch (err: any) {
                console.error('Failed to revoke session:', err);
            }
            setRevokeModalOpen(false);
            setSessionToRevoke(null);
        }
    };

    const copyToClipboard = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            alert(isRtl ? 'تم النسخ' : 'Copied');
        }
    };

    const handleSecurityUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const updateData: any = {};
        let changed = false;

        if (newKeyInput) {
            if (newKeyInput.length < 8) {
                setSecurityMessage({ text: isRtl ? 'الرمز الجديد قصير جداً' : 'New Key too short', type: 'error' });
                return;
            }
            updateData.newMasterKey = newKeyInput;
            changed = true;
        }

        if (newAnswer) {
            updateData.securityQuestion = newQuestion;
            updateData.securityAnswer = newAnswer;
            changed = true;
        }

        if (!changed) {
            setSecurityMessage({ text: isRtl ? 'لم يتم إجراء تغييرات' : 'No changes made', type: 'info' });
            return;
        }

        try {
            await api.dean.updateConfig(updateData);
            setSecurityMessage({ text: isRtl ? 'تم تحديث الإعدادات بنجاح' : 'Settings Updated Successfully', type: 'success' });
            setNewKeyInput('');
            setNewAnswer('');
            setCurrentKeyInput('');
        } catch (err: any) {
            setSecurityMessage({ text: isRtl ? 'فشل التحديث: ' + err.message : 'Update failed: ' + err.message, type: 'error' });
        }
    };

    const generateBackupCode = async () => {
        const code = 'CSA-BACKUP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        try {
            await api.dean.updateConfig({ backupCode: code });
            security.updateConfig({ ...security.config, backupCode: code });
            alert(isRtl ? 'تم توليد رمز احتياطي جديد' : 'New Backup Code Generated');
        } catch (err: any) {
            alert(isRtl ? 'فشل: ' + err.message : 'Failed: ' + err.message);
        }
    };

    return (
        <div className={`min-h-screen bg-slate-900 text-slate-100 ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'} pb-24 overflow-y-auto`}>

            {/* Share Modal */}
            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                content={generatedToken || ''}
                isRtl={isRtl}
            />

            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="bg-amber-500 p-3 rounded-xl text-slate-900 shadow-lg shadow-amber-500/20">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{isRtl ? 'بوابة العميد الآمنة' : 'Dean Security Portal'}</h1>
                        <p className="text-slate-400 text-sm">{isRtl ? 'لوحة التحكم بصلاحيات الوصول' : 'Access Control Authority Dashboard'}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                >
                    <LogOut size={18} /> {isRtl ? 'إنهاء الجلسة الآمنة' : 'Terminate Secure Session'}
                </button>
            </div>

            <div className="max-w-7xl mx-auto p-6 md:p-8">

                {/* Navigation */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Key size={20} /> {isRtl ? 'توليد مفاتيح الدخول' : 'Generate Access Keys'}
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'sessions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Smartphone size={20} /> {isRtl ? 'الأجهزة المتصلة' : 'Active Sessions'}
                        <span className="bg-slate-900 px-2 py-0.5 rounded-full text-xs border border-slate-700">{state.sessions.filter(s => s.isActive).length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Lock size={20} /> {isRtl ? 'إعدادات الأمان' : 'Security Settings'}
                    </button>
                </div>

                {/* --- GENERATE TAB --- */}
                {activeTab === 'generate' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        {/* Generator Form */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
                                <RefreshCw size={24} /> {isRtl ? 'إصدار مفتاح جديد' : 'Issue New Key'}
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">{isRtl ? 'الدور الوظيفي' : 'Target Role'}</label>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl p-4 outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        <option value="President">{isRtl ? 'رئيس الجمعية' : 'President'}</option>
                                        <option value="Vice President">{isRtl ? 'نائب الرئيس' : 'Vice President'}</option>
                                        <option value="General Secretary">{isRtl ? 'الأمين العام' : 'General Secretary'}</option>
                                        <option value="Media Head">{isRtl ? 'رئيس المكتب الإعلامي' : 'Media Head'}</option>
                                    </select>
                                </div>

                                <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl flex gap-3">
                                    <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
                                    <p className="text-sm text-amber-200/80">
                                        {isRtl
                                            ? 'تنبيه: هذا المفتاح صالح للاستخدام مرة واحدة فقط، وسيتم ربطه بالجهاز الذي يستخدمه لأول مرة. في حال فقدانه يجب توليد مفتاح جديد.'
                                            : 'Warning: This key is for one-time use only and will be locked to the first device that uses it. If lost, a new key must be generated.'}
                                    </p>
                                </div>

                                <button
                                    onClick={generateKey}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform"
                                >
                                    {isRtl ? 'توليد المفتاح ورمز QR' : 'Generate Key & QR Code'}
                                </button>
                            </div>
                        </div>

                        {/* Result Display */}
                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            {generatedToken ? (
                                <div className="w-full max-w-md space-y-6 animate-slide-up">
                                    <div className="bg-white p-4 rounded-xl inline-block mx-auto shadow-xl">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedToken)}`}
                                            alt="Access QR"
                                            className="w-48 h-48 object-contain mix-blend-multiply"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest">{isRtl ? 'مفتاح الوصول الرقمي' : 'Digital Access Token'}</p>
                                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 font-mono text-indigo-400 break-all relative group cursor-pointer" onClick={() => copyToClipboard(generatedToken)}>
                                            {generatedToken}
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Copy size={20} className="text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 justify-center">
                                        <button onClick={downloadQR} className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                            <Download size={18} /> {isRtl ? 'تنزيل' : 'Download'}
                                        </button>
                                        <button onClick={shareQR} className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20">
                                            <Share2 size={18} /> {isRtl ? 'مشاركة' : 'Share'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                                        <CheckCircle size={16} />
                                        <span>{isRtl ? 'تم التوليد بنجاح - صالح لمدة 24 ساعة' : 'Generated Successfully - Valid for 24h'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-600">
                                    <QrCode size={64} className="mx-auto mb-4 opacity-20" />
                                    <p>{isRtl ? 'قم بتوليد مفتاح لظهور الرمز' : 'Generate a key to see the QR code'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- SESSIONS TAB --- */}
                {activeTab === 'sessions' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold tracking-wider">
                                    <tr>
                                        <th className="p-6 text-left">{isRtl ? 'المستخدم (الدور)' : 'User Role'}</th>
                                        <th className="p-6">{isRtl ? 'الجهاز / المتصفح' : 'Device Info'}</th>
                                        <th className="p-6">{isRtl ? 'وقت الدخول' : 'Login Time'}</th>
                                        <th className="p-6 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                                        <th className="p-6 text-right">{isRtl ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {state.sessions.length > 0 ? state.sessions.map(session => (
                                        <tr key={session.sessionId} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="p-6 font-bold text-white">
                                                {session.role}
                                                <div className="text-xs text-slate-500 font-mono mt-1">{session.tokenUsed.substring(0, 15)}...</div>
                                            </td>
                                            <td className="p-6 text-slate-300 text-sm">
                                                {session.deviceInfo}
                                            </td>
                                            <td className="p-6 text-slate-400 text-sm">
                                                {session.loginTime}
                                            </td>
                                            <td className="p-6 text-center">
                                                {session.isActive ? (
                                                    <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                                                        Revoked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                {session.isActive && (
                                                    <button
                                                        onClick={() => handleRevokeClick(session)}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        {isRtl ? 'سحب الصلاحية' : 'Revoke Access'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-500">
                                                {isRtl ? 'لا توجد جلسات نشطة حالياً' : 'No active sessions monitored.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- SECURITY SETTINGS TAB --- */}
                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        {/* Change Credentials Form */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
                                <Lock size={24} /> {isRtl ? 'تغيير بيانات الدخول' : 'Update Credentials'}
                            </h2>

                            <form onSubmit={handleSecurityUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">{isRtl ? 'الرمز الحالي (للتحقق)' : 'Current Key (Required)'}</label>
                                    <div className="relative">
                                        <input
                                            type={showKey ? "text" : "password"}
                                            value={currentKeyInput}
                                            onChange={(e) => setCurrentKeyInput(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl p-4 outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="Enter current master key..."
                                        />
                                        <button type="button" onClick={() => setShowKey(!showKey)} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-500 hover:text-white">
                                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-slate-700 pt-6">
                                    <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">{isRtl ? 'الرمز الجديد (اختياري)' : 'New Master Key (Optional)'}</label>
                                    <input
                                        type="text"
                                        value={newKeyInput}
                                        onChange={(e) => setNewKeyInput(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl p-4 outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="Leave empty to keep current"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">{isRtl ? 'سؤال الأمان' : 'Security Question'}</label>
                                        <select
                                            value={newQuestion}
                                            onChange={(e) => setNewQuestion(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl p-4 outline-none focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="What is the default year?">What is the default year?</option>
                                            <option value="What is your childhood nickname?">What is your childhood nickname?</option>
                                            <option value="What is the name of your first pet?">What is the name of your first pet?</option>
                                            <option value="Where were you born?">Where were you born?</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">{isRtl ? 'إجابة الأمان' : 'Security Answer'}</label>
                                        <input
                                            type="text"
                                            value={newAnswer}
                                            onChange={(e) => setNewAnswer(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl p-4 outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="Set new answer..."
                                        />
                                    </div>
                                </div>

                                {securityMessage.text && (
                                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${securityMessage.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {securityMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                                        {securityMessage.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} /> {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
                                </button>
                            </form>
                        </div>

                        {/* Backup & Info */}
                        <div className="space-y-8">
                            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
                                    <FileKey size={24} /> {isRtl ? 'خيارات الاسترداد' : 'Recovery Options'}
                                </h2>

                                <div className="p-6 bg-slate-950 rounded-xl border border-dashed border-slate-600 text-center mb-6">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">{isRtl ? 'الرمز الاحتياطي الحالي' : 'Current Backup Code'}</p>
                                    <p className="font-mono text-2xl text-white tracking-wider mb-4 select-all">{security.config.backupCode}</p>
                                    <button onClick={() => copyToClipboard(security.config.backupCode)} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center justify-center gap-1 mx-auto">
                                        <Copy size={14} /> {isRtl ? 'نسخ' : 'Copy'}
                                    </button>
                                </div>

                                <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl flex gap-3 mb-6">
                                    <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
                                    <p className="text-sm text-amber-200/80">
                                        {isRtl
                                            ? 'احتفظ بهذا الرمز في مكان آمن خارج النظام. سيسمح لك باستعادة الحساب في حال فقدان كلمة المرور الرئيسية.'
                                            : 'Keep this code safe outside the system. It allows you to recover the account if the master key is lost.'}
                                    </p>
                                </div>

                                <button onClick={generateBackupCode} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors">
                                    {isRtl ? 'توليد رمز احتياطي جديد' : 'Generate New Backup Code'}
                                </button>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                                <p className="text-slate-500 text-sm">
                                    {isRtl ? 'آخر تغيير:' : 'Last Credentials Change:'} <span className="text-white font-mono">{security.config.lastChanged}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONFIRMATION MODAL --- */}
                {revokeModalOpen && sessionToRevoke && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>

                            <div className="p-6">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-500/20">
                                    <AlertOctagon size={32} className="text-red-500" />
                                </div>

                                <h3 className="text-xl font-bold text-center text-white mb-2">
                                    {isRtl ? 'تأكيد سحب الصلاحية' : 'Confirm Session Revocation'}
                                </h3>
                                <p className="text-center text-slate-400 text-sm mb-6">
                                    {isRtl
                                        ? 'هل أنت متأكد من رغبتك في طرد هذا المستخدم؟ سيتم إنهاء جلسته فوراً.'
                                        : 'Are you sure you want to forcibly log out this user? This action cannot be undone.'}
                                </p>

                                <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500 font-bold uppercase">{isRtl ? 'الدور' : 'Role'}</span>
                                        <span className="text-sm font-bold text-white">{sessionToRevoke.role}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500 font-bold uppercase">{isRtl ? 'الجهاز' : 'Device'}</span>
                                        <span className="text-sm text-slate-300 flex items-center gap-1">
                                            <Laptop size={12} /> {sessionToRevoke.deviceInfo.split('(')[0].substring(0, 15)}...
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setRevokeModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                                    >
                                        {isRtl ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button
                                        onClick={confirmRevoke}
                                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        {isRtl ? 'تأكيد الطرد' : 'Revoke Access'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DeanDashboard;
