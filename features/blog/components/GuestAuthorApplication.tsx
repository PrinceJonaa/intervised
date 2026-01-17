/**
 * GuestAuthorApplication - Form for users to apply to be guest authors
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Link as LinkIcon, Send, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { guestAuthorService } from '../../../lib/supabase/guestAuthorService';
import { authService } from '../../../lib/supabase/authService';

export default function GuestAuthorApplication() {
    const [bio, setBio] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                throw new Error('You must be logged in to apply.');
            }

            await guestAuthorService.applyAsGuestAuthor(bio, portfolioUrl);
            setStatus('success');
        } catch (err: any) {
            console.error('Application error:', err);
            setStatus('error');
            setErrorMessage(err.message || 'Failed to submit application.');
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-400 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Application Received</h2>
                    <p className="text-gray-400 mb-8">
                        Thank you for your interest in contributing! Our team will review your application and get back to you shortly.
                    </p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors font-medium"
                    >
                        <ArrowLeft size={18} /> Return to Blog
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="max-w-2xl mx-auto px-6">
                <Link to="/blog" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm">
                    <ArrowLeft size={16} /> Back to Blog
                </Link>

                <div className="mb-10">
                    <h1 className="text-4xl font-display font-bold mb-4">Become a Contributor</h1>
                    <p className="text-gray-400 text-lg">
                        Share your insights and stories with the Intervised community.
                        Apply below to become a verified guest author.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                            <AlertCircle size={20} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Why do you want to write needed for us? (Mini Bio)
                        </label>
                        <div className="relative">
                            <PenTool className="absolute left-3 top-3 text-gray-500" size={18} />
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                required
                                minLength={50}
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-accent outline-none min-h-[150px]"
                                placeholder="Tell us about your expertise and what topics you'd like to cover..."
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-right">
                            {bio.length} characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Portfolio or Writing Samples
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            <input
                                type="url"
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-accent outline-none"
                                placeholder="https://"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full bg-accent hover:bg-white text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'submitting' ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Application <Send size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>By submitting, you agree to our <Link to="/terms" className="text-accent hover:underline">Content Guidelines</Link>.</p>
                </div>
            </div>
        </div>
    );
}
