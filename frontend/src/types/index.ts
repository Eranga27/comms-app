export type FocusMode = 'beginner' | 'professional' | 'analyst';

export type SessionState = 'idle' | 'loading' | 'ready' | 'recording' | 'processing';

export interface PracticeContext {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export interface PracticeGoal {
  id: string;
  emoji: string;
  title: string;
  description: string;
  metric: string;
}

export interface CoachingNote {
  id: number;
  type: 'positive' | 'warning';
  message: string;
  timestamp: string;
}

export interface SessionSummary {
  id: string;
  name: string;
  context: string;
  score: number;
  durationSeconds: number;
  createdAgo: string;
}

export interface TrendPoint {
  session: number;
  overall: number;
  speech: number;
  connection: number;
}

export interface QuickStat {
  label: string;
  value: string;
  delta: number | null;
  unit?: string;
}

export interface SkillComparison {
  label: string;
  previous: number;
  current: number;
}

export interface Pillar {
  label: string;
  score: number;
  max: number;
}

export interface CafGroup {
  label: string;
  emoji: string;
  metrics: {label: string;value: string;percent: number;}[];
}

export interface TranscriptLine {
  time: string;
  text: string;
  fillers: string[];
}