import React from 'react';
import { coachSummary } from '../../data/results';

export function CoachSummary() {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-violet-500/10 blur-[110px]"
        aria-hidden="true" />
      
      <div className="relative">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/15 text-xl"
            aria-hidden="true">
            
            🤖
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400">AI Coach Summary</p>
            <p className="mt-0.5 text-[13px] text-slate-500">Generated from your full session</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {coachSummary.map((para) =>
          <p key={para.slice(0, 24)} className="text-[15px] leading-relaxed text-slate-300">
              {para}
            </p>
          )}
        </div>
      </div>
    </article>);

}