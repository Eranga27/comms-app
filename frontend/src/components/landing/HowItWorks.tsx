import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../common/SectionHeading';
import { steps } from '../../data/landing';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="How It Works"
          title="Coaching in Three Steps"
          subtitle="Open your camera, speak naturally, and receive a full coaching report — in under five minutes." />
        

        <div className="relative mt-16">
          <div
            className="absolute left-[16%] right-[16%] top-14 hidden h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent lg:block"
            aria-hidden="true" />
          
          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((s, i) =>
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.1 }}
              className="relative rounded-2xl border border-slate-800/60 bg-slate-900 p-6 transition-colors duration-300 hover:border-slate-700 hover:bg-slate-900/60">
              
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-emerald-500/10 text-2xl">
                  <span aria-hidden="true">{s.emoji}</span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">{s.step}</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{s.description}</p>
              </motion.article>
            )}
          </div>
        </div>
      </div>
    </section>);

}