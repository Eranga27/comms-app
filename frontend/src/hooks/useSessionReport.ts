import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export function useSessionReport(sessionId: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    async function fetchSession(retries = 15) {
      try {
        const token = localStorage.getItem('eloquent_token');
        const res = await fetch(`${API_URL}/api/session/${sessionId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (res.status === 404 && retries > 0) {
          setTimeout(() => fetchSession(retries - 1), 2000);
          return;
        }
        
        if (!res.ok) throw new Error('Failed to fetch session report');
        const dbSession = await res.json();
        
        const feedback = dbSession.feedback_summary ? JSON.parse(dbSession.feedback_summary) : {};
        const caf = feedback.caf_breakdown || {};

        const formatted = {
          sessionReport: {
            id: dbSession.id,
            name: dbSession.session_label || 'Practice Session',
            context: dbSession.practice_context || 'General',
            date: new Date().toLocaleDateString(), 
            duration: `${Math.floor(dbSession.duration_seconds / 60)}:${String(dbSession.duration_seconds % 60).padStart(2, '0')}`,
            grade: dbSession.communication_grade || 'C',
            gradeLabel: 'Evaluated Communicator',
            overall: dbSession.overall_score || 0,
            eyeContact: Math.round(dbSession.eye_contact_score || 0),
            fillerWords: dbSession.filler_words_count || 0,
            wpm: feedback.wpm || 140
          },
          pillars: [
            { label: 'Speech Delivery', score: dbSession.speech_score || 0, max: 25 },
            { label: 'Facial Emotion', score: dbSession.facial_score || 0, max: 20 },
            { label: 'Posture', score: dbSession.posture_score || 0, max: 20 },
            { label: 'Gestures', score: dbSession.gesture_score || 0, max: 20 },
            { label: 'Content', score: dbSession.content_score || 0, max: 15 }
          ],
          radarData: [
            { dimension: 'Speech', value: Math.round(((dbSession.speech_score || 0) / 25) * 100) },
            { dimension: 'Emotion', value: Math.round(((dbSession.facial_score || 0) / 20) * 100) },
            { dimension: 'Posture', value: Math.round(((dbSession.posture_score || 0) / 20) * 100) },
            { dimension: 'Gestures', value: Math.round(((dbSession.gesture_score || 0) / 20) * 100) },
            { dimension: 'Content', value: Math.round(((dbSession.content_score || 0) / 15) * 100) }
          ],
          strengths: feedback.strengths || ['Good effort in maintaining a steady pace.', 'You completed the practice successfully.'],
          focusAreas: (feedback.weaknesses || ['No major behavioral flags detected.']).map((w: string, idx: number) => ({
            area: w, tip: (feedback.tips && feedback.tips[idx]) ? feedback.tips[idx] : 'Focus on this specific area during your next session.'
          })),
          coachSummary: feedback.feedback_summary ? [feedback.feedback_summary] : ['The AI coach analyzed your session. Keep practicing to see detailed trends.'],
          cafBreakdown: [
            {
              label: 'Speech Analysis', emoji: '🗣️', metrics: [
                { label: 'Pace', value: `${feedback.wpm || 140} WPM`, percent: 75 },
                { label: 'Filler Words', value: `${dbSession.filler_words_count || 0}`, percent: Math.max(0, 100 - (dbSession.filler_words_count || 0) * 5) }
              ]
            },
            {
              label: 'Visual Analysis', emoji: '😊', metrics: [
                { label: 'Eye Contact', value: `${Math.round(dbSession.eye_contact_score || 0)}%`, percent: Math.round(dbSession.eye_contact_score || 0) }
              ]
            }
          ],
          transcript: [{ time: '00:00', text: dbSession.transcript || 'No transcript recorded.', fillers: ['um', 'uh', 'ah', 'like', 'basically', 'actually', 'literally', 'you know', 'i mean', 'sort of', 'kind of'] }]
        };

        setData(formatted);
        setIsLoading(false);
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => fetchSession(retries - 1), 2000);
          return;
        }
        console.error(err);
        setError('Could not load session data');
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  return { data, isLoading, error };
}
