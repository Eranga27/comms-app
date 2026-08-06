import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CoachingNote } from '../../types';

interface CoachingHistoryProps {
  notes: CoachingNote[];
}

export function CoachingHistory({ notes }: CoachingHistoryProps) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">Coaching History</p>

      <div className="mt-4 space-y-2.5">
        <AnimatePresence initial={false}>
          {notes.slice(0, 3).map((note) =>
          <motion.article
            key={note.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`rounded-xl border p-3.5 ${
            note.type === 'positive' ?
            'border-emerald-500/20 bg-emerald-500/10' :
            'border-amber-500/20 bg-amber-500/10'}`
            }>
            
              <div className="flex items-center justify-between gap-3">
                <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                note.type === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`
                }>
                
                  {note.type === 'positive' ? 'Positive' : 'Improve'}
                </span>
                <span className="font-mono text-[11px] text-slate-500">{note.timestamp}</span>
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-slate-300">{note.message}</p>
            </motion.article>
          )}
        </AnimatePresence>

        {notes.length === 0 &&
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="animate-pulse text-[13px] text-slate-500">Monitoring behaviour...</p>
          </div>
        }
      </div>
    </aside>);

}