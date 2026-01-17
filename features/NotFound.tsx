import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    useSEO({
        title: '404 - Page Not Found | Intervised',
        description: 'The page you are looking for does not exist.',
        noIndex: true
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md"
            >
                <div className="text-[120px] sm:text-[180px] font-display font-bold leading-none text-white/10 select-none">
                    404
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold -mt-8 mb-4 text-white">
                    Page Not Found
                </h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors text-white"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-void font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        <Home size={18} />
                        Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};
