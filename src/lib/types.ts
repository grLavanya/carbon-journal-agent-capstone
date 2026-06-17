export type Category = 'transport' | 'energy' | 'food' | 'waste' | 'water' | 'lifestyle';
export type Mood = 'hopeful' | 'neutral' | 'concerned' | 'proud' | 'motivated';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: Category;
  carbon_value: number;
  mood: Mood | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryInsert {
  title: string;
  content: string;
  category: Category;
  carbon_value: number;
  mood?: Mood | null;
}

export const CATEGORIES: { value: Category; label: string; color: string; icon: string }[] = [
  { value: 'transport', label: 'Transport', color: 'bg-sky-100 text-sky-800', icon: 'car' },
  { value: 'energy', label: 'Energy', color: 'bg-amber-100 text-amber-800', icon: 'zap' },
  { value: 'food', label: 'Food', color: 'bg-emerald-100 text-emerald-800', icon: 'leaf' },
  { value: 'waste', label: 'Waste', color: 'bg-orange-100 text-orange-800', icon: 'trash' },
  { value: 'water', label: 'Water', color: 'bg-cyan-100 text-cyan-800', icon: 'droplets' },
  { value: 'lifestyle', label: 'Lifestyle', color: 'bg-violet-100 text-violet-800', icon: 'heart' },
];

export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'hopeful', label: 'Hopeful', emoji: '\u2600\uFE0F' },
  { value: 'neutral', label: 'Neutral', emoji: '\uD83D\uDE10' },
  { value: 'concerned', label: 'Concerned', emoji: '\uD83D\uDE1F' },
  { value: 'proud', label: 'Proud', emoji: '\uD83C\uDF1F' },
  { value: 'motivated', label: 'Motivated', emoji: '\uD83D\uDD25' },
];
