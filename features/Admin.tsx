/**
 * Admin Dashboard - Manage contacts, bookings, and content
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Calendar, MessageSquare, Users, FileText, Settings,
  LogOut, ChevronRight, Clock, CheckCircle2, Archive,
  Eye, Trash2, RefreshCw, X, User, Building2,
  Activity, Database, ShieldCheck, Lock as LockIcon, Loader2, AlertCircle, PenTool
} from 'lucide-react';

// ... (existing code)

import { useNavigate } from 'react-router-dom';
import { useAuthContext, ProtectedRoute } from '../components/AuthProvider';
import { useToast } from '../components/ToastSystem';
import { getContactMessages, updateMessageStatus, type ContactMessage, type ContactStatus } from '../lib/supabase/contactService';
import { getBookings, updateBookingStatus, type Booking, type BookingStatus } from '../lib/supabase/bookingService';
import { ServiceManager } from './admin/ServiceManager';
import { ProjectManager } from './admin/ProjectManager';
import { BlogManager } from './admin/BlogManager';

// Tab types

type AdminTab = 'contacts' | 'bookings' | 'services' | 'content' | 'blog' | 'comments' | 'settings' | 'system';

// Status badge component
function StatusBadge({ status, type }: { status: string; type: 'contact' | 'booking' }) {
  const colors: Record<string, string> = {
    // Contact statuses
    new: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    read: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    replied: 'bg-green-500/20 text-green-400 border-green-500/50',
    archived: 'bg-gray-800/50 text-gray-500 border-gray-700/50',
    // Booking statuses
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    completed: 'bg-green-500/20 text-green-400 border-green-500/50',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${colors[status] || colors.new}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

// Contact card component
function ContactCard({
  contact,
  onStatusChange,
  onView
}: {
  contact: ContactMessage;
  onStatusChange: (status: ContactStatus) => void;
  onView: () => void;
}) {
  const date = new Date(contact.created_at || '').toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-white">{contact.name}</h4>
            <p className="text-gray-400 text-xs">{contact.email}</p>
          </div>
        </div>
        <StatusBadge status={contact.status || 'new'} type="contact" />
      </div>

      {contact.company && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Building2 size={12} />
          {contact.company}
        </div>
      )}

      <p className="text-gray-300 text-sm line-clamp-2 mb-3">{contact.message}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-500">{date}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Eye size={14} />
          </button>
          {contact.status !== 'replied' && (
            <button
              onClick={() => onStatusChange('replied')}
              className="p-2 hover:bg-green-500/20 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
          <button
            onClick={() => onStatusChange('archived')}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Archive size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Booking card component
function BookingCard({
  booking,
  onStatusChange
}: {
  booking: Booking;
  onStatusChange: (status: BookingStatus) => void;
}) {
  const date = booking.scheduled_date
    ? new Date(booking.scheduled_date).toLocaleDateString()
    : 'TBD';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-white">{booking.service_name}</h4>
          <p className="text-gray-400 text-xs">{booking.customer_name}</p>
        </div>
        <StatusBadge status={booking.status || 'pending'} type="booking" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={12} />
          {date}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <User size={12} />
          {booking.provider || 'Any'}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-accent font-mono font-bold">${booking.total_price}</span>
        <div className="flex items-center gap-1">
          {booking.status === 'pending' && (
            <button
              onClick={() => onStatusChange('confirmed')}
              className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Confirm
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={() => onStatusChange('in_progress')}
              className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              Start
            </button>
          )}
          {booking.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange('completed')}
              className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              Complete
            </button>
          )}
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button
              onClick={() => onStatusChange('cancelled')}
              className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// System Health Component
function SystemHealth() {
  const { user, profile } = useAuthContext();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setDbStatus('checking');
    const start = performance.now();
    try {
      // Simple query to check connection
      await getContactMessages({ limit: 1 });
      const end = performance.now();
      setDbLatency(Math.round(end - start));
      setDbStatus('connected');
    } catch (error) {
      setDbStatus('error');
    }
  };

  const provider = user?.app_metadata?.provider || 'email';
  const lastSignIn = new Date(user?.last_sign_in_at || '').toLocaleString();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Connectivity Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-2xl border border-white/10"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Activity size={20} className="text-accent" />
          System Status
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Database size={18} className="text-gray-400" />
              <span className="text-sm text-gray-300">Database Connection</span>
            </div>
            <div className="flex items-center gap-2">
              {dbStatus === 'checking' && <Loader2 size={16} className="animate-spin text-yellow-400" />}
              {dbStatus === 'connected' && (
                <>
                  <span className="text-xs font-mono text-gray-500">{dbLatency}ms</span>
                  <CheckCircle2 size={16} className="text-green-400" />
                </>
              )}
              {dbStatus === 'error' && <AlertCircle size={16} className="text-red-400" />}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-gray-400" />
              <span className="text-sm text-gray-300">Auth Service</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-green-400">ONLINE</span>
              <CheckCircle2 size={16} className="text-green-400" />
            </div>
          </div>
        </div>

        <button
          onClick={checkConnection}
          className="mt-4 text-xs text-center w-full py-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500"
        >
          Re-run Checks
        </button>
      </motion.div>

      {/* Auth Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 rounded-2xl border border-white/10"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <LockIcon size={20} className="text-accent" />
          Auth Configuration
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-gray-500 uppercase mb-1">Current Role</p>
              <p className="font-mono text-accent">{profile?.role || 'Guest'}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-gray-500 uppercase mb-1">Provider</p>
              <p className="font-mono text-white capitalize">{provider}</p>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl">
            <p className="text-xs text-gray-500 uppercase mb-1">User ID</p>
            <p className="font-mono text-xs text-gray-400 break-all">{user?.id}</p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl">
            <p className="text-xs text-gray-500 uppercase mb-1">Last Sign In</p>
            <p className="font-mono text-xs text-gray-400">{lastSignIn}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Main Admin Dashboard
function AdminDashboardContent() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, profile, signOut, isAdmin } = useAuthContext();

  const [activeTab, setActiveTab] = useState<AdminTab>('contacts');
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contactsData, bookingsData] = await Promise.all([
        getContactMessages({ limit: 50 }),
        getBookings({ limit: 50 }),
      ]);
      setContacts(contactsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactStatusChange = async (id: string, status: ContactStatus) => {
    try {
      await updateMessageStatus(id, status);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      addToast(`Contact marked as ${status}`, 'success');
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleBookingStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      addToast(`Booking ${status}`, 'success');
    } catch (error) {
      addToast('Failed to update booking', 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Stats
  const newContactsCount = contacts.filter(c => c.status === 'new').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

  const tabs = [
    { id: 'contacts' as AdminTab, label: 'Messages', icon: Mail, count: newContactsCount },
    { id: 'bookings' as AdminTab, label: 'Bookings', icon: Calendar, count: pendingBookingsCount },
    { id: 'services' as AdminTab, label: 'Services', icon: Database },
    { id: 'content' as AdminTab, label: 'Portfolio', icon: FileText },
    { id: 'blog' as AdminTab, label: 'Blog', icon: PenTool },
    { id: 'comments' as AdminTab, label: 'Comments', icon: MessageSquare, count: 0 },
    { id: 'system' as AdminTab, label: 'System Health', icon: Activity },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  return (
    <section className="min-h-screen pt-28 pb-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">
              COMMAND <span className="text-gray-500">CENTER</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, {profile?.full_name || user?.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-accent text-black font-bold'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-black/20' : 'bg-accent/20 text-accent'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-mono">Loading data...</p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Contacts Tab */}
              {activeTab === 'contacts' && (
                <motion.div
                  key="contacts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {contacts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <Mail size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contacts.map(contact => (
                        <ContactCard
                          key={contact.id}
                          contact={contact}
                          onStatusChange={(status) => handleContactStatusChange(contact.id, status)}
                          onView={() => setSelectedContact(contact)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {bookings.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No bookings yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bookings.map(booking => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onStatusChange={(status) => handleBookingStatusChange(booking.id, status)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ServiceManager />
                </motion.div>
              )}

              {/* Content / Portfolio Tab */}
              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ProjectManager />
                </motion.div>
              )}

              {/* Blog Tab */}
              {activeTab === 'blog' && (
                <motion.div
                  key="blog"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <BlogManager />
                </motion.div>
              )}

              {/* Comments Tab (Placeholder) */}
              {activeTab === 'comments' && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-20 text-gray-500"
                >
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Comment moderation coming soon</p>
                </motion.div>
              )}

              {/* System Health Tab */}
              {activeTab === 'system' && (
                <motion.div
                  key="system"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SystemHealth />
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl"
                >
                  <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-lg mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                        <p className="text-white">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Role</label>
                        <p className="text-white capitalize">{profile?.role || 'Member'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">User ID</label>
                        <p className="text-gray-400 font-mono text-sm">{user?.id}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Contact Detail Modal */}
        <AnimatePresence>
          {selectedContact && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              onClick={() => setSelectedContact(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedContact.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedContact.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {selectedContact.company && (
                  <p className="text-gray-400 text-sm mb-2">
                    <span className="text-gray-500">Company:</span> {selectedContact.company}
                  </p>
                )}
                {selectedContact.service_interest && (
                  <p className="text-gray-400 text-sm mb-2">
                    <span className="text-gray-500">Interest:</span> {selectedContact.service_interest}
                  </p>
                )}
                {selectedContact.budget && (
                  <p className="text-gray-400 text-sm mb-2">
                    <span className="text-gray-500">Budget:</span> {selectedContact.budget}
                  </p>
                )}
                {selectedContact.timeline && (
                  <p className="text-gray-400 text-sm mb-4">
                    <span className="text-gray-500">Timeline:</span> {selectedContact.timeline}
                  </p>
                )}

                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <p className="text-white whitespace-pre-wrap">{selectedContact.message}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(selectedContact.created_at || '').toLocaleString()}
                  </span>
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: Your inquiry to Intervised`}
                    className="px-4 py-2 bg-accent text-black font-bold rounded-lg hover:bg-accent/90 transition-colors text-sm"
                  >
                    Reply via Email
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// Wrapped with auth protection
export function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  // Show login page if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <ProtectedRoute
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-gray-400 mb-6">Please sign in to access the admin dashboard.</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        }
      >
        <AdminDashboardContent />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to access the admin dashboard.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

export default AdminPage;
