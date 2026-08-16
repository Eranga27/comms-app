import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ChevronLeftIcon } from 'lucide-react';
import { AmbientGlow } from '../components/common/AmbientGlow';
import { FadeIn } from '../components/common/FadeIn';
import { ActiveGoalBanner } from '../components/dashboard/ActiveGoalBanner';
import { LevelCard } from '../components/dashboard/LevelCard';
import { PersonalInsights } from '../components/dashboard/PersonalInsights';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { QuickStats } from '../components/dashboard/QuickStats';
import { Recommended } from '../components/dashboard/Recommended';
import { SessionComparison } from '../components/dashboard/SessionComparison';
import { SessionHistory } from '../components/dashboard/SessionHistory';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';

export function Dashboard() {
  const { user } = useAuth();
  const [goalVisible, setGoalVisible] = useState(true);
  
  const {
    sessions, setSessions,
    trend,
    quickStats,
    skillComparison,
    isLoading,
    avgScore,
    level,
    grade,
    sessionCount,
    insights,
    recommendations,
    activeGoal,
    setActiveGoal,
    GOAL_DEFAULTS,
  } = useDashboardData();

  const displayName = user?.first_name || user?.username || 'Communicator';

  if (isLoading) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-white" aria-hidden="true" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full px-5 pb-20 pt-24 sm:px-8">
      <AmbientGlow />

      <div className="relative mx-auto max-w-7xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-slate-600 hover:text-slate-400 transition-colors mb-6">
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          Home
        </Link>

        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
              Communication Journey
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 text-[15px] text-slate-400">
              {sessions.length} sessions recorded • Powered by Communication Intelligence Engine V2
            </p>
          </div>
          <Link
            to="/v2/practice"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Start New Session
          </Link>
        </header>

        {sessions.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900/50 py-24 px-6 text-center backdrop-blur-sm">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
                <span className="text-4xl" aria-hidden="true">🎯</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">No sessions recorded yet</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Your communication dashboard is empty. Complete your first practice session to unlock insights, track your progress, and get AI coaching feedback.
              </p>
              <Link
                to="/v2/practice"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-[16px] font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500"
              >
                <PlusIcon className="h-5 w-5" aria-hidden="true" />
                Start First Session
              </Link>
            </div>
          </FadeIn>
        ) : (
          <>
            {goalVisible && (
              <FadeIn delay={0.1}>
                <div className="mt-8">
                  <ActiveGoalBanner
                    onDismiss={() => setGoalVisible(false)}
                    activeGoal={activeGoal}
                    goalDefaults={GOAL_DEFAULTS}
                    onGoalChange={setActiveGoal}
                  />
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.2}>
              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <div title={`Based on your rolling average across ${sessionCount} session${sessionCount !== 1 ? 's' : ''}`}>
                  <LevelCard score={avgScore} level={level} grade={grade} />
                </div>
                <div className="lg:col-span-2">
                  <QuickStats stats={quickStats} />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-5">
                <ProgressChart data={trend} />
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <SessionComparison skills={skillComparison} />
                <PersonalInsights insights={insights} />
              </div>
            </FadeIn>

            <FadeIn>
              <div className="mt-5">
                <Recommended recommendations={recommendations} />
              </div>
            </FadeIn>

            <FadeIn>
              <div className="mt-5">
                <SessionHistory
                  sessions={sessions}
                  onDelete={async (id) => {
                    const token = localStorage.getItem('eloquent_token');
                    try {
                      await fetch(`${API_URL}/api/session/${id}`, {
                        method: 'DELETE',
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                      });
                    } catch (e) {}
                    setSessions((prev) => prev.filter((s) => s.id !== id));
                  }}
                />
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </main>
  );
}
