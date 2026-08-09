import React from 'react';
import { motion } from 'framer-motion';
import { FocusMode, PracticeGoal, SessionState } from '../../types';

import { formatClock } from '../../hooks/usePracticeSession';

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
  showTelemetry: boolean;
  onToggleTelemetry: () => void;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

const statusChips = [
{ label: 'Face Tracked ✓', className: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400' },
{ label: 'Hands Tracked 🤚', className: 'border-amber-500/30 bg-amber-500/20 text-amber-400' },
{ label: 'Smiling 😊', className: 'border-pink-500/30 bg-pink-500/20 text-pink-400' },
{ label: 'Good Posture 🧍', className: 'border-violet-500/30 bg-violet-500/20 text-violet-400' }];


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
  showTelemetry,
  onToggleTelemetry,
  onStart,
  onStop,
  onCancel
}: CameraStageProps) {
  const recording = state === 'recording';
  const booting = !cameraReady || !engineReady;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950" aria-label="Camera stage">
      <div className="relative aspect-video w-full bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: 'scaleX(-1)' }} />
          
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${showTelemetry ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'scaleX(-1)' }} />
        
        {/* TrackingOverlay removed in favor of live canvas drawing */}

        {booting &&
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-950/90 backdrop-blur-md">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-primary-500" />
            <p className="text-[15px] text-slate-300 font-medium tracking-wide">Initializing AI Models...</p>
            <p className="text-[12px] text-slate-500 text-center max-w-[280px]">Loading advanced face and gesture tracking engines. This may take up to 15 seconds.</p>
          </div>
        }

        {/* Top-left HUD */}
        <div className="absolute left-4 top-4">
          {recording ?
          <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-slate-950/80 px-3.5 py-2 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">REC</span>
              <span className="font-mono text-[13px] text-slate-200">{formatClock(elapsed)}</span>
            </div> :

          <div className="rounded-full border border-slate-700 bg-slate-950/80 px-3.5 py-2 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {booting ? 'Preparing' : 'Camera Ready'}
              </span>
            </div>
          }
        </div>

        {/* Top-right HUD */}
        {mode === 'analyst' && !booting &&
        <div className="absolute right-4 top-4 flex max-w-[60%] flex-wrap justify-end gap-1.5 items-start">
            <button
              onClick={onToggleTelemetry}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold backdrop-blur-md transition-colors ${showTelemetry ? 'border-primary-500/50 bg-primary-500/20 text-primary-300' : 'border-slate-500/30 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}
            >
              {showTelemetry ? 'Hide Mapping' : 'Show Mapping'}
            </button>
            {statusChips.map((chip) =>
          <span
            key={chip.label}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${chip.className}`}>
            
                {chip.label}
              </span>
          )}
          </div>
        }

        {/* Bottom-left goal tracker */}
        {recording &&
        <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2.5 backdrop-blur-xl">
            <span className="text-[13px] text-slate-300">
              <span aria-hidden="true">{goal.emoji} </span>
              {goal.title}
            </span>
            <span className="font-mono text-[13px] font-medium text-primary-400">{eyeContact}%</span>
            <span className="flex h-6 items-end gap-[2px]" aria-hidden="true">
              {volumeBars.slice(0, 12).map((h, i) =>
            <span
              key={i}
              className="w-[3px] rounded-full bg-primary-500/70 transition-all duration-100"
              style={{ height: `${h}px` }} />

            )}
            </span>
          </div>
        }

        {cameraError && !booting &&
        <div className="absolute bottom-4 right-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-[12px] text-amber-400 backdrop-blur-md">
            {cameraError}
          </div>
        }
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-800/60 bg-slate-900/60 px-5 py-5">
        {recording ?
        <>
            <motion.button
            type="button"
            onClick={onStop}
            whileHover={{ scale: 1.04 }}
            className="rounded-full bg-slate-700 px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-slate-600">
            
              End Session
            </motion.button>
            {mode === 'beginner' &&
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-700 px-6 py-3.5 text-[15px] font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200">
            
                Cancel
              </button>
          }
          </> :

        <motion.button
          type="button"
          onClick={onStart}
          disabled={booting}
          whileHover={booting ? undefined : { scale: 1.04 }}
          className={`inline-flex items-center gap-3 rounded-full px-9 py-3.5 text-[15px] font-bold transition-colors ${
          booting ?
          'cursor-not-allowed bg-slate-700 text-slate-400 opacity-70' :
          'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-500'}`
          }>
          
            {booting &&
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" aria-hidden="true" />
          }
            {booting ? cameraReady ? 'Loading Engine...' : 'Starting Camera...' : 'Start Practice'}
          </motion.button>
        }
      </div>
    </section>);

}