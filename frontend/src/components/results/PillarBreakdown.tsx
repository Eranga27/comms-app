import React from 'react';
import { ScoreBar } from '../common/ScoreBar';
import { useReport } from '../../contexts/ReportContext';

export function PillarBreakdown() {
  const { pillars } = useReport();
  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        Communication Breakdown
      </p>
      <h2 className="mt-1.5 font-display text-xl font-bold text-white">The five pillars</h2>

      <div className="mt-7 space-y-6">
        {pillars.map((p) => {
          const percent = Math.round(p.score / p.max * 100);
          return (
            <ScoreBar
              key={p.label}
              label={p.label}
              percent={percent}
              valueLabel={`${p.score}/${p.max}`} />);


        })}
      </div>
    </article>);

}