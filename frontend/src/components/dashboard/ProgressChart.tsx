import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { TrendPoint } from '../../types';

interface ProgressChartProps {
  data: TrendPoint[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Progress Trend</p>
          <h2 className="mt-1.5 font-display text-xl font-bold text-white">Score over sessions</h2>
        </div>
        <ul className="flex flex-wrap gap-4 text-[12px]">
          {[
          { label: 'Overall', color: '#14b8a6' },
          { label: 'Speech', color: '#8b5cf6' },
          { label: 'Connection', color: '#f59e0b' }].
          map((l) =>
          <li key={l.label} className="flex items-center gap-2 text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} aria-hidden="true" />
              {l.label}
            </li>
          )}
        </ul>
      </div>

      {data.length < 2 ?
      <p className="py-16 text-center text-[15px] text-slate-500">
          Complete at least 2 sessions to see your progress trend.
        </p> :

      <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis
              dataKey="session"
              stroke="#475569"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={false} />
            
              <YAxis
              domain={[0, 100]}
              stroke="#475569"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={false} />
            
              <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
                fontSize: 13
              }}
              labelStyle={{ color: '#94a3b8' }}
              labelFormatter={(v) => `Session ${v}`} />
            
              <Line type="monotone" dataKey="overall" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} name="Overall" />
              <Line
              type="monotone"
              dataKey="speech"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              name="Speech" />
            
              <Line
              type="monotone"
              dataKey="connection"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              name="Connection" />
            
            </LineChart>
          </ResponsiveContainer>
        </div>
      }
    </article>);

}