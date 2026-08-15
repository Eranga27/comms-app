import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, RefreshCwIcon } from 'lucide-react';

// ─── Scripted demo sequence ──────────────────────────────────────────────────

interface DemoFrame {
  eye: number;
  pace: number;
  body: number;
  clarity: number;
  coaching: { type: 'positive' | 'warning'; text: string } | null;
  transcript: string;
  label: string;
}

const FRAMES: DemoFrame[] = [
  { eye: 74, pace: 148, body: 80, clarity: 76, coaching: null,
    transcript: 'I led the product discovery from scratch…',
    label: 'Session started' },
  { eye: 89, pace: 144, body: 86, clarity: 81,
    coaching: { type: 'positive', text: 'Strong eye contact — hold it right there.' },
    transcript: 'I led the product discovery from scratch, worked with eight different users',
    label: 'Good start' },
  { eye: 84, pace: 179, body: 82, clarity: 71,
    coaching: { type: 'warning', text: 'Speaking pace climbing. Slow down slightly.' },
    transcript: 'I led the product discovery from scratch, worked with eight different users, um, to map',
    label: 'Rushing' },
  { eye: 80, pace: 163, body: 79, clarity: 69,
    coaching: { type: 'warning', text: 'Filler detected. Replace with a confident pause.' },
    transcript: '…to map the exact points where the process was breaking down.',
    label: 'Filler detected' },
  { eye: 60, pace: 156, body: 77, clarity: 71,
    coaching: { type: 'warning', text: 'Eye contact dropped — bring your gaze back.' },
    transcript: 'The result was a thirty-percent reduction',
    label: 'Eye contact dipped' },
  { eye: 91, pace: 147, body: 89, clarity: 86,
    coaching: { type: 'positive', text: 'Strong recovery. Excellent eye contact and steady pace.' },
    transcript: 'The result was a thirty-percent reduction in handoff time across the whole team.',
    label: 'Recovered' },
];

const FRAME_MS = 2800;

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricBar({ label, value, good }: { label: string; value: number; good: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-slate-400">{label}</span>
        <span className="font-mono text-[11px] text-slate-300">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className={`h-full rounded-full ${good ? 'bg-emerald-500' : 'bg-amber-500'}`}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function DemoPreview() {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(-1);       // -1 = not yet started
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (elRef.current)   clearInterval(elRef.current);
  };

  const startDemo = useCallback(() => {
    clear();
    setIdx(0);
    setDone(false);
    setElapsed(0);
    elRef.current = setInterval(() => setElapsed(e => e + 100), 100);
  }, []);

  // Auto-start once on mount
  useEffect(() => {
    const t = setTimeout(() => startDemo(), 600);
    return () => { clearTimeout(t); clear(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advance frames
  useEffect(() => {
    if (idx < 0) return;
    if (idx >= FRAMES.length - 1) {
      timerRef.current = setTimeout(() => {
        setDone(true);
        clearInterval(elRef.current!);
      }, FRAME_MS);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
    timerRef.current = setTimeout(() => setIdx(i => i + 1), FRAME_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx]);

  const frame       = idx >= 0 ? FRAMES[idx] : FRAMES[0];
  const totalMs     = FRAMES.length * FRAME_MS;
  const progress    = Math.min((elapsed / totalMs) * 100, 100);
  const mm          = String(Math.floor(elapsed / 60000)).padStart(2, '0');
  const ss          = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
  const eyeGood     = frame.eye >= 80;
  const paceGood    = frame.pace <= 160;
  const running     = idx >= 0 && !done;

  return (
    <section id="demo" className="relative px-5 py-16 sm:px-8 sm:py-24">

      {/* Section heading */}
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-primary-400">
          See It In Action
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          A live coaching session
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
          Watch how Eloquent One detects delivery changes and coaches you in real time.
        </p>
      </div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mx-auto max-w-5xl"
      >
        {/* ── Demo card ── */}
        <div className="overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900 shadow-2xl shadow-black/50">

          {/* Chrome bar */}
          <div className="flex items-center gap-3 border-b border-slate-800/60 bg-slate-900/80 px-4 py-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="mx-auto rounded-md bg-slate-950/50 px-3 py-1 font-mono text-[11px] text-slate-500">
              eloquent-one.app · Coaching Environment
            </div>
          </div>

          {/* Content grid */}
          <div className="grid lg:grid-cols-[1.4fr_1fr]">

            {/* Left — camera stage */}
            <div className="border-b border-slate-800/50 p-4 lg:border-b-0 lg:border-r">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

                {/* Ambient glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(20,184,166,0.12),transparent_65%)]" />

                {/* Silhouette */}
                <div className="absolute inset-0 flex items-end justify-center pb-6">
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      className="h-16 w-16 rounded-full bg-gradient-to-b from-slate-600 to-slate-700"
                      animate={{ boxShadow: eyeGood && running ? '0 0 20px rgba(20,184,166,0.35)' : 'none' }}
                      transition={{ duration: 0.7 }}
                    />
                    <div className="mt-1.5 h-20 w-28 rounded-t-3xl bg-gradient-to-b from-slate-700 to-slate-800" />
                  </div>
                </div>

                {/* Detection ring */}
                {running && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '12%' }}>
                    <motion.div
                      className="h-20 w-20 rounded-full border-2"
                      animate={{ borderColor: eyeGood ? 'rgba(52,211,153,0.55)' : 'rgba(251,191,36,0.5)' }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                )}

                {/* REC badge */}
                {running && (
                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-red-500/30 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">REC</span>
                    <span className="font-mono text-[11px] text-slate-300">{mm}:{ss}</span>
                  </div>
                )}

                {/* Live metric badges */}
                {running && (
                  <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
                    <motion.span
                      animate={{
                        backgroundColor: eyeGood ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                        borderColor:     eyeGood ? 'rgba(52,211,153,0.3)'  : 'rgba(251,191,36,0.3)',
                        color:           eyeGood ? 'rgb(110,231,183)'       : 'rgb(252,211,77)',
                      }}
                      transition={{ duration: 0.6 }}
                      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md"
                    >
                      Eye {frame.eye}%
                    </motion.span>
                    <motion.span
                      animate={{
                        backgroundColor: paceGood ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                        borderColor:     paceGood ? 'rgba(52,211,153,0.3)'  : 'rgba(251,191,36,0.3)',
                        color:           paceGood ? 'rgb(110,231,183)'       : 'rgb(252,211,77)',
                      }}
                      transition={{ duration: 0.6 }}
                      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md"
                    >
                      {frame.pace} wpm
                    </motion.span>
                  </div>
                )}

                {/* Transcript overlay */}
                {running && (
                  <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/10 bg-slate-950/85 p-3 backdrop-blur-xl">
                    <p className="text-[12px] leading-relaxed text-slate-300">
                      {frame.transcript.includes('um') ? (
                        <>
                          {frame.transcript.split('um').map((part, i, arr) => (
                            <React.Fragment key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <mark className="rounded bg-amber-500/20 px-0.5 text-amber-400">um</mark>
                              )}
                            </React.Fragment>
                          ))}
                        </>
                      ) : frame.transcript}
                      <span className="ml-0.5 animate-pulse text-primary-400">|</span>
                    </p>
                  </div>
                )}

                {/* Done overlay */}
                {done && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                    <p className="text-[14px] font-bold text-white">Session complete</p>
                    <p className="mt-1 text-[12px] text-slate-400">Generating your report…</p>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className="h-full rounded-full bg-primary-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            </div>

            {/* Right — live analysis */}
            <div className="flex flex-col gap-4 p-4">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-800/30 p-4">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-primary-400">
                  Live Analysis
                </p>
                <div className="space-y-3">
                  <MetricBar label="Eye Contact"   value={frame.eye}     good={eyeGood} />
                  <MetricBar label="Body Language" value={frame.body}    good={frame.body >= 80} />
                  <MetricBar label="Clarity"       value={frame.clarity} good={frame.clarity >= 75} />
                </div>
              </div>

              <div className="flex-1">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Coaching
                </p>
                <div className="min-h-[88px]">
                  <AnimatePresence mode="wait">
                    {frame.coaching ? (
                      <motion.div
                        key={frame.coaching.text}
                        initial={reduced ? {} : { opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduced ? {} : { opacity: 0, x: -8 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className={`rounded-xl border p-3 ${
                          frame.coaching.type === 'positive'
                            ? 'border-emerald-500/20 bg-emerald-500/10'
                            : 'border-amber-500/20 bg-amber-500/10'
                        }`}
                      >
                        <p className={`text-[13px] font-medium ${
                          frame.coaching.type === 'positive' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {frame.coaching.type === 'positive' ? '✅ ' : '💡 '}{frame.coaching.text}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-slate-600">{mm}:{ss}</p>
                      </motion.div>
                    ) : (
                      <motion.p
                        key="listening"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[12px] italic text-slate-600"
                      >
                        {running ? 'Listening…' : ''}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {running && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {frame.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Post-session summary ── */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mt-5 overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900 p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">
                    Session Snapshot
                  </p>
                  <h3 className="mt-2 font-display text-lg font-bold text-white">
                    Practice Report Ready
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
                    <span className="text-emerald-400">✅ Eye contact recovered strongly</span>
                    <span className="text-amber-400">💡 1 filler word detected</span>
                    <span className="text-emerald-400">✅ Pace settled to 147 wpm</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/30 bg-primary-500/10 font-display text-xl font-black text-primary-400">
                    B+
                  </div>
                  <button
                    onClick={startDemo}
                    className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-[13px] font-semibold text-slate-300 transition-colors hover:bg-slate-800"
                    aria-label="Replay demo"
                  >
                    <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Replay
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA ── */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/v2/practice"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-slate-950 shadow-xl shadow-white/10 transition-transform duration-300 hover:scale-105 sm:w-auto"
          >
            Try it yourself
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-[13px] text-slate-500">
            Free to start · No camera required to explore
          </p>
        </div>
      </motion.div>

      {/* ── What we analyse strip ── */}
      <div className="mx-auto mt-16 max-w-4xl">
        <p className="mb-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-600">
          What Eloquent One analyses
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: '🎙️', label: 'How You Speak',      detail: 'Pace, filler words, vocal variety' },
            { icon: '👁️', label: 'How You Present',    detail: 'Eye contact, posture, expression' },
            { icon: '🤲', label: 'Your Body Language', detail: 'Gestures, presence, composure' },
            { icon: '💬', label: 'What You Say',       detail: 'Clarity, structure, message impact' },
          ].map((p) => (
            <div key={p.label} className="rounded-2xl border border-slate-800/60 bg-slate-900 p-4 text-center">
              <span className="text-2xl" aria-hidden="true">{p.icon}</span>
              <p className="mt-3 text-[13px] font-semibold text-white">{p.label}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}