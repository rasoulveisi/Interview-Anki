import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateNextReview, isCardDue, formatIntervalDisplay, MIN_EASE_FACTOR } from './srs';
import type { Card } from '../types';

const now = 1_700_000_000_000;

function buildCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card_1',
    userId: 'u1',
    deckId: 'deck_1',
    front: 'Q',
    back: 'A',
    tags: ['tag'],
    state: 'new',
    due: now,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    lapses: 0,
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    ...overrides
  };
}

describe('calculateNextReview', () => {
  test('graduates new card to review after good', () => {
    const result = calculateNextReview(buildCard(), 'good', now);

    assert.equal(result.nextState, 'review');
    assert.equal(result.nextInterval, 1);
    assert.equal(result.days, 1);
    assert.equal(result.nextReps, 1);
    assert.equal(result.nextLapses, 0);
    assert.equal(result.dueTimestamp, now + 24 * 60 * 60 * 1000);
    assert.equal(result.label, '1d');
  });

  test('moves learning card to learning with 6m after hard', () => {
    const result = calculateNextReview(buildCard({ state: 'learning', due: now }), 'hard', now);

    assert.equal(result.nextState, 'learning');
    assert.equal(result.label, '6m');
    assert.equal(result.days, 0);
    assert.equal(result.dueTimestamp, now + 6 * 60 * 1000);
  });

  test('relearning on review again uses minimum ease floor', () => {
    const result = calculateNextReview(
      buildCard({ state: 'review', interval: 5, lapses: 1, easeFactor: 1.05 }),
      'again',
      now
    );

    assert.equal(result.nextState, 'relearning');
    assert.equal(result.days, 0);
    assert.equal(result.nextEase, MIN_EASE_FACTOR);
    assert.equal(result.nextReps, 0);
    assert.equal(result.nextLapses, 2);
    assert.equal(result.dueTimestamp, now + 10 * 60 * 1000);
  });

  test('hard review keeps at least 1 day for small intervals', () => {
    const result = calculateNextReview(buildCard({ state: 'review', interval: 1 }), 'hard', now);

    assert.equal(result.nextState, 'review');
    assert.equal(result.nextInterval, 1);
    assert.equal(result.days, 1);
    assert.equal(result.dueTimestamp, now + 24 * 60 * 60 * 1000);
  });

  test('good review grows interval by ease multiplier', () => {
    const result = calculateNextReview(buildCard({ state: 'review', interval: 6, easeFactor: 2.0 }), 'good', now);

    assert.equal(result.nextState, 'review');
    assert.equal(result.nextInterval, 12);
    assert.equal(result.dueTimestamp, now + 12 * 24 * 60 * 60 * 1000);
    assert.equal(result.nextReps, 1);
  });
});

describe('isCardDue', () => {
  test('suspends due check to false', () => {
    const suspended = buildCard({ state: 'suspended' });
    assert.equal(isCardDue({ ...suspended, due: now - 10_000 }, now), false);
  });

  test('treats new cards as always due', () => {
    const newCard = buildCard({ state: 'new', due: now + 10_000 });
    assert.equal(isCardDue(newCard, now), true);
  });

  test('checks interval against now for review cards', () => {
    const dueCard = buildCard({ state: 'review', due: now - 1 });
    const notDueCard = buildCard({ state: 'review', due: now + 1_000 });

    assert.equal(isCardDue(dueCard, now), true);
    assert.equal(isCardDue(notDueCard, now), false);
  });
});

describe('formatIntervalDisplay', () => {
  test('formats short minute/ hour and day buckets', () => {
    assert.equal(formatIntervalDisplay(30 * 1000), '< 1m');
    assert.equal(formatIntervalDisplay(50 * 60 * 1000), '50m');
    assert.equal(formatIntervalDisplay(5 * 60 * 60 * 1000), '5h');
    assert.equal(formatIntervalDisplay(3 * 24 * 60 * 60 * 1000), '3d');
  });
});
