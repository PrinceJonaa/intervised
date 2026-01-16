
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Edit2, FileText, Globe, Archive, Eye } from 'lucide-react';
import {
    getAdminPosts,
    createPost,
    updatePost,
    deletePost,
    uploadBlogImage,
    type BlogPost,
    type BlogPostInsert
} from '../../lib/supabase/blogService';
import { logAdminAction } from '../../lib/supabase/adminService';
import { useToast } from '../../components/ToastSystem';
import { Upload } from 'lucide-react';

export const BlogManager = () => {
    const { addToast } = useToast();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit/Create State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<BlogPostInsert>>({});
    const [tagsInput, setTagsInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getAdminPosts();
            setPosts(data);
        } catch (error) {
            console.error('Failed to load posts:', error);
            addToast('Failed to load posts', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditForm({
            title: '',
            content: '',
            category: 'Tech',
            status: 'draft',
            tags: [],
            excerpt: '',
            featured_image: ''
        });
        setTagsInput('');
        setIsEditing(true);
    };

    const handleEdit = (post: BlogPost) => {
        setEditForm(post);
        setTagsInput(post.tags?.join(', ') || '');
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await deletePost(id);
            await logAdminAction('delete_post', 'blog_posts', id);
            setPosts(prev => prev.filter(p => p.id !== id));
            addToast('Post deleted', 'success');
        } catch (error) {
            addToast('Failed to delete post', 'error');
        }
    };

    const handleSave = async () => {
        try {
            const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
            const dataToSave = { ...editForm, tags };

            if ((editForm as any).id) {
                // Update
                const updated = await updatePost((editForm as any).id, dataToSave);
                await logAdminAction('update_post', 'blog_posts', updated.id, { title: updated.title, status: updated.status });
                setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
                addToast('Post updated', 'success');
            } else {
                // Create
                // Ensure required fields for insert
                if (!dataToSave.title || !dataToSave.content) {
                    addToast('Title and Content are required', 'error');
                    return;
                }
                const created = await createPost(dataToSave as BlogPostInsert);
                await logAdminAction('create_post', 'blog_posts', created.id, { title: created.title });
                setPosts(prev => [created, ...prev]);
                addToast('Post created', 'success');
            }
            setIsEditing(false);
            setEditForm({});
        } catch (error) {
            console.error(error);
            addToast('Failed to save post', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'text-green-400 border-green-500/50 bg-green-500/10';
            case 'draft': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
            case 'archived': return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
            default: return 'text-white border-white/50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Blog Posts</h2>
                <button onClick={handleCreate} className="px-4 py-2 bg-accent text-black font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-white transition-colors">
                    <Plus size={16} /> New Post
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-surface border border-white/10 rounded-xl p-6 space-y-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{(editForm as any).id ? 'Edit Post' : 'New Post'}</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-bold text-lg"
                                    placeholder="Enter post title..."
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Category</label>
                                <select
                                    value={editForm.category || 'Tech'}
                                    onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none"
                                >
                                    <option value="Tech">Tech</option>
                                    <option value="Ministry">Ministry</option>
                                    <option value="Business">Business</option>
                                    <option value="Lifestyle">Lifestyle</option>
                                    <option value="Tutorial">Tutorial</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Status</label>
                                <select
                                    value={editForm.status || 'draft'}
                                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Excerpt (Short Summary)</label>
                            <textarea
                                value={editForm.excerpt || ''}
                                onChange={e => setEditForm({ ...editForm, excerpt: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none h-20 resize-none"
                                placeholder="Brief description for cards..."
                            />
                        </div>

                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Featured Image</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editForm.featured_image || ''}
                                    onChange={e => setEditForm({ ...editForm, featured_image: e.target.value })}
                                    className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none"
                                    placeholder="https://..."
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={isUploading}
                                        onChange={async (e) => {
                                            if (!e.target.files || e.target.files.length === 0) return;
                                            setIsUploading(true);
                                            try {
                                                const file = e.target.files[0];
                                                // Use a temporary slug if creating new
                                                const slug = editForm.slug || editForm.title?.toLowerCase().replace(/\s+/g, '-') || 'temp';
                                                const url = await uploadBlogImage(file, slug);
                                                setEditForm(prev => ({ ...prev, featured_image: url }));
                                                addToast('Image uploaded successfully', 'success');
                                            } catch (err) {
                                                console.error(err);
                                                addToast('Failed to upload image', 'error');
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <button className={`px-3 py-2 bg-white/10 hover:bg-white/20 rounded border border-white/10 transition-colors flex items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}>
                                        <Upload size={16} />
                                        {isUploading ? '...' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Content (Markdown Supported)</label>
                            <textarea
                                value={editForm.content || ''}
                                onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none h-96 font-mono text-sm"
                                placeholder="# Heading&#10;&#10;Write your post content here..."
                            />
                        </div>

                        {/* SEO Settings */}
                        <div className="border border-white/5 rounded-xl p-4 bg-black/20 space-y-4">
                            <h4 className="font-bold text-gray-300 flex items-center gap-2">
                                <Globe size={16} className="text-accent" />
                                SEO Settings
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-bold block mb-1">URL Slug</label>
                                    <input
                                        type="text"
                                        value={editForm.slug || ''}
                                        onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono text-xs"
                                        placeholder="custom-url-slug"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Meta Keywords</label>
                                    <input
                                        type="text"
                                        value={editForm.meta_keywords?.join(', ') || ''}
                                        onChange={e => setEditForm({
                                            ...editForm,
                                            meta_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                        })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono text-xs"
                                        placeholder="keyword1, keyword2..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Meta Description</label>
                                <textarea
                                    value={editForm.meta_description || ''}
                                    onChange={e => setEditForm({ ...editForm, meta_description: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none h-20 resize-none text-sm"
                                    placeholder="SEO description for search engines..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={tagsInput}
                                onChange={e => setTagsInput(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none"
                                placeholder="AI, Church, Design..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-accent text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2">
                                <Save size={16} /> Save Post
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <motion.div
                                key={post.id}
                                layout
                                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center overflow-hidden border border-white/5`}>
                                        {post.featured_image ? (
                                            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <FileText size={20} className="text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white text-lg">{post.title}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(post.status)}`}>
                                                {post.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                                            <span>{post.category}</span>
                                            <span>•</span>
                                            <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{post.views || 0} views</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(post)} className="p-2 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(post.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {posts.length === 0 && !isLoading && (
                            <div className="text-center py-20 text-gray-500">
                                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No blog posts found.</p>
                            </div>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
