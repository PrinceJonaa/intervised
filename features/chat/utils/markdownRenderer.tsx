import React from 'react';

// --- Comprehensive Markdown Renderer ---
export const processInlines = (text: string) => {
    // Split by bold, italics, inline code, and links
    const parts = text.split(/(\*\*.*?\*\*|__.*?__|(?<!\*)\*.*?\*(?!\*)|(?<!_)_.*?_(?!_)|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
        if (!part) return null;

        // Bold (** or __)
        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
            return <strong key={i} className="text-accent font-bold">{part.slice(2, -2)}</strong>;
        }
        // Italics (* or _)
        if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
            return <em key={i} className="text-gray-400 italic">{part.slice(1, -1)}</em>;
        }
        // Inline Code
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-xs border border-white/5">{part.slice(1, -1)}</code>;
        }
        // Links
        if (part.startsWith('[') && part.includes('](')) {
            const match = /\[(.*?)\]\((.*?)\)/.exec(part);
            if (match) {
                return (
                    <a
                        key={i}
                        href={match[2]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline underline-offset-2 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                        {match[1]}
                    </a>
                );
            }
        }
        return <span key={i}>{part}</span>;
    });
};

export const formatText = (text: string) => {
    // Split by triple-backtick code blocks
    const blocks = text.split(/(```[\s\S]*?```)/g);

    return blocks.map((block, blockIdx) => {
        if (!block) return null;

        // Handle Code Blocks
        if (block.startsWith('```') && block.endsWith('```')) {
            const fullCode = block.slice(3, -3).trim();
            const firstLineEnd = fullCode.indexOf('\n');
            const language = firstLineEnd !== -1 ? fullCode.substring(0, firstLineEnd).trim() : '';
            const codeContent = firstLineEnd !== -1 ? fullCode.substring(firstLineEnd + 1) : fullCode;

            return (
                <div key={`block-${blockIdx}`} className="my-6 group/code">
                    <div className="flex items-center justify-between bg-black/40 px-4 py-2 rounded-t-xl border-x border-t border-white/10">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{language || 'code'}</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                        </div>
                    </div>
                    <pre className="bg-black/60 p-4 rounded-b-xl border border-white/10 overflow-x-auto text-xs font-mono text-green-400 leading-relaxed shadow-inner">
                        <code>{codeContent}</code>
                    </pre>
                </div>
            );
        }

        // Process normal text line by line
        const lines = block.split('\n');
        return lines.map((line, lineIdx) => {
            const key = `block-${blockIdx}-line-${lineIdx}`;
            const trimmed = line.trim();

            // Horizontal Rule
            if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
                return <hr key={key} className="my-8 border-white/10" />;
            }

            // Headers (h1-h6)
            const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
            if (headerMatch) {
                const level = headerMatch[1].length;
                const content = headerMatch[2];
                const baseClass = "font-display font-bold text-white mb-4 mt-8";

                switch (level) {
                    case 1: return <h1 key={key} className={`${baseClass} text-3xl md:text-4xl border-b border-white/10 pb-4`}>{processInlines(content)}</h1>;
                    case 2: return <h2 key={key} className={`${baseClass} text-2xl md:text-3xl flex items-center gap-4`}>{processInlines(content)} <div className="h-px flex-1 bg-accent/20" /></h2>;
                    case 3: return <h3 key={key} className={`${baseClass} text-xl md:text-2xl text-accent`}>{processInlines(content)}</h3>;
                    case 4: return <h4 key={key} className={`${baseClass} text-lg md:text-xl text-gray-200`}>{processInlines(content)}</h4>;
                    case 5: return <h5 key={key} className={`${baseClass} text-base md:text-lg text-gray-300`}>{processInlines(content)}</h5>;
                    case 6: return <h6 key={key} className={`${baseClass} text-sm md:text-base text-gray-400 uppercase tracking-widest`}>{processInlines(content)}</h6>;
                }
            }

            // Blockquotes
            if (line.startsWith('> ')) {
                return (
                    <div key={key} className="border-l-4 border-accent bg-white/5 px-6 py-4 my-6 rounded-r-xl italic font-serif text-lg text-gray-300">
                        {processInlines(line.slice(2))}
                    </div>
                );
            }

            // Unordered Lists
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ')) {
                return (
                    <div key={key} className="flex gap-3 ml-2 my-2 items-start group/list">
                        <span className="text-accent mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(244,201,93,0.4)] group-hover/list:scale-125 transition-transform" />
                        <div className="flex-1 text-gray-300 leading-relaxed">{processInlines(trimmed.slice(2))}</div>
                    </div>
                );
            }

            // Ordered Lists
            const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
            if (orderedMatch) {
                return (
                    <div key={key} className="flex gap-3 ml-2 my-2 items-start group/list">
                        <span className="text-accent font-mono text-xs font-bold mt-1 min-w-[1.2rem]">{orderedMatch[1]}.</span>
                        <div className="flex-1 text-gray-300 leading-relaxed">{processInlines(orderedMatch[2])}</div>
                    </div>
                );
            }

            // Empty line / spacing
            if (trimmed === '') return <div key={key} className="h-4" />;

            // Regular paragraph
            return <p key={key} className="mb-4 text-gray-300 leading-relaxed text-sm md:text-base">{processInlines(line)}</p>;
        });
    });
};
