import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { SessionSummary, TrendPoint, QuickStat, SkillComparison } from '../types';

export function useDashboardData() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [skillComparison, setSkillComparison] = useState<SkillComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const token = localStorage.getItem('eloquent_token');
        const res = await fetch(`${API_URL}/api/sessions`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Failed to fetch sessions');
        const data = await res.json();
        
        // Ensure data is sorted by timestamp descending
        data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const history: SessionSummary[] = data.map((s: any) => ({
          id: s.id,
          name: s.session_label || 'Practice Session',
          context: s.practice_context || 'General',
          score: s.overall_score || 0,
          durationSeconds: s.duration_seconds || 0,
          createdAgo: new Date(s.timestamp).toLocaleDateString()
        }));

        setSessions(history);

        // Calculate trends (chronological, oldest first)
        const chronological = [...data].reverse();
        const newTrend: TrendPoint[] = chronological.map((s: any, i: number) => ({
          session: i + 1,
          overall: s.overall_score || 0,
          speech: s.speech_score || 0,
          connection: s.eye_contact_score || 0
        }));
        setTrend(newTrend.length > 0 ? newTrend : [{ session: 1, overall: 0, speech: 0, connection: 0 }]);

        // Quick Stats
        const latest = data[0] || {};
        const previous = data[1] || {};
        const avgScore = data.length > 0 ? Math.round(data.reduce((acc: number, curr: any) => acc + (curr.overall_score || 0), 0) / data.length) : 0;
        const totalDuration = data.reduce((acc: number, curr: any) => acc + (curr.duration_seconds || 0), 0);
        
        const newStats: QuickStat[] = [
          { label: 'Latest Score', value: String(latest.overall_score || 0), delta: (latest.overall_score || 0) - (previous.overall_score || 0) },
          { label: 'Average Score', value: String(avgScore), delta: null },
          { label: 'Sessions', value: String(data.length), delta: null },
          { label: 'Practice Time', value: `${Math.round(totalDuration / 60)}m`, delta: null },
          { label: 'Eye Contact', value: `${Math.round(latest.eye_contact_score || 0)}%`, delta: Math.round((latest.eye_contact_score || 0) - (previous.eye_contact_score || 0)) },
          { label: 'Filler Words', value: String(latest.filler_words_count || 0), delta: (latest.filler_words_count || 0) - (previous.filler_words_count || 0) }
        ];
        setQuickStats(newStats);

        // Skill Comparison
        setSkillComparison([
          { label: 'Speech Delivery', previous: previous.speech_score || 0, current: latest.speech_score || 0 },
          { label: 'Facial Emotion', previous: previous.facial_score || 0, current: latest.facial_score || 0 },
          { label: 'Posture', previous: previous.posture_score || 0, current: latest.posture_score || 0 },
          { label: 'Gestures', previous: previous.gesture_score || 0, current: latest.gesture_score || 0 },
          { label: 'Content', previous: previous.content_score || 0, current: latest.content_score || 0 }
        ]);

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, []);

  return { sessions, trend, quickStats, skillComparison, isLoading, setSessions };
}
