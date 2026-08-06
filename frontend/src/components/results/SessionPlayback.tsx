import React, { useRef, useState } from 'react';
import { PauseIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';

export function SessionPlayback() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

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
        <video ref={videoRef} className="h-full w-full object-cover" playsInline />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950">
          <span className="text-3xl" aria-hidden="true">🎬</span>
          <p className="text-[14px] text-slate-500">Processed canvas recording of this session</p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-800/60 bg-slate-900/60 px-5 py-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause playback' : 'Play playback'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-500">
          
          {playing ?
          <PauseIcon className="h-4 w-4 fill-current" aria-hidden="true" /> :

          <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
          }
        </button>
        <button
          type="button"
          onClick={restart}
          aria-label="Restart playback"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
          
          <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-0 rounded-full bg-primary-500" />
        </div>
        <span className="font-mono text-[12px] text-slate-500">00:00 / 06:52</span>
      </div>
    </article>);

}