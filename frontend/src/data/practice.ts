import { PracticeContext, PracticeGoal } from '../types';

export const practiceContexts: PracticeContext[] = [
  { id: 'interview', label: 'Job Interview', emoji: '💼', description: 'Behavioural questions and STAR responses' },
  { id: 'presentation', label: 'Presentation', emoji: '📊', description: 'Decks, slide reviews, and team readouts' },
  { id: 'sales', label: 'Sales Pitch', emoji: '📈', description: 'Discovery calls, demos, and client proposals' },
  { id: 'speaking', label: 'Public Speaking', emoji: '🎤', description: 'Keynotes, panels, and stage presentations' },
  { id: 'freeform', label: 'Custom Practice', emoji: '✨', description: 'Warm up or practice any topic on your mind' },
];


export const practiceGoals: PracticeGoal[] = [
{ id: 'fillers', emoji: '🚫', title: 'Reduce Fillers', description: 'Trade “um” and “like” for confident pauses.', metric: 'Filler words / minute' },
{ id: 'eye', emoji: '👁️', title: 'Improve Eye Contact', description: 'Hold the camera without drifting away.', metric: 'Eye contact %' },
{ id: 'confidence', emoji: '💪', title: 'Confidence', description: 'Steady voice, open posture, no hedging.', metric: 'Presence score' },
{ id: 'story', emoji: '📖', title: 'Storytelling', description: 'Structure a narrative people remember.', metric: 'Message organisation' },
{ id: 'presentation', emoji: '🖥️', title: 'Presentation Skills', description: 'Signpost clearly and land your points.', metric: 'Clarity score' },
{ id: 'interview', emoji: '🎯', title: 'Interview Answers', description: 'Tight, evidence-led STAR responses.', metric: 'Answer structure' },
{ id: 'pace', emoji: '⏱️', title: 'Speaking Pace', description: 'Find the 140–160 WPM sweet spot.', metric: 'Words per minute' },
{ id: 'custom', emoji: '⚙️', title: 'Custom Goal', description: 'Track something specific to you.', metric: 'You choose' }];


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