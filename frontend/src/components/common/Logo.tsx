import React from 'react';

interface LogoProps {
  showWordmark?: boolean;
  size?: 'sm' | 'md';
}

export function Logo({ showWordmark = true, size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 'h-8' : 'h-10';

  return (
    <span className="flex items-center gap-3">
      <img 
        src="/logos/LogoVibrant.png" 
        alt="Eloquent One Logo" 
        className={`${iconSize} w-auto object-contain`} 
        aria-hidden="true"
      />
      {showWordmark && (
        <span className="font-display text-xl font-bold tracking-tight text-white flex gap-1.5">
          Eloquent <span className="text-slate-400 font-medium">One</span>
        </span>
      )}
    </span>
  );
}