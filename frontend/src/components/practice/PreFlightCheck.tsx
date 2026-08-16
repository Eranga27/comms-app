import React from 'react';
import { CameraIcon, MicIcon, RefreshCwIcon, CheckCircle2Icon, AlertCircleIcon, Loader2Icon } from 'lucide-react';

interface PreFlightCheckProps {
  cameraReady: boolean;
  engineReady: boolean;
  cameraError: string | null;
  volumeBars: number[];
  onRetryMedia?: () => void;
}

export function PreFlightCheck({
  cameraReady,
  engineReady,
  cameraError,
  volumeBars,
  onRetryMedia,
}: PreFlightCheckProps) {
  const isBooting = !cameraReady || !engineReady;

  // Determine microphone status
  const avgVol = volumeBars.length > 0 ? volumeBars.reduce((a, b) => a + b, 0) / volumeBars.length : 0;
  const isMicAvailable = !cameraError?.includes('Microphone access unavailable') && !cameraError?.includes('Camera & Microphone');
  
  // Camera status
  const isCameraAvailable = !cameraError?.includes('Camera unavailable') && !cameraError?.includes('Camera & Microphone');

  let cameraStatus: 'checking' | 'ready' | 'unavailable' = isBooting
    ? 'checking'
    : isCameraAvailable
    ? 'ready'
    : 'unavailable';

  let micStatus: 'checking' | 'ready' | 'unavailable' = isBooting
    ? 'checking'
    : isMicAvailable
    ? 'ready'
    : 'unavailable';

  // Readiness Summary
  let summaryMessage = "Checking your devices…";
  let summaryClass = "text-slate-400";

  if (!isBooting) {
    if (cameraStatus === 'ready' && micStatus === 'ready') {
      summaryMessage = "You're ready.";
      summaryClass = "text-emerald-400 font-semibold";
    } else if (cameraStatus === 'ready' && micStatus === 'unavailable') {
      summaryMessage = "Microphone unavailable — running in video-only practice mode.";
      summaryClass = "text-amber-400 font-medium";
    } else if (cameraStatus === 'unavailable' && micStatus === 'ready') {
      summaryMessage = "Camera unavailable — running in audio-only practice mode.";
      summaryClass = "text-amber-400 font-medium";
    } else {
      summaryMessage = "Device access required. Please grant permission and click Retry.";
      summaryClass = "text-red-400 font-medium";
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/90 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
            Pre-Flight Readiness
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-white">
            Let's make sure you're ready.
          </h3>
          <p className={`mt-1 text-[13px] ${summaryClass}`}>
            {summaryMessage}
          </p>
        </div>

        {/* Readiness Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Camera Readiness */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-all ${
              cameraStatus === 'checking'
                ? 'border-slate-800 bg-slate-950/60 text-slate-400'
                : cameraStatus === 'ready'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}
          >
            <CameraIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {cameraStatus === 'checking' && 'Checking...'}
              {cameraStatus === 'ready' && 'Camera ✓ Ready'}
              {cameraStatus === 'unavailable' && 'Camera unavailable'}
            </span>
            {cameraStatus === 'checking' && (
              <Loader2Icon className="h-3.5 w-3.5 animate-spin text-slate-400" aria-hidden="true" />
            )}
            {cameraStatus === 'ready' && (
              <CheckCircle2Icon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            )}
            {cameraStatus === 'unavailable' && (
              <AlertCircleIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
            )}
          </div>

          {/* Microphone Readiness */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-all ${
              micStatus === 'checking'
                ? 'border-slate-800 bg-slate-950/60 text-slate-400'
                : micStatus === 'ready'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}
          >
            <MicIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {micStatus === 'checking' && 'Checking...'}
              {micStatus === 'ready' && 'Microphone ✓ Ready'}
              {micStatus === 'unavailable' && 'Microphone unavailable'}
            </span>
            {micStatus === 'checking' && (
              <Loader2Icon className="h-3.5 w-3.5 animate-spin text-slate-400" aria-hidden="true" />
            )}
            {micStatus === 'ready' && (
              <CheckCircle2Icon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            )}
            {micStatus === 'unavailable' && (
              <AlertCircleIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
            )}
          </div>

          {/* Retry Button if any device is unavailable */}
          {(cameraStatus === 'unavailable' || micStatus === 'unavailable') && onRetryMedia && (
            <button
              type="button"
              onClick={onRetryMedia}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-[13px] font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <RefreshCwIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Retry Media
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
