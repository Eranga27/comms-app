import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ZapIcon } from 'lucide-react';
import { useReport } from '../../contexts/ReportContext';
import { practiceGoals, mapFocusAreaToGoalId } from '../../data/practice';

export function NextSessionCTA() {
  const { focusAreas } = useReport();

  // Take the first focus area and attempt a safe goal mapping
  const topFocus = focusAreas?.[0];
  if (!topFocus) return null;

  const goalId = mapFocusAreaToGoalId(topFocus.area);
  if (!goalId) return null;

  const goal = practiceGoals.find((g) => g.id === goalId);
  if (!goal) return null;

  const practiceUrl = `/v2/practice?goal=${goalId}`;

  return (
    <article
      aria-label="Coaching recommendation for next session"
      className="relative overflow-hidden rounded-2xl border border-primary-500/25 bg-gradient-to-br from-primary-600/10 to-violet-600/5 p-6 sm:p-7"
    >
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-500/15 blur-[80px]"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Coaching copy */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500/20 text-sm" aria-hidden="true">
              <ZapIcon className="h-3.5 w-3.5 text-primary-400" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">
              Your biggest opportunity
            </p>
          </div>

          <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
            {goal.emoji} {goal.title}
          </h3>

          <p className="mt-2 text-[14px] leading-relaxed text-slate-300 max-w-lg">
            {topFocus.area}
          </p>

          <p className="mt-1 text-[13px] leading-relaxed text-slate-500 italic max-w-lg">
            {topFocus.tip}
          </p>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Link
            to={practiceUrl}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Practise this
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Goal: {goal.metric}
          </p>
        </div>
      </div>
    </article>
  );
}
