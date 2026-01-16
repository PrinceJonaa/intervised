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
                        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                        <h3>1. Introduction</h3>
                        <p>
                            Welcome to Intervised ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                        </p>

                        <h3>2. Information We Collect</h3>
                        <p>
                            We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
                        </p>
                        <ul>
                            <li><strong>Personal Data:</strong> Name, email address, and other contact info provided during login (via Google or Email).</li>
                            <li><strong>Usage Data:</strong> Information about how you use our website.</li>
                        </ul>

                        <h3>3. How We Use Your Information</h3>
                        <p>
                            We use personal information collected via our website for a variety of business purposes described below:
                        </p>
                        <ul>
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send administrative information to you.</li>
                            <li>To fulfill and manage your orders/bookings.</li>
                            <li>To protect our Services.</li>
                        </ul>

                        <h3>4. Sharing Your Information</h3>
                        <p>
                            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                        </p>

                        <h3>5. Data Security</h3>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>

                        <h3>6. Contact Us</h3>
                        <p>
                            If you have questions or comments about this policy, you may email us at support@intervised.com.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default PrivacyPage;
