import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';
import { outcomes } from '../../data/landing';

const scores = [
{ label: 'Pacing & Flow', value: 92 },
{ label: 'Eye Contact', value: 85 },
{ label: 'Clarity', value: 78 }];


export function WhyPlatform() {
  return (
    <section id="features" className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}>
          
          <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-primary-400">Why SpeakIQ</p>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Transform How You Are Perceived
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-slate-400">
            Most feedback on communication is vague and late. SpeakIQ makes it specific, measurable,
            and available the moment you finish speaking.
          </p>

          <ul className="mt-8 space-y-4">
            {outcomes.map((o, i) =>
            <motion.li
              key={o}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
              className="flex items-start gap-3">
              
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <CheckIcon className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                </span>
                <span className="text-[15px] leading-relaxed text-slate-300">{o}</span>
              </motion.li>
            )}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
          className="relative">
          
          <div className="absolute -inset-6 rounded-[32px] bg-primary-500/[0.06] blur-[100px]" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900 p-7">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary-500 to-emerald-500" aria-hidden="true" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Communication DNA
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">Session Report</h3>
              </div>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/30 bg-primary-500/10 font-display text-xl font-black text-primary-400">
                A-
              </span>
            </div>

            <div className="mt-7 space-y-5">
              {scores.map((s) =>
              <div key={s.label}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-slate-200">{s.label}</span>
                    <span className="font-mono text-[13px] text-slate-400">{s.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                    className="h-full rounded-full bg-primary-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
                  
                  </div>
                </div>
              )}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Top Strength</p>
                <p className="mt-1.5 text-[13px] text-slate-300">Vocal variety kept attention high</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Focus Area</p>
                <p className="mt-1.5 text-[13px] text-slate-300">Close each answer on one line</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}