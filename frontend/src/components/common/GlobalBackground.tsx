import React from 'react';

/**
 * GlobalBackground
 *
 * Renders the BGDark design as a fixed, full-viewport backdrop.
 * Strategy:
 *   - The image sits at z-index -2, pinned behind all content.
 *   - It fades in on mount (CSS animation) so pages never flash the raw image.
 *   - A dark gradient vignette (z-index -1) sits on top of the image to
 *     protect text readability while letting the image colour bleed through
 *     at the edges where content is sparse.
 *   - mix-blend-mode: screen lets the vivid butterfly/wave colours show
 *     through the dark slate without creating harsh contrast.
 */
export function GlobalBackground() {
  return (
    <>
      {/* ── Background image layer ─────────────────────────────── */}
      <div
        aria-hidden="true"
        className="global-bg-image"
      />

      {/* ── Dark vignette overlay ──────────────────────────────── */}
      <div
        aria-hidden="true"
        className="global-bg-vignette"
      />
    </>
  );
}
