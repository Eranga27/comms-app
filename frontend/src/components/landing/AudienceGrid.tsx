import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../common/SectionHeading';
import { audiences } from '../../data/landing';

export function AudienceGrid() {
  return (
    <section id="about" className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="Who Is This For?"
          title="Built for Ambitious Communicators"
          subtitle="Whoever you speak to, the goal is the same — be understood, and be remembered." />
        

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
          {audiences.map((a, i) =>
          <motion.article
            key={a.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: i % 4 * 0.08 }}
            className="group rounded-2xl border border-slate-800/60 bg-slate-900 p-5 transition-all duration-300 hover:border-primary-500/40 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-primary-500/5">
            
              <span className="text-2xl grayscale transition-all duration-300 group-hover:grayscale-0" aria-hidden="true">
                {a.emoji}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white transition-colors group-hover:text-primary-400">
                {a.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{a.line}</p>
            </motion.article>
          )}
        </div>
      </div>
    </section>);

}