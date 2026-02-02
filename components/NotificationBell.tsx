/**
 * NotificationBell - Header notification icon with dropdown
 * 
 * Shows unread count and recent notifications
 */
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { notificationService, Notification } from '../lib/supabase/notificationService';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNotifications();

        // Close on outside click
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function loadNotifications() {
        try {
            const [notifs, count] = await Promise.all([
                notificationService.getNotifications(10),
                notificationService.getUnreadCount(),
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    }

    async function handleMarkAsRead(id: string) {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }

    async function handleMarkAllRead() {
        setLoading(true);
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        } finally {
            setLoading(false);
        }
    }

    const notificationIcons: Record<string, string> = {
        new_post: '📝',
        reply: '💬',
        follower: '👤',
        mention: '@',
        system: '🔔',
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications, no unread messages'}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-black text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-void border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={loading}
                                    className="text-xs text-accent hover:underline disabled:opacity-50 flex items-center gap-1"
                                >
                                    {loading && <Loader2 size={12} className="animate-spin" />}
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-gray-500" role="status">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.is_read ? 'bg-accent/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-lg">
                                                {notificationIcons[notif.type] || '🔔'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notif.is_read ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                    {notif.title}
                                                </p>
                                                {notif.body && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {notif.body}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {formatTime(notif.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {notif.link && (
                                                    <Link
                                                        to={notif.link}
                                                        onClick={() => setIsOpen(false)}
                                                        className="p-1 text-gray-500 hover:text-accent"
                                                        aria-label={`Open link for "${notif.title}"`}
                                                        title={`Open link for "${notif.title}"`}
                                                    >
                                                        <ExternalLink size={14} aria-hidden="true" />
                                                    </Link>
                                                )}
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="p-1 text-gray-500 hover:text-green-400"
                                                        title="Mark as read"
                                                        aria-label={`Mark notification "${notif.title}" as read`}
                                                    >
                                                        <Check size={14} aria-hidden="true" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-white/10 text-center">
                                <Link
                                    to="/settings/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs text-gray-400 hover:text-accent"
                                >
                                    Notification settings
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}
