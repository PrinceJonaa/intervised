
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, Trash2, DollarSign, Calendar, Save, Trash, AlertCircle } from 'lucide-react';
import {
    getTransparencyMetrics,
    createTransparencyMetric,
    deleteTransparencyMetric,
    type TransparencyMetric
} from '../../lib/supabase/adminService';
import { useToast } from '../../components/ToastSystem';

export const TransparencyManager = () => {
    const { addToast } = useToast();
    const [metrics, setMetrics] = useState<TransparencyMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [newMetric, setNewMetric] = useState({
        metric_type: 'revenue',
        value: 0,
        period: new Date().toISOString().slice(0, 7), // YYYY-MM
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getTransparencyMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Failed to load metrics:', error);
            addToast('Failed to load transparency data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const created = await createTransparencyMetric(newMetric);
            setMetrics(prev => [created, ...prev].sort((a, b) => b.period.localeCompare(a.period)));
            addToast('Metric recorded', 'success');
            setShowAddForm(false);
            setNewMetric(prev => ({ ...prev, value: 0, notes: '' }));
        } catch (error) {
            addToast('Failed to add metric', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this record?')) return;
        try {
            await deleteTransparencyMetric(id);
            setMetrics(prev => prev.filter(m => m.id !== id));
            addToast('Record removed', 'success');
        } catch (error) {
            addToast('Failed to remove record', 'error');
        }
    };

    const groupedByPeriod = metrics.reduce((acc, metric) => {
        if (!acc[metric.period]) acc[metric.period] = [];
        acc[metric.period].push(metric);
        return acc;
    }, {} as Record<string, TransparencyMetric[]>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">Open Metrics</h2>
                    <p className="text-sm text-gray-400">Manage public transparency data</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-accent text-black font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-white transition-colors"
                >
                    <Plus size={16} /> Add Record
                </button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-surface border border-white/10 rounded-xl p-4 overflow-hidden"
                    >
                        <h3 className="font-bold mb-4">New Financial Record</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Type</label>
                                <select
                                    value={newMetric.metric_type}
                                    onChange={e => setNewMetric({ ...newMetric, metric_type: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none"
                                >
                                    <option value="revenue">Revenue</option>
                                    <option value="expenses">Expenses</option>
                                    <option value="server_costs">Server Costs</option>
                                    <option value="donations">Donations</option>
                                    <option value="carbon_offset">Carbon Offset (kg)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Period</label>
                                <input
                                    type="month"
                                    value={newMetric.period}
                                    onChange={e => setNewMetric({ ...newMetric, period: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Value ($)</label>
                                <input
                                    type="number"
                                    value={newMetric.value}
                                    onChange={e => setNewMetric({ ...newMetric, value: parseFloat(e.target.value) })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Notes</label>
                                <input
                                    type="text"
                                    value={newMetric.notes}
                                    onChange={e => setNewMetric({ ...newMetric, notes: e.target.value })}
                                    placeholder="Optional details..."
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddForm(false)} className="px-3 py-1 text-sm text-gray-400">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-1 bg-white/10 hover:bg-white/20 rounded text-sm text-white font-bold transition-colors">
                                Save Record
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : Object.keys(groupedByPeriod).length === 0 ? (
                    <div className="text-center py-10 text-gray-500 border border-white/5 rounded-xl border-dashed">
                        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No transparency data recorded yet.</p>
                    </div>
                ) : (
                    Object.entries(groupedByPeriod)
                        .sort((a, b) => b[0].localeCompare(a[0])) // Sort by period desc
                        .map(([period, items]) => (
                            <motion.div
                                key={period}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-4"
                            >
                                <h3 className="text-lg font-mono font-bold text-accent mb-4 border-b border-white/5 pb-2">
                                    {new Date(period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <div className="space-y-2">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.metric_type === 'revenue' ? 'bg-green-500/20 text-green-400' :
                                                        item.metric_type === 'expenses' || item.metric_type === 'server_costs' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    <DollarSign size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold capitalize text-white">{item.metric_type.replace('_', ' ')}</p>
                                                    {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-white font-bold">
                                                    {item.metric_type === 'carbon_offset' ? `${item.value} kg` : `$${item.value.toFixed(2)}`}
                                                </span>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 pt-2 border-t border-white/5 flex justify-between text-xs text-gray-400 font-mono">
                                        <span>NET</span>
                                        <span className={
                                            (items.filter(i => i.metric_type === 'revenue').reduce((s, i) => s + i.value, 0) -
                                                items.filter(i => ['expenses', 'server_costs'].includes(i.metric_type)).reduce((s, i) => s + i.value, 0)) > 0
                                                ? 'text-green-400' : 'text-red-400'
                                        }>
                                            ${(
                                                items.filter(i => i.metric_type === 'revenue').reduce((s, i) => s + i.value, 0) -
                                                items.filter(i => ['expenses', 'server_costs'].includes(i.metric_type)).reduce((s, i) => s + i.value, 0)
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                )}
            </div>
        </div>
    );
};
