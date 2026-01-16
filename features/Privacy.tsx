/**
 * Privacy Policy Page
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <section className="min-h-screen pt-28 pb-32 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to home
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                            <Shield size={24} />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-300">
                        <p className="text-sm text-gray-500 mb-8">Last updated: January 16, 2026</p>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Your data belongs to you.</h3>
                                <p>
                                    We're Intervised. We build tools for coherent collaboration. This policy explains what data we hold, why we hold it, and how you stay in control. We wrote this to be readable by humans, not just lawyers.
                                </p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">1. What We Collect</h3>
                                <p className="mb-4">We collect only what's needed to make Intervised work:</p>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-accent mb-1">Account Information</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-400">
                                            <li>Name and email address (provided when you sign up via Google or email)</li>
                                            <li>Profile information you choose to add</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-accent mb-1">Usage Data</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-400">
                                            <li>Which features you use and when</li>
                                            <li>Technical information (browser type, IP address, device type) to keep the service running</li>
                                            <li>Error logs to fix bugs</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <h4 className="font-bold text-white mb-2">What We DON'T Collect</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-400">
                                            <li>Browsing activity outside Intervised</li>
                                            <li>Device fingerprints or tracking identifiers</li>
                                            <li>Audio, video, or location data</li>
                                            <li>Anything from third-party sites you visit</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="mt-4 italic text-gray-400">
                                    <strong>You can see everything we have.</strong> Request your complete data export anytime at <a href="mailto:support@intervised.com" className="text-accent hover:underline">support@intervised.com</a>. We'll send it within 48 hours in a format you can actually read.
                                </p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">2. How We Use Your Information</h3>
                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-bold text-accent mb-2">We use your data to:</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-400">
                                            <li>Create and maintain your account</li>
                                            <li>Deliver the features you're using</li>
                                            <li>Send you updates you've agreed to receive</li>
                                            <li>Improve the product through aggregated analytics</li>
                                            <li>Respond when you contact support</li>
                                        </ul>
                                    </div>
                                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                        <h4 className="font-bold text-red-400 mb-2">We will NEVER:</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-400">
                                            <li>Sell your data to anyone</li>
                                            <li>Use algorithms to manipulate your behavior</li>
                                            <li>Track you across other websites</li>
                                            <li>Build shadow profiles</li>
                                            <li>Keep data longer than necessary</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="mt-4 text-center text-white font-medium">Your autonomy matters more to us than your engagement time.</p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">3. How Long We Keep Your Data</h3>
                                <p className="mb-4">Data dissolves when its purpose is complete:</p>
                                <ul className="space-y-2">
                                    <li className="flex gap-2"><strong className="text-white min-w-[140px]">Active accounts:</strong> We keep your data while you're using Intervised</li>
                                    <li className="flex gap-2"><strong className="text-white min-w-[140px]">Deleted accounts:</strong> All personal data purged within 30 days</li>
                                    <li className="flex gap-2"><strong className="text-white min-w-[140px]">Analytics:</strong> Anonymized and kept for improvement</li>
                                    <li className="flex gap-2"><strong className="text-white min-w-[140px]">Backups:</strong> Fully overwritten within 90 days</li>
                                </ul>
                                <p className="mt-4 text-gray-400">You can request immediate deletion anytime. We'll confirm it's done.</p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">4. Who We Share Data With</h3>
                                <p className="mb-4"><strong>We do not share your data except:</strong></p>
                                <ol className="list-decimal pl-5 space-y-2 text-gray-300 mb-6">
                                    <li><strong>With your explicit permission</strong> (like when you enable an integration)</li>
                                    <li><strong>Legal requirements</strong> (court orders, subpoenas—we'll notify you unless legally prohibited)</li>
                                    <li><strong>Service providers</strong> (hosting, email delivery) under strict contracts that forbid them from using your data for anything else</li>
                                </ol>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <h4 className="font-bold text-white mb-2">We will never:</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-400">
                                        <li>Sell bundled datasets to third parties</li>
                                        <li>Use "partners" as a loophole for data extraction</li>
                                        <li>Participate in ad networks that profile you</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">5. Your Rights</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                        <li><strong>Access</strong> your data anytime</li>
                                        <li><strong>Correct</strong> inaccurate information</li>
                                        <li><strong>Export</strong> everything we have about you</li>
                                    </ul>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                        <li><strong>Delete</strong> your account and data</li>
                                        <li><strong>Opt out</strong> of communications</li>
                                        <li><strong>Object</strong> to processing</li>
                                    </ul>
                                </div>
                                <p className="mt-6 text-gray-400">
                                    Contact us at <a href="mailto:support@intervised.com" className="text-accent hover:underline">support@intervised.com</a>. We'll respond within 5 business days.
                                </p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">6. Security</h3>
                                <p>
                                    We use encryption, secure servers, and regular audits to protect your data. No system is perfect, but we've taken reasonable steps. If there's ever a breach affecting you, we'll notify you immediately and explain what happened.
                                </p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">7. Changes to This Policy</h3>
                                <p>
                                    If we change this policy in meaningful ways, we'll email you and get your consent before the changes take effect. We won't hide updates in fine print.
                                </p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">8. Our Commitments</h3>
                                <p className="mb-4">Intervised exists to enable coherent work, not extract data. To stay accountable:</p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-300 mb-4">
                                    <li><strong>Annual transparency report</strong> on data requests and policy changes</li>
                                    <li><strong>User council</strong> to review major changes before launch</li>
                                    <li><strong>Independent audit</strong> every 2 years to verify we're honoring these commitments</li>
                                </ul>
                                <p>If we violate these terms in ways that harm you, we'll acknowledge it publicly and make it right.</p>
                            </div>

                            <div className="bg-accent/10 p-6 rounded-2xl border border-accent/20 text-center mt-12">
                                <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
                                <p className="text-gray-400">Questions about this policy?</p>
                                <a href="mailto:support@intervised.com" className="text-accent hover:underline font-bold text-lg block mt-2">support@intervised.com</a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default PrivacyPage;
