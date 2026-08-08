import React from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer } from
'recharts';
import { useReport } from '../../contexts/ReportContext';

export function DnaRadar() {
  const { radarData } = useReport();
  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Communication DNA</p>
      <h2 className="mt-1.5 font-display text-xl font-bold text-white">Your five-dimension signature</h2>

      <div className="mt-4 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="72%">
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="value"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="#14b8a6"
              fillOpacity={0.3}
              dot={{ r: 3, fill: '#2dd4bf' }} />
            
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {radarData.map((d) =>
        <li key={d.dimension} className="rounded-lg border border-slate-800 bg-slate-800/40 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{d.dimension}</p>
            <p className="mt-1 font-mono text-[13px] text-primary-400">{d.value}</p>
          </li>
        )}
      </ul>
    </article>);

}