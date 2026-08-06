import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { recommendations } from '../../data/sessions';

export function Recommended() {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary-500 to-emerald-500" aria-hidden="true" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
            Recommended Next Practice
          </p>
          <h2 className="mt-1.5 font-display text-xl font-bold text-white">Three ways to move the needle</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Based on your Job Interview profile &amp; latest results
          </p>
        </div>
        <Link
          to="/v2/practice"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800">
          
          Practice now
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ol className="mt-6 grid gap-4 lg:grid-cols-3">
        {recommendations.map((r, i) =>
        <li key={r.title} className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
            <span className="font-mono text-[12px] text-primary-400">0{i + 1}</span>
            <h3 className="mt-2 font-display text-lg font-bold text-white">{r.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{r.detail}</p>
            <span className="mt-4 inline-block rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-semibold text-primary-400">
              {r.goal}
            </span>
          </li>
        )}
      </ol>
    </article>);

}