import React from 'react';

interface LogoProps {
  showWordmark?: boolean;
  size?: 'sm' | 'md';
}

export function Logo({ showWordmark = true, size = 'md' }: LogoProps) {
  const box = size === 'sm' ? 'h-8 w-8 text-base' : 'h-9 w-9 text-lg';

  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex ${box} items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-emerald-500 font-display font-black text-white shadow-lg shadow-primary-500/20`}
        aria-hidden="true">
        
        S
      </span>
      {showWordmark &&
      <span className="font-display text-lg font-bold tracking-tight text-white">SpeakIQ</span>
      }
    </span>);

}