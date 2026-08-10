import React from 'react';
import { motion } from 'framer-motion';
import { FocusMode, PracticeGoal, SessionState } from '../../types';
import { formatClock, LiveTelemetry } from '../../hooks/usePracticeSession';

interface CameraStageProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  state: SessionState;
  cameraReady: boolean;
  engineReady: boolean;
  cameraError: string | null;
  mode: FocusMode;
  elapsed: number;
  eyeContact: number;
  volumeBars: number[];
  goal: PracticeGoal;
  telemetry: LiveTelemetry;
  showTelemetry: boolean;
  onToggleTelemetry: () => void;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

function QualityDot({ level }: { level: 'good' | 'moderate' | 'poor' }) {
  const colors = {
    good: 'bg-emerald-400',
    moderate: 'bg-amber-400',
    poor: 'bg-red-400 animate-pulse',
  };
  return <span className={`h-2 w-2 rounded-full shrink-0 ${colors[level]}`} />;
}

export function CameraStage({
  videoRef,
  canvasRef,
  state,
  cameraReady,
  engineReady,
  cameraError,
  mode,
  elapsed,
  eyeContact,
  volumeBars,
  goal,
  telemetry,
  showTelemetry,
  onToggleTelemetry,
  onStart,
  onStop,
  onCancel,
}: CameraStageProps) {
  const recording = state === 'recording';
  const booting = !cameraReady || !engineReady;

  // Compute live audio quality
  const avgVol = volumeBars.reduce((a, b) => a + b, 0) / volumeBars.length;
  const audioLevel: 'good' | 'moderate' | 'poor' =
    avgVol >= 35 ? 'good' : avgVol >= 18 ? 'moderate' : 'poor';
  const audioLabel = audioLevel === 'good' ? 'Audio Good' : audioLevel === 'moderate' ? 'Audio Moderate' : 'Audio Low';

  // Camera quality
  const cameraLevel: 'good' | 'moderate' | 'poor' = cameraError
    ? 'poor'
    : telemetry.faceDetected
    ? 'good'
    : 'moderate';
  const cameraLabel = cameraError ? 'No Camera' : telemetry.faceDetected ? 'Camera Good' : 'Camera Searching';

  // Live telemetry chips from real data
  const liveChips = [
    {
      active: telemetry.faceDetected,
      activeLabel: 'Face Tracked ✓',
      inactiveLabel: 'No Face Detected',
      activeClass: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400',
      inactiveClass: 'border-slate-700/40 bg-slate-800/50 text-slate-500',
    },
    {
      active: telemetry.handsDetected,
      activeLabel: 'Hands Visible 🤚',
      inactiveLabel: 'Hands Hidden',
      activeClass: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
      inactiveClass: 'border-slate-700/40 bg-slate-800/50 text-slate-500',
    },
    {
      active: telemetry.smiling,
      activeLabel: 'Smiling 😊',
      inactiveLabel: 'Neutral Expression',
      activeClass: 'border-pink-500/40 bg-pink-500/15 text-pink-400',
      inactiveClass: 'border-slate-700/40 bg-slate-800/50 text-slate-500',
    },
    {
      active: telemetry.postureGood,
      activeLabel: 'Good Posture 🧍',
      inactiveLabel: 'Adjust Posture',
      activeClass: 'border-violet-500/40 bg-violet-500/15 text-violet-400',
      inactiveClass: 'border-red-500/20 bg-red-500/5 text-red-400',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950" aria-label="Camera stage">
      <div className="relative aspect-video w-full bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${showTelemetry ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Loading overlay */}
        {booting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-950/90 backdrop-blur-md">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-primary-500" />
            <p className="text-[15px] text-slate-300 font-medium tracking-wide">Initializing AI Models...</p>
            <p className="text-[12px] text-slate-500 text-center max-w-[280px]">
              Loading face, gesture and posture tracking engines. This takes up to 15 seconds.
            </p>
          </div>
        )}

        {/* Top-left HUD — REC timer */}
        <div className="absolute left-4 top-4">
          {recording ? (
            <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-slate-950/80 px-3.5 py-2 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">REC</span>
              <span className="font-mono text-[13px] text-slate-200">{formatClock(elapsed)}</span>
            </div>
          ) : (
            <div className="rounded-full border border-slate-700 bg-slate-950/80 px-3.5 py-2 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {booting ? 'Preparing…' : 'Camera Ready'}
              </span>
            </div>
          )}
        </div>

        {/* Top-right HUD — live telemetry chips + toggle */}
        {mode === 'analyst' && !booting && (
          <div className="absolute right-4 top-4 flex max-w-[60%] flex-wrap justify-end gap-1.5 items-start">
            <button
              onClick={onToggleTelemetry}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold backdrop-blur-md transition-colors ${
                showTelemetry
                  ? 'border-primary-500/50 bg-primary-500/20 text-primary-300'
                  : 'border-slate-500/30 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {showTelemetry ? 'Hide Mapping' : 'Show Mapping'}
            </button>
            {liveChips.map((chip) => (
              <span
                key={chip.activeLabel}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md transition-all duration-300 ${
                  chip.active ? chip.activeClass : chip.inactiveClass
                }`}
              >
                {chip.active ? chip.activeLabel : chip.inactiveLabel}
              </span>
            ))}
          </div>
        )}

        {/* Bottom-left — Audio & Camera quality indicators */}
        {recording && (
          <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
            {/* Audio quality */}
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-1.5 backdrop-blur-xl">
              <QualityDot level={audioLevel} />
              <span className="text-[11px] font-medium text-slate-300">{audioLabel}</span>
              {/* Mini waveform */}
              <span className="flex h-4 items-end gap-[2px]" aria-hidden="true">
                {volumeBars.slice(-10).map((h, i) => (
                  <span
                    key={i}
                    className={`w-[2px] rounded-full transition-all duration-75 ${
                      audioLevel === 'good'
                        ? 'bg-emerald-400/70'
                        : audioLevel === 'moderate'
                        ? 'bg-amber-400/70'
                        : 'bg-red-400/70'
                    }`}
                    style={{ height: `${Math.max(2, Math.min(16, h * 0.18))}px` }}
                  />
                ))}
              </span>
            </div>

            {/* Camera quality */}
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-1.5 backdrop-blur-xl">
              <QualityDot level={cameraLevel} />
              <span className="text-[11px] font-medium text-slate-300">{cameraLabel}</span>
              {telemetry.faceDetected && (
                <span className="font-mono text-[11px] text-primary-400">{eyeContact}% eye</span>
              )}
            </div>
          </div>
        )}

        {cameraError && !booting && (
          <div className="absolute bottom-4 right-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-[12px] text-amber-400 backdrop-blur-md">
            {cameraError}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-800/60 bg-slate-900/60 px-5 py-5">
        {recording ? (
          <>
            <motion.button
              type="button"
              onClick={onStop}
              whileHover={{ scale: 1.04 }}
              className="rounded-full bg-slate-700 px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-slate-600"
            >
              End Session
            </motion.button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-700 px-6 py-3.5 text-[15px] font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            >
              Cancel
            </button>
          </>
        ) : (
          <motion.button
            type="button"
            onClick={onStart}
            disabled={booting}
            whileHover={booting ? undefined : { scale: 1.04 }}
            className={`inline-flex items-center gap-3 rounded-full px-9 py-3.5 text-[15px] font-bold transition-colors ${
              booting
                ? 'cursor-not-allowed bg-slate-700 text-slate-400 opacity-70'
                : 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-500'
            }`}
          >
            {booting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" aria-hidden="true" />
            )}
            {booting ? (cameraReady ? 'Loading Engine…' : 'Starting Camera…') : 'Start Practice'}
          </motion.button>
        )}
      </div>
    </section>
  );
}