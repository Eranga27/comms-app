import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, RefreshCwIcon, QuoteIcon, SparklesIcon } from 'lucide-react';
import { practiceContexts, practiceGoals, practicePrompts } from '../../data/practice';

export interface SessionSetup {
  contextId: string;
  context: string;
  name: string;
  goalId: string;
  prompt: string;
}

interface SetupModalProps {
  onComplete: (setup: SessionSetup) => void;
  initialGoalId?: string;
  initialContextId?: string;
}

export function SetupModal({ onComplete, initialGoalId, initialContextId }: SetupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [contextId, setContextId] = useState(initialContextId ?? 'interview');
  const [name, setName] = useState('');
  const [goalId, setGoalId] = useState(initialGoalId ?? 'all');
  const [promptIndex, setPromptIndex] = useState(0);

  // Resolved goal object — used in the handoff banner
  const handoffGoal = initialGoalId ? practiceGoals.find((g) => g.id === initialGoalId) : null;

  const availablePrompts = practicePrompts[contextId] || practicePrompts['freeform'] || ['Speak about any topic you would like to practise.'];
  const currentPrompt = availablePrompts[promptIndex % availablePrompts.length];

  const handleNextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % availablePrompts.length);
  };

  const handleContextChange = (id: string) => {
    setContextId(id);
    setPromptIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/85 px-4 py-10 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-label="Session setup"
        className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8"
      >
        {/* Handoff banner — shown when arriving from Results with a pre-set goal */}
        {handoffGoal && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-primary-500/20 bg-primary-500/8 px-4 py-3">
            <span className="shrink-0 text-xl" aria-hidden="true">{handoffGoal.emoji}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">
                Continuing from your last session
              </p>
              <p className="mt-0.5 text-[14px] font-semibold text-white">
                Let's work on: {handoffGoal.title.replace(/^[^\w]*/, '')}
              </p>
            </div>
          </div>
        )}
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
              Step {step} of 3
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {step === 1
                ? 'What are you preparing for?'
                : step === 2
                ? 'What would you like to work on?'
                : 'Your first challenge'}
            </h2>
            {step === 2 && (
              <p className="mt-1.5 text-[13px] text-slate-400">
                Optional — selecting a focus highlights priority tips. Full 4-pillar communication analysis is always active.
              </p>
            )}
            {step === 3 && (
              <p className="mt-1.5 text-[13px] text-slate-400">
                Take your time. There's no perfect answer — focus on steady pacing and clear thoughts.
              </p>
            )}
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className={`h-1.5 w-8 sm:w-10 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-slate-700'}`} />
            <span className={`h-1.5 w-8 sm:w-10 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-slate-700'}`} />
            <span className={`h-1.5 w-8 sm:w-10 rounded-full ${step >= 3 ? 'bg-primary-500' : 'bg-slate-700'}`} />
          </div>
        </div>

        {step === 1 ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {practiceContexts.map((c) => {
                const active = contextId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleContextChange(c.id)}
                    aria-pressed={active}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/15 ring-1 ring-primary-500/50'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-xl" aria-hidden="true">
                          {c.emoji}
                        </span>
                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold text-white shadow-sm">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-display font-semibold text-white">{c.label}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{c.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <label htmlFor="session-name" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Session name (optional)
              </label>
              <input
                id="session-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Product Manager Loop — Round 2"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500"
              >
                Continue
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {practiceGoals.map((g) => {
                const active = goalId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoalId(g.id)}
                    aria-pressed={active}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/15 ring-1 ring-primary-500/50'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-xl" aria-hidden="true">
                          {g.emoji}
                        </span>
                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold text-white shadow-sm">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-display font-semibold text-white">{g.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{g.description}</p>
                    </div>
                    <p className="mt-3 font-mono text-[11px] font-medium text-primary-400">{g.metric}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
              >
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500"
              >
                Continue
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider">
                  <SparklesIcon className="h-4 w-4" />
                  Recommended Practice Challenge
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Option { (promptIndex % availablePrompts.length) + 1 } of { availablePrompts.length }
                </span>
              </div>

              <div className="relative py-3">
                <QuoteIcon className="absolute -top-1 -left-2 h-8 w-8 text-primary-500/20" />
                <p className="font-display text-xl sm:text-2xl font-semibold leading-relaxed text-white pl-6">
                  "{currentPrompt}"
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                <p className="text-[12px] text-slate-400">
                  Prefer a different prompt for this context?
                </p>
                <button
                  type="button"
                  onClick={handleNextPrompt}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800"
                >
                  <RefreshCwIcon className="h-3.5 w-3.5 text-primary-400" />
                  Choose another
                </button>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
              >
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                Back
              </button>
              <button
                type="button"
                onClick={() =>
                  onComplete({
                    contextId,
                    context: practiceContexts.find((c) => c.id === contextId)?.label || contextId,
                    name: name.trim() || 'Untitled Practice Session',
                    goalId,
                    prompt: currentPrompt,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500"
              >
                Enter Coaching Environment
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}