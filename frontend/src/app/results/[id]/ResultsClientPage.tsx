"use client";

import Link from "next/link";
import { useRef } from "react";
import TimelineVisualizer from "./TimelineVisualizer";
import RadarChartClient from "./RadarChartClient";

export default function ResultsClientPage({ session, feedback, id }: { session: any, feedback: any, id: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play().catch(e => console.error("Playback error", e));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center animate-fade-in">
      <div className="max-w-4xl w-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-emerald-400">
              Session Results
            </h1>
            <p className="text-slate-400 mt-1">Review your performance and coaching feedback.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="px-6 py-2 glass-panel text-primary-400 border border-primary-500/30 rounded-full font-medium hover:bg-primary-500/10 transition-colors print:hidden"
            >
              Export PDF
            </button>
            <Link 
              href="/dashboard"
              className="px-6 py-2 glass-panel text-white rounded-full font-medium hover:bg-slate-800 transition-colors print:hidden"
            >
              Back to Dashboard
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center md:col-span-1 border-primary-500/30 shadow-[0_0_30px_-10px_rgba(20,184,166,0.3)]">
            <h3 className="text-slate-400 font-medium mb-2 uppercase tracking-widest text-sm">Overall Score</h3>
            {session.communication_grade && (
              <div className="px-4 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-bold mb-4 border border-primary-500/30 text-center">
                {session.communication_grade.toUpperCase()}
              </div>
            )}
            <div className="relative mt-2">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="60" className="stroke-slate-800" strokeWidth="8" fill="none" />
                <circle 
                  cx="64" cy="64" r="60" 
                  className="stroke-primary-500" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="377" 
                  strokeDashoffset={377 - (377 * (session.overall_score || feedback.overall_score)) / 100} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{Math.round(session.overall_score || feedback.overall_score)}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl md:col-span-2 flex flex-col justify-center gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-300 font-semibold text-lg">Speech Delivery</h4>
                <p className="text-slate-500 text-sm">Pacing and filler word control</p>
              </div>
              <div className="text-2xl font-bold text-white">{session.speech_score || 0}<span className="text-sm text-slate-500">/25</span></div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${((session.speech_score || 0) / 25) * 100}%` }}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <h4 className="text-slate-300 font-semibold text-lg">Content Quality</h4>
                <p className="text-slate-500 text-sm">Structure and persuasion</p>
              </div>
              <div className="text-2xl font-bold text-white">{session.content_score || 0}<span className="text-sm text-slate-500">/30</span></div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${((session.content_score || 0) / 30) * 100}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div>
                <h4 className="text-slate-300 font-semibold text-lg">Duration</h4>
                <p className="text-slate-500 text-sm">Total practice time</p>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.floor(session.duration_seconds / 60)}:{(session.duration_seconds % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {session.timeline_events && session.timeline_events.length > 0 && (
          <div className="glass-panel p-8 rounded-2xl mb-8 flex flex-col gap-6 print:hidden">
            <h3 className="text-slate-300 font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Behavioral Review
            </h3>
            
            {/* Embedded Video Player */}
            <div className="w-full bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                <video 
                    ref={videoRef}
                    controls 
                    className="w-full h-[400px] object-cover"
                    src={`/sessions_media/${id}.webm`}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            <TimelineVisualizer events={session.timeline_events} duration={session.duration_seconds} onSeek={handleSeek} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl md:col-span-2 border-primary-500/20">
            <h3 className="text-primary-400 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Communication DNA Profile
            </h3>
            <p className="text-slate-400 text-sm mb-6">Your unique behavioral blueprint across the 5 CAF intelligence pillars.</p>
            <RadarChartClient data={[
              { subject: 'Speech Delivery', A: Math.round(((session.speech_score || 0) / 25) * 100) },
              { subject: 'Facial Communication', A: Math.round(((session.facial_score || 0) / 20) * 100) },
              { subject: 'Gesture Effectiveness', A: Math.round(((session.gesture_score || 0) / 15) * 100) },
              { subject: 'Posture & Presence', A: Math.round(((session.posture_score || 0) / 10) * 100) },
              { subject: 'Content Quality', A: Math.round(((session.content_score || 0) / 30) * 100) }
            ]} />
          </div>
          
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center">
             <h4 className="text-slate-300 font-medium mb-4">DNA Analysis</h4>
             <p className="text-slate-400 text-sm leading-relaxed mb-4">
               This radar chart normalizes your raw category scores into percentages to show your overall communication balance.
             </p>
             <ul className="space-y-4">
               <li className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                 <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Strongest Pillar</span>
                 <span className="text-emerald-400 font-semibold">
                   {
                     (() => {
                       const scores = [
                         { name: "Speech", val: (session.speech_score || 0)/25 },
                         { name: "Facial", val: (session.facial_score || 0)/20 },
                         { name: "Gestures", val: (session.gesture_score || 0)/15 },
                         { name: "Content", val: (session.content_score || 0)/30 }
                       ];
                       scores.sort((a,b) => b.val - a.val);
                       return scores[0].val > 0 ? scores[0].name : "N/A";
                     })()
                   }
                 </span>
               </li>
               <li className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                 <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Growth Opportunity</span>
                 <span className="text-amber-400 font-semibold">
                   {
                     (() => {
                       const scores = [
                         { name: "Speech", val: (session.speech_score || 0)/25 },
                         { name: "Facial", val: (session.facial_score || 0)/20 },
                         { name: "Gestures", val: (session.gesture_score || 0)/15 },
                         { name: "Content", val: (session.content_score || 0)/30 }
                       ];
                       scores.sort((a,b) => a.val - b.val);
                       return scores[0].name;
                     })()
                   }
                 </span>
               </li>
             </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Strengths
            </h3>
            <ul className="space-y-3">
              {feedback.strengths?.map((item: string, idx: number) => (
                <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Areas to Improve
            </h3>
            <ul className="space-y-3">
              {feedback.weaknesses?.map((item: string, idx: number) => {
                let badge = null;
                let text = item;
                if (item.startsWith("Major:")) {
                  badge = <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Major</span>;
                  text = item.replace("Major:", "").trim();
                } else if (item.startsWith("Minor:")) {
                  badge = <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Minor</span>;
                  text = item.replace("Minor:", "").trim();
                }
                
                return (
                  <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-amber-500 mt-1 flex-shrink-0">•</span>
                    <div className="flex items-start gap-2">
                        {badge}
                        <span>{text}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Filler Word Analysis Card */}
          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-pink-400 font-semibold mb-4 flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
               Filler Word Analysis
             </h3>
             <div className="text-4xl font-bold text-white mb-2">{session.filler_words_count || 0}</div>
             <p className="text-slate-400 text-sm mb-4">Total filler words detected in your speech.</p>
             
             {(() => {
                 const text = (session.transcript || "").toLowerCase();
                 const fillers = ["um", "uh", "ah", "ugh", "like", "you know", "sort of", "kinda", "basically"];
                 const counts: Record<string, number> = {};
                 fillers.forEach(f => {
                     const regex = new RegExp(`\\b${f}\\b`, 'g');
                     const matches = text.match(regex);
                     if (matches) counts[f] = matches.length;
                 });
                 const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                 if (sorted.length === 0) return <p className="text-emerald-400 text-sm font-medium mt-6">No common fillers detected. Perfect fluency!</p>;
                 return (
                     <div className="space-y-2 mt-6">
                        <h4 className="text-slate-500 text-xs uppercase tracking-wider mb-3">Most Used</h4>
                        {sorted.slice(0, 3).map(([word, count], i) => (
                           <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                               <span className="text-slate-300 font-mono">"{word}"</span>
                               <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">{count}</span>
                           </div>
                        ))}
                     </div>
                 );
             })()}
          </div>
        </div>


        <div className="glass-panel p-8 rounded-2xl mb-8">
          <h3 className="text-primary-400 font-semibold mb-4 text-xl">Coach Summary & Action Plan</h3>
          <p className="text-slate-300 leading-relaxed mb-6">
            {feedback.feedback_summary}
          </p>
          
          <h4 className="text-slate-400 font-medium uppercase tracking-wider text-xs mb-3">Actionable Tips</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.tips?.map((tip: string, idx: number) => (
              <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                <p className="text-slate-300 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {session.transcript && (
          <div className="glass-panel p-8 rounded-2xl">
            <h3 className="text-slate-400 font-semibold mb-4">Transcript</h3>
            <div className="p-4 bg-slate-900 rounded-lg max-h-60 overflow-y-auto">
              <p className="text-slate-400 text-sm leading-relaxed font-mono">
                {(() => {
                  const text = session.transcript;
                  if (!text) return null;
                  const fillers = ["um", "uh", "ah", "ugh", "like", "you know", "sort of", "kinda", "basically"];
                  const regex = new RegExp(`\\b(${fillers.join('|')})\\b`, 'gi');
                  const parts = text.split(regex);
                  return parts.map((part: string, i: number) => {
                    if (fillers.includes(part.toLowerCase())) {
                      return <span key={i} className="bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1">{part}</span>;
                    }
                    return part;
                  });
                })()}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
