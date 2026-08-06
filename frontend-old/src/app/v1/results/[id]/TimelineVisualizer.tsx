"use client";

import React from 'react';

export default function TimelineVisualizer({ events, duration, onSeek }: { events: any[], duration: number, onSeek?: (time: number) => void }) {
  if (!events || events.length === 0) return <p className="text-slate-500 text-sm">No timeline data available for this session.</p>;

  // Filter out the noisy frame_ticks, keep only meaningful events
  const meaningfulEvents = events.filter(e => 
    (e.event === 'eye_contact' && e.value < 0.5) || 
    (e.event === 'hands_detected' && e.value === true) ||
    (e.event === 'smile' && e.value > 0.5) ||
    (e.event === 'posture' && e.value < 0.5) ||
    (e.event === 'filler_word')
  );

  return (
    <div className="w-full relative py-12 mt-4">
      {/* Base Timeline Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 rounded -translate-y-1/2"></div>
      
      {/* Event Markers */}
      {meaningfulEvents.map((evt, idx) => {
        const leftPercent = Math.min(100, Math.max(0, (evt.time / duration) * 100));
        
        let color = "bg-slate-500";
        let label = "Event";
        let topClass = "top-1/2";
        
        if (evt.event === 'eye_contact') {
            color = "bg-amber-500";
            label = "Eye Contact Drop";
            topClass = "top-[30%]";
        } else if (evt.event === 'hands_detected') {
            color = "bg-emerald-500";
            label = "Open Gesture";
            topClass = "top-[70%]";
        } else if (evt.event === 'smile') {
            color = "bg-pink-500";
            label = "Smiled";
            topClass = "top-[10%]";
        } else if (evt.event === 'posture') {
            color = "bg-purple-500";
            label = "Posture Slump";
            topClass = "top-[90%]";
        } else if (evt.event === 'filler_word') {
            color = "bg-blue-500";
            label = `Filler: "${evt.value}"`;
            topClass = "top-[50%]";
        }

        return (
          <div 
            key={idx} 
            onClick={() => onSeek && onSeek(evt.time)}
            className={`absolute ${topClass} w-4 h-4 rounded-full ${color} -translate-y-1/2 -translate-x-1/2 cursor-pointer group hover:scale-150 transition-transform shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 hover:z-30`}
            style={{ left: `${leftPercent}%` }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-slate-900 border border-slate-700 text-slate-300 text-xs px-2 py-1 rounded shadow-lg">
              <span className="font-bold text-white block">{label}</span>
              {Math.floor(evt.time / 60)}:{(Math.floor(evt.time % 60)).toString().padStart(2, '0')}
            </div>
          </div>
        );
      })}
      
      {/* Start/End Labels */}
      <div className="absolute top-full mt-4 left-0 text-xs text-slate-500 font-mono">00:00</div>
      <div className="absolute top-full mt-4 right-0 text-xs text-slate-500 font-mono">
        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </div>
      
      {/* Legend */}
      <div className="absolute -top-8 right-0 flex flex-wrap gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Smiles</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Eye Drops</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Filler Words</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Gestures</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Posture Drops</div>
      </div>
    </div>
  );
}
