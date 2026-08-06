import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CoachingNote } from '../../types';

interface CoachingToastProps {
  note: CoachingNote | null;
}

export function CoachingToast({ note }: CoachingToastProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {note &&
        <motion.div
          key={note.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          role="status"
          aria-live="polite"
          className="w-72 rounded-xl border-l-4 bg-slate-900/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl"
          style={{ borderLeftColor: note.type === 'positive' ? '#10b981' : '#f59e0b' }}>
          
            <p
            className={`text-[14px] font-medium leading-snug ${
            note.type === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`
            }>
            
              <span aria-hidden="true">{note.type === 'positive' ? '✅ ' : '💡 '}</span>
              {note.message}
            </p>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}