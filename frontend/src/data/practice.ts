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

/** Maps a focus area description string to a practice goal ID using safe keyword matching.
 *  Returns null when no confident mapping can be made. */
export function mapFocusAreaToGoalId(area: string): string | null {
  const lower = area.toLowerCase();
  if (lower.includes('pace') || lower.includes('wpm') || lower.includes('speed') || lower.includes('fast') || lower.includes('slow')) return 'pace';
  if (lower.includes('filler') || lower.includes('um') || lower.includes('uh') || lower.includes('like') || lower.includes('you know')) return 'fillers';
  if (lower.includes('eye contact') || lower.includes('eye')) return 'eye';
  if (lower.includes('posture') || lower.includes('gesture') || lower.includes('weight shift') || lower.includes('body')) return 'body';
  if (lower.includes('confidence') || lower.includes('nervous') || lower.includes('trail') || lower.includes('strong')) return 'confidence';
  if (lower.includes('structure') || lower.includes('clarity') || lower.includes('organis') || lower.includes('message') || lower.includes('ending')) return 'clarity';
  return null;
}

/** Reverse-maps a practice context label to its ID. Returns 'freeform' as safe fallback. */
export function mapContextLabelToId(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('interview')) return 'interview';
  if (lower.includes('presentation')) return 'presentation';
  if (lower.includes('sales')) return 'sales';
  if (lower.includes('public speaking') || lower.includes('speaking')) return 'speaking';
  return 'freeform';
}

export const practicePrompts: Record<string, string[]> = {
  interview: [
    'Tell me about yourself.',
    'Why should we hire you?',
    'Tell me about a difficult problem you solved.',
    'What is your greatest professional achievement?',
  ],
  presentation: [
    'Explain a complex idea in simple terms.',
    'Give a two-minute project update.',
    'Present a new idea to a senior leadership team.',
  ],
  sales: [
    'Pitch your product in 60 seconds.',
    'Explain why a customer should choose your solution.',
    'Handle a skeptical customer\'s objection.',
  ],
  speaking: [
    'Give your opinion on a topic you care about.',
    'Tell a story that taught you an important lesson.',
    'Convince the audience to change one everyday habit.',
  ],
  freeform: [
    'Speak about any topic you would like to practise.',
  ],
};


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