import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';

const stepLabels = [
'Analyzing behavioural data...',
'Transcribing audio with engine...',
'Generating coaching report...'];


interface ProcessingOverlayProps {
  onComplete: () => void;
}

export function ProcessingOverlay({ onComplete }: ProcessingOverlayProps) {
  const [active, setActive] = useState(0);
  const [takingLonger, setTakingLonger] = useState(false);

  useEffect(() => {
    const timers = stepLabels.map((_, i) =>
      window.setTimeout(() => setActive(i + 1), (i + 1) * 1300)
    );
    const slowNoticeTimer = window.setTimeout(() => setTakingLonger(true), 6000);
    const done = window.setTimeout(onComplete, stepLabels.length * 1300 + 700);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(slowNoticeTimer);
      window.clearTimeout(done);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-6 backdrop-blur-xl"
      role="status"
      aria-live="polite">
      
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mx-auto mb-7 h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-primary-500" />
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-primary-400">
          Building your report
        </p>
        {takingLonger && (
          <p className="mb-4 text-center text-[12px] text-amber-400 font-medium animate-pulse">
            Finalizing analysis... compiling your communication report.
          </p>
        )}
        <ol className="space-y-4">
          {stepLabels.map((label, i) => {
            const complete = active > i;
            const current = active === i;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                  complete ?
                  'border-emerald-500/40 bg-emerald-500/15 text-emerald-400' :
                  current ?
                  'border-primary-500/40 bg-primary-500/15 text-primary-400' :
                  'border-slate-700 bg-slate-800/60 text-slate-600'}`
                  }>
                  
                  {complete ? <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span
                  className={`text-[15px] ${
                  complete ?
                  'text-slate-400' :
                  current ?
                  'animate-pulse font-medium text-white' :
                  'text-slate-600'}`
                  }>
                  
                  {label}
                </span>
              </li>);

          })}
        </ol>
      </div>
    </motion.div>);

}