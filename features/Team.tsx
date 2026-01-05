

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Instagram, Mail, Music, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { TEAM_DATA } from '../constants';
import { TeamSkeleton } from '../components/Loading';
import { useToast } from '../components/ToastSystem';
import { TeamMember } from '../types';

const TeamCard = ({ member, index }: { member: TeamMember; index: number }) => {
  const { addToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 400, damping: 90 });
  const mouseY = useSpring(y, { stiffness: 400, damping: 90 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to center of card
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Move up to 20px in opposition or direction
    const xPos = (clickX / width - 0.5) * 20;
    const yPos = (clickY / height - 0.5) * 20;

    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleCopyEmail = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    addToast('Email address copied to clipboard.', 'success');
  };

  // Status Color Logic
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Online': return 'bg-green-500';
      case 'In Deep Work': return 'bg-purple-500';
      case 'On Set': return 'bg-yellow-500';
      case 'Offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, layout: { duration: 0.4, type: "spring", bounce: 0.2 } }}
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      className={`group relative bg-white/5 border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all ${isExpanded ? 'z-20 shadow-2xl bg-white/10' : 'z-10'}`}
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <motion.img
          src={member.image}
          alt={member.name}
          style={{ x: mouseX, y: mouseY, scale: 1.15 }}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent opacity-90" />
        
        {/* Status Indicator */}
        {member.status && (
           <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)} animate-pulse`}></div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">{member.status}</span>
           </div>
        )}

        <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full transform translate-y-0 transition-transform">
           <motion.div layout="position">
              <h3 className="text-2xl sm:text-3xl font-display font-bold leading-none text-white mb-2">{member.name}</h3>
              <p className="text-accent font-mono text-sm tracking-wide">{member.role}</p>
           </motion.div>
        </div>
      </div>

      <div className="p-6 sm:p-8 pt-4">
        <motion.div layout="position" className="relative">
             <AnimatePresence mode="wait">
                 {isExpanded ? (
                     <motion.div 
                        key="full" 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                     >
                        <p className="text-gray-200 leading-relaxed text-base font-serif mb-6">{member.bio}</p>
                     </motion.div>
                 ) : (
                     <motion.div 
                        key="collapsed"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                     >
                        <p className="text-gray-400 leading-relaxed text-sm line-clamp-2 mb-2">{member.bio}</p>
                     </motion.div>
                 )}
             </AnimatePresence>
        </motion.div>

        <motion.div layout="position" className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
            <div className="flex gap-3">
              {member.links.instagram && (
                <a href={member.links.instagram} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 bg-black/20 rounded-full hover:bg-white hover:text-black transition-colors border border-white/5" title="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {member.links.email && (
                <button onClick={(e) => handleCopyEmail(e, member.links.email!)} className="p-2 bg-black/20 rounded-full hover:bg-accent hover:text-void transition-colors border border-white/5" title="Copy Email">
                  <Mail size={18} />
                </button>
              )}
              {member.links.spotify && (
                <a href={member.links.spotify} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 bg-black/20 rounded-full hover:bg-[#1DB954] hover:text-white transition-colors border border-white/5" title="Spotify">
                  <Music size={18} />
                </a>
              )}
            </div>
            <div className={`text-[10px] font-bold font-mono uppercase tracking-widest flex items-center gap-2 transition-colors ${isExpanded ? 'text-accent' : 'text-gray-500 group-hover:text-gray-300'}`}>
               {isExpanded ? 'Collapse' : 'Read Bio'}
               {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const TeamSection = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen pt-20 sm:pt-24 pb-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="mb-12 sm:mb-16 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 sm:mb-6">THE CREATORS</h2>
        <p className="text-gray-400 text-base sm:text-lg px-2">
          We believe creativity and technology are not opposites — they are collaborators. 
          Intervised exists to midwife coherence, bringing sacred and systemic projects into reality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        {isLoading ? (
           [1, 2].map(i => <TeamSkeleton key={i} />)
        ) : (
           TEAM_DATA.map((member, idx) => (
             <TeamCard key={member.name} member={member} index={idx} />
           ))
        )}
      </div>
    </section>
  );
};