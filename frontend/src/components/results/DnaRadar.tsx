import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { useReport } from '../../contexts/ReportContext';

export function DnaRadar() {
  const { radarData } = useReport();
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Communication DNA
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-white">
            Five-dimension signature
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
          aria-expanded={expanded}
        >
          <span>{expanded ? 'Hide Radar' : 'View Radar'}</span>
          <ChevronDownIcon
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/60">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fill="#14b8a6"
                  fillOpacity={0.3}
                  dot={{ r: 3, fill: '#2dd4bf' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {radarData.map((d) => (
              <li key={d.dimension} className="rounded-lg border border-slate-800 bg-slate-800/40 p-2 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{d.dimension}</p>
                <p className="mt-0.5 font-mono text-xs font-semibold text-primary-400">{d.value}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}