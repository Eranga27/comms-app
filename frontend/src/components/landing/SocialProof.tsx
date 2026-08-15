import React from 'react';
import { motion } from 'framer-motion';

const outcomes = [
  { stat: '5 min', label: 'Average session length' },
  { stat: '< 30 s', label: 'Time to your first insight' },
  { stat: '100%', label: 'Private — nothing leaves your browser' },
  { stat: 'Free', label: 'No credit card, no trial timer' },
];

export function SocialProof() {
  return (
    <section className="relative border-y border-slate-800/50 px-5 py-14 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mx-auto max-w-6xl">

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {outcomes.map((o) => (
            <div key={o.label} className="text-center">
              <p className="font-display text-3xl font-black text-white">{o.stat}</p>
              <p className="mt-2 text-[13px] leading-snug text-slate-500">{o.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>);

}