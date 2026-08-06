import { CafGroup, Pillar, TranscriptLine } from '../types';

export const sessionReport = {
  id: 'sess-108',
  name: 'Product Manager Loop — Round 2',
  context: 'Job Interview',
  date: '6 August 2026',
  duration: '06:52',
  grade: 'A-',
  gradeLabel: 'Effective Communicator',
  overall: 78,
  eyeContact: 85,
  fillerWords: 11,
  wpm: 168
};

export const pillars: Pillar[] = [
{ label: 'Speech Delivery', score: 20, max: 25 },
{ label: 'Audience Connection', score: 17, max: 20 },
{ label: 'Leadership Presence', score: 15, max: 20 },
{ label: 'Executive Poise', score: 13, max: 20 },
{ label: 'Message Organisation', score: 9, max: 15 }];


export const radarData = [
{ dimension: 'Speech', value: 80 },
{ dimension: 'Connection', value: 85 },
{ dimension: 'Presence', value: 75 },
{ dimension: 'Poise', value: 65 },
{ dimension: 'Structure', value: 60 }];


export const strengths = [
'Vocal variety kept a seven-minute answer genuinely engaging.',
'Eye contact held at 85% — you looked present, not rehearsed.',
'Open, purposeful gestures reinforced your two strongest points.',
'You recovered smoothly after being interrupted mid-answer.'];


export const focusAreas = [
{ area: 'Filler density spikes under pressure', tip: 'When you feel a filler coming, close your mouth and count one beat. Silence reads as confidence.' },
{ area: 'Pace drifts to 168 WPM', tip: 'Aim for 145–155. Mark two places in your story where you deliberately slow down.' },
{ area: 'Endings trail off', tip: 'Write one sentence that lands the impact, and finish every answer on it.' },
{ area: 'Weight shifts while thinking', tip: 'Plant both feet before you begin. Stillness signals composure.' }];


export const coachSummary = [
'You came into this session sounding like someone who genuinely knows their work — and that credibility carried the first four minutes almost effortlessly. Your vocal variety is now a real strength: you emphasised the discovery work naturally, and the shift in tone when you described the outcome made it feel earned rather than rehearsed.',
'Where you lost ground was structure under pressure. Around the four-minute mark your answer opened a second thread before closing the first, and the filler rate roughly doubled as you navigated back. That is a signal, not a flaw — it tells us your thinking is running ahead of your framing. A single-sentence destination before you start will fix most of it.',
'For your next session, keep the delivery exactly as it is and change one thing only: decide your closing line before you speak. Say it slower than the rest of the answer. If you do that consistently, this moves from an A- to comfortably A territory within two or three sessions.'];


export const cafBreakdown: CafGroup[] = [
{
  label: 'Speech Analysis',
  emoji: '🗣️',
  metrics: [
  { label: 'Pace', value: '168 WPM', percent: 72 },
  { label: 'Filler Control', value: '11 fillers', percent: 64 },
  { label: 'Vocal Variety', value: 'Strong', percent: 88 },
  { label: 'Pauses', value: '9 deliberate', percent: 76 },
  { label: 'Clarity', value: 'High', percent: 82 }]

},
{
  label: 'Facial Analysis',
  emoji: '😊',
  metrics: [
  { label: 'Eye Contact', value: '85%', percent: 85 },
  { label: 'Engagement', value: 'Consistent', percent: 79 },
  { label: 'Expression Variety', value: 'Moderate', percent: 68 }]

},
{
  label: 'Gesture Analysis',
  emoji: '🤚',
  metrics: [
  { label: 'Open Gestures', value: '24 detected', percent: 81 },
  { label: 'Effectiveness', value: 'Reinforcing', percent: 77 },
  { label: 'Fidgeting', value: 'Low', percent: 58 }]

},
{
  label: 'Posture Analysis',
  emoji: '🧍',
  metrics: [
  { label: 'Quality', value: 'Upright', percent: 84 },
  { label: 'Stability', value: '3 weight shifts', percent: 61 }]

}];


export const transcript: TranscriptLine[] = [
{ time: '00:04', text: 'Thanks for having me — I want to start with the project that shaped how I work today.', fillers: [] },
{ time: '00:18', text: 'So it began as, um, a small internal tool that only two teams touched.', fillers: ['um'] },
{ time: '00:31', text: 'I owned discovery end to end, which meant sitting with eight different users.', fillers: [] },
{ time: '00:47', text: 'And, you know, mapping exactly where their workflow was breaking down.', fillers: ['you know'] },
{ time: '01:05', text: 'The insight was that handoffs, not the tooling, were the actual bottleneck.', fillers: [] },
{ time: '01:22', text: 'So we, like, rebuilt the review step around a single shared queue.', fillers: ['like'] },
{ time: '01:40', text: 'That cut handoff time by thirty percent within the first two sprints.', fillers: [] },
{ time: '01:58', text: 'And basically, um, the release process got a lot calmer after that.', fillers: ['basically', 'um'] },
{ time: '02:15', text: 'If I did it again, I would bring engineering into discovery much earlier.', fillers: [] }];