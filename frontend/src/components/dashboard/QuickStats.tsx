import React from 'react';
import { motion } from 'framer-motion';
import { QuickStat } from '../../types';

interface QuickStatsProps {
  stats: QuickStat[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {stats.map((s, i) =>
      <motion.article
        key={s.label}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.06 }}
        className="rounded-2xl border border-slate-800/60 bg-slate-900 p-5">
        
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white">{s.value}</p>
          {s.delta !== null ?
        <p
          className={`mt-1.5 font-mono text-[12px] ${
          s.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`
          }>
          
              {s.delta >= 0 ? '▲' : '▼'} {Math.abs(s.delta)} vs last
            </p> :

        <p className="mt-1.5 font-mono text-[12px] text-slate-600">all time</p>
        }
        </motion.article>
      )}
    </div>);

}