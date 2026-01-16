
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Edit2, Image as ImageIcon, Link as LinkIcon, Briefcase } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject, getServices, type Project, type Service } from '../../lib/supabase/referenceService';
import { useToast } from '../../components/ToastSystem';

export const ProjectManager = () => {
    const { addToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit/Create State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Project>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [projectsData, servicesData] = await Promise.all([
                getProjects(),
                getServices()
            ]);
            setProjects(projectsData);
            setServices(servicesData);
        } catch (error) {
            console.error('Failed to load content:', error);
            addToast('Failed to load data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditForm({
            title: '',
            client: '',
            category: 'Video',
            is_featured: false,
            sort_order: 0,
            service_ids: []
        });
        setIsEditing(true);
    };

    const handleEdit = (project: Project) => {
        setEditForm(project);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
            addToast('Project deleted', 'success');
        } catch (error) {
            addToast('Failed to delete project', 'error');
        }
    };

    const handleSave = async () => {
        try {
            if (editForm.id) {
                // Update
                const updated = await updateProject(editForm.id, editForm);
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                addToast('Project updated', 'success');
            } else {
                // Create
                const created = await createProject(editForm);
                setProjects(prev => [...prev, created]);
                addToast('Project created', 'success');
            }
            setIsEditing(false);
            setEditForm({});
        } catch (error) {
            console.error(error);
            addToast('Failed to save project', 'error');
        }
    };

    const toggleServiceLink = (serviceId: string) => {
        const currentLinks = editForm.service_ids || [];
        if (currentLinks.includes(serviceId)) {
            setEditForm({ ...editForm, service_ids: currentLinks.filter(id => id !== serviceId) });
        } else {
            setEditForm({ ...editForm, service_ids: [...currentLinks, serviceId] });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Recent Works</h2>
                <button onClick={handleCreate} className="px-4 py-2 bg-accent text-black font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-white transition-colors">
                    <Plus size={16} /> Add Project
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
                            <h3 className="text-lg font-bold">{editForm.id ? 'Edit Project' : 'New Project'}</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Client</label>
                                <input
                                    type="text"
                                    value={editForm.client || ''}
                                    onChange={e => setEditForm({ ...editForm, client: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Description</label>
                            <textarea
                                value={editForm.description || ''}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none h-24 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={editForm.image || ''}
                                    onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Project URL</label>
                                <input
                                    type="text"
                                    value={editForm.url || ''}
                                    onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-accent outline-none"
                                />
                            </div>
                        </div>

                        {/* Service Linking */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <label className="text-xs uppercase text-gray-500 font-bold block mb-2">Connected Services</label>
                            <div className="flex flex-wrap gap-2">
                                {services.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => toggleServiceLink(service.id)}
                                        className={`px-3 py-1 rounded-full text-xs transition-colors border ${(editForm.service_ids || []).includes(service.id)
                                                ? 'bg-accent/20 border-accent text-accent'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {service.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-accent text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2">
                                <Save size={16} /> Save Project
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map(project => (
                            <motion.div
                                key={project.id}
                                layout
                                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-all"
                            >
                                <div className="h-32 bg-black/50 relative overflow-hidden">
                                    {project.image ? (
                                        <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button onClick={() => handleEdit(project)} className="p-1.5 bg-black/60 text-white rounded-lg backdrop-blur-md hover:bg-accent hover:text-black transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(project.id)} className="p-1.5 bg-black/60 text-red-400 rounded-lg backdrop-blur-md hover:bg-red-500 hover:text-white transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-white truncate">{project.title}</h3>
                                    <p className="text-gray-400 text-xs mb-2">{project.client}</p>

                                    {/* Linked Services Badges */}
                                    {project.service_ids && project.service_ids.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {project.service_ids.map(sid => {
                                                const s = services.find(srv => srv.id === sid);
                                                return s ? (
                                                    <span key={sid} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-gray-300">
                                                        {s.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
