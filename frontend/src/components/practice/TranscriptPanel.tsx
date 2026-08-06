import React, { useEffect, useRef } from 'react';

interface TranscriptPanelProps {
  transcript: string;
  recording: boolean;
}

export function TranscriptPanel({ transcript, recording }: TranscriptPanelProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <section className="rounded-2xl border border-slate-800/60 bg-slate-900 p-5" aria-label="Live transcript">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Live Transcript</p>
        {recording &&
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-primary-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400" aria-hidden="true" />
            streaming
          </span>
        }
      </div>
      <div ref={boxRef} className="scroll-thin h-28 overflow-y-auto pr-2" aria-live="polite">
        {transcript ?
        <p className="text-[15px] leading-relaxed text-slate-300">{transcript}</p> :

        <p className="text-[15px] italic leading-relaxed text-slate-600">
            {recording ? 'Listening...' : 'Your speech will appear here once you begin.'}
          </p>
        }
      </div>
    </section>);

}