import React from 'react';

export const MarkdownRenderer = ({ content }: { content: string }) => {
  const parseInline = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="text-accent font-bold">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*')) return <em key={index} className="text-gray-300 italic">{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-sm text-accent border border-white/5">{part.slice(1, -1)}</code>;
      if (part.match(linkRegex)) {
         const match = linkRegex.exec(part);
         if (match) return <a key={index} href={match[2]} target="_blank" rel="noreferrer" className="text-accent hover:underline underline-offset-4 decoration-accent/30">{match[1]}</a>;
      }
      return part;
    });
  };

  const generateId = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  return (
    <article className="prose prose-invert prose-lg max-w-none">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('# ')) {
            const text = line.slice(2);
            return <h1 id={generateId(text)} key={i} className="scroll-mt-32 text-3xl md:text-5xl font-display font-bold mb-8 mt-12 text-white leading-tight">{text}</h1>;
        }
        if (line.startsWith('## ')) {
            const text = line.slice(3);
            return <h2 id={generateId(text)} key={i} className="scroll-mt-32 text-2xl md:text-3xl font-display font-bold mb-6 mt-12 text-accent flex items-center gap-4">{text} <div className="h-px flex-1 bg-accent/20"></div></h2>;
        }
        if (line.startsWith('### ')) {
            const text = line.slice(4);
            return <h3 id={generateId(text)} key={i} className="scroll-mt-32 text-xl md:text-2xl font-display font-bold mb-4 mt-8 text-white">{text}</h3>;
        }
        if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-accent pl-6 my-10 italic text-xl md:text-2xl text-gray-300 font-serif leading-relaxed bg-white/5 py-6 pr-6 rounded-r-xl">{line.slice(2)}</blockquote>;
        if (line.startsWith('- ')) return <li key={i} className="list-disc list-inside mb-3 ml-4 text-gray-300 text-lg leading-relaxed marker:text-accent">{parseInline(line.slice(2))}</li>;
        if (line.trim() === '') return <div key={i} className="h-4" />;
        return <p key={i} className="mb-6 text-gray-300 leading-8 font-serif text-lg md:text-xl">{parseInline(line)}</p>;
      })}
    </article>
  );
};