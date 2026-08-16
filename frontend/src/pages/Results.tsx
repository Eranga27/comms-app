import React, { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, DownloadIcon } from 'lucide-react';
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
import { useAuth } from '../contexts/AuthContext';

const section = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: 'easeOut' }
} as const;

const GUEST_SESSION_KEY = 'eloquent_guest_session_used';

export function Results() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useSessionReport(id);
  const { user, setShowAuthModal } = useAuth();
  const seekVideoRef = useRef<((seconds: number) => void) | null>(null);

  // Show guest sign-up prompt after they view their free trial results
  const isGuest = !user;
  const guestJustFinished = isGuest && localStorage.getItem(GUEST_SESSION_KEY) === 'true';

  if (isLoading) {
    return (
      <main className="relative min-h-screen w-full flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-white" aria-hidden="true" />
        <p className="text-slate-400 font-medium animate-pulse">AI Coach is analyzing your communication...</p>
        <p className="text-[13px] text-slate-600">This can take up to 30 seconds</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="relative min-h-screen w-full flex flex-col items-center justify-center text-white gap-4">
        <p className="text-slate-400">Could not load session results.</p>
        <Link to="/v2/dashboard" className="text-primary-400 hover:text-primary-300">
          Return to Dashboard
        </Link>
        <Link to="/" className="text-sm text-slate-600 hover:text-slate-400">
          Go to Home
        </Link>
      </main>
    );
  }

  const { sessionReport } = data;

  return (
    <ReportContext.Provider value={{ ...data, seekVideoRef }}>
      <main className="relative min-h-screen w-full px-5 pb-20 pt-24 sm:px-8">
        <AmbientGlow />

        <div className="relative mx-auto max-w-6xl space-y-5">

          {/* Back navigation */}
          <div className="flex items-center gap-3 text-[13px]">
            <Link
              to={user ? '/v2/dashboard' : '/'}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              {user ? 'Dashboard' : 'Home'}
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-slate-500">Session Report</span>
          </div>

          {/* Guest upgrade banner */}
          {guestJustFinished && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary-500/30 bg-gradient-to-r from-primary-600/10 to-violet-600/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-white">🎉 Your free trial report is ready!</p>
                <p className="text-[13px] text-slate-400 mt-1">
                  Create a free account to save your history, track improvement over time, and unlock unlimited sessions.
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="shrink-0 rounded-xl bg-primary-600 px-5 py-2.5 text-[14px] font-bold text-white hover:bg-primary-500 transition-colors"
              >
                Create Free Account
              </button>
            </motion.div>
          )}

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

          {/* TOP SECTION: Score hero + Playback side by side */}
          <motion.div {...section} className="grid gap-5 lg:grid-cols-[1fr_400px]">
            <ScoreHero />
            <SessionPlayback />
          </motion.div>

          {/* PRIMARY COACHING INSIGHTS: Strengths & Focus Areas */}
          <motion.div {...section}>
            <StrengthsFocus />
          </motion.div>

          {/* COMMUNICATION BREAKDOWN: 5 Pillars + Collapsible Radar */}
          <motion.div {...section} className="grid gap-5 lg:grid-cols-2 items-start">
            <PillarBreakdown />
            <DnaRadar />
          </motion.div>

          {/* SESSION TRANSCRIPT: Promoted for easy discovery */}
          <motion.div {...section}>
            <TranscriptView />
          </motion.div>

          {/* EXECUTIVE COACH SUMMARY */}
          <motion.div {...section}>
            <CoachSummary />
          </motion.div>

          {/* DETAILED BREAKDOWN ACCORDION */}
          <motion.div {...section}>
            <CafAccordion />
          </motion.div>

          {/* Action buttons */}
          <motion.div {...section} className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/v2/practice"
              className="rounded-xl bg-primary-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500"
            >
              Start New Session
            </Link>
            {user && (
              <Link
                to="/v2/dashboard"
                className="rounded-xl px-6 py-3.5 text-[15px] font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Back to Dashboard
              </Link>
            )}
            <Link
              to="/"
              className="rounded-xl px-6 py-3.5 text-[15px] font-semibold text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Home
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3.5 text-[15px] font-semibold text-slate-300 transition-colors hover:bg-slate-800"
            >
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              Download Report
            </button>
          </motion.div>
        </div>
      </main>
    </ReportContext.Provider>
  );
}