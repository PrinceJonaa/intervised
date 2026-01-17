/**
 * Notification Service - In-app notifications
 * 
 * Handles user notifications, preferences, and marking as read
 */
import { supabase } from './client';

// Notification types
export type NotificationType = 'new_post' | 'reply' | 'follower' | 'mention' | 'system';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    body?: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export interface NotificationPreferences {
    id?: string;
    user_id?: string;
    new_post: boolean;
    reply_to_comment: boolean;
    new_follower: boolean;
    weekly_digest: boolean;
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Get user's notifications
 */
export async function getNotifications(
    limit = 20,
    unreadOnly = false
): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (unreadOnly) {
        query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
    return data as Notification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) {
        console.error('Error counting notifications:', error);
        return 0;
    }
    return count || 0;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

    if (error) throw error;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) throw error;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

    if (error) throw error;
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

/**
 * Get user's notification preferences
 */
export async function getPreferences(): Promise<NotificationPreferences> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            new_post: true,
            reply_to_comment: true,
            new_follower: true,
            weekly_digest: false,
        };
    }

    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching preferences:', error);
    }

    // Return defaults if no preferences set
    return (data as NotificationPreferences) || {
        new_post: true,
        reply_to_comment: true,
        new_follower: true,
        weekly_digest: false,
    };
}

/**
 * Update notification preferences
 */
export async function updatePreferences(
    prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upsert preferences
    const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
            user_id: user.id,
            ...prefs,
        }, {
            onConflict: 'user_id',
        })
        .select()
        .single();

    if (error) throw error;
    return data as NotificationPreferences;
}

// ============================================
// CREATE NOTIFICATIONS (internal use)
// ============================================

/**
 * Create a notification for a user
 * Used internally by triggers or other services
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    options?: { body?: string; link?: string }
): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            type,
            title,
            body: options?.body,
            link: options?.link,
        });

    if (error) {
        console.error('Error creating notification:', error);
    }
}

// ============================================
// EXPORT NAMESPACE
// ============================================

export const notificationService = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getPreferences,
    updatePreferences,
    createNotification,
};
