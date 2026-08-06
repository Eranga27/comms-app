import React from 'react';
import { motion } from 'framer-motion';
import { SkillComparison } from '../../types';

interface SessionComparisonProps {
  skills: SkillComparison[];
}

export function SessionComparison({ skills }: SessionComparisonProps) {
  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Session Comparison</p>
      <h2 className="mt-1.5 font-display text-xl font-bold text-white">Latest vs previous</h2>

      <div className="mt-7 space-y-6">
        {skills.map((s, i) => {
          const delta = s.current - s.previous;
          return (
            <div key={s.label}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-slate-200">{s.label}</span>
                <span className="font-mono text-[12px] text-slate-500">
                  {s.previous}% → <span className="text-slate-300">{s.current}%</span>{' '}
                  <span className={delta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
                  </span>
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-slate-600"
                  style={{ width: `${s.previous}%` }}
                  aria-hidden="true" />
                
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.current}%` }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }} />
                
              </div>
            </div>);

        })}
      </div>
    </article>);

}