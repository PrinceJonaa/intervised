
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, Check, ExternalLink, Archive, Search, Filter } from 'lucide-react';
import { getContactMessages, updateMessageStatus, deleteContactMessage, type ContactMessage } from '../../lib/supabase/contactService';
import { logAdminAction } from '../../lib/supabase/adminService';
import { useToast } from '../../components/ToastSystem';

export const MessageManager = () => {
    const { addToast } = useToast();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await getContactMessages();
            setMessages(data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load messages', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateMessageStatus(id, newStatus as any);
            await logAdminAction('update_message', 'contact_messages', id, { status: newStatus });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
            addToast(`Marked as ${newStatus}`, 'success');
        } catch (error) {
            addToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Delete this message permanently?')) return;
        try {
            await deleteContactMessage(id);
            await logAdminAction('delete_message', 'contact_messages', id);
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selectedMessage === id) setSelectedMessage(null);
            addToast('Message deleted', 'success');
        } catch (error) {
            addToast('Failed to delete message', 'error');
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (msg.subject || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'read': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
            case 'replied': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'archived': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col md:flex-row gap-6">
            {/* List Column */}
            <div className={`flex-1 flex flex-col h-full ${selectedMessage ? 'hidden md:flex' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-display font-bold">Inbox</h2>
                        <p className="text-sm text-gray-500">Contact form submissions</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-accent outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-white focus:border-accent outline-none"
                    >
                        <option value="all">All</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500">Loading messages...</div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No messages found</div>
                    ) : (
                        filteredMessages.map(msg => (
                            <motion.div
                                key={msg.id}
                                layout
                                onClick={() => {
                                    setSelectedMessage(msg.id);
                                    if (msg.status === 'new') handleStatusUpdate(msg.id, 'read');
                                }}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedMessage === msg.id
                                    ? 'bg-accent/10 border-accent/50'
                                    : 'bg-white/5 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold ${msg.status === 'new' ? 'text-white' : 'text-gray-400'}`}>
                                        {msg.name}
                                    </h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusColor(msg.status || 'new')}`}>
                                        {msg.status || 'new'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-1">{msg.subject || 'No Subject'}</p>
                                <p className="text-xs text-gray-600 line-clamp-1">{msg.message}</p>
                                <div className="mt-2 text-[10px] text-gray-600 font-mono">
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail View */}
            <AnimatePresence mode="wait">
                {selectedMessage && (() => {
                    const msg = messages.find(m => m.id === selectedMessage);
                    if (!msg) return null;
                    return (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-[1.5] bg-surface border border-white/10 rounded-2xl p-6 h-full overflow-y-auto flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="md:hidden text-sm text-gray-400 mb-4 flex items-center gap-1"
                                    >
                                        ← Back
                                    </button>
                                    <h2 className="text-2xl font-bold font-display">{msg.subject || 'No Subject'}</h2>
                                    <div className="flex items-center gap-2 mt-2 text-gray-400">
                                        <Mail size={16} />
                                        <span>{msg.email}</span>
                                        {msg.company && (
                                            <>
                                                <span>•</span>
                                                <span>{msg.company}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`mailto:${msg.email}`}
                                        className="p-2 bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-colors"
                                        title="Reply via Email"
                                    >
                                        <ExternalLink size={20} />
                                    </a>
                                    <button
                                        onClick={(e) => handleDelete(msg.id, e)}
                                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-black/20 rounded-xl p-6 mb-6 border border-white/5 whitespace-pre-wrap text-gray-200">
                                {msg.message}
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <h4 className="text-xs uppercase text-gray-500 font-bold mb-3">Update Status</h4>
                                <div className="flex gap-2">
                                    {['read', 'replied', 'archived'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(msg.id, status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors border ${msg.status === status
                                                ? getStatusColor(status)
                                                : 'text-gray-500 border-white/10 hover:border-white/20 hover:text-white'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {msg.service_interest && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Interest</h4>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-sm text-accent border border-white/10">
                                        {msg.service_interest}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    );
                })()}
                {!selectedMessage && (
                    <div className="hidden md:flex flex-[1.5] bg-surface border border-white/10 rounded-2xl items-center justify-center text-gray-500 h-full">
                        <div className="text-center">
                            <Mail size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Select a message to view details</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
