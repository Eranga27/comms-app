import React from 'react';
import { CheckIcon, TargetIcon } from 'lucide-react';
import { useReport } from '../../contexts/ReportContext';

export function StrengthsFocus() {
  const { strengths, focusAreas } = useReport();
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
          Your Top Strengths
        </p>
        <ul className="mt-5 space-y-4">
          {strengths.map((s) =>
          <li key={s} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckIcon className="h-3 w-3 text-emerald-400" aria-hidden="true" />
              </span>
              <span className="text-[15px] leading-relaxed text-slate-300">{s}</span>
            </li>
          )}
        </ul>
      </article>

      <article className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Focus Areas</p>
        <ul className="mt-5 space-y-5">
          {focusAreas.map((f) =>
          <li key={f.area} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                <TargetIcon className="h-3 w-3 text-amber-400" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[15px] font-medium leading-snug text-slate-200">{f.area}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{f.tip}</p>
              </div>
            </li>
          )}
        </ul>
      </article>
    </div>);

}