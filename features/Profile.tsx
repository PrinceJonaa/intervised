import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2, Camera, Shield, FileText } from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase/client';
import { useToast } from '../components/ToastSystem';

export function ProfilePage() {
    const { user, profile } = useAuthContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

    // Update state when profile loads
    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setBio(profile.bio || '');
            setAvatarUrl(profile.avatar_url || '');
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            const updates = {
                id: user.id,
                full_name: fullName,
                bio,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            addToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            addToast('Failed to update profile', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Role Badge Component
    const RoleBadge = ({ role }: { role: string }) => {
        const colors = {
            admin: 'bg-red-500/10 text-red-500 border-red-500/20',
            contributor: 'bg-accent/10 text-accent border-accent/20',
            member: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs uppercase font-bold border flex items-center gap-1 ${colors[role as keyof typeof colors] || colors.member}`}>
                <Shield size={12} />
                {role}
            </span>
        );
    };

    return (
        <section className="min-h-screen-safe pt-28 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-display font-bold mb-2">My Profile</h1>
                        <p className="text-gray-400 text-sm">Manage your personal information</p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden p-6 md:p-8">
                        <form onSubmit={handleUpdateProfile} className="space-y-8">

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center border-2 border-white/10 overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-gray-400" />
                                        )}
                                    </div>
                                    {/* Placeholder for avatar upload - simpler to just use URL for now or integrate upload later */}
                                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                        <Camera size={20} className="text-white" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <RoleBadge role={profile?.role || 'member'} />
                                    <p className="text-xs text-gray-500 mt-2 font-mono">{user?.id}</p>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Email Address</label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-gray-400 cursor-not-allowed">
                                        <Mail size={16} />
                                        <span className="text-sm">{user?.email}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 ml-1">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors resize-none"
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-accent outline-none transition-colors"
                                        placeholder="https://..."
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1 ml-1">Paste a direct link to an image</p>
                                </div>
                            </div>

                            {/* Privacy / Permissions Info */}
                            <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
                                    <Shield size={14} />
                                    Permissions
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${profile?.permissions?.can_blog ? 'bg-green-500' : 'bg-red-500/50'}`} />
                                        Create Blog Posts
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${profile?.permissions?.can_comment !== false ? 'bg-green-500' : 'bg-red-500/50'}`} />
                                        Post Comments
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default ProfilePage;
