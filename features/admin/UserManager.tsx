import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, User, Mail, MoreVertical, Ban, CheckCircle, XCircle, Filter, Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useToast } from '../../components/ToastSystem';
import { logAdminAction } from '../../lib/supabase/adminService';
import { inviteUser, deleteUser, updateUserPermissions, type UserPermission } from '../../lib/supabase/adminService';
import type { Database } from '../../lib/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const UserManager = () => {
    const { addToast } = useToast();
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member' | 'contributor'>('all');

    // Modal states
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
            addToast('Failed to load user data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: 'member' | 'admin' | 'contributor') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            await logAdminAction('update_role', 'profiles', userId, { from: users.find(u => u.id === userId)?.role, to: newRole });
            addToast(`User role updated to ${newRole}`, 'success');
        } catch (error) {
            addToast('Failed to update role', 'error');
        }
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await inviteUser(inviteEmail, inviteName);
            addToast(`Invite sent to ${inviteEmail}`, 'success');
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteName('');
            loadUsers(); // Reload to see new user if auto-confirmed
        } catch (error) {
            addToast('Failed to invite user: ' + error.message, 'error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            addToast('User deleted successfully', 'success');
        } catch (error) {
            addToast('Failed to delete user', 'error');
        }
    };

    const handleTogglePermission = async (userId: string, permission: keyof UserPermission, currentValue: boolean) => {
        try {
            const user = users.find(u => u.id === userId);
            if (!user) return;

            const currentPermissions = (user.permissions as UserPermission) || {};
            const newPermissions = { ...currentPermissions, [permission]: !currentValue };

            await updateUserPermissions(userId, newPermissions);

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u));
            addToast(`Permission updated`, 'success');
        } catch (error) {
            addToast('Failed to update permission', 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const RoleBadge = ({ role }: { role: string }) => {
        const colors = {
            admin: 'bg-red-500/10 text-red-500 border-red-500/20',
            contributor: 'bg-accent/10 text-accent border-accent/20',
            member: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${colors[role as keyof typeof colors] || colors.member}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold">User Directory</h2>
                    <p className="text-sm text-gray-500">Manage access and permissions</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-accent outline-none"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-accent outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="contributor">Contributors</option>
                        <option value="member">Members</option>
                    </select>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors text-sm"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add User</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">User</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Role</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Permissions</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Joined</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => {
                                    const permissions = (user.permissions as UserPermission) || {};
                                    return (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center border border-white/10 overflow-hidden">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt={user.full_name || ''} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={14} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{user.full_name || 'Anonymous User'}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Mail size={10} />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <RoleBadge role={user.role || 'member'} />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleTogglePermission(user.id, 'can_blog', permissions.can_blog || false)}
                                                        className={`p-2 rounded-lg border transition-colors touch-target ${permissions.can_blog ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                                        title="Can Blog"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleTogglePermission(user.id, 'can_comment', permissions.can_comment || false)}
                                                        className={`p-2 rounded-lg border transition-colors touch-target ${permissions.can_comment ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                                        title="Can Comment"
                                                    >
                                                        <User size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-400 font-mono">
                                                {new Date(user.created_at || '').toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-sm">
                                                    <select
                                                        value={user.role || 'member'}
                                                        onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                                                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 focus:text-white focus:border-accent outline-none"
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="contributor">Contributor</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors touch-target"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                        onClick={() => setShowInviteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface border border-white/10 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4">Invite New User</h3>
                            <form onSubmit={handleInviteUser} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={inviteName}
                                        onChange={(e) => setInviteName(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-accent outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteModal(false)}
                                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-accent text-black font-bold rounded-lg hover:bg-accent/90 transition-colors text-sm"
                                    >
                                        Send Invite
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
