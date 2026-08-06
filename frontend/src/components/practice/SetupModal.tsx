import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { practiceContexts, practiceGoals } from '../../data/practice';

export interface SessionSetup {
  contextId: string;
  name: string;
  goalId: string;
}

interface SetupModalProps {
  onComplete: (setup: SessionSetup) => void;
}

export function SetupModal({ onComplete }: SetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [contextId, setContextId] = useState('interview');
  const [name, setName] = useState('');
  const [goalId, setGoalId] = useState('fillers');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/85 px-4 py-10 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-label="Session setup"
        className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
        
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
              Step {step} of 2
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {step === 1 ? 'What are you practising?' : 'Pick your focus for this session'}
            </h2>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className={`h-1.5 w-10 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-slate-700'}`} />
            <span className={`h-1.5 w-10 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-slate-700'}`} />
          </div>
        </div>

        {step === 1 ?
        <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {practiceContexts.map((c) => {
              const active = contextId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setContextId(c.id)}
                  aria-pressed={active}
                  className={`rounded-xl border p-4 text-left transition-all duration-300 ${
                  active ?
                  'border-primary-500/50 bg-primary-500/10 shadow-lg shadow-primary-500/10' :
                  'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'}`
                  }>
                  
                    <span className="text-xl" aria-hidden="true">
                      {c.emoji}
                    </span>
                    <p className="mt-2.5 font-semibold text-white">{c.label}</p>
                    <p className="mt-1 text-[13px] leading-snug text-slate-500">{c.description}</p>
                  </button>);

            })}
            </div>

            <div className="mt-6">
              <label htmlFor="session-name" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Session name
              </label>
              <input
              id="session-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Manager Loop — Round 2"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-0" />
            
            </div>

            <div className="mt-7 flex justify-end">
              <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500">
              
                Continue
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div> :

        <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {practiceGoals.map((g) => {
              const active = goalId === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoalId(g.id)}
                  aria-pressed={active}
                  className={`rounded-xl border p-4 text-left transition-all duration-300 ${
                  active ?
                  'border-primary-500/60 bg-primary-500/10 shadow-lg shadow-primary-500/20' :
                  'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'}`
                  }>
                  
                    <span className="text-xl" aria-hidden="true">
                      {g.emoji}
                    </span>
                    <p className="mt-2.5 font-semibold text-white">{g.title}</p>
                    <p className="mt-1 text-[13px] leading-snug text-slate-500">{g.description}</p>
                    <p className="mt-3 font-mono text-[11px] text-primary-400">{g.metric}</p>
                  </button>);

            })}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800">
              
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <button
              type="button"
              onClick={() =>
              onComplete({
                contextId,
                name: name.trim() || 'Untitled Practice Session',
                goalId
              })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500">
              
                Enter Coaching Environment
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        }
      </motion.div>
    </div>);

}