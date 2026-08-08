import React, { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { useReport } from '../../contexts/ReportContext';

function highlight(text: string, fillers: string[], query: string) {
  const terms = [...fillers];
  if (query.trim()) terms.push(query.trim());
  if (terms.length === 0) return text;

  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));

  return parts.map((part, i) => {
    const isFiller = fillers.some((f) => f.toLowerCase() === part.toLowerCase());
    const isQuery = query.trim() && part.toLowerCase() === query.trim().toLowerCase();
    if (isFiller) {
      return (
        <mark key={i} className="rounded bg-amber-500/20 px-1 text-amber-400">
          {part}
        </mark>);

    }
    if (isQuery) {
      return (
        <mark key={i} className="rounded bg-primary-500/25 px-1 text-primary-300">
          {part}
        </mark>);

    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function TranscriptView() {
  const { transcript } = useReport();
  const [query, setQuery] = useState('');

  const lines = useMemo(
    () =>
    query.trim() ?
    transcript.filter((l) => l.text.toLowerCase().includes(query.trim().toLowerCase())) :
    transcript,
    [query]
  );

  return (
    <article className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Session Transcript</p>
          <h2 className="mt-1.5 font-display text-xl font-bold text-white">Everything you said</h2>
        </div>
        <div className="relative w-full sm:w-64">
          <SearchIcon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
            aria-hidden="true" />
          
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transcript"
            aria-label="Search transcript"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-[14px] text-white placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-0" />
          
        </div>
      </div>

      <div className="scroll-thin mt-6 max-h-96 space-y-4 overflow-y-auto pr-2">
        {lines.map((line) =>
        <div key={line.time} className="flex gap-4">
            <span className="w-12 shrink-0 pt-0.5 font-mono text-[12px] text-slate-600">{line.time}</span>
            <p className="text-[15px] leading-relaxed text-slate-300">
              {highlight(line.text, line.fillers, query)}
            </p>
          </div>
        )}
        {lines.length === 0 &&
        <p className="py-8 text-center text-[15px] text-slate-500">No lines match “{query}”.</p>
        }
      </div>
    </article>);

}