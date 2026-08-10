import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { SessionSummary, TrendPoint, QuickStat, SkillComparison } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Insight {
  emoji: string;
  label: string;
  title: string;
  detail: string;
  tone: 'emerald' | 'teal' | 'amber';
}

export interface Recommendation {
  title: string;
  detail: string;
  goal: string;
  goalId: string;
  whyScore: number;
  whyLabel: string;
}

export interface ActiveGoal {
  emoji: string;
  title: string;
  description: string;
  goalId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLevelFromScore(s: number): { level: string; grade: string } {
  if (s >= 90) return { level: 'Master', grade: 'A+' };
  if (s >= 80) return { level: 'Advanced Communicator', grade: 'A-' };
  if (s >= 70) return { level: 'Proficient', grade: 'B+' };
  if (s >= 50) return { level: 'Developing', grade: 'B-' };
  return { level: 'Foundation', grade: 'C' };
}

const METRICS = [
  { key: 'speech_score', label: 'Speech Delivery', goalId: 'pace' },
  { key: 'eye_contact_score', label: 'Eye Contact', goalId: 'eye' },
  { key: 'posture_score', label: 'Posture', goalId: 'confidence' },
  { key: 'gesture_score', label: 'Gestures', goalId: 'confidence' },
  { key: 'content_score', label: 'Content', goalId: 'story' },
] as const;

function generateInsights(data: any[]): Insight[] {
  if (data.length < 2) return [];
  const latest = data[0];
  const older = data.slice(1, 4);

  const deltas = METRICS.map(({ key, label }) => ({
    label,
    delta: (latest[key] ?? 0) - (older.reduce((a: number, s: any) => a + (s[key] ?? 0), 0) / older.length),
  }));

  const avgs = METRICS.map(({ key, label }) => ({
    label,
    avg: data.reduce((a: number, s: any) => a + (s[key] ?? 0), 0) / data.length,
  }));

  const mostImproved = [...deltas].sort((a, b) => b.delta - a.delta)[0];
  const strongSuit = [...avgs].sort((a, b) => b.avg - a.avg)[0];
  const weakArea = [...avgs].sort((a, b) => a.avg - b.avg)[0];

  return [
    {
      emoji: '🚀',
      label: 'Most Improved Skill',
      title: mostImproved.label,
      detail: `Up ${Math.abs(mostImproved.delta).toFixed(0)} points across your recent sessions. Keep the momentum.`,
      tone: 'emerald',
    },
    {
      emoji: '⭐',
      label: 'Consistent Strength',
      title: strongSuit.label,
      detail: `Averaging ${strongSuit.avg.toFixed(0)}% — this is your most reliable asset.`,
      tone: 'teal',
    },
    {
      emoji: '🎯',
      label: 'Main Improvement Area',
      title: weakArea.label,
      detail: `Your lowest-scoring pillar. A focused session here will move the needle fastest.`,
      tone: 'amber',
    },
  ];
}

const RECOMMENDATION_MAP: Record<string, Recommendation> = {
  'Speech Delivery': {
    title: 'Pace Control Sprint',
    detail: 'Practice a 60-second answer targeting 140–160 WPM.',
    goal: 'Speaking Pace',
    goalId: 'pace',
    whyScore: 0,
    whyLabel: 'Speech Delivery',
  },
  'Eye Contact': {
    title: 'Camera Lock Challenge',
    detail: '90 seconds of direct-to-camera storytelling without looking away.',
    goal: 'Improve Eye Contact',
    goalId: 'eye',
    whyScore: 0,
    whyLabel: 'Eye Contact',
  },
  'Posture': {
    title: 'Posture Reset Drill',
    detail: 'Record a 2-minute answer focusing solely on maintaining an upright, open posture.',
    goal: 'Confidence',
    goalId: 'confidence',
    whyScore: 0,
    whyLabel: 'Posture',
  },
  'Gestures': {
    title: 'Open Hands Drill',
    detail: 'Frame a 2-minute pitch using only open-palm gestures.',
    goal: 'Confidence',
    goalId: 'confidence',
    whyScore: 0,
    whyLabel: 'Gestures',
  },
  'Content': {
    title: 'The 90-Second Answer',
    detail: 'Re-run your strongest story with a hard 90-second cap.',
    goal: 'Storytelling',
    goalId: 'story',
    whyScore: 0,
    whyLabel: 'Content',
  },
};

const GOAL_DEFAULTS: Record<string, ActiveGoal> = {
  pace: { emoji: '🎙️', title: 'Speaking Pace', description: 'Target: 120–160 WPM for confident, clear delivery.', goalId: 'pace' },
  eye: { emoji: '👁️', title: 'Improve Eye Contact', description: 'Target: 70%+ direct camera eye contact.', goalId: 'eye' },
  fillers: { emoji: '🤫', title: 'Reduce Fillers', description: 'Target: under 4 filler words per minute across a full answer.', goalId: 'fillers' },
  confidence: { emoji: '💪', title: 'Confidence & Posture', description: 'Target: open posture and visible hand gestures throughout.', goalId: 'confidence' },
  story: { emoji: '📖', title: 'Storytelling', description: 'Target: clear narrative arc with a strong closing line.', goalId: 'story' },
};

const GOAL_STORAGE_KEY = 'eloquent_active_goal';

function loadActiveGoal(): ActiveGoal | null {
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActiveGoal) : null;
  } catch {
    return null;
  }
}

export function saveActiveGoal(goal: ActiveGoal): void {
  localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goal));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDashboardData() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [skillComparison, setSkillComparison] = useState<SkillComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Derived intelligence state ───────────────────────────────────────────
  const [avgScore, setAvgScore] = useState(0);
  const [level, setLevel] = useState('Foundation');
  const [grade, setGrade] = useState('C');
  const [sessionCount, setSessionCount] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeGoal, setActiveGoalState] = useState<ActiveGoal | null>(loadActiveGoal);

  const setActiveGoal = (goal: ActiveGoal) => {
    saveActiveGoal(goal);
    setActiveGoalState(goal);
  };

  useEffect(() => {
    async function fetchSessions() {
      try {
        const token = localStorage.getItem('eloquent_token');
        const res = await fetch(`${API_URL}/api/sessions`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Failed to fetch sessions');
        const data = await res.json();

        // Sort newest first
        data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const history: SessionSummary[] = data.map((s: any) => ({
          id: s.id,
          name: s.session_label || 'Practice Session',
          context: s.practice_context || 'General',
          score: s.overall_score || 0,
          durationSeconds: s.duration_seconds || 0,
          createdAgo: new Date(s.timestamp).toLocaleDateString(),
        }));
        setSessions(history);
        setSessionCount(data.length);

        // ── Trend (chronological) ──────────────────────────────────────────
        const chronological = [...data].reverse();
        const newTrend: TrendPoint[] = chronological.map((s: any, i: number) => ({
          session: i + 1,
          overall: s.overall_score || 0,
          speech: s.speech_score || 0,
          connection: s.eye_contact_score || 0,
        }));
        setTrend(newTrend.length > 0 ? newTrend : [{ session: 1, overall: 0, speech: 0, connection: 0 }]);

        // ── Quick Stats ────────────────────────────────────────────────────
        const latest = data[0] || {};
        const previous = data[1] || {};
        const computed_avg = data.length > 0
          ? Math.round(data.reduce((acc: number, curr: any) => acc + (curr.overall_score || 0), 0) / data.length)
          : 0;
        const totalDuration = data.reduce((acc: number, curr: any) => acc + (curr.duration_seconds || 0), 0);

        setQuickStats([
          { label: 'Latest Score', value: String(latest.overall_score || 0), delta: (latest.overall_score || 0) - (previous.overall_score || 0) },
          { label: 'Average Score', value: String(computed_avg), delta: null },
          { label: 'Sessions', value: String(data.length), delta: null },
          { label: 'Practice Time', value: `${Math.round(totalDuration / 60)}m`, delta: null },
          { label: 'Eye Contact', value: `${Math.round(latest.eye_contact_score || 0)}%`, delta: Math.round((latest.eye_contact_score || 0) - (previous.eye_contact_score || 0)) },
          { label: 'Filler Words', value: String(latest.filler_words_count || 0), delta: (latest.filler_words_count || 0) - (previous.filler_words_count || 0) },
        ]);

        // ── Skill Comparison ───────────────────────────────────────────────
        setSkillComparison([
          { label: 'Speech Delivery', previous: previous.speech_score || 0, current: latest.speech_score || 0 },
          { label: 'Facial Emotion', previous: previous.facial_score || 0, current: latest.facial_score || 0 },
          { label: 'Posture', previous: previous.posture_score || 0, current: latest.posture_score || 0 },
          { label: 'Gestures', previous: previous.gesture_score || 0, current: latest.gesture_score || 0 },
          { label: 'Content', previous: previous.content_score || 0, current: latest.content_score || 0 },
        ]);

        // ── Level Card ─────────────────────────────────────────────────────
        setAvgScore(computed_avg);
        const { level: lv, grade: gr } = getLevelFromScore(computed_avg);
        setLevel(lv);
        setGrade(gr);

        // ── Personal Insights ──────────────────────────────────────────────
        setInsights(generateInsights(data));

        // ── Recommendations ────────────────────────────────────────────────
        const metricAvgs = METRICS.map(({ key, label }) => ({
          label,
          avg: data.length > 0
            ? data.reduce((a: number, s: any) => a + (s[key] ?? 0), 0) / data.length
            : 0,
        }));
        const weakAreas = [...metricAvgs].sort((a, b) => a.avg - b.avg);
        const recs: Recommendation[] = weakAreas
          .slice(0, 3)
          .map((area) => {
            const rec = RECOMMENDATION_MAP[area.label];
            if (!rec) return null;
            return { ...rec, whyScore: Math.round(area.avg), whyLabel: area.label };
          })
          .filter(Boolean) as Recommendation[];
        setRecommendations(recs);

        // ── Active Goal: auto-assign for first-time users ──────────────────
        if (!loadActiveGoal() && weakAreas.length > 0) {
          const weakestGoalId = METRICS.find((m) => m.label === weakAreas[0].label)?.goalId ?? 'fillers';
          const autoGoal = GOAL_DEFAULTS[weakestGoalId] ?? GOAL_DEFAULTS['fillers'];
          saveActiveGoal(autoGoal);
          setActiveGoalState(autoGoal);
        }

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, []);

  return {
    sessions, setSessions,
    trend,
    quickStats,
    skillComparison,
    isLoading,
    // Intelligence Engine outputs
    avgScore,
    level,
    grade,
    sessionCount,
    insights,
    recommendations,
    activeGoal,
    setActiveGoal,
    GOAL_DEFAULTS,
  };
}
