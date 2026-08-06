import { QuickStat, SessionSummary, SkillComparison, TrendPoint } from '../types';

export const userName = 'Aarav';

export const sessionHistory: SessionSummary[] = [
{ id: 'sess-108', name: 'Product Manager Loop — Round 2', context: 'Job Interview', score: 78, durationSeconds: 412, createdAgo: '2 hours ago' },
{ id: 'sess-107', name: 'Series A Narrative Rehearsal', context: 'Public Speaking', score: 84, durationSeconds: 622, createdAgo: 'Yesterday' },
{ id: 'sess-106', name: 'Q3 Business Review Readout', context: 'Presentation', score: 71, durationSeconds: 508, createdAgo: '3 days ago' },
{ id: 'sess-105', name: 'Enterprise Discovery Call', context: 'Sales Pitch', score: 80, durationSeconds: 356, createdAgo: '5 days ago' },
{ id: 'sess-104', name: 'Difficult Feedback Conversation', context: 'Leadership', score: 66, durationSeconds: 288, createdAgo: '1 week ago' },
{ id: 'sess-103', name: 'Warm-up — Tell Me About Yourself', context: 'Job Interview', score: 62, durationSeconds: 194, createdAgo: '2 weeks ago' }];


export const trend: TrendPoint[] = [
{ session: 1, overall: 58, speech: 54, connection: 61 },
{ session: 2, overall: 62, speech: 60, connection: 64 },
{ session: 3, overall: 66, speech: 63, connection: 70 },
{ session: 4, overall: 71, speech: 72, connection: 68 },
{ session: 5, overall: 80, speech: 76, connection: 79 },
{ session: 6, overall: 84, speech: 83, connection: 81 },
{ session: 7, overall: 78, speech: 81, connection: 76 }];


export const quickStats: QuickStat[] = [
{ label: 'Latest Score', value: '78', delta: -6 },
{ label: 'Average Score', value: '71', delta: 4 },
{ label: 'Sessions', value: '7', delta: null },
{ label: 'Practice Time', value: '46m', delta: null },
{ label: 'Eye Contact', value: '85%', delta: 7 },
{ label: 'Filler Words', value: '11', delta: -4 }];


export const skillComparison: SkillComparison[] = [
{ label: 'Speech Delivery', previous: 74, current: 83 },
{ label: 'Audience Connection', previous: 81, current: 76 },
{ label: 'Leadership Presence', previous: 68, current: 79 },
{ label: 'Executive Poise', previous: 72, current: 74 },
{ label: 'Message Organisation', previous: 63, current: 70 }];


export const insights = [
{
  emoji: '🚀',
  label: 'Most Improved Skill',
  title: 'Leadership Presence',
  detail: 'Up 11 points across your last two sessions — your posture is holding far steadier.',
  tone: 'emerald' as const
},
{
  emoji: '⭐',
  label: 'Most Consistent Strength',
  title: 'Speech Delivery',
  detail: 'Above 80% in five straight sessions. Vocal variety is now a reliable asset.',
  tone: 'teal' as const
},
{
  emoji: '🎯',
  label: 'Main Improvement Area',
  title: 'Message Organisation',
  detail: 'Answers tend to open strong then wander. Commit to a single closing line.',
  tone: 'amber' as const
}];


export const recommendations = [
{
  title: 'The 90-Second Answer',
  detail: 'Re-run “Tell me about yourself” with a hard 90-second cap to force structure.',
  goal: 'Message Organisation'
},
{
  title: 'Pause Instead of Filler',
  detail: 'One minute of deliberate silence practice before you record your next answer.',
  goal: 'Reduce Fillers'
},
{
  title: 'Close With Impact',
  detail: 'Practise three different closing lines for your strongest project story.',
  goal: 'Storytelling'
}];


export const activeGoal = {
  emoji: '🎯',
  title: 'Reduce Fillers',
  description: 'Target: under 4 filler words per minute across a full answer.'
};