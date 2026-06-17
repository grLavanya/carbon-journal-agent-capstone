import type { Category, Mood } from './types';

export interface EntryImpact {
  impact_score: number;
  impact_type: 'positive' | 'negative' | 'neutral';
  is_exceptional: boolean;
  world_effect: 'sky' | 'trees' | 'water' | 'flowers';
}

const CATEGORY_IMPACT: Record<Category, { score: number; effect: EntryImpact['world_effect'] }> = {
  transport: { score: 4, effect: 'sky' },
  food: { score: 3, effect: 'trees' },
  lifestyle: { score: 4, effect: 'flowers' },
  water: { score: 5, effect: 'water' },
  energy: { score: -2, effect: 'sky' },
  waste: { score: -3, effect: 'trees' },
};

const MOOD_MODIFIER: Partial<Record<Mood, number>> = {
  concerned: -2,
  proud: 2,
  motivated: 1,
  hopeful: 1,
};

export function analyzeEntry(category: Category, mood: Mood | null): EntryImpact {
  const { score: catScore, effect } = CATEGORY_IMPACT[category];
  const moodMod = (mood && MOOD_MODIFIER[mood]) ?? 0;

  const totalScore = catScore + moodMod;
  const impactType = totalScore > 0 ? 'positive' : totalScore < 0 ? 'negative' : 'neutral';

  // Exceptional = positive category + proud mood (high-impact positive action)
  const isExceptional = totalScore >= 5;

  return {
    impact_score: totalScore,
    impact_type: impactType,
    is_exceptional: isExceptional,
    world_effect: isExceptional ? 'flowers' : effect,
  };
}
