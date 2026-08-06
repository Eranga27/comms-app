import React from 'react';
import { insights } from '../../data/sessions';

const toneClasses: Record<'emerald' | 'teal' | 'amber', string> = {
  emerald: 'border-emerald-500/20 bg-emerald-500/10',
  teal: 'border-primary-500/15 bg-primary-500/5',
  amber: 'border-amber-500/20 bg-amber-500/10'
};

const toneText: Record<'emerald' | 'teal' | 'amber', string> = {
  emerald: 'text-emerald-400',
  teal: 'text-primary-400',
  amber: 'text-amber-400'
};

export function PersonalInsights() {
  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Personal Insights</p>
      <h2 className="mt-1.5 font-display text-xl font-bold text-white">What the data says about you</h2>

      <div className="mt-7 space-y-3">
        {insights.map((ins) =>
        <div key={ins.label} className={`rounded-xl border p-4 ${toneClasses[ins.tone]}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${toneText[ins.tone]}`}>
              <span aria-hidden="true">{ins.emoji} </span>
              {ins.label}
            </p>
            <p className="mt-2 font-display text-lg font-bold text-white">{ins.title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{ins.detail}</p>
          </div>
        )}
      </div>
    </article>);

}