
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Quote, Star } from 'lucide-react';
import { Page } from '../types';
import { getTestimonials, getProjects, type Testimonial, type Project } from '../lib/supabase/referenceService';
import { useSEO, SEO_CONFIG } from '../hooks/useSEO';

export const HomeView = ({ setPage }: { setPage: (p: Page) => void }) => {
  useSEO(SEO_CONFIG.home);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, testimonialsData] = await Promise.all([
          getProjects(true), // Get featured projects
          getTestimonials()
        ]);
        setProjects(projectsData);
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Failed to load home data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col pb-32">
      {/* Hero Section */}
      <section className="min-h-[100dvh] flex flex-col justify-center items-center relative px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-5xl w-full z-10 text-center mt-auto mb-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-accent font-mono text-[10px] sm:text-xs md:text-sm tracking-[0.3em] mb-4 sm:mb-6 uppercase">
              Mutually Envisioned
            </h2>
            <h1 className="font-display text-5xl sm:text-7xl md:text-9xl font-bold leading-none mix-blend-overlay tracking-tighter mb-6 break-words text-white">
              BRIDGE <span className="italic font-serif font-light text-white/70 block sm:inline">VISION</span><br className="hidden sm:block" />
              & EXECUTION
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-muted max-w-xl mx-auto text-sm sm:text-lg leading-relaxed mb-8 sm:mb-10 px-4"
          >
            We are a collaborative intelligence where creativity and systems thinking meet.
            From worship content to AI automation, we serve as the bridge between what you envision and what exists.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4 px-8 sm:px-0"
          >
            <button
              onClick={() => setPage(Page.SERVICES)}
              className="group px-8 py-4 bg-accent text-void font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 text-sm sm:text-base border border-accent"
            >
              Explore Services <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setPage(Page.SERVICES)}
              className="px-8 py-4 border border-white/20 rounded-full hover:bg-white/5 backdrop-blur-sm transition-colors text-sm sm:text-base text-white"
            >
              Book a Session
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          className="mt-8 sm:mt-16 text-gray-500 flex flex-col items-center gap-2 cursor-pointer pb-4 sm:pb-8"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ArrowDown size={16} />
        </motion.div>
      </section>

      {/* Philosophy / Intro Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative z-10 bg-gradient-to-b from-transparent to-void/80">
        <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
          <h3 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mb-6 sm:mb-8 leading-tight text-white">
            We believe creativity and technology are not opposites.
          </h3>
          <p className="text-base sm:text-xl text-muted leading-relaxed mb-12 px-2">
            Intervised exists to midwife coherence, bringing sacred and systemic projects into reality with resonance, clarity, and trust.
            Whether you are a church needing a livestream overhaul or a brand needing a sonic identity, we build the infrastructure for your vision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 border-l border-white/20 bg-white/5 md:bg-transparent rounded-r-xl md:rounded-none">
              <h4 className="font-bold text-xl mb-2 text-accent">Creative</h4>
              <p className="text-sm text-gray-500">Videography, Photography, Music Production</p>
            </div>
            <div className="p-6 border-l border-white/20 bg-white/5 md:bg-transparent rounded-r-xl md:rounded-none">
              <h4 className="font-bold text-xl mb-2 text-white">Tech</h4>
              <p className="text-sm text-gray-500">Automation, AI Bots, OBS Setup</p>
            </div>
            <div className="p-6 border-l border-white/20 bg-white/5 md:bg-transparent rounded-r-xl md:rounded-none">
              <h4 className="font-bold text-xl mb-2 text-muted">Ministry</h4>
              <p className="text-sm text-gray-500">Livestreams, Kids Kits, Sermon Media</p>
            </div>
          </div>
        </div>

        {/* Recent Work Grid */}
        <div className="max-w-6xl mx-auto mb-16 sm:mb-24">
          <div className="flex items-end justify-between mb-8 px-2 sm:px-4">
            <h3 className="text-xl sm:text-2xl font-display font-bold">RECENT WORK</h3>
            <span className="text-xs font-mono text-gray-500 hidden sm:inline">SELECTED CASE STUDIES</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-0 sm:px-4">
            {projects.map((project, idx) => (
              <div key={project.id} className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ArrowRight size={48} className="text-accent" />
                </div>
                <div className="relative z-10">
                  <span className="text-xs font-mono text-accent mb-2 block">{project.category}</span>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{project.title}</h4>
                  <p className="text-sm text-gray-400 mb-4">{project.description}</p>
                  <div className="text-xs text-gray-500 border-t border-white/5 pt-4">
                    <span className="font-bold text-gray-400">Outcome:</span> {project.results}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto px-0 sm:px-4">
          <h3 className="text-xl sm:text-2xl font-display font-bold mb-8 sm:mb-12 text-center">WHAT CLIENTS SAY</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-gradient-to-br from-white/5 to-transparent p-6 rounded-2xl border border-white/5">
                <div className="mb-4 text-accent opacity-50"><Quote size={24} /></div>
                <p className="text-sm leading-relaxed text-gray-300 mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-accent border border-accent/20">{t.client_name[0]}</div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.client_name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">{t.client_role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};