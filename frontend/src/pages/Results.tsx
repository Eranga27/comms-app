import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DownloadIcon } from 'lucide-react';
import { AmbientGlow } from '../components/common/AmbientGlow';
import { CafAccordion } from '../components/results/CafAccordion';
import { CoachSummary } from '../components/results/CoachSummary';
import { DnaRadar } from '../components/results/DnaRadar';
import { PillarBreakdown } from '../components/results/PillarBreakdown';
import { ScoreHero } from '../components/results/ScoreHero';
import { SessionPlayback } from '../components/results/SessionPlayback';
import { StrengthsFocus } from '../components/results/StrengthsFocus';
import { TranscriptView } from '../components/results/TranscriptView';
import { ReportContext } from '../contexts/ReportContext';
import { useSessionReport } from '../hooks/useSessionReport';

const section = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: 'easeOut' }
} as const;

export function Results() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useSessionReport(id);

  if (isLoading) {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-white" aria-hidden="true" />
        <p className="text-slate-400 font-medium animate-pulse">AI Coach is analyzing your communication...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white">
        <p>Could not load session results.</p>
        <Link to="/v2/dashboard" className="mt-4 text-primary-400">Return to Dashboard</Link>
      </main>
    );
  }

  const { sessionReport } = data;

  return (
    <ReportContext.Provider value={data}>
      <main className="relative min-h-screen w-full bg-slate-950 px-5 pb-20 pt-24 sm:px-8">
      <AmbientGlow />

      <div className="relative mx-auto max-w-6xl space-y-5">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
            Session Intelligence Report
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {sessionReport.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[13px]">
            <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-slate-300">
              {sessionReport.context}
            </span>
            <span className="text-slate-500">{sessionReport.date}</span>
            <span className="font-mono text-slate-500">{sessionReport.duration}</span>
            <span className="rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 font-semibold text-primary-400">
              Grade {sessionReport.grade}
            </span>
          </div>
        </header>

        <motion.div {...section}>
          <ScoreHero />
        </motion.div>

        <motion.div {...section} className="grid gap-5 lg:grid-cols-2">
          <PillarBreakdown />
          <DnaRadar />
        </motion.div>

        <motion.div {...section}>
          <StrengthsFocus />
        </motion.div>

        <motion.div {...section}>
          <CoachSummary />
        </motion.div>

        <motion.div {...section}>
          <CafAccordion />
        </motion.div>

        <motion.div {...section} className="grid gap-5 lg:grid-cols-2">
          <TranscriptView />
          <SessionPlayback />
        </motion.div>

        <motion.div {...section} className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/v2/practice"
            className="rounded-xl bg-primary-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500">
            
            Start New Session
          </Link>
          <Link
            to="/v2/dashboard"
            className="rounded-xl px-6 py-3.5 text-[15px] font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
            
            Back to Dashboard
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3.5 text-[15px] font-semibold text-slate-300 transition-colors hover:bg-slate-800">
            
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            Download Report
          </button>
        </motion.div>
      </div>
    </main>
    </ReportContext.Provider>
  );

}