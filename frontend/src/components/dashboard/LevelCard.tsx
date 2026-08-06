import React from 'react';
import { ScoreRing } from '../common/ScoreRing';

interface LevelCardProps {
  score: number;
  level: string;
  grade: string;
}

const levels = ['Foundation', 'Developing', 'Proficient', 'Advanced', 'Master'];

export function LevelCard({ score, level, grade }: LevelCardProps) {
  const currentIndex = levels.findIndex((l) => level.startsWith(l));

  return (
    <article className="flex flex-col items-center rounded-2xl border border-slate-800/60 bg-slate-900 p-6 text-center">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Overall Level</p>
      <div className="my-5">
        <ScoreRing score={score} size={172} />
      </div>
      <span className="rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-[13px] font-semibold text-primary-400">
        {level}
      </span>
      <p className="mt-3 font-mono text-[13px] text-slate-500">Grade: {grade}</p>

      <ol className="mt-6 flex w-full items-center gap-1.5" aria-label="Level progression">
        {levels.map((l, i) =>
        <li key={l} className="flex-1">
            <span
            className={`block h-1.5 rounded-full ${i <= currentIndex ? 'bg-primary-500' : 'bg-slate-800'}`}
            title={l} />
          
          </li>
        )}
      </ol>
      <div className="mt-2 flex w-full justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600">
        <span>Foundation</span>
        <span>Master</span>
      </div>
    </article>);

}