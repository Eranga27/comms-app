import React from 'react';
import { Link } from 'react-router-dom';
import { XIcon } from 'lucide-react';
import { activeGoal } from '../../data/sessions';

interface ActiveGoalBannerProps {
  onDismiss: () => void;
}

export function ActiveGoalBanner({ onDismiss }: ActiveGoalBannerProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary-500/25 bg-primary-500/5 px-5 py-4">
      <span className="text-xl" aria-hidden="true">
        {activeGoal.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">
          Active goal: <span className="text-primary-400">{activeGoal.title}</span>
        </p>
        <p className="mt-0.5 text-[13px] text-slate-400">{activeGoal.description}</p>
      </div>
      <Link
        to="/v2/practice"
        className="rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-2.5 text-sm font-semibold text-primary-400 transition-colors hover:bg-primary-500/20">
        
        Practice Now →
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss active goal"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-white">
        
        <XIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>);

}