
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, User, Activity, FileText } from 'lucide-react';
import { getAuditLogs, type AuditLog } from '../../lib/supabase/adminService';
import { useToast } from '../../components/ToastSystem';

export const AuditLogViewer = () => {
    const { addToast } = useToast();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await getAuditLogs(100);
            setLogs(data);
        } catch (error) {
            console.error('Failed to load logs:', error);
            addToast('Failed to load audit logs', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('delete')) return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (action.includes('create')) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (action.includes('update')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">Audit Logs</h2>
                    <p className="text-sm text-gray-400">Track administrative actions</p>
                </div>
                <button
                    onClick={loadLogs}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Refresh Logs"
                >
                    <Activity size={16} />
                </button>
            </div>

            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 border-b border-white/10 text-gray-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Time</th>
                                <th className="p-4">Admin</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Target</th>
                                <th className="p-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Loading logs...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No actions recorded yet.</td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 whitespace-nowrap text-gray-400 font-mono text-xs">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                                                    {(log.admin_name || log.admin_email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-xs font-bold">{log.admin_name || 'Unknown'}</span>
                                                    <span className="text-gray-500 text-[10px]">{log.admin_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            <div className="flex items-center gap-1.5">
                                                <FileText size={12} className="text-gray-500" />
                                                <span className="font-mono text-xs opacity-70">{log.target_resource}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500 font-mono text-xs max-w-[200px] truncate" title={JSON.stringify(log.details, null, 2)}>
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
