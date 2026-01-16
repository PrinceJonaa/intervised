/**
 * Terms of Service Page
 */
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsPage() {
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
                            <FileText size={24} />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold">Terms of Service</h1>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-300">
                        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                        <h3>1. Agreement to Terms</h3>
                        <p>
                            These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Intervised ("we," "us" or "our"), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
                        </p>

                        <h3>2. Intellectual Property Rights</h3>
                        <p>
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                        </p>

                        <h3>3. User Representations</h3>
                        <p>
                            By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Use.
                        </p>

                        <h3>4. Prohibited Activities</h3>
                        <p>
                            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                        </p>

                        <h3>5. Term and Termination</h3>
                        <p>
                            These Terms of Use shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF USE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON.
                        </p>

                        <h3>6. Contact Us</h3>
                        <p>
                            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at support@intervised.com.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default TermsPage;
