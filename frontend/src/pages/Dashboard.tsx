import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { AmbientGlow } from '../components/common/AmbientGlow';
import { ActiveGoalBanner } from '../components/dashboard/ActiveGoalBanner';
import { LevelCard } from '../components/dashboard/LevelCard';
import { OnboardingModal } from '../components/dashboard/OnboardingModal';
import { PersonalInsights } from '../components/dashboard/PersonalInsights';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { QuickStats } from '../components/dashboard/QuickStats';
import { Recommended } from '../components/dashboard/Recommended';
import { SessionComparison } from '../components/dashboard/SessionComparison';
import { SessionHistory } from '../components/dashboard/SessionHistory';
import { quickStats, sessionHistory, skillComparison, trend, userName } from '../data/sessions';

export function Dashboard() {
  const [name, setName] = useState<string | null>(null);
  const [goalVisible, setGoalVisible] = useState(true);
  const [sessions, setSessions] = useState(sessionHistory);

  return (
    <main className="relative min-h-screen w-full bg-slate-950 px-5 pb-20 pt-24 sm:px-8">
      <AmbientGlow />

      <div className="relative mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
              Communication Journey
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Welcome back, {name ?? userName}
            </h1>
            <p className="mt-2 text-[15px] text-slate-400">
              {sessions.length} sessions recorded • Powered by CAF Intelligence Engine V2
            </p>
          </div>
          <Link
            to="/v2/practice"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500">
            
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Start New Session
          </Link>
        </header>

        {goalVisible &&
        <div className="mt-8">
            <ActiveGoalBanner onDismiss={() => setGoalVisible(false)} />
          </div>
        }

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <LevelCard score={78} level="Advanced Communicator" grade="A-" />
          <div className="lg:col-span-2">
            <QuickStats stats={quickStats} />
          </div>
        </div>

        <div className="mt-5">
          <ProgressChart data={trend} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <SessionComparison skills={skillComparison} />
          <PersonalInsights />
        </div>

        <div className="mt-5">
          <Recommended />
        </div>

        <div className="mt-5">
          <SessionHistory
            sessions={sessions}
            onDelete={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))} />
          
        </div>
      </div>

      {name === null && <OnboardingModal onComplete={setName} />}
    </main>);

}