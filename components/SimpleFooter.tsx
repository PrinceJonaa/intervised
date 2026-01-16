import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const SimpleFooter = () => {
    const currentYear = new Date().getFullYear();
    const location = useLocation();

    // Hide footer on Chat and Admin pages (app-like views)
    if (['/chat', '/admin', '/login'].includes(location.pathname)) return null;

    return (
        <footer className="w-full py-8 mt-auto px-4 z-40 relative">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs text-gray-400 font-mono tracking-wide uppercase">

                {/* Copyright */}
                <div className="text-center md:text-left">
                    © {currentYear} INTERVISED. ALL RIGHTS RESERVED.
                </div>

                {/* Links */}
                <div className="flex items-center gap-6">
                    <Link
                        to="/privacy"
                        className="hover:text-accent transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <div className="w-1 h-1 bg-gray-700 rounded-full" />
                    <Link
                        to="/terms"
                        className="hover:text-accent transition-colors"
                    >
                        Terms of Service
                    </Link>
                    <div className="w-1 h-1 bg-gray-700 rounded-full" />
                    <a
                        href="mailto:contact@intervised.com"
                        className="hover:text-accent transition-colors"
                    >
                        Contact
                    </a>
                </div>
            </div>

            {/* Spacer for NavDock */}
            <div className="h-20 sm:h-24" />
        </footer>
    );
};
