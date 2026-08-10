import React, { useRef, useState, useEffect } from 'react';
import { PauseIcon, PlayIcon, RotateCcwIcon, VideoOffIcon } from 'lucide-react';
import { useReport } from '../../contexts/ReportContext';

import { API_URL } from '../../config';

export function SessionPlayback() {
  const { sessionReport } = useReport();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [hasVideo, setHasVideo] = useState(true);
  const [duration, setDuration] = useState(0);

  const videoSrc = `${API_URL}/sessions_media/${sessionReport.id}.webm`;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      const p = (el.currentTime / (el.duration || 1)) * 100;
      setProgress(p);
      const mins = Math.floor(el.currentTime / 60);
      const secs = Math.floor(el.currentTime % 60);
      setCurrentTime(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };
    const onLoaded = () => setDuration(el.duration);
    const onEnded = () => setPlaying(false);
    const onError = () => setHasVideo(false);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, []);

  const toggle = () => {
    const el = videoRef.current;
    if (!el || !hasVideo) return;
    if (el.paused) { void el.play(); setPlaying(true); }
    else { el.pause(); setPlaying(false); }
  };

  const restart = () => {
    const el = videoRef.current;
    if (!el || !hasVideo) return;
    el.currentTime = 0;
    void el.play();
    setPlaying(true);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current;
    if (!el || !hasVideo || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * duration;
  };

  const formatDur = (s: number) => {
    if (!s || isNaN(s)) return sessionReport.duration || '--:--';
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900">
      <div className="border-b border-slate-800/60 p-5 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Session Playback</p>
        <h2 className="mt-1 font-display text-xl font-bold text-white">Watch it back</h2>
      </div>

      {/* Video area */}
      <div className="relative aspect-video bg-slate-950">
        <video
          ref={videoRef}
          src={videoSrc}
          className={`h-full w-full object-cover transition-opacity duration-300 ${hasVideo ? 'opacity-100' : 'opacity-0'}`}
          playsInline
          preload="metadata"
        />

        {!hasVideo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600">
            <VideoOffIcon className="h-10 w-10" />
            <p className="text-[13px] font-medium text-center px-6">
              Video not available for this session.
              <br />
              <span className="text-[11px] text-slate-700">Future sessions will be saved automatically.</span>
            </p>
          </div>
        )}

        {hasVideo && !playing && progress === 0 && (
          <button
            onClick={toggle}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/40 hover:bg-slate-950/20 transition-colors"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600/90 text-white shadow-lg">
              <PlayIcon className="h-6 w-6 fill-current" />
            </div>
            <p className="text-[13px] text-slate-300 font-medium">Play session recording</p>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 border-t border-slate-800/60 bg-slate-900/60 px-5 py-4">
        <button
          type="button"
          onClick={toggle}
          disabled={!hasVideo}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-500 disabled:opacity-40"
        >
          {playing
            ? <PauseIcon className="h-4 w-4 fill-current" />
            : <PlayIcon className="h-4 w-4 fill-current" />
          }
        </button>
        <button
          type="button"
          onClick={restart}
          disabled={!hasVideo}
          aria-label="Restart"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-40"
        >
          <RotateCcwIcon className="h-4 w-4" />
        </button>

        {/* Seek bar */}
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800 cursor-pointer"
          onClick={seekTo}
        >
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="shrink-0 font-mono text-[12px] text-slate-500">
          {currentTime} / {formatDur(duration)}
        </span>
      </div>
    </article>
  );
}