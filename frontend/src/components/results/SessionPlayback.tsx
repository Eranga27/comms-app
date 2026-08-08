import React, { useRef, useState, useEffect } from 'react';
import { PauseIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';
import { useReport } from '../../contexts/ReportContext';

export function SessionPlayback() {
  const { sessionReport } = useReport();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const handleTimeUpdate = () => {
      const p = (el.currentTime / (el.duration || 1)) * 100;
      setProgress(p);
      const mins = Math.floor(el.currentTime / 60);
      const secs = Math.floor(el.currentTime % 60);
      setCurrentTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    const handleEnded = () => setPlaying(false);

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('ended', handleEnded);
    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('ended', handleEnded);
    };
  }, []);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const restart = () => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play();
    setPlaying(true);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900">
      <div className="border-b border-slate-800/60 p-6 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Session Playback</p>
        <h2 className="mt-1.5 font-display text-xl font-bold text-white">Watch it back</h2>
      </div>

      <div className="relative aspect-video bg-slate-950">
        <video 
          ref={videoRef} 
          src={`/sessions_media/${sessionReport.id}.webm`} 
          className="h-full w-full object-cover" 
          playsInline 
        />
        {!playing && progress === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/50 backdrop-blur-sm pointer-events-none">
            <span className="text-3xl" aria-hidden="true">🎬</span>
            <p className="text-[14px] text-slate-300 font-medium drop-shadow-md">Processed canvas recording</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-slate-800/60 bg-slate-900/60 px-5 py-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause playback' : 'Play playback'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-500">
          
          {playing ?
          <PauseIcon className="h-4 w-4 fill-current" aria-hidden="true" /> :

          <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
          }
        </button>
        <button
          type="button"
          onClick={restart}
          aria-label="Restart playback"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
          
          <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-primary-500 transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <span className="shrink-0 font-mono text-[12px] text-slate-500">{currentTime} / {sessionReport.duration}</span>
      </div>
    </article>);

}