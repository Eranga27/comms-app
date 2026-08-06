import React from 'react';
import { motion } from 'framer-motion';
import { trustedBy } from '../../data/landing';

export function SocialProof() {
  return (
    <section className="relative border-y border-slate-800/50 px-5 py-14 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mx-auto max-w-6xl text-center">
        
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
          Trusted by ambitious communicators from
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {trustedBy.map((name) =>
          <li
            key={name}
            className="font-display text-lg font-bold text-slate-600 transition-colors duration-300 hover:text-primary-400">
            
              {name}
            </li>
          )}
        </ul>
      </motion.div>
    </section>);

}