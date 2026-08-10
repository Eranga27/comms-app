import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XIcon, ChevronDownIcon, CheckIcon } from 'lucide-react';
import { ActiveGoal } from '../../hooks/useDashboardData';

interface ActiveGoalBannerProps {
  onDismiss: () => void;
  activeGoal: ActiveGoal | null;
  goalDefaults: Record<string, ActiveGoal>;
  onGoalChange: (goal: ActiveGoal) => void;
}

export function ActiveGoalBanner({ onDismiss, activeGoal, goalDefaults, onGoalChange }: ActiveGoalBannerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const goal = activeGoal ?? {
    emoji: '🎯',
    title: 'Set a Goal',
    description: 'Pick a focus area to make every session intentional.',
    goalId: '',
  };

  return (
    <div className="relative flex flex-wrap items-center gap-4 rounded-2xl border border-primary-500/25 bg-primary-500/5 px-5 py-4">
      <span className="text-xl" aria-hidden="true">{goal.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">
          Active goal:{' '}
          <span className="text-primary-400">{goal.title}</span>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="ml-2 inline-flex items-center gap-0.5 rounded text-[11px] font-semibold text-slate-500 hover:text-primary-400 transition-colors"
            aria-label="Edit active goal"
          >
            Edit <ChevronDownIcon className="h-3 w-3" />
          </button>
        </p>
        <p className="mt-0.5 text-[13px] text-slate-400">{goal.description}</p>
      </div>
      <Link
        to="/v2/practice"
        className="rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-2.5 text-sm font-semibold text-primary-400 transition-colors hover:bg-primary-500/20"
      >
        Practice Now →
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss active goal"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <XIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Inline Goal Picker */}
      {pickerOpen && (
        <div
          ref={pickerRef}
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/40 backdrop-blur-sm"
          role="listbox"
          aria-label="Select an active goal"
        >
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Switch Goal
          </p>
          {Object.values(goalDefaults).map((g) => (
            <button
              key={g.goalId}
              type="button"
              role="option"
              aria-selected={g.goalId === goal.goalId}
              onClick={() => {
                onGoalChange(g);
                setPickerOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-800"
            >
              <span className="text-lg">{g.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">{g.title}</p>
                <p className="truncate text-[11px] text-slate-500">{g.description}</p>
              </div>
              {g.goalId === goal.goalId && (
                <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-primary-400" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}