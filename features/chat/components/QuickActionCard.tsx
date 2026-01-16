import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
    icon: LucideIcon;
    title: string;
    prompt: string;
    onClick: (prompt: string) => void;
}

export const QuickActionCard = memo(({ icon: Icon, title, prompt, onClick }: QuickActionCardProps) => (
    <button onClick={() => onClick(prompt)} className="text-left group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 p-4 rounded-xl transition-all hover:-translate-y-1 relative overflow-hidden glass-panel-hover">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Icon className="text-gray-400 group-hover:text-accent mb-3 transition-colors" size={20} />
        <h4 className="font-bold text-sm text-gray-200 group-hover:text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-500 line-clamp-2">{prompt}</p>
    </button>
));

QuickActionCard.displayName = 'QuickActionCard';
