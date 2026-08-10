import React, { useEffect, useRef } from 'react';
import { MicIcon, MicOffIcon } from 'lucide-react';

interface TranscriptPanelProps {
  transcript: string;
  interimTranscript: string;
  recording: boolean;
  isAudioLow: boolean;
}

export function TranscriptPanel({ transcript, interimTranscript, recording, isAudioLow }: TranscriptPanelProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  return (
    <section className="rounded-2xl border border-slate-800/60 bg-slate-900 p-5" aria-label="Live transcript">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Live Transcript</p>
        <div className="flex items-center gap-2">
          {recording && isAudioLow && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400 animate-pulse bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <MicOffIcon className="h-3 w-3" />
              Audio low — speak louder
            </span>
          )}
          {recording && !isAudioLow && (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-primary-400">
              <MicIcon className="h-3 w-3" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400" aria-hidden="true" />
              listening
            </span>
          )}
        </div>
      </div>

      <div ref={boxRef} className="h-52 overflow-y-auto pr-1 scroll-smooth" aria-live="polite">
        {transcript || interimTranscript ? (
          <p className="text-[15px] leading-relaxed text-slate-300">
            {transcript}
            {interimTranscript && (
              <span className="text-slate-500 italic"> {interimTranscript}</span>
            )}
          </p>
        ) : (
          <p className="text-[15px] italic leading-relaxed text-slate-600">
            {recording
              ? isAudioLow
                ? 'Microphone level is too low to capture speech. Please speak louder or move closer to the mic.'
                : 'Listening… start speaking and your words will appear here.'
              : 'Your speech will appear here once you begin.'}
          </p>
        )}
      </div>

      {recording && (
        <div className="mt-3 border-t border-slate-800/60 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-600">
            {transcript.split(' ').filter(Boolean).length} words captured
          </span>
          {isAudioLow && (
            <span className="text-[11px] text-amber-500">
              Transcript may be incomplete due to low audio
            </span>
          )}
        </div>
      )}
    </section>
  );
}