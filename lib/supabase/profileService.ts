/**
 * Profile Service - Community profile features
 * 
 * Handles user profiles, follows, and public profile viewing
 */
import { supabase } from './client';
import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Extended profile with community fields
export interface CommunityProfile extends Profile {
    display_name?: string | null;
    website?: string | null;
    social_links?: Record<string, string>;
    is_public?: boolean;
    location?: string | null;
    follower_count?: number;
    following_count?: number;
    is_guest_author?: boolean;
    author_bio?: string | null;
}

// Public-safe profile (for viewing others)
export interface PublicProfile {
    id: string;
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    social_links: Record<string, string>;
    location: string | null;
    follower_count: number;
    following_count: number;
    is_guest_author: boolean;
    is_public: boolean;
}

// Follow relationship
export interface UserFollow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
    // Joined profile info
    profile?: {
        id: string;
        display_name: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
}

// ============================================
// PROFILE CRUD
// ============================================

/**
 * Get current user's full profile
 */
export async function getMyProfile(): Promise<CommunityProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data as CommunityProfile;
}

/**
 * Get a user's public profile by ID
 * Returns null if profile is private and not the current user
 */
export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
      id,
      display_name,
      full_name,
      avatar_url,
      bio,
      website,
      social_links,
      location,
      follower_count,
      following_count,
      is_guest_author,
      is_public
    `)
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching public profile:', error);
        return null;
    }

    // If profile is private, only show basic info
    const profile = data as any;
    if (!profile.is_public) {
        // Check if it's the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== userId) {
            // Return minimal info for private profiles
            return {
                id: profile.id,
                display_name: profile.display_name,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                bio: null,
                website: null,
                social_links: {},
                location: null,
                follower_count: 0,
                following_count: 0,
                is_guest_author: false,
                is_public: false,
            };
        }
    }

    return {
        id: profile.id,
        display_name: profile.display_name || profile.full_name,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        website: profile.website,
        social_links: profile.social_links || {},
        location: profile.location,
        follower_count: profile.follower_count || 0,
        following_count: profile.following_count || 0,
        is_guest_author: profile.is_guest_author || false,
        is_public: profile.is_public !== false,
    };
}

/**
 * Update current user's profile
 */
export async function updateProfile(updates: Partial<CommunityProfile>): Promise<CommunityProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        } as ProfileUpdate)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
    return data as CommunityProfile;
}

/**
 * Toggle profile visibility
 */
export async function setProfileVisibility(isPublic: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('profiles')
        .update({ is_public: isPublic } as any)
        .eq('id', user.id);

    if (error) throw error;
}

// ============================================
// FOLLOW SYSTEM
// ============================================

/**
 * Follow a user
 */
export async function followUser(targetUserId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    if (user.id === targetUserId) throw new Error('Cannot follow yourself');

    const { error } = await supabase
        .from('user_follows')
        .insert({
            follower_id: user.id,
            following_id: targetUserId,
        });

    if (error) {
        if (error.code === '23505') {
            // Already following
            return;
        }
        throw error;
    }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(targetUserId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

    if (error) throw error;
}

/**
 * Check if current user is following another user
 */
export async function isFollowing(targetUserId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

    if (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
    return !!data;
}

/**
 * Get followers of a user
 */
export async function getFollowers(
    userId: string,
    limit = 20,
    offset = 0
): Promise<{ followers: UserFollow[]; total: number }> {
    const { data, error, count } = await supabase
        .from('user_follows')
        .select(`
      *,
      profile:profiles!user_follows_follower_id_fkey(
        id,
        display_name,
        full_name,
        avatar_url
      )
    `, { count: 'exact' })
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching followers:', error);
        return { followers: [], total: 0 };
    }

    return {
        followers: (data || []).map(f => ({
            ...f,
            profile: Array.isArray(f.profile) ? f.profile[0] : f.profile,
        })) as UserFollow[],
        total: count || 0,
    };
}

/**
 * Get users that a user is following
 */
export async function getFollowing(
    userId: string,
    limit = 20,
    offset = 0
): Promise<{ following: UserFollow[]; total: number }> {
    const { data, error, count } = await supabase
        .from('user_follows')
        .select(`
      *,
      profile:profiles!user_follows_following_id_fkey(
        id,
        display_name,
        full_name,
        avatar_url
      )
    `, { count: 'exact' })
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching following:', error);
        return { following: [], total: 0 };
    }

    return {
        following: (data || []).map(f => ({
            ...f,
            profile: Array.isArray(f.profile) ? f.profile[0] : f.profile,
        })) as UserFollow[],
        total: count || 0,
    };
}

// ============================================
// PROFILE STATS & ACTIVITY
// ============================================

/**
 * Get user's activity stats (posts, comments)
 */
export async function getProfileStats(userId: string): Promise<{
    postCount: number;
    commentCount: number;
    followerCount: number;
    followingCount: number;
}> {
    // Get post count (only published)
    const { count: postCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)
        .eq('status', 'published');

    // Get comment count
    const { count: commentCount } = await supabase
        .from('blog_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_approved', true);

    // Get profile for follower counts
    const { data: profile } = await supabase
        .from('profiles')
        .select('follower_count, following_count')
        .eq('id', userId)
        .single();

    return {
        postCount: postCount || 0,
        commentCount: commentCount || 0,
        followerCount: (profile as any)?.follower_count || 0,
        followingCount: (profile as any)?.following_count || 0,
    };
}

/**
 * Get user's recent posts
 */
export async function getUserPosts(userId: string, limit = 5) {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, published_at, views')
        .eq('author_id', userId)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching user posts:', error);
        return [];
    }
    return data || [];
}

/**
 * Get user's recent comments
 */
export async function getUserComments(userId: string, limit = 5) {
    const { data, error } = await supabase
        .from('blog_comments')
        .select(`
      id,
      content,
      created_at,
      blog_posts(id, title, slug)
    `)
        .eq('user_id', userId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching user comments:', error);
        return [];
    }
    return data || [];
}

// ============================================
// EXPORT NAMESPACE
// ============================================

export const profileService = {
    getMyProfile,
    getPublicProfile,
    updateProfile,
    setProfileVisibility,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing,
    getProfileStats,
    getUserPosts,
    getUserComments,
};
