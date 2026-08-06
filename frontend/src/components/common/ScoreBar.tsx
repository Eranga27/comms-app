import React from 'react';
import { motion } from 'framer-motion';

interface ScoreBarProps {
  label: string;
  percent: number;
  valueLabel?: string;
  color?: string;
}

export function toneColor(percent: number): string {
  if (percent >= 78) return '#14b8a6';
  if (percent >= 60) return '#f59e0b';
  return '#ef4444';
}

export function ScoreBar({ label, percent, valueLabel, color }: ScoreBarProps) {
  const fill = color ?? toneColor(percent);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="font-mono text-[13px] text-slate-400">{valueLabel ?? `${percent}%`}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: fill }}
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
        
      </div>
    </div>);

}