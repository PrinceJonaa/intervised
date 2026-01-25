
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, EyeOff, Save, Plus, Trash2, X, Check, AlertCircle, Edit2 } from 'lucide-react';
import { getServices, updateService, type Service } from '../../lib/supabase/referenceService';
import { logAdminAction } from '../../lib/supabase/adminService';
import { useToast } from '../../components/ToastSystem';

interface ServiceOption {
    id: string;
    label: string;
    price: number;
}

export const ServiceManager = () => {
    const { addToast } = useToast();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Edit Form State
    const [editForm, setEditForm] = useState<Partial<Service>>({});
    const [editOptions, setEditOptions] = useState<ServiceOption[]>([]);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            // Fetch ALL services (including inactive)
            const data = await getServices(undefined, true);
            setServices(data || []);
        } catch (error) {
            console.error('Failed to load services:', error);
            addToast('Failed to load services', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleVisibility = async (service: Service) => {
        try {
            const newStatus = !service.is_active;
            await updateService(service.id, { is_active: newStatus });
            await logAdminAction('update_service_status', 'services', service.id, { is_active: newStatus });
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s));
            addToast(`Service ${newStatus ? 'enabled' : 'disabled'}`, 'success');
        } catch (error) {
            addToast('Failed to update status', 'error');
        }
    };

    const startEdit = (service: Service) => {
        setEditingId(service.id);
        setEditForm({
            name: service.name,
            base_price: service.base_price,
            description: service.description
        });
        setEditOptions((service.options as ServiceOption[]) || []);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
        setEditOptions([]);
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            await updateService(editingId, {
                ...editForm,
                options: editOptions
            });

            await logAdminAction('update_service', 'services', editingId, editForm);
            setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...editForm, options: editOptions } : s));
            addToast('Service updated successfully', 'success');
            cancelEdit();
        } catch (error) {
            addToast('Failed to save changes', 'error');
        }
    };

    // Option Management
    const addOption = () => {
        const newOpt: ServiceOption = {
            id: crypto.randomUUID(),
            label: 'New Option',
            price: 0
        };
        setEditOptions([...editOptions, newOpt]);
    };

    const updateOption = (id: string, field: keyof ServiceOption, value: any) => {
        setEditOptions(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
    };

    const removeOption = (id: string) => {
        setEditOptions(prev => prev.filter(o => o.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Service Protocols</h2>
                <button onClick={loadServices} className="text-xs font-mono text-accent hover:text-white transition-colors">REFRESH DATA</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {services.map(service => (
                    <motion.div
                        layout
                        key={service.id}
                        className={`border rounded-xl p-4 transition-all ${service.is_active ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-60'}`}
                    >
                        {editingId === service.id ? (
                            // EDIT MODE
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-500 font-bold">Service Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name || ''}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-accent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-500 font-bold">Base Price ($)</label>
                                        <input
                                            type="number"
                                            value={editForm.base_price || 0}
                                            onChange={e => setEditForm({ ...editForm, base_price: parseFloat(e.target.value) })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-accent outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase text-gray-500 font-bold">Description</label>
                                    <textarea
                                        value={editForm.description || ''}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-accent outline-none h-20 resize-none"
                                    />
                                </div>

                                {/* Options Editor */}
                                <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] uppercase text-accent font-bold">Add-on Modules (Extra Stuff)</label>
                                        <button onClick={addOption} className="p-1 bg-white/10 hover:bg-white/20 rounded text-xs flex items-center gap-1"><Plus size={12} /> Add</button>
                                    </div>

                                    <div className="space-y-2">
                                        {editOptions.map(opt => (
                                            <div key={opt.id} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={opt.label}
                                                    onChange={e => updateOption(opt.id, 'label', e.target.value)}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded p-1.5 text-xs text-white"
                                                    placeholder="Option Name"
                                                />
                                                <input
                                                    type="number"
                                                    value={opt.price}
                                                    onChange={e => updateOption(opt.id, 'price', parseFloat(e.target.value))}
                                                    className="w-20 bg-black/50 border border-white/10 rounded p-1.5 text-xs text-white"
                                                    placeholder="Price"
                                                />
                                                <button onClick={() => removeOption(opt.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={12} /></button>
                                            </div>
                                        ))}
                                        {editOptions.length === 0 && <div className="text-xs text-gray-600 italic">No add-on options configured.</div>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                                    <button onClick={cancelEdit} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-white/5 rounded-lg">Cancel</button>
                                    <button onClick={saveEdit} className="px-4 py-2 text-xs font-bold text-black bg-accent rounded-lg flex items-center gap-2"><Save size={14} /> Save Changes</button>
                                </div>
                            </div>
                        ) : (
                            // READ MODE
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${service.is_active ? 'bg-green-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`} />
                                    <div>
                                        <h3 className="font-bold text-white">{service.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                            <span>${service.base_price}</span>
                                            <span>•</span>
                                            <span>{service.category}</span>
                                            {service.options && Array.isArray(service.options) && service.options.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-accent">{service.options.length} Add-ons</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleToggleVisibility(service)} className={`p-2 rounded-lg transition-colors ${service.is_active ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-300'}`} title={service.is_active ? "Hide Service" : "Show Service"}>
                                        {service.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button onClick={() => startEdit(service)} className="p-2 text-gray-400 hover:text-accent hover:bg-white/5 rounded-lg transition-colors" title="Edit Service">
                                        <Edit2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};


