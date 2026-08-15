import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon } from 'lucide-react';
import { AmbientGlow } from '../components/common/AmbientGlow';
import { CameraStage } from '../components/practice/CameraStage';
import { CoachingHistory } from '../components/practice/CoachingHistory';
import { CoachingToast } from '../components/practice/CoachingToast';
import { ProcessingOverlay } from '../components/practice/ProcessingOverlay';
import { SetupModal, SessionSetup } from '../components/practice/SetupModal';
import { TranscriptPanel } from '../components/practice/TranscriptPanel';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { useAuth } from '../contexts/AuthContext';
import { practiceGoals } from '../data/practice';
import { FocusMode } from '../types';

const GUEST_SESSION_KEY = 'eloquent_guest_session_used';

export function Practice() {
  const { user, setShowAuthModal } = useAuth();
  const [setup, setSetup] = useState<SessionSetup | null>(null);
  const [mode] = useState<FocusMode>('analyst');
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const session = usePracticeSession();

  const goal = practiceGoals.find((g) => g.id === setup?.goalId) ?? practiceGoals[0];
  const isAudioLow = session.volumeBars.reduce((a, b) => a + b, 0) / session.volumeBars.length < 18;

  // Guest mode: only allow 1 session without registering
  const isGuest = !user;
  const guestSessionUsed = localStorage.getItem(GUEST_SESSION_KEY) === 'true';

  const handleStart = () => {
    if (isGuest && guestSessionUsed) {
      // Already used their free trial
      setShowGuestPrompt(true);
      return;
    }
    if (isGuest) {
      // Mark their trial as used when they start
      localStorage.setItem(GUEST_SESSION_KEY, 'true');
    }
    session.start(setup?.name || 'Practice Session', setup?.context || 'General');
  };

  const handleStop = () => {
    session.stop();
    // After a guest session completes, show auth prompt
    if (isGuest) {
      // Auth modal will be shown from ProcessingOverlay or on results page load
      localStorage.setItem(GUEST_SESSION_KEY, 'true');
    }
  };

  return (
    <main className="relative min-h-screen w-full px-5 py-8 sm:px-8 sm:py-12">
      <AmbientGlow />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-300 transition-colors mb-3"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              Home
            </Link>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
              Live Telemetry Engine
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Coaching Environment
            </h1>
            <p className="mt-2 text-[15px] text-slate-400">
              Calm, focused, and distraction-free practice.
              {setup ? ` · ${setup.name}` : ''}
            </p>
          </div>
          {isGuest && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-400">
              🎯 Guest trial — completing this session will prompt you to register for full access.
            </div>
          )}
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <CameraStage
              videoRef={session.videoRef}
              canvasRef={session.canvasRef}
              state={session.state}
              cameraReady={session.cameraReady}
              engineReady={session.engineReady}
              cameraError={session.cameraError}
              mode={mode}
              elapsed={session.elapsed}
              eyeContact={session.eyeContact}
              volumeBars={session.volumeBars}
              goal={goal}
              telemetry={session.telemetry}
              showTelemetry={showTelemetry}
              onToggleTelemetry={() => setShowTelemetry(!showTelemetry)}
              onStart={handleStart}
              onStop={handleStop}
              onCancel={session.cancel}
              onRetryMedia={session.retryMedia}
            />

            <TranscriptPanel
              transcript={session.transcript}
              interimTranscript={session.interimTranscript}
              recording={session.state === 'recording'}
              isAudioLow={isAudioLow}
            />
          </div>

          <div className="space-y-5">
            <CoachingHistory notes={session.notes} />
            <div className="rounded-2xl border border-primary-500/15 bg-primary-500/5 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">Session Goal</p>
              <p className="mt-2.5 font-display text-lg font-bold text-white">
                <span aria-hidden="true">{goal.emoji} </span>
                {goal.title}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{goal.description}</p>
              <p className="mt-3 font-mono text-[11px] text-slate-500">Tracking: {goal.metric}</p>
            </div>
          </div>
        </div>
      </div>

      <CoachingToast note={session.toast} />

      {/* Setup modal — skip for guests who already used their trial */}
      {!setup && !guestSessionUsed && <SetupModal onComplete={setSetup} />}

      {/* Guest prompt overlay */}
      <AnimatePresence>
        {showGuestPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
              <p className="text-3xl mb-4">🎯</p>
              <h2 className="font-display text-2xl font-bold text-white mb-2">You've used your free trial</h2>
              <p className="text-slate-400 text-[15px] mb-6">
                Create a free account to unlock unlimited practice sessions, a full AI analytics dashboard, and your communication history.
              </p>
              <button
                onClick={() => { setShowGuestPrompt(false); setShowAuthModal(true); }}
                className="w-full rounded-xl bg-primary-600 py-3.5 font-bold text-white hover:bg-primary-500 transition-colors mb-3"
              >
                Create Free Account
              </button>
              <button
                onClick={() => setShowGuestPrompt(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {session.state === 'processing' && (
          <ProcessingOverlay onComplete={() => {
            // Post-session guest prompt shown after results
          }} />
        )}
      </AnimatePresence>
    </main>
  );
}