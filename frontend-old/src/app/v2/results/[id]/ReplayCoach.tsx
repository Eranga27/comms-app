"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type RawEvent = { time: number; event: string; value: any };

type CoachEvent = {
  time: number;
  kind: "eye_contact_drop" | "eye_contact_good" | "filler_word" | "gesture_good" | "posture_drop" | "pace_flag" | "smile";
  label: string;
  icon: string;
  tier: "green" | "amber" | "red";
  what: string;
  why: string;
  how: string;
};

// ─── Event builder ───────────────────────────────────────────────────────────────
function buildCoachEvents(rawEvents: RawEvent[], transcript: string, duration: number): CoachEvent[] {
  const events: CoachEvent[] = [];
  const SAMPLE = 3; // seconds between eye / posture checks

  const frameTicks = rawEvents.filter(e => e.event === "frame_tick").map(e => e.time);
  const lastSeen: Record<string, number> = {};

  rawEvents.forEach(e => {
    const t = e.time;

    if (e.event === "eye_contact") {
      if (e.value < 0.5) {
        if (!lastSeen.eye_drop || t - lastSeen.eye_drop > SAMPLE) {
          lastSeen.eye_drop = t;
          events.push({ time: t, kind: "eye_contact_drop", label: "Gaze Drift", icon: "👁️", tier: "amber",
            what: "Your gaze moved away from the camera.",
            why: "Sustained eye contact signals confidence and builds trust with viewers.",
            how: "Imagine the camera lens as your listener's eyes. Return to it after every key point." });
        }
      } else if (e.value > 0.85) {
        if (!lastSeen.eye_good || t - lastSeen.eye_good > 8) {
          lastSeen.eye_good = t;
          events.push({ time: t, kind: "eye_contact_good", label: "Strong Eye Contact", icon: "🎯", tier: "green",
            what: "You held direct, sustained eye contact with the camera.",
            why: "Eye contact directly correlates with perceived confidence and credibility.",
            how: "Keep this up — aim for 70-80% of your speaking time at this level." });
        }
      }
    }

    if (e.event === "filler_word") {
      events.push({ time: t, kind: "filler_word", label: `Filler: "${e.value}"`, icon: "🔴", tier: "red",
        what: `You used the filler word "${e.value}".`,
        why: "Filler words interrupt the listener's flow and signal uncertainty to the audience.",
        how: `Replace "${e.value}" with a deliberate 1-second pause. Silence projects more authority.` });
    }

    if (e.event === "hands_detected" && e.value === true) {
      if (!lastSeen.gesture || t - lastSeen.gesture > 6) {
        lastSeen.gesture = t;
        events.push({ time: t, kind: "gesture_good", label: "Open Gesture", icon: "🤚", tier: "green",
          what: "Your hands were visible and actively engaged.",
          why: "Open-palm gestures improve perceived warmth, openness, and trustworthiness.",
          how: "Continue using open gestures especially when making key claims." });
      }
    }

    if (e.event === "posture" && e.value < 0.3) {
      if (!lastSeen.posture || t - lastSeen.posture > SAMPLE) {
        lastSeen.posture = t;
        events.push({ time: t, kind: "posture_drop", label: "Posture Shift", icon: "🪑", tier: "amber",
          what: "Your shoulder alignment indicated a posture shift.",
          why: "Upright posture subconsciously signals authority and self-assurance.",
          how: "Imagine a thread pulling from the crown of your head — sit tall, shoulders back." });
      }
    }

    if (e.event === "smile" && e.value > 0.5) {
      if (!lastSeen.smile || t - lastSeen.smile > 10) {
        lastSeen.smile = t;
        events.push({ time: t, kind: "smile", label: "Positive Affect", icon: "😊", tier: "green",
          what: "The system detected a genuine smile.",
          why: "Smiling increases approachability, rapport, and perceived warmth.",
          how: "Strategic smiling at the start and end of key points reinforces your message positively." });
      }
    }
  });

  // Pace flag — compare words per 10-second window
  if (transcript) {
    const words = transcript.split(/\s+/).filter(Boolean);
    const wpm = duration > 0 ? (words.length / duration) * 60 : 0;
    if (wpm > 165 && duration > 10) {
      events.push({ time: Math.min(10, duration * 0.1), kind: "pace_flag", label: "Speech Pace Elevated", icon: "⚡", tier: "amber",
        what: `Your average pace was ~${Math.round(wpm)} WPM — slightly fast.`,
        why: "Rapid speech compresses processing time for your listener and can obscure key points.",
        how: "Try inserting a 2-second pause after each main idea. It feels longer to you than to your audience." });
    }
  }

  return events.sort((a, b) => a.time - b.time);
}

// ─── Transcript sentences with timestamps ────────────────────────────────────────
function buildTranscriptSegments(transcript: string, duration: number) {
  if (!transcript) return [];
  const sentences = transcript.match(/[^.!?]+[.!?]*/g) || [transcript];
  const timePerSentence = duration / Math.max(sentences.length, 1);
  return sentences.map((text, i) => ({
    text: text.trim(),
    start: i * timePerSentence,
    end: (i + 1) * timePerSentence,
  }));
}

// ─── Coaching panel ──────────────────────────────────────────────────────────────
function CoachPanel({ event, onClose }: { event: CoachEvent; onClose: () => void }) {
  const tierColors = {
    green: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", accent: "text-emerald-400", badge: "bg-emerald-500/15" },
    amber: { border: "border-amber-500/30", bg: "bg-amber-500/5", accent: "text-amber-400", badge: "bg-amber-500/15" },
    red:   { border: "border-red-500/30",   bg: "bg-red-500/5",   accent: "text-red-400",   badge: "bg-red-500/15"   },
  };
  const c = tierColors[event.tier];

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 animate-fade-in`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{event.icon}</span>
          <span className={`font-bold text-base ${c.accent}`}>{event.label}</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none">✕</button>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <span className={`text-[10px] uppercase font-bold tracking-widest ${c.accent} opacity-70`}>What happened</span>
          <p className="text-slate-300 mt-1 leading-relaxed">{event.what}</p>
        </div>
        <div className="border-t border-slate-800 pt-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Why it matters</span>
          <p className="text-slate-400 mt-1 leading-relaxed">{event.why}</p>
        </div>
        <div className="border-t border-slate-800 pt-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary-500">How to improve</span>
          <p className="text-primary-300 mt-1 leading-relaxed font-medium">{event.how}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Format time ─────────────────────────────────────────────────────────────────
function fmtTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function ReplayCoach({
  sessionId,
  rawEvents,
  transcript,
  duration,
}: {
  sessionId: string;
  rawEvents: RawEvent[];
  transcript: string;
  duration: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CoachEvent | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);

  const coachEvents = useMemo(() => buildCoachEvents(rawEvents, transcript, duration), [rawEvents, transcript, duration]);
  const segments = useMemo(() => buildTranscriptSegments(transcript, duration), [transcript, duration]);

  // ── Video time sync ────────────────────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    // Find nearest past event
    let nearestIdx: number | null = null;
    for (let i = coachEvents.length - 1; i >= 0; i--) {
      if (coachEvents[i].time <= t + 0.5) { nearestIdx = i; break; }
    }
    setActiveEventIndex(nearestIdx);
  }, [coachEvents]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener("timeupdate", handleTimeUpdate);
    v.addEventListener("play",  () => setIsPlaying(true));
    v.addEventListener("pause", () => setIsPlaying(false));
    return () => {
      v.removeEventListener("timeupdate", handleTimeUpdate);
      v.removeEventListener("play",  () => setIsPlaying(true));
      v.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, [handleTimeUpdate]);

  const seekTo = useCallback((t: number, evt?: CoachEvent) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      videoRef.current.play().catch(() => {});
    }
    if (evt) setSelectedEvent(evt);
  }, []);

  // ── Active transcript segment ─────────────────────────────────────────────
  const activeSegment = useMemo(() =>
    segments.findIndex(s => currentTime >= s.start && currentTime < s.end),
    [currentTime, segments]);

  // ── Filler highlighting in transcript ────────────────────────────────────
  const FILLERS = ["um", "uh", "ah", "ugh", "like", "you know", "sort of", "kinda", "basically"];
  const fillerRegex = new RegExp(`\\b(${FILLERS.join("|")})\\b`, "gi");

  const highlightFiller = (text: string) => {
    const parts = text.split(fillerRegex);
    return parts.map((p, i) =>
      FILLERS.includes(p.toLowerCase())
        ? <mark key={i} className="bg-red-500/20 text-red-400 border-b border-red-500/50 px-0.5 not-italic">{p}</mark>
        : <span key={i}>{p}</span>
    );
  };

  // ── Tier colours for timeline dots ────────────────────────────────────────
  const dotClass = { green: "bg-emerald-500 shadow-emerald-500/50", amber: "bg-amber-500 shadow-amber-500/50", red: "bg-red-500 shadow-red-500/50" };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* ── Section heading ───────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-slate-200 font-bold text-lg">Intelligent Replay Coach</h3>
        <span className="ml-auto text-xs text-slate-500 font-mono">{coachEvents.length} coaching events</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 divide-y xl:divide-y-0 xl:divide-x divide-slate-800">

        {/* ── LEFT: Video + progress timeline ─────────────────────────────── */}
        <div className="xl:col-span-3 p-5 flex flex-col gap-4">

          {/* Video */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video w-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={`/sessions_media/${sessionId}.webm`}
              controls={false}
              preload="metadata"
            />
            {/* Custom controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => videoRef.current?.[isPlaying ? "pause" : "play"]()}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                {isPlaying
                  ? <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                }
              </button>

              {/* Scrubber */}
              <div className="flex-1 relative h-1.5 bg-slate-700 rounded-full cursor-pointer group"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  seekTo(pct * duration);
                }}>
                <div className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all"
                  style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }} />
                {/* Event dots on scrubber */}
                {coachEvents.map((ev, i) => (
                  <button key={i}
                    className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-[0_0_6px_2px] -translate-x-1/2 z-10 transition-transform hover:scale-150 ${dotClass[ev.tier]}`}
                    style={{ left: `${(ev.time / Math.max(duration, 1)) * 100}%` }}
                    onClick={e => { e.stopPropagation(); seekTo(ev.time, ev); }}
                    title={ev.label}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-slate-400 flex-shrink-0">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
            </div>
          </div>

          {/* Coaching Overlay (active event panel) */}
          {selectedEvent && (
            <CoachPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          )}

          {/* Interactive Transcript */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h4 className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
              Synchronised Transcript — click any sentence to seek
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {segments.length > 0 ? segments.map((seg, i) => (
                <button
                  key={i}
                  onClick={() => seekTo(seg.start)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm leading-relaxed transition-all duration-200 ${
                    i === activeSegment
                      ? "bg-primary-500/15 border border-primary-500/30 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-500 mr-2">{fmtTime(seg.start)}</span>
                  {highlightFiller(seg.text)}
                </button>
              )) : (
                <p className="text-slate-600 italic text-sm">No transcript available for this session.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Event sidebar ─────────────────────────────────────────── */}
        <div className="xl:col-span-2 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-slate-300 font-semibold text-sm">Behaviour Events</h4>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Positive</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Caution</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Improve</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {coachEvents.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No behavioural events detected in this session.</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {coachEvents.map((ev, i) => {
                  const isActive = activeEventIndex === i;
                  const isSelected = selectedEvent === ev;
                  return (
                    <button
                      key={i}
                      onClick={() => seekTo(ev.time, ev)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all hover:bg-slate-800/50 ${isActive ? "bg-slate-800/70" : ""} ${isSelected ? "bg-primary-500/5" : ""}`}
                    >
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_6px_2px] ${dotClass[ev.tier]}`} />
                        {i < coachEvents.length - 1 && <div className="w-px flex-1 bg-slate-800 mt-1 min-h-[20px]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-mono text-slate-500">{fmtTime(ev.time)}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            ev.tier === "green" ? "text-emerald-400" : ev.tier === "amber" ? "text-amber-400" : "text-red-400"
                          }`}>{ev.tier === "green" ? "Positive" : ev.tier === "amber" ? "Caution" : "Improve"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base leading-none">{ev.icon}</span>
                          <span className="text-slate-200 text-sm font-medium truncate">{ev.label}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2">{ev.what}</p>
                      </div>

                      <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
