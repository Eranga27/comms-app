import { PracticeContext, PracticeGoal } from '../types';

export const practiceContexts: PracticeContext[] = [
  { id: 'interview', label: 'Job Interview', emoji: '💼', description: 'Behavioural questions and STAR responses' },
  { id: 'presentation', label: 'Presentation', emoji: '📊', description: 'Decks, slide reviews, and team readouts' },
  { id: 'sales', label: 'Sales Pitch', emoji: '📈', description: 'Discovery calls, demos, and client proposals' },
  { id: 'speaking', label: 'Public Speaking', emoji: '🎤', description: 'Keynotes, panels, and stage presentations' },
  { id: 'freeform', label: 'Custom Practice', emoji: '✨', description: 'Warm up or practice any topic on your mind' },
];


export const practiceGoals: PracticeGoal[] = [
  { id: 'all', emoji: '🎯', title: 'Skip — Coach me on everything', description: 'Comprehensive real-time analysis across all 4 pillars.', metric: 'All metrics active' },
  { id: 'confidence', emoji: '💪', title: 'Speak with more confidence', description: 'Steady voice, calm delivery, and open posture.', metric: 'Presence & delivery' },
  { id: 'pace', emoji: '⏱️', title: 'Slow down my pace', description: 'Find the optimal 140–160 WPM sweet spot.', metric: 'Words per minute' },
  { id: 'fillers', emoji: '🚫', title: 'Reduce filler words', description: 'Replace "um" and "like" with confident pauses.', metric: 'Filler words / min' },
  { id: 'eye', emoji: '👁️', title: 'Improve eye contact', description: 'Maintain natural eye contact with your camera.', metric: 'Eye contact %' },
  { id: 'body', emoji: '🤲', title: 'Improve body language', description: 'Open hand gestures and upright posture.', metric: 'Posture & gestures' },
  { id: 'clarity', emoji: '💬', title: 'Improve message clarity', description: 'Clear signposting and structured answers.', metric: 'Clarity score' },
];


export const coachingScript: {type: 'positive' | 'warning';message: string;}[] = [
{ type: 'positive', message: 'Great eye contact — hold it right there.' },
{ type: 'warning', message: 'Slight filler creeping in. Try a pause instead.' },
{ type: 'positive', message: 'Nice open gesture, that reinforced your point.' },
{ type: 'warning', message: 'Pace is climbing. Breathe and slow down 10%.' },
{ type: 'positive', message: 'Posture is steady and grounded. Very composed.' },
{ type: 'warning', message: 'You trailed off at the end — land the sentence.' },
{ type: 'positive', message: 'Strong vocal variety on that last thought.' }];


export const transcriptScript = [
'So the project I want to walk you through',
'started as a small internal tool',
'and, um, grew into something the whole team relied on.',
'I owned the discovery work end to end,',
'which meant sitting with eight different users',
'and mapping where their workflow actually broke.',
'The result was a thirty percent drop in handoff time,',
'and, you know, a much calmer release process.'];