import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { PlayIcon, SparklesIcon } from 'lucide-react';
import { AmbientGlow } from '../common/AmbientGlow';
import { useAuth } from '../../contexts/AuthContext';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export function Hero() {
  const { user, setShowAuthModal } = useAuth();

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pb-20 pt-28 sm:px-8">
      <AmbientGlow variant="hero" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-4xl text-center">
        
        <motion.div variants={item} className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-slate-300 backdrop-blur-xl">
            <SparklesIcon className="h-3.5 w-3.5 text-primary-400" aria-hidden="true" />
            Your personal AI communication coach
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display text-[52px] font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-[88px]">
          Speak with
          <br />
          <span className="gradient-text">Confidence.</span>
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-7 max-w-2xl text-[17px] leading-relaxed text-slate-400">
          Practice speaking on camera and instantly see how you come across — your delivery, eye contact,
          body language, and clarity of message — with personalised coaching you can act on today.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {user ? (
            <Link
              to="/v2/practice"
              className="w-full rounded-full bg-white px-8 py-4 text-center text-[15px] font-bold text-slate-950 shadow-xl shadow-white/10 transition-transform duration-300 hover:scale-105 sm:w-auto">
              Start Practising Free
            </Link>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full rounded-full bg-white px-8 py-4 text-center text-[15px] font-bold text-slate-950 shadow-xl shadow-white/10 transition-transform duration-300 hover:scale-105 sm:w-auto">
              Start Practising Free
            </button>
          )}
          <a
            href="#demo"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-[15px] font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/10 sm:w-auto">
            
            <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
            Watch Demo
          </a>
        </motion.div>

        <motion.p variants={item} className="mt-6 font-mono text-[13px] text-slate-600">
          Free to start · No credit card required
        </motion.p>
      </motion.div>
    </section>);

}