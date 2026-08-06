import { useCallback, useEffect, useRef, useState } from 'react';
import { CoachingNote, SessionState } from '../types';
import { coachingScript, transcriptScript } from '../data/practice';

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface PracticeSessionApi {
  videoRef: React.RefObject<HTMLVideoElement>;
  state: SessionState;
  cameraReady: boolean;
  engineReady: boolean;
  cameraError: string | null;
  elapsed: number;
  notes: CoachingNote[];
  toast: CoachingNote | null;
  transcript: string;
  volumeBars: number[];
  eyeContact: number;
  start: () => void;
  stop: () => void;
  cancel: () => void;
}

export function usePracticeSession(): PracticeSessionApi {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const elapsedRef = useRef(0);

  const [state, setState] = useState<SessionState>('loading');
  const [cameraReady, setCameraReady] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState<CoachingNote[]>([]);
  const [toast, setToast] = useState<CoachingNote | null>(null);
  const [transcript, setTranscript] = useState('');
  const [volumeBars, setVolumeBars] = useState<number[]>(() => Array.from({ length: 20 }, () => 8));
  const [eyeContact, setEyeContact] = useState(82);

  // Camera + engine boot
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      } catch {
        if (!cancelled) {
          setCameraError('Camera unavailable — running in preview mode.');
          setCameraReady(true);
        }
      }
      if (!cancelled) {
        window.setTimeout(() => {
          if (cancelled) return;
          setEngineReady(true);
          setState('ready');
        }, 1400);
      }
    }

    boot();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Recording timer
  useEffect(() => {
    if (state !== 'recording') return;
    const id = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [state]);

  // Volume bars + telemetry drift
  useEffect(() => {
    if (state !== 'recording') return;
    const id = window.setInterval(() => {
      setVolumeBars(Array.from({ length: 20 }, () => 6 + Math.random() * 26));
    }, 100);
    const telemetry = window.setInterval(() => {
      setEyeContact((v) => Math.min(97, Math.max(58, v + Math.round((Math.random() - 0.45) * 6))));
    }, 1800);
    return () => {
      window.clearInterval(id);
      window.clearInterval(telemetry);
    };
  }, [state]);

  // Streaming transcript
  useEffect(() => {
    if (state !== 'recording') return;
    let index = 0;
    const id = window.setInterval(() => {
      setTranscript((prev) => `${prev}${prev ? ' ' : ''}${transcriptScript[index % transcriptScript.length]}`);
      index += 1;
    }, 2600);
    return () => window.clearInterval(id);
  }, [state]);

  // Coaching feedback
  useEffect(() => {
    if (state !== 'recording') return;
    let index = 0;
    let dismissTimer = 0;

    const id = window.setInterval(() => {
      const source = coachingScript[index % coachingScript.length];
      index += 1;
      const note: CoachingNote = {
        id: Date.now(),
        type: source.type,
        message: source.message,
        timestamp: formatClock(elapsedRef.current)
      };
      setNotes((prev) => [note, ...prev].slice(0, 12));
      setToast(note);
      window.clearTimeout(dismissTimer);
      dismissTimer = window.setTimeout(() => setToast(null), 3000);
    }, 5000);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(dismissTimer);
    };
  }, [state]);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const start = useCallback(() => {
    setElapsed(0);
    setNotes([]);
    setTranscript('');
    setState('recording');
  }, []);

  const stop = useCallback(() => {
    setToast(null);
    setState('processing');
  }, []);

  const cancel = useCallback(() => {
    setToast(null);
    setNotes([]);
    setTranscript('');
    setElapsed(0);
    setState('ready');
  }, []);

  return {
    videoRef,
    state,
    cameraReady,
    engineReady,
    cameraError,
    elapsed,
    notes,
    toast,
    transcript,
    volumeBars,
    eyeContact,
    start,
    stop,
    cancel
  };
}