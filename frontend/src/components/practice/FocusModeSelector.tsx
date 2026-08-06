import React from 'react';
import { FocusMode } from '../../types';

const modes: {id: FocusMode;label: string;emoji: string;}[] = [
{ id: 'beginner', label: 'Beginner', emoji: '🟢' },
{ id: 'professional', label: 'Professional', emoji: '🔵' },
{ id: 'analyst', label: 'Analyst', emoji: '🟣' }];


interface FocusModeSelectorProps {
  value: FocusMode;
  onChange: (mode: FocusMode) => void;
}

export function FocusModeSelector({ value, onChange }: FocusModeSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Focus mode"
      className="inline-flex rounded-xl border border-slate-800 bg-slate-900/60 p-1 backdrop-blur-md">
      
      {modes.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m.id)}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-5 ${
            active ?
            'bg-primary-500 text-white shadow-md shadow-primary-500/20' :
            'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`
            }>
            
            <span className="mr-1.5" aria-hidden="true">
              {m.emoji}
            </span>
            <span className="hidden sm:inline">{m.label} Mode</span>
            <span className="sm:hidden">{m.label}</span>
          </button>);

      })}
    </div>);

}