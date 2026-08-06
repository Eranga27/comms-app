import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';

export function FinalCTA() {
  return (
    <section id="pricing" className="relative px-5 py-20 sm:px-8 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900 px-6 py-16 text-center sm:px-14 sm:py-20">
        
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/15 blur-[120px]"
          aria-hidden="true" />
        
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" aria-hidden="true" />

        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Start Building Your
            <br />
            <span className="gradient-text">Communication Advantage</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-slate-400">
            Your first personalised assessment is only a few minutes away. No credit card required.
          </p>
          <Link
            to="/v2/practice"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-slate-950 shadow-xl shadow-white/10 transition-transform duration-300 hover:scale-105">
            
            Start Your First Practice Session
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </section>);

}