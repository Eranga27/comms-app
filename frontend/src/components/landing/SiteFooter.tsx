import React from 'react';
import { Logo } from '../common/Logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/50 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo size="sm" />
        <nav aria-label="Footer" className="flex items-center gap-7">
          {['Privacy', 'Terms', 'Contact'].map((l) =>
          <a key={l} href="#top" className="text-sm text-slate-500 transition-colors hover:text-slate-300">
              {l}
            </a>
          )}
        </nav>
        <p className="font-mono text-[12px] text-slate-600">© 2026 Eloquent One</p>
      </div>
    </footer>);

}