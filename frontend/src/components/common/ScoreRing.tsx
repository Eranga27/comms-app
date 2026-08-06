import React, { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showDenominator?: boolean;
  color?: string;
}

const CIRCUMFERENCE = 402;

export function ScoreRing({
  score,
  size = 168,
  strokeWidth = 6,
  label,
  showDenominator = true,
  color = '#14b8a6'
}: ScoreRingProps) {
  const [offset, setOffset] = useState(CIRCUMFERENCE);
  const radius = CIRCUMFERENCE / (2 * Math.PI);
  const viewBox = radius * 2 + strokeWidth * 2;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOffset(CIRCUMFERENCE - CIRCUMFERENCE * score / 100);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        className="-rotate-90"
        role="img"
        aria-label={`Score ${score} out of 100`}>
        
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth} />
        
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-black tracking-tight text-white">{score}</span>
        {showDenominator && <span className="font-mono text-[11px] text-slate-500">/100</span>}
        {label &&
        <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        }
      </div>
    </div>);

}