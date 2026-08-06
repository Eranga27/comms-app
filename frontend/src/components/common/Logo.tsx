import React from 'react';

interface LogoProps {
  showWordmark?: boolean;
  size?: 'sm' | 'md';
}

export function Logo({ showWordmark = true, size = 'md' }: LogoProps) {
  const box = size === 'sm' ? 'h-8 w-8 text-base' : 'h-9 w-9 text-lg';

  return (
    <span className="flex items-center gap-3">
      <span className={`flex ${size === 'sm' ? 'h-6' : 'h-8'} items-center`} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6h12M2 12h8M2 18h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white" />
          <path d="M20 5v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary-400" />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-xl font-bold tracking-tight text-white flex gap-1.5">
          Eloquent <span className="text-slate-400 font-medium">One</span>
        </span>
      )}
    </span>);

}