import React from 'react';

const meshPoints = Array.from({ length: 42 }, (_, i) => {
  const angle = i / 42 * Math.PI * 2;
  const rx = 62 + i % 3 * 9;
  const ry = 78 + i % 4 * 7;
  return { x: 200 + Math.cos(angle) * rx, y: 132 + Math.sin(angle) * ry };
});

export function TrackingOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true">
      
      {/* Face mesh */}
      <g stroke="#2dd4bf" strokeOpacity="0.35" strokeWidth="0.5">
        {meshPoints.map((p, i) => {
          const next = meshPoints[(i + 5) % meshPoints.length];
          return <line key={`m${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} />;
        })}
      </g>
      {meshPoints.map((p, i) =>
      <circle key={`p${i}`} cx={p.x} cy={p.y} r="1.1" fill="#2dd4bf" fillOpacity="0.7" />
      )}

      {/* Pose skeleton */}
      <g stroke="#8b5cf6" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round">
        <line x1="200" y1="215" x2="200" y2="285" />
        <line x1="140" y1="240" x2="260" y2="240" />
        <line x1="140" y1="240" x2="118" y2="292" />
        <line x1="260" y1="240" x2="282" y2="292" />
      </g>
      {[
      [200, 215],
      [140, 240],
      [260, 240],
      [118, 292],
      [282, 292]].
      map(([x, y]) =>
      <circle key={`j${x}-${y}`} cx={x} cy={y} r="3" fill="#8b5cf6" fillOpacity="0.8" />
      )}

      {/* Hand connectors */}
      <g stroke="#f59e0b" strokeOpacity="0.55" strokeWidth="1">
        <line x1="108" y1="286" x2="96" y2="266" />
        <line x1="108" y1="286" x2="104" y2="262" />
        <line x1="108" y1="286" x2="114" y2="262" />
        <line x1="292" y1="286" x2="304" y2="266" />
        <line x1="292" y1="286" x2="296" y2="262" />
      </g>
    </svg>);

}