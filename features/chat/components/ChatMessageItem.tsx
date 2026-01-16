import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, FileText, Terminal } from 'lucide-react';
import { formatText } from '../utils/markdownRenderer';
import { formatBytes } from '../../../features/Chat'; // We might need to duplicate formatBytes or import it if we export it. 
// Ideally formatBytes should be in a util. I'll duplicate for now or export it.

// Duplicate formatBytes here for safety as I'm not sure if Chat.tsx exports it cleanly without circular deps.
const formatBytesLocal = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};

interface ChatMessageItemProps {
    msg: any; // Type this properly if possible, but 'any' matches the implicit usage in Chat.tsx for now to avoid breakages. 
    // Message structure: { id, role, text, attachments, toolCalls, ... }
}

export const ChatMessageItem = memo(({ msg }: ChatMessageItemProps) => {
    const isUser = msg.role === 'user';
    const isSystem = msg.role === 'system';
    const isModel = msg.role === 'model';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 md:gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border shadow-lg ${isUser ? 'bg-white/5 border-white/20' : 'bg-accent/10 border-accent/30'}`}>
                {isUser ? <User size={14} className="text-gray-300" /> : <Sparkles size={14} className="text-accent" />}
            </div>
            <div className={`max-w-[85%] md:max-w-[85%] space-y-2 group ${isUser ? 'items-end flex flex-col' : ''}`}>
                {!isSystem && (
                    <div className="relative group/bubble w-full">
                        <div className={`p-4 md:p-8 rounded-2xl text-sm md:text-base shadow-lg backdrop-blur-md transition-all duration-300 ${isUser ? 'bg-white text-black rounded-tr-none' : 'glass-panel border-white/10 rounded-tl-none'}`}>
                            {isModel ? (
                                <div className="markdown-body font-sans text-gray-200">
                                    {formatText(msg.text)}
                                </div>
                            ) : (
                                msg.text ? <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p> : null
                            )}
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {msg.attachments.map((attachment: any) => {
                                        const cardBase = isUser
                                            ? 'bg-black/5 border-black/10 text-black/70'
                                            : 'bg-black/40 border-white/10 text-gray-300';
                                        const metaText = isUser ? 'text-black/50' : 'text-gray-500';
                                        const iconColor = isUser ? 'text-black/60' : 'text-gray-400';

                                        if (attachment.kind === 'image' && attachment.dataUrl) {
                                            return (
                                                <a
                                                    key={attachment.id}
                                                    href={attachment.dataUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block group"
                                                >
                                                    <img
                                                        src={attachment.dataUrl}
                                                        alt={attachment.name}
                                                        className={`w-full max-h-48 object-cover rounded-lg border ${isUser ? 'border-black/10' : 'border-white/10'}`}
                                                    />
                                                    <div className={`mt-1 text-[10px] truncate ${metaText}`}>{attachment.name}</div>
                                                </a>
                                            );
                                        }

                                        return (
                                            <div key={attachment.id} className={`flex items-center gap-2 p-2 rounded-lg border ${cardBase}`}>
                                                <FileText size={14} className={iconColor} />
                                                <div className="min-w-0">
                                                    <div className="text-xs font-mono truncate">{attachment.name}</div>
                                                    <div className={`text-[10px] ${metaText}`}>{formatBytesLocal(attachment.size)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {msg.toolCalls && msg.toolCalls.map((tc: any, idx: number) => (
                    <div key={idx} className="bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-gray-400 flex flex-col gap-2 shadow-inner w-full">
                        <div className="flex items-center gap-2 text-accent"><Terminal size={12} /><span className="font-bold">Executing: {tc.name}</span></div>
                    </div>
                ))}
                {isSystem && <span className="text-xs font-mono text-red-400 block ml-2 border-l-2 border-red-500/50 pl-2">{msg.text}</span>}
            </div>
        </motion.div>
    );
});

ChatMessageItem.displayName = 'ChatMessageItem';
