import React from 'react';

interface AmbientGlowProps {
  variant?: 'hero' | 'section';
}

export function AmbientGlow({ variant = 'section' }: AmbientGlowProps) {
  if (variant === 'hero') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-primary-500/10 blur-[140px] animate-breathe" />
        <div className="absolute -right-32 -top-20 h-[460px] w-[460px] rounded-full bg-emerald-500/10 blur-[150px] animate-breathe" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-[-200px] left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-[150px] animate-breathe" style={{ animationDelay: '2.4s' }} />
      </div>);

  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-primary-500/[0.07] blur-[130px]" />
    </div>);

}