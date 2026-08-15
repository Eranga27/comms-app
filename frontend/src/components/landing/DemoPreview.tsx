import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon } from 'lucide-react';

export function DemoPreview() {
  return (
    <section id="demo" className="relative px-5 py-16 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="group relative mx-auto max-w-6xl">
        
        <div className="absolute inset-x-16 -top-10 h-32 rounded-full bg-primary-500/10 blur-[120px]" aria-hidden="true" />

        <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900 shadow-2xl shadow-black/50">
          {/* macOS chrome */}
          <div className="flex items-center gap-3 border-b border-slate-800/60 bg-slate-900/80 px-4 py-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="mx-auto flex items-center gap-2 rounded-md bg-slate-950/60 px-3 py-1 font-mono text-[11px] text-slate-500">
              eloquent-one.app/v2/practice
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-[1.6fr_1fr] lg:p-5">
            {/* Camera mock */}
            <div className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(20,184,166,0.14),transparent_60%)]" />
                <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-500/20 bg-slate-800/60" />
                <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-400/30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-red-500/30 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">REC</span>
                  <span className="font-mono text-[12px] text-slate-300">02:45</span>
                </div>

                <div className="absolute right-3 top-3 space-y-1.5 text-right">
                  <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                    Eye Contact 84%
                  </span>
                  <br />
                  <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
                    Pace 168 WPM
                  </span>
                </div>

                <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/10 bg-slate-950/80 p-3 backdrop-blur-xl">
                  <p className="text-[13px] leading-relaxed text-slate-300">
                    “I owned discovery end to end, and{' '}
                    <mark className="rounded bg-amber-500/20 px-1 text-amber-400">um</mark> mapped where the
                    workflow broke.”
                  </p>
                </div>
              </div>

              <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
                <div className="h-full w-[42%] bg-emerald-500/70" />
                <div className="h-full w-[8%] bg-amber-500/80" />
                <div className="h-full w-[35%] bg-emerald-500/70" />
                <div className="h-full flex-1 bg-slate-700" />
              </div>
            </div>

            {/* Live insights */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-primary-400">Live Insights</p>

              <div className="space-y-2.5">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <p className="text-[13px] font-medium text-emerald-400">✅ Strong eye contact — hold it.</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-500">02:31</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <p className="text-[13px] font-medium text-amber-400">💡 Filler detected. Try a pause.</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-500">02:38</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                  <p className="text-[13px] font-medium text-slate-300">🧍 Posture steady and grounded.</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-500">02:44</p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Confidence</span>
                  <span className="font-mono text-[13px] text-primary-400">76%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    className="h-full rounded-full bg-primary-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: '76%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 backdrop-blur-xl">
            <PlayIcon className="h-7 w-7 fill-white text-white" aria-hidden="true" />
          </span>
        </div>
      </motion.div>

      {/* What we analyse */}
      <div className="mx-auto mt-10 max-w-4xl">
        <p className="mb-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-600">
          What Eloquent One analyses
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: '🎙️', label: 'How You Speak', detail: 'Pace, filler words, vocal variety' },
            { icon: '👁️', label: 'How You Present', detail: 'Eye contact, posture, expression' },
            { icon: '🤲', label: 'Your Body Language', detail: 'Gestures, presence, composure' },
            { icon: '💬', label: 'What You Say', detail: 'Clarity, structure, message impact' },
          ].map((pillar) => (
            <div
              key={pillar.label}
              className="rounded-2xl border border-slate-800/60 bg-slate-900 p-4 text-center"
            >
              <span className="text-2xl" aria-hidden="true">{pillar.icon}</span>
              <p className="mt-3 text-[13px] font-semibold text-white">{pillar.label}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{pillar.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>);

}