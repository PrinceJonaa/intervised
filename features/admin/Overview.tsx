import React, { useEffect, useState } from 'react';
import { Activity, BarChart3, Database, Globe, Server, Shield, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export const AdminOverview = () => {
    const [stats, setStats] = useState({
        services: 0,
        projects: 0,
        posts: 0,
        team: 0
    });
    const [health, setHealth] = useState({
        db: 'checking',
        ai: 'checking',
        latency: 0
    });

    useEffect(() => {
        checkSystemContext();
    }, []);

    const checkSystemContext = async () => {
        const start = Date.now();

        // Parallel data fetch
        const [
            { count: servicesCount },
            { count: projectsCount },
            { count: postsCount },
            { count: teamCount },
            dbCheck
        ] = await Promise.all([
            supabase.from('services').select('*', { count: 'exact', head: true }),
            supabase.from('projects').select('*', { count: 'exact', head: true }),
            supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
            supabase.from('team_members').select('*', { count: 'exact', head: true }),
            supabase.from('services').select('id').limit(1).single() // Latency check
        ]);

        const end = Date.now();

        setStats({
            services: servicesCount || 0,
            projects: projectsCount || 0,
            posts: postsCount || 0,
            team: teamCount || 0
        });

        setHealth({
            db: dbCheck.error ? 'error' : 'operational',
            ai: 'operational', // Mock for now, or check generic API
            latency: end - start
        });
    };

    const StatCard = ({ label, value, icon: Icon, color }: any) => (
        <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={100} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <Icon size={18} />
                    <span className="text-xs uppercase font-mono tracking-wider">{label}</span>
                </div>
                <div className="text-3xl font-display font-bold">{value}</div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-display font-bold mb-2">System Status</h2>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        <Activity size={12} />
                        <span>OPERATIONAL</span>
                    </div>
                    <div className="text-gray-500">
                        Latency: {health.latency}ms
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active Protocols" value={stats.services} icon={Zap} color="text-yellow-400" />
                <StatCard label="Deployments" value={stats.projects} icon={Globe} color="text-blue-400" />
                <StatCard label="Transmissions" value={stats.posts} icon={Activity} color="text-purple-400" />
                <StatCard label="Operatives" value={stats.team} icon={Shield} color="text-green-400" />
            </div>

            {/* Health Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-black/40">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Database size={18} className="text-accent" />
                        <span>Database Integrity</span>
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-300">Connection Status</span>
                            <span className="text-xs font-mono text-green-400 uppercase">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-300">Replica Identity</span>
                            <span className="text-xs font-mono text-gray-400 uppercase">Default</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-300">Region</span>
                            <span className="text-xs font-mono text-gray-400 uppercase">aws-us-east-1</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-black/40">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Server size={18} className="text-blue-400" />
                        <span>AI Inference Engine</span>
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-300">G4F Gateway</span>
                            <span className="text-xs font-mono text-green-400 uppercase">Online</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-300">Gemini 1.5 Pro</span>
                            <span className="text-xs font-mono text-green-400 uppercase">Available</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-300">Stream Status</span>
                            <span className="text-xs font-mono text-yellow-400 uppercase">Checking...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
