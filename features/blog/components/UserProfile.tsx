/**
 * UserProfile - Public user profile page component
 * 
 * Displays user's public profile with bio, stats, posts, and follow button
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, MapPin, Globe, Twitter, Github, Linkedin,
    Calendar, BookOpen, MessageSquare, Users, UserPlus, UserMinus,
    Lock, ArrowLeft, ExternalLink
} from 'lucide-react';
import { profileService, PublicProfile } from '../../../lib/supabase/profileService';

interface UserStats {
    postCount: number;
    commentCount: number;
    followerCount: number;
    followingCount: number;
}

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) loadProfile(id);
    }, [id]);

    async function loadProfile(userId: string) {
        setLoading(true);
        setError(null);
        try {
            const [profileData, statsData, followStatus, userPosts] = await Promise.all([
                profileService.getPublicProfile(userId),
                profileService.getProfileStats(userId),
                profileService.isFollowing(userId),
                profileService.getUserPosts(userId, 5),
            ]);

            if (!profileData) {
                setError('Profile not found');
            } else {
                setProfile(profileData);
                setStats(statsData);
                setIsFollowing(followStatus);
                setPosts(userPosts);
            }
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleFollowToggle() {
        if (!id) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await profileService.unfollowUser(id);
                setIsFollowing(false);
                if (stats) setStats({ ...stats, followerCount: stats.followerCount - 1 });
            } else {
                await profileService.followUser(id);
                setIsFollowing(true);
                if (stats) setStats({ ...stats, followerCount: stats.followerCount + 1 });
            }
        } catch (err) {
            console.error('Follow error:', err);
        } finally {
            setFollowLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <User className="w-16 h-16 text-gray-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{error || 'Profile not found'}</h1>
                <Link to="/blog" className="text-accent hover:underline flex items-center gap-2 mt-4">
                    <ArrowLeft size={18} /> Back to Blog
                </Link>
            </div>
        );
    }

    const socialIcons: Record<string, typeof Twitter> = {
        twitter: Twitter,
        github: Github,
        linkedin: Linkedin,
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-gradient-to-b from-accent/20 to-transparent pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Back button */}
                    <Link to="/blog" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm">
                        <ArrowLeft size={16} /> Back to Blog
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center md:items-start gap-6"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.display_name || 'User'}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-accent/30"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center border-4 border-accent/30">
                                    <User className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                            {!profile.is_public && (
                                <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-2" title="Private Profile">
                                    <Lock size={16} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold mb-2">
                                {profile.display_name || profile.full_name || 'Anonymous'}
                            </h1>

                            {profile.is_public && profile.bio && (
                                <p className="text-gray-400 mb-4 max-w-lg">{profile.bio}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-sm text-gray-400">
                                {profile.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> {profile.location}
                                    </span>
                                )}
                                {profile.website && (
                                    <a
                                        href={profile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-accent transition-colors"
                                    >
                                        <Globe size={14} /> Website <ExternalLink size={12} />
                                    </a>
                                )}
                                {profile.is_guest_author && (
                                    <span className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs font-medium">
                                        ✍️ Guest Author
                                    </span>
                                )}
                            </div>

                            {/* Social Links */}
                            {profile.is_public && Object.keys(profile.social_links || {}).length > 0 && (
                                <div className="flex gap-3 mt-4 justify-center md:justify-start">
                                    {Object.entries(profile.social_links).map(([platform, url]) => {
                                        const Icon = socialIcons[platform.toLowerCase()] || Globe;
                                        return (
                                            <a
                                                key={platform}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-accent transition-colors"
                                                title={platform}
                                            >
                                                <Icon size={20} />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Follow Button */}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${isFollowing
                                    ? 'bg-white/10 hover:bg-red-500/20 hover:text-red-400'
                                    : 'bg-accent hover:bg-accent/80 text-black'
                                    }`}
                            >
                                {followLoading ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                ) : isFollowing ? (
                                    <><UserMinus size={18} /> Unfollow</>
                                ) : (
                                    <><UserPlus size={18} /> Follow</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={BookOpen} label="Posts" value={stats?.postCount || 0} />
                    <StatCard icon={MessageSquare} label="Comments" value={stats?.commentCount || 0} />
                    <StatCard icon={Users} label="Followers" value={stats?.followerCount || 0} />
                    <StatCard icon={Users} label="Following" value={stats?.followingCount || 0} />
                </div>
            </div>

            {/* Recent Posts */}
            {profile.is_public && posts.length > 0 && (
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <BookOpen size={20} className="text-accent" />
                        Recent Posts
                    </h2>
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
                            >
                                <h3 className="font-semibold mb-2">{post.title}</h3>
                                {post.excerpt && (
                                    <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
                                )}
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(post.published_at).toLocaleDateString()}
                                    </span>
                                    <span>{post.views || 0} views</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Private Profile Notice */}
            {!profile.is_public && (
                <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                    <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                        This user has set their profile to private.
                    </p>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof User; label: string; value: number }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
        </div>
    );
}
