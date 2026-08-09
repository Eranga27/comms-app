import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AmbientGlow } from '../components/common/AmbientGlow';
import { CameraStage } from '../components/practice/CameraStage';
import { CoachingHistory } from '../components/practice/CoachingHistory';
import { CoachingToast } from '../components/practice/CoachingToast';
import { ProcessingOverlay } from '../components/practice/ProcessingOverlay';
import { SetupModal, SessionSetup } from '../components/practice/SetupModal';
import { TranscriptPanel } from '../components/practice/TranscriptPanel';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { practiceGoals } from '../data/practice';
import { FocusMode } from '../types';

export function Practice() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState<SessionSetup | null>(null);
  const [mode] = useState<FocusMode>('analyst');
  const [showTelemetry, setShowTelemetry] = useState(true);
  const session = usePracticeSession();

  const goal = practiceGoals.find((g) => g.id === setup?.goalId) ?? practiceGoals[0];
  const isAudioLow = session.volumeBars.reduce((a, b) => a + b, 0) / session.volumeBars.length < 15;

  const handleProcessed = useCallback(() => {
    // The session hook drives navigation on its own after stop() — this fallback is no longer needed.
  }, [navigate]);

  return (
    <main className="relative min-h-screen w-full bg-slate-950 px-5 py-8 sm:px-8 sm:py-12">
      <AmbientGlow />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
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
              showTelemetry={showTelemetry}
              onToggleTelemetry={() => setShowTelemetry(!showTelemetry)}
              onStart={session.start}
              onStop={session.stop}
              onCancel={session.cancel} />
            

            <TranscriptPanel transcript={session.transcript} recording={session.state === 'recording'} isAudioLow={isAudioLow} />
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

      {!setup && <SetupModal onComplete={setSetup} />}

      <AnimatePresence>
        {session.state === 'processing' && <ProcessingOverlay onComplete={handleProcessed} />}
      </AnimatePresence>
    </main>);

}