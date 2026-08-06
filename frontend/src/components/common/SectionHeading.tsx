import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  label?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({ label, title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      
      {label &&
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-primary-400">{label}</p>
      }
      <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-[17px] leading-relaxed text-slate-400">{subtitle}</p>}
    </motion.div>);

}