/**
 * Terms of Service Page
 */
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsPage() {
    const navigate = useNavigate();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <section className="min-h-screen pt-28 pb-32 px-4 sm:px-6 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-20 left-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
                    >
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="font-mono tracking-wide">BACK TO HOME</span>
                    </button>
                    <div className="text-xs text-gray-600 font-mono border border-white/5 px-3 py-1 rounded-full">
                        LEGAL DOCUMENT
                    </div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass-panel p-8 sm:p-12 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                >
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-50" />

                    <motion.div variants={itemVariants} className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-accent border border-accent/20 shadow-[0_0_30px_rgba(244,201,93,0.1)]">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-2 tracking-tight">Terms of Service</h1>
                            <p className="text-sm font-mono text-accent/80 tracking-widest uppercase">Effective as of January 16, 2026</p>
                        </div>
                    </motion.div>

                    <div className="prose prose-invert max-w-none text-gray-300">
                        <motion.div variants={itemVariants} className="space-y-12">

                            {/* Intro */}
                            <div className="bg-white/5 p-8 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FileText size={120} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">This is an agreement between us.</h3>
                                <p className="text-lg leading-relaxed text-gray-300 relative z-10">
                                    By using Intervised, you agree to these terms. We also agree to uphold them with you. If we violate them, you can hold us accountable. <span className="text-white font-medium">This is a relational contract, not just legal protection for us.</span>
                                </p>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Section 1 */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-mono">01</span>
                                    The Basics
                                </h3>
                                <div className="bg-white/[0.02] p-6 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-accent mb-3 text-sm font-mono uppercase tracking-wide">CORE PRINCIPLES</h4>
                                    <ul className="grid gap-3">
                                        {[
                                            "We won't hide changes in buried emails. Major updates require re-consent.",
                                            "You can leave anytime with no penalties and full data export.",
                                            "We're building this tool with you, not on you."
                                        ].map((text, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                                                <span>{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Section 2 */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-mono">02</span>
                                    Ownership
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
                                        <h4 className="font-bold text-white mb-4 text-center pb-2 border-b border-white/10">WE OWN</h4>
                                        <ul className="space-y-2 text-sm text-gray-400">
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full" />Intervised Code</li>
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full" />Design & Visuals</li>
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full" />Brand & Trademarks</li>
                                        </ul>
                                    </div>
                                    <div className="p-6 rounded-xl border border-accent/20 bg-accent/5">
                                        <h4 className="font-bold text-accent mb-4 text-center pb-2 border-b border-accent/10">YOU OWN</h4>
                                        <ul className="space-y-2 text-sm text-gray-300">
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" />Your Projects & Content</li>
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" />Your Data Points</li>
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" />Right to Export</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="mt-4 text-center text-xs text-gray-500 font-mono">
                                    IF WE OPEN SOURCE ANYTHING, WE'LL CREDIT CONTRIBUTORS.
                                </p>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Section 3 & 4 */}
                            <div className="grid gap-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-mono">03</span>
                                        Responsibilities
                                    </h3>
                                    <p className="text-gray-400 mb-4">You agree to provide accurate info and keep your credentials secure. Easy.</p>
                                </div>

                                <div className="bg-red-500/[0.03] border border-red-500/10 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-sm font-mono text-red-400">04</span>
                                        <h3 className="text-xl font-bold text-red-200">The "Don't Be Evil" Clause</h3>
                                    </div>
                                    <p className="text-gray-400 mb-4 text-sm">You strictly cannot:</p>
                                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-400">
                                        {['Build manipulative/surveillance projects', 'Scrape data without consent', 'Impersonate others', 'Disrupt services (spam/attacks)', 'Violate laws', 'Reverse-engineer to harm us'].map((rule, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <div className="w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center text-[10px] text-red-400 mt-0.5">X</div>
                                                <span>{rule}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Section 5 - Ending it */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-mono">05</span>
                                    Termination
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-bold text-accent mb-2 text-sm uppercase">You can leave:</h4>
                                        <ul className="text-sm text-gray-400 space-y-1">
                                            <li>• Anytime. No hurdles.</li>
                                            <li>• Export your data (48hr delivery).</li>
                                            <li>• Delete account (purged in 30 days).</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2 text-sm uppercase">We can remove you:</h4>
                                        <ul className="text-sm text-gray-400 space-y-1">
                                            <li>• If you violate terms (we warn first).</li>
                                            <li>• If we shut down (90 days notice + refunds).</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    {['No Data Hostage', 'No Silent Termination', 'No Non-Competes'].map((tag, i) => (
                                        <span key={i} className="px-3 py-1 rounded-md bg-white/5 text-xs text-white border border-white/10">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Section 6 & 7 & 8 */}
                            <div className="text-sm text-gray-400 space-y-6">
                                <div>
                                    <strong className="text-white block mb-1">Liability & Warranties</strong>
                                    Provided "as is". We try our best, but can't guarantee perfection. Liability limited to what you paid in last 12 months. Standard legal safeguards.
                                </div>
                                <div>
                                    <strong className="text-white block mb-1">Disputes</strong>
                                    Talk to us first. Then arbitration or small claims.
                                </div>
                                <div>
                                    <strong className="text-white block mb-1">Accountability</strong>
                                    Transparency reports, User Council, Independent Audits. We hold ourselves to a high standard.
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white/10 to-transparent p-8 rounded-[2rem] border border-white/10 text-center mt-12 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Questions?</h3>
                                <p className="text-white/60 mb-6 relative z-10">We'll respond within 5 business days.</p>
                                <a
                                    href="mailto:support@intervised.com"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform relative z-10 shadow-lg"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default TermsPage;
