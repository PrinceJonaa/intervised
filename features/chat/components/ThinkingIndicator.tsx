import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

export const ThinkingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex gap-4 items-end"
    >
        <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(244,201,93,0.2)]">
            <Cpu size={14} className="text-accent animate-spin-slow" />
        </div>
        <div className="glass-panel px-5 py-3 rounded-2xl rounded-bl-none border-white/10 flex items-center gap-2">
            <span className="text-xs font-mono text-accent uppercase tracking-wider mr-2">Computing</span>
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
        </div>
    </motion.div>
);
