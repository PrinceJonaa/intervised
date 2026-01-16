
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import {
    getPendingComments,
    approveComment,
    deleteComment,
    type BlogComment
} from '../../lib/supabase/blogService';
import { logAdminAction } from '../../lib/supabase/adminService';
import { useToast } from '../../components/ToastSystem';

export const CommentsManager = () => {
    const { addToast } = useToast();
    const [comments, setComments] = useState<(BlogComment & { post_title?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const data = await getPendingComments();
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
            addToast('Failed to load pending comments', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveComment(id);
            await logAdminAction('approve_comment', 'blog_comments', id);
            setComments(prev => prev.filter(c => c.id !== id));
            addToast('Comment approved', 'success');
        } catch (error) {
            addToast('Failed to approve comment', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await deleteComment(id);
            await logAdminAction('delete_comment', 'blog_comments', id);
            setComments(prev => prev.filter(c => c.id !== id));
            addToast('Comment deleted', 'success');
        } catch (error) {
            addToast('Failed to delete comment', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">Content Moderation</h2>
                    <p className="text-sm text-gray-500">Review pending comments</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-400">
                    {comments.length} Pending
                </div>
            </div>

            <AnimatePresence>
                {isLoading ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>Loading comments...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-gray-500 bg-white/5 rounded-xl border border-white/10 border-dashed"
                    >
                        <ShieldAlert size={48} className="mx-auto mb-4 opacity-50 text-green-500" />
                        <p className="font-bold text-white">All Clear!</p>
                        <p className="text-sm">No pending comments to review.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <motion.div
                                key={comment.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6"
                            >
                                <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{comment.author_name}</span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                                        </div>

                                        <div className="bg-black/40 rounded-lg p-3 text-gray-300 text-sm border border-white/5">
                                            {comment.content}
                                        </div>

                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            On: <span className="text-accent">{comment.post_title || 'Unknown Post'}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleApprove(comment.id)}
                                            className="flex-1 md:flex-none px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                        >
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                        >
                                            <Trash2 size={16} /> Reject
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
