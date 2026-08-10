import React, { useState } from 'react';
import { AlertTriangleIcon, CheckIcon } from 'lucide-react';
import { AmbientGlow } from '../components/common/AmbientGlow';
import { userName } from '../data/sessions';

export function Settings() {
  const [name, setName] = useState(userName);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState({ weekly: true, coaching: true, product: false });
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <main className="relative min-h-screen w-full px-5 pb-20 pt-24 sm:px-8">
      <AmbientGlow />

      <div className="relative mx-auto max-w-2xl space-y-5">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">Preferences</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Settings</h1>
        </header>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="font-display text-xl font-bold text-white">
            Profile
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2200);
            }}
            className="mt-5">
            
            <label htmlFor="profile-name" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Display name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-0" />
            
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-500">
                
                Save changes
              </button>
              {saved &&
              <span className="inline-flex items-center gap-1.5 text-[13px] text-emerald-400">
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  Saved
                </span>
              }
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6" aria-labelledby="prefs-heading">
          <h2 id="prefs-heading" className="font-display text-xl font-bold text-white">
            Preferences
          </h2>

          <div className="mt-5 flex items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <p className="font-medium text-white">Appearance</p>
              <p className="mt-0.5 text-[13px] text-slate-500">Eloquent One is designed for dark mode.</p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
              {(['dark', 'light'] as const).map((t) =>
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${
                theme === t ?
                'bg-primary-500 text-white shadow-md shadow-primary-500/20' :
                'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`
                }>
                
                  {t}
                </button>
              )}
            </div>
          </div>

          <ul className="mt-5 space-y-4">
            {(
            [
            { key: 'weekly', label: 'Weekly progress summary', detail: 'A digest of your scores every Monday.' },
            { key: 'coaching', label: 'Coaching nudges', detail: 'Reminders to practise your active goal.' },
            { key: 'product', label: 'Product updates', detail: 'New features and engine improvements.' }] as
            const).
            map((n) =>
            <li key={n.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{n.label}</p>
                  <p className="mt-0.5 text-[13px] text-slate-500">{n.detail}</p>
                </div>
                <button
                type="button"
                role="switch"
                aria-checked={notifications[n.key]}
                aria-label={n.label}
                onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                notifications[n.key] ? 'bg-primary-500' : 'bg-slate-700'}`
                }>
                
                  <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  notifications[n.key] ? 'left-[22px]' : 'left-0.5'}`
                  }
                  aria-hidden="true" />
                
                </button>
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-900 p-6" aria-labelledby="data-heading">
          <h2 id="data-heading" className="font-display text-xl font-bold text-white">
            Data
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-400">
            Deleting your sessions removes every recording, transcript, and report permanently.
          </p>

          {deleted ?
          <p className="mt-5 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-[14px] text-slate-300">
              All sessions deleted.
            </p> :
          confirming ?
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="flex items-start gap-2 text-[14px] text-red-400">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                This cannot be undone. Delete all 7 sessions?
              </p>
              <div className="mt-4 flex gap-3">
                <button
                type="button"
                onClick={() => {
                  setDeleted(true);
                  setConfirming(false);
                }}
                className="rounded-xl border border-red-500/30 bg-red-500/20 px-5 py-2.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/30">
                
                  Yes, delete everything
                </button>
                <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800">
                
                  Cancel
                </button>
              </div>
            </div> :

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20">
            
              Delete all sessions
            </button>
          }
        </section>
      </div>
    </main>);

}