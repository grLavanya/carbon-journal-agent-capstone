import { describe, it, expect } from 'vitest';
import { applyImpact, recalculateFromEntries } from './worldHealth';
import type { EntryImpact } from './gemini';
import type { JournalEntry, Category, Mood } from './types';

function makeEntry(category: Category, mood: Mood | null): JournalEntry {
    return {
        id: 'test-id',
        user_id: 'test-user',
        title: 'Test entry',
        content: '',
        category,
        carbon_value: 0,
        mood,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

describe('applyImpact', () => {
    it('increases score for a positive impact', () => {
        const impact: EntryImpact = {
            impact_score: 5,
            impact_type: 'positive',
            is_exceptional: false,
            world_effect: 'sky',
        };
        const result = applyImpact(impact, 50);
        expect(result.score).toBeGreaterThan(50);
    });

    it('clamps score at 100 maximum', () => {
        const impact: EntryImpact = {
            impact_score: 50,
            impact_type: 'positive',
            is_exceptional: true,
            world_effect: 'flowers',
        };
        const result = applyImpact(impact, 95);
        expect(result.score).toBe(100);
    });

    it('clamps score at 0 minimum', () => {
        const impact: EntryImpact = {
            impact_score: -50,
            impact_type: 'negative',
            is_exceptional: false,
            world_effect: 'trees',
        };
        const result = applyImpact(impact, 5);
        expect(result.score).toBe(0);
    });

    it('passes through the effect and effectType unchanged', () => {
        const impact: EntryImpact = {
            impact_score: 3,
            impact_type: 'positive',
            is_exceptional: false,
            world_effect: 'water',
        };
        const result = applyImpact(impact, 50);
        expect(result.effect).toBe('water');
        expect(result.effectType).toBe('positive');
    });

    it('keeps the score unchanged for a zero-score neutral entry', () => {
        const impact: EntryImpact = {
            impact_score: 0,
            impact_type: 'neutral',
            is_exceptional: false,
            world_effect: 'sky',
        };
        const result = applyImpact(impact, 50);
        expect(result.score).toBe(50);
    });

    it('always returns an integer score', () => {
        const impact: EntryImpact = {
            impact_score: 1,
            impact_type: 'positive',
            is_exceptional: false,
            world_effect: 'sky',
        };
        const result = applyImpact(impact, 50);
        expect(Number.isInteger(result.score)).toBe(true);
    });
});

describe('recalculateFromEntries', () => {
    it('returns the default baseline score of 50 for an empty entries array', () => {
        expect(recalculateFromEntries([])).toBe(50);
    });

    it('increases score for a single positive entry', () => {
        const result = recalculateFromEntries([makeEntry('water', 'proud')]);
        expect(result).toBeGreaterThan(50);
    });

    it('decreases score for a single negative entry', () => {
        const result = recalculateFromEntries([makeEntry('transport', 'concerned')]);
        expect(result).toBeLessThan(50);
    });

    it('accumulates impact across multiple entries rather than using only the last one', () => {
        const oneEntry = recalculateFromEntries([makeEntry('water', 'proud')]);
        const threeEntries = recalculateFromEntries([
            makeEntry('water', 'proud'),
            makeEntry('water', 'proud'),
            makeEntry('water', 'proud'),
        ]);
        expect(threeEntries).toBeGreaterThan(oneEntry);
    });

    it('never returns a score below 0, even with many negative entries', () => {
        const manyNegative = Array.from({ length: 30 }, () => makeEntry('transport', 'concerned'));
        expect(recalculateFromEntries(manyNegative)).toBe(0);
    });

    it('never returns a score above 100, even with many positive entries', () => {
        const manyPositive = Array.from({ length: 30 }, () => makeEntry('water', 'proud'));
        expect(recalculateFromEntries(manyPositive)).toBe(100);
    });
});