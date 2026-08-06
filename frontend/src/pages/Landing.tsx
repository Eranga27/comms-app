import React from 'react';
import { Hero } from '../components/landing/Hero';
import { DemoPreview } from '../components/landing/DemoPreview';
import { HowItWorks } from '../components/landing/HowItWorks';
import { AudienceGrid } from '../components/landing/AudienceGrid';
import { WhyPlatform } from '../components/landing/WhyPlatform';
import { SocialProof } from '../components/landing/SocialProof';
import { FinalCTA } from '../components/landing/FinalCTA';
import { SiteFooter } from '../components/landing/SiteFooter';
import { FadeIn } from '../components/common/FadeIn';

export function Landing() {
  return (
    <main className="w-full bg-slate-950">
      <Hero />
      <FadeIn delay={0.2}><DemoPreview /></FadeIn>
      <FadeIn><HowItWorks /></FadeIn>
      <FadeIn><AudienceGrid /></FadeIn>
      <FadeIn><WhyPlatform /></FadeIn>
      <FadeIn><SocialProof /></FadeIn>
      <FadeIn><FinalCTA /></FadeIn>
      <SiteFooter />
    </main>);

}