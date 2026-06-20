import { describe, it, expect } from 'vitest';
import { analyzeEntry } from './gemini';
import type { Category, Mood } from './types';

describe('analyzeEntry - mood handling', () => {
    it('scores a concerned mood as negative regardless of category', () => {
        const result = analyzeEntry('lifestyle', 'concerned');
        expect(result.impact_type).toBe('negative');
        expect(result.impact_score).toBeLessThan(0);
    });

    it('scores a proud mood on a positive category as exceptional when high enough', () => {
        const result = analyzeEntry('water', 'proud');
        expect(result.impact_type).toBe('positive');
        expect(result.is_exceptional).toBe(true);
        expect(result.world_effect).toBe('flowers');
    });

    it('halves the score for a neutral mood', () => {
        const result = analyzeEntry('transport', 'neutral');
        expect(result.impact_score).toBe(2); // category score 4 / 2
    });

    it('treats a waste entry with no mood as negative (base category effect)', () => {
        const result = analyzeEntry('waste', null);
        expect(result.impact_type).toBe('negative');
    });

    it('treats no mood the same as neutral mood for any category', () => {
        const withNull = analyzeEntry('energy', null);
        const withNeutral = analyzeEntry('energy', 'neutral');
        expect(withNull.impact_score).toBe(withNeutral.impact_score);
    });
});

describe('analyzeEntry - exceptional threshold', () => {
    it('flags a score of exactly 5 as exceptional (inclusive boundary)', () => {
        // energy (score 3) + proud (+2) = 5
        const result = analyzeEntry('energy', 'proud');
        expect(result.impact_score).toBe(5);
        expect(result.is_exceptional).toBe(true);
    });

    it('does not flag a score of 4 as exceptional (just under the boundary)', () => {
        // energy (score 3) + motivated (+1) = 4
        const result = analyzeEntry('energy', 'motivated');
        expect(result.impact_score).toBe(4);
        expect(result.is_exceptional).toBe(false);
    });

    it('overrides world_effect to "flowers" only when exceptional', () => {
        const exceptional = analyzeEntry('water', 'proud');
        const notExceptional = analyzeEntry('water', 'neutral');
        expect(exceptional.world_effect).toBe('flowers');
        expect(notExceptional.world_effect).toBe('water');
    });
});

describe('analyzeEntry - category coverage', () => {
    const categories: Category[] = ['transport', 'energy', 'food', 'waste', 'water', 'lifestyle'];

    it.each(categories)('produces a valid EntryImpact shape for category "%s"', (category) => {
        const result = analyzeEntry(category, 'hopeful');
        expect(typeof result.impact_score).toBe('number');
        expect(['positive', 'negative', 'neutral']).toContain(result.impact_type);
        expect(typeof result.is_exceptional).toBe('boolean');
        expect(['sky', 'trees', 'water', 'flowers']).toContain(result.world_effect);
    });

    it('allows a "proud" mood to flip a negative-baseline category (waste) into a positive entry', () => {
        // Intentional design: feeling proud about correcting wasteful behavior
        // should register positively, even though "waste" has a negative baseline.
        const result = analyzeEntry('waste', 'proud');
        expect(result.impact_type).toBe('positive');
    });
});

describe('analyzeEntry - all moods produce valid output', () => {
    const moods: Mood[] = ['hopeful', 'neutral', 'concerned', 'proud', 'motivated'];

    it.each(moods)('returns a finite numeric score for mood "%s"', (mood) => {
        const result = analyzeEntry('transport', mood);
        expect(Number.isFinite(result.impact_score)).toBe(true);
    });
});