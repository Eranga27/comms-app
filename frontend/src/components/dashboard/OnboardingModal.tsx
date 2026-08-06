import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

interface OnboardingModalProps {
  onComplete: (name: string) => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-5 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        
        <Logo size="sm" />
        <h2 id="onboarding-title" className="mt-6 font-display text-3xl font-bold tracking-tight text-white">
          Welcome to Eloquent One V2
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
          Every session you record builds a picture of how you communicate — what already works, and the
          one thing worth changing next. Let&apos;s start with your name.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onComplete(name.trim() || 'there');
          }}
          className="mt-7">
          
          <label htmlFor="onboarding-name" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Your name
          </label>
          <input
            id="onboarding-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aarav"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-0" />
          
          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-primary-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500">
            
            Begin My Journey
          </button>
        </form>
      </motion.div>
    </div>);

}