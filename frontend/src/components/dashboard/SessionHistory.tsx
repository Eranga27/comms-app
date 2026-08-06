import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, Trash2Icon } from 'lucide-react';
import { SessionSummary } from '../../types';
import { formatClock } from '../../hooks/usePracticeSession';

interface SessionHistoryProps {
  sessions: SessionSummary[];
  onDelete: (id: string) => void;
}

export function SessionHistory({ sessions, onDelete }: SessionHistoryProps) {
  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Session History</p>
      <h2 className="mt-1.5 font-display text-xl font-bold text-white">Every session you have recorded</h2>

      <ul className="scroll-thin mt-6 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {sessions.map((s) =>
        <li key={s.id}>
            <div className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-800/30 p-4 transition-all duration-300 hover:border-primary-500/40 hover:shadow-lg hover:shadow-primary-500/5">
              <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border font-mono text-[14px] font-bold ${
              s.score >= 80 ?
              'border-emerald-500/30 bg-emerald-500/15 text-emerald-400' :
              'border-amber-500/30 bg-amber-500/15 text-amber-400'}`
              }>
              
                {s.score}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{s.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                  <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-slate-300">
                    {s.context}
                  </span>
                  <span>{s.createdAgo}</span>
                  <span className="font-mono">{formatClock(s.durationSeconds)}</span>
                </div>
              </div>

              <button
              type="button"
              onClick={() => onDelete(s.id)}
              aria-label={`Delete ${s.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-600 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400">
              
                <Trash2Icon className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link
              to={`/v2/results/${s.id}`}
              aria-label={`Open results for ${s.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-white">
              
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </li>
        )}
      </ul>

      {sessions.length === 0 &&
      <div className="py-14 text-center">
          <p className="text-4xl" aria-hidden="true">🎙️</p>
          <h3 className="mt-4 font-display text-2xl font-bold text-white">Your journey starts here</h3>
          <p className="mt-2 text-[15px] text-slate-400">
            Complete your first practice session to unlock your profile.
          </p>
          <Link
          to="/v2/practice"
          className="mt-6 inline-block rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-500">
          
            Start First Session
          </Link>
        </div>
      }
    </article>);

}