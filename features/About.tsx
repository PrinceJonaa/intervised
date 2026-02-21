import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Sparkles, Workflow, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <section className="min-h-screen pt-24 sm:pt-28 pb-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
            <Sparkles size={12} />
            About Intervised
          </span>

          <h1 className="mt-5 text-4xl sm:text-6xl md:text-7xl font-display font-bold leading-[0.95] text-white max-w-4xl">
            A place to do your
            <span className="text-accent"> best work</span>.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-3xl leading-relaxed">
            Intervised started with Prince Jona&apos;s vision and has grown into a shared vision for giving people room to create with clarity and dignity.
            Not hustle theater. Not endless noise. Just real support for artists, ministries, and teams trying to ship meaningful work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-12 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7"
          >
            <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent mb-4">
              <Workflow size={20} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Less friction</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              We build systems that remove chaos from the process so your energy can stay on writing, building, designing, and performing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7"
          >
            <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent mb-4">
              <HeartHandshake size={20} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">More honesty</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              We care about clean communication, transparent pricing, and work that actually serves people, not vanity metrics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7"
          >
            <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent mb-4">
              <Music2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Higher craft</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              We treat creative work like craft. Keep showing up, keep refining, and let the work speak louder than the performance around it.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-7 sm:p-10 mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-5">
            How this started
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed max-w-4xl">
            <p>
              Intervised began because too many talented people never get stable support.
              They have ideas, discipline, and purpose, but no consistent structure around them.
            </p>
            <p>
              What started as one person&apos;s conviction is now shared across collaborators, clients, and community.
              Intervised exists to be that structure: clear creative direction, reliable technical systems, and a process that helps people finish what they start.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-accent/20 bg-accent/5 p-7 sm:p-10 mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
            Reina&apos;s story in this vision
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed max-w-4xl">
            <p>
              Reina Hondo is a Queens-native multi-instrumentalist and educator who has spent more than 15 years teaching and performing.
              Through Hondo School of Sounds, she has helped kids, teens, and adults build confidence through music.
            </p>
            <p>
              That same spirit shapes Intervised: patient coaching, high standards, and work that grows people while it grows the output.
              She keeps us rooted in rhythm, discipline, and joy, especially when projects get hard.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-void font-bold hover:scale-[1.02] transition-transform"
          >
            Build With Intervised
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors"
          >
            See Services
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;
