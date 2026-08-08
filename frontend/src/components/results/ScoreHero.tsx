import React from 'react';
import { ScoreRing } from '../common/ScoreRing';
import { useReport } from '../../contexts/ReportContext';

export function ScoreHero() {
  const { sessionReport } = useReport();
  const stats = [
  { label: 'Eye Contact', value: `${sessionReport.eyeContact}%` },
  { label: 'Filler Words', value: String(sessionReport.fillerWords) },
  { label: 'Words / Min', value: String(sessionReport.wpm) }];


  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900 p-7 sm:p-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary-500 to-emerald-500" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-500/10 blur-[120px]"
        aria-hidden="true" />
      

      <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
        <ScoreRing score={sessionReport.overall} size={196} strokeWidth={7} />

        <div className="flex-1 text-center lg:text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Overall Score</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {sessionReport.gradeLabel}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-400">
            You landed in the top band for delivery and connection. Structure is the one lever holding this
            back from an A.
          </p>

          <dl className="mt-7 grid grid-cols-3 gap-3">
            {stats.map((s) =>
            <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-center">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</dt>
                <dd className="mt-2 font-mono text-xl font-bold text-white">{s.value}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>);

}