import React, { useState } from 'react';
import { api } from '../services/api';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { saveSettings } from '../services/settingsService';

interface AuthProps {
    onLogin: (user: any) => void;
    onAdminLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onAdminLogin }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'login') {
                const data = await api.auth.login(email, password);
                localStorage.setItem('token', data.token);
                // Load user settings
                await saveSettings(data.user.settings || {}); // Sync settings if any
                onLogin(data.user);
            } else {
                const data = await api.auth.register(email, password);
                setSuccess('Registration successful! Please login.');
                setMode('login');
                setEmail('');
                setPassword('');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-fade-in relative z-10">
                {/* Header */}
                <div className="bg-brand-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
                            <User className="text-brand-600 w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{mode === 'login' ? 'Welcome Back' : 'Join Community'}</h2>
                        <p className="text-brand-100 mt-2 text-sm font-medium">Computer Science Association Portal</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 dark:border-red-900/30">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-green-100 dark:border-green-900/30">
                            <CheckCircle2 size={18} />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium"
                                    placeholder="student@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-lg shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="mt-8 text-center flex flex-col gap-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
                                className="ml-2 font-bold text-brand-600 hover:underline"
                            >
                                {mode === 'login' ? 'Register Now' : 'Login Here'}
                            </button>
                        </p>

                        <button
                            onClick={onAdminLogin}
                            className="text-xs font-bold text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                            <Lock size={12} />
                            Admin Access
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
