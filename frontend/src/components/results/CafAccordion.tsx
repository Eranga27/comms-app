import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { cafBreakdown } from '../../data/results';
import { toneColor } from '../common/ScoreBar';

export function CafAccordion() {
  const [open, setOpen] = useState<string | null>(cafBreakdown[0].label);

  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        Detailed CAF Breakdown
      </p>
      <h2 className="mt-1.5 font-display text-xl font-bold text-white">Every metric we measured</h2>

      <div className="mt-6 divide-y divide-slate-800">
        {cafBreakdown.map((group) => {
          const expanded = open === group.label;
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : group.label)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-4 py-4 text-left">
                
                <span className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden="true">
                    {group.emoji}
                  </span>
                  <span className="font-semibold text-white">{group.label}</span>
                  <span className="font-mono text-[12px] text-slate-500">{group.metrics.length} metrics</span>
                </span>
                <ChevronDownIcon
                  className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ${
                  expanded ? 'rotate-180' : ''}`
                  }
                  aria-hidden="true" />
                
              </button>

              <AnimatePresence initial={false}>
                {expanded &&
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="overflow-hidden">
                  
                    <div className="space-y-4 pb-5">
                      {group.metrics.map((m) =>
                    <div key={m.label}>
                          <div className="mb-2 flex items-baseline justify-between gap-4">
                            <span className="text-sm text-slate-300">{m.label}</span>
                            <span className="font-mono text-[13px] text-slate-400">{m.value}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: toneColor(m.percent) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${m.percent}%` }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
                        
                          </div>
                        </div>
                    )}
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>);

        })}
      </div>
    </article>);

}