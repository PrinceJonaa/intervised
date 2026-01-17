/**
 * ProfileSettings - Profile editing page component
 * 
 * Allows users to edit their profile information, visibility, and notification preferences
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Globe, MapPin, Save, Lock, Unlock,
    Bell, Twitter, Github, Linkedin, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../../../lib/supabase/authService';
import { profileService, CommunityProfile } from '../../../lib/supabase/profileService';
import { notificationService, NotificationPreferences } from '../../../lib/supabase/notificationService';

export default function ProfileSettings() {
    const [profile, setProfile] = useState<CommunityProfile | null>(null);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [profileData, prefsData] = await Promise.all([
                profileService.getMyProfile(),
                notificationService.getPreferences(),
            ]);
            setProfile(profileData);
            setPreferences(prefsData);
        } catch (err) {
            console.error('Error loading profile settings:', err);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!profile || !preferences) return;

        setSaving(true);
        setMessage(null);
        try {
            await Promise.all([
                profileService.updateProfile({
                    display_name: profile.display_name,
                    bio: profile.bio,
                    website: profile.website,
                    location: profile.location,
                    social_links: profile.social_links,
                    is_public: profile.is_public,
                }),
                notificationService.updatePreferences(preferences),
            ]);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err) {
            console.error('Error saving profile:', err);
            setMessage({ type: 'error', text: 'Failed to save changes' });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!profile || !preferences) return null;

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="max-w-3xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/profile" className="text-gray-400 hover:text-white flex items-center gap-2">
                        <ArrowLeft size={16} /> Back to Profile
                    </Link>
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Public Profile Section */}
                    <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User size={20} className="text-accent" />
                            Public Profile
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={profile.display_name || ''}
                                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                                    placeholder="Your display name"
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm text-gray-400 mb-2">Location</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={profile.location || ''}
                                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent outline-none"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm text-gray-400 mb-2">Bio</label>
                                <textarea
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none min-h-[100px]"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm text-gray-400 mb-2">Website</label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                    <input
                                        type="url"
                                        value={profile.website || ''}
                                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent outline-none"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Social Links Section */}
                    <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Globe size={20} className="text-accent" />
                            Social Links
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative">
                                <Twitter size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    value={profile.social_links?.twitter || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        social_links: { ...profile.social_links, twitter: e.target.value }
                                    })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent outline-none"
                                    placeholder="Twitter URL"
                                />
                            </div>
                            <div className="relative">
                                <Github size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    value={profile.social_links?.github || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        social_links: { ...profile.social_links, github: e.target.value }
                                    })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent outline-none"
                                    placeholder="GitHub URL"
                                />
                            </div>
                            <div className="relative">
                                <Linkedin size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    value={profile.social_links?.linkedin || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        social_links: { ...profile.social_links, linkedin: e.target.value }
                                    })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent outline-none"
                                    placeholder="LinkedIn URL"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Privacy & Notifications Section */}
                    <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Settings2 size={20} className="text-accent" />
                            Preferences
                        </h2>

                        <div className="space-y-6">
                            {/* Profile Visibility */}
                            <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    {profile.is_public ? <Unlock className="text-green-400" size={20} /> : <Lock className="text-red-400" size={20} />}
                                    <div>
                                        <h3 className="font-semibold">Profile Visibility</h3>
                                        <p className="text-sm text-gray-400">
                                            {profile.is_public ? 'Your profile is visible to everyone' : 'Only you can see your profile details'}
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={profile.is_public}
                                        onChange={(e) => setProfile({ ...profile, is_public: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Bell size={16} /> Notification Settings
                                </h3>

                                <div className="space-y-4">
                                    <Toggle
                                        label="New Posts"
                                        description="Notify me when new blog posts are published"
                                        checked={preferences.new_post}
                                        onChange={(checked) => setPreferences({ ...preferences, new_post: checked })}
                                    />
                                    <Toggle
                                        label="Comment Replies"
                                        description="Notify me when someone replies to my comments"
                                        checked={preferences.reply_to_comment}
                                        onChange={(checked) => setPreferences({ ...preferences, reply_to_comment: checked })}
                                    />
                                    <Toggle
                                        label="New Followers"
                                        description="Notify me when someone follows me"
                                        checked={preferences.new_follower}
                                        onChange={(checked) => setPreferences({ ...preferences, new_follower: checked })}
                                    />
                                    <Toggle
                                        label="Weekly Digest"
                                        description="Receive a weekly summary of top content"
                                        checked={preferences.weekly_digest}
                                        onChange={(checked) => setPreferences({ ...preferences, weekly_digest: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-black font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Toggle({ label, description, checked, onChange }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="font-medium">{label}</div>
                <div className="text-xs text-gray-400">{description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
            </label>
        </div>
    );
}

import { Settings2 } from 'lucide-react';
