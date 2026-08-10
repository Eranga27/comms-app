import React from 'react';
import { Insight } from '../../hooks/useDashboardData';

const toneClasses: Record<'emerald' | 'teal' | 'amber', string> = {
  emerald: 'border-emerald-500/20 bg-emerald-500/10',
  teal: 'border-primary-500/15 bg-primary-500/5',
  amber: 'border-amber-500/20 bg-amber-500/10',
};

const toneText: Record<'emerald' | 'teal' | 'amber', string> = {
  emerald: 'text-emerald-400',
  teal: 'text-primary-400',
  amber: 'text-amber-400',
};

interface PersonalInsightsProps {
  insights: Insight[];
}

export function PersonalInsights({ insights }: PersonalInsightsProps) {
  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Personal Insights</p>
      <h2 className="mt-1.5 font-display text-xl font-bold text-white">What the data says about you</h2>

      {insights.length === 0 ? (
        <div className="mt-7 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/60 py-10 px-4 text-center">
          <span className="text-3xl mb-3 animate-pulse" aria-hidden="true">🔮</span>
          <p className="font-semibold text-white text-sm">Complete 2+ sessions to unlock your insights</p>
          <p className="mt-1 text-[12px] text-slate-500 max-w-[220px]">
            Your personal intelligence engine activates after your second session.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {insights.map((ins) => (
            <div key={ins.label} className={`rounded-xl border p-4 ${toneClasses[ins.tone]}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${toneText[ins.tone]}`}>
                <span aria-hidden="true">{ins.emoji} </span>
                {ins.label}
              </p>
              <p className="mt-2 font-display text-lg font-bold text-white">{ins.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{ins.detail}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}