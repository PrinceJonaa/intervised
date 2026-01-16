
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Sparkles, Save, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../lib/supabase/authService';
import { useToast } from '../../components/ToastSystem';
import {
    getUserAISettings,
    updateUserAISettings,
    type UserAISettings
} from '../../lib/supabase/aiService';

export const SettingsManager = () => {
    const { user, profile, refreshProfile, signOut } = useAuth();
    const { addToast } = useToast();
    const [activeSection, setActiveSection] = useState<'profile' | 'ai'>('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Profile State
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        email: '',
        avatar_url: ''
    });

    // AI Settings State
    const [aiSettings, setAiSettings] = useState<Partial<UserAISettings>>({
        provider: 'openai',
        system_prompt: '',
        temperature: 0.7,
        save_history: true
    });

    useEffect(() => {
        if (profile) {
            setProfileForm({
                full_name: profile.full_name || '',
                email: profile.email || '',
                avatar_url: profile.avatar_url || ''
            });
        }
        loadAISettings();
    }, [profile]);

    const loadAISettings = async () => {
        const settings = await getUserAISettings();
        if (settings) {
            setAiSettings(settings);
        }
    };

    const handleProfileUpdate = async () => {
        setIsLoading(true);
        try {
            await authService.updateUserProfile(user!.id, {
                full_name: profileForm.full_name,
                avatar_url: profileForm.avatar_url
            });
            await refreshProfile();
            addToast('Profile updated', 'success');
        } catch (error) {
            addToast('Failed to update profile', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAISettingsUpdate = async () => {
        setIsLoading(true);
        try {
            await updateUserAISettings(aiSettings);
            addToast('AI Configuration saved', 'success');
        } catch (error) {
            addToast('Failed to save AI config', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 flex flex-col gap-2">
                <button
                    onClick={() => setActiveSection('profile')}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeSection === 'profile'
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <User size={18} />
                    <span className="font-bold">My Profile</span>
                </button>
                <button
                    onClick={() => setActiveSection('ai')}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeSection === 'ai'
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Sparkles size={18} />
                    <span className="font-bold">AI Assistant</span>
                </button>

                <div className="mt-8 border-t border-white/10 pt-4">
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 p-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                        <LogOut size={18} />
                        <span className="font-bold">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-surface border border-white/10 rounded-2xl p-6 md:p-8">
                <AnimatePresence mode="wait">
                    {activeSection === 'profile' ? (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 max-w-2xl"
                        >
                            <h2 className="text-2xl font-display font-bold mb-6">Profile Settings</h2>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                    {profileForm.avatar_url ? (
                                        <img src={profileForm.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={profileForm.avatar_url}
                                        onChange={e => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                                        className="bg-black/50 border border-white/10 rounded-lg p-3 text-white w-full outline-none focus:border-accent"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.full_name}
                                        onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                        className="bg-black/50 border border-white/10 rounded-lg p-3 text-white w-full outline-none focus:border-accent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        disabled
                                        className="bg-black/30 border border-white/5 rounded-lg p-3 text-gray-500 w-full outline-none cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed manually.</p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={handleProfileUpdate}
                                    disabled={isLoading}
                                    className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ai"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 max-w-2xl"
                        >
                            <h2 className="text-2xl font-display font-bold mb-6">AI Configuration</h2>
                            <p className="text-gray-400 mb-6">Customize how the AI assistant interacts with you.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Default Provider</label>
                                    <select
                                        value={aiSettings.provider || 'openai'}
                                        onChange={e => setAiSettings({ ...aiSettings, provider: e.target.value as any })}
                                        className="bg-black/50 border border-white/10 rounded-lg p-3 text-white w-full outline-none focus:border-accent"
                                    >
                                        <option value="openai">OpenAI (GPT-4)</option>
                                        <option value="azure">Azure Open AI</option>
                                        <option value="anthropic">Anthropic (Claude)</option>
                                        <option value="google">Google (Gemini)</option>
                                        <option value="cohere">Cohere</option>
                                        <option value="grok">Grok (xAI)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">System Prompt</label>
                                    <textarea
                                        value={aiSettings.system_prompt || ''}
                                        onChange={e => setAiSettings({ ...aiSettings, system_prompt: e.target.value })}
                                        className="bg-black/50 border border-white/10 rounded-lg p-3 text-white w-full h-32 outline-none focus:border-accent resize-none"
                                        placeholder="You are a helpful assistant..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This instruction will be prepended to every conversation.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Temperature ({aiSettings.temperature})</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={aiSettings.temperature || 0.7}
                                            onChange={e => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                                            className="w-full accent-accent"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Precise</span>
                                            <span>Creative</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 border border-white/10 rounded-lg p-3 bg-black/50">
                                        <input
                                            type="checkbox"
                                            checked={aiSettings.save_history || false}
                                            onChange={e => setAiSettings({ ...aiSettings, save_history: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-600 accent-accent"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-white">Save Chat History</span>
                                            <span className="block text-xs text-gray-500">Store conversations for later review</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={handleAISettingsUpdate}
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : <><Save size={18} /> Save Configuration</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
