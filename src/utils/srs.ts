import { Card, CardState, NextIntervalEstimate, ReviewRating } from '../types';

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;

const ONE_MINUTE_MS = 60 * 1000;
const TEN_MINUTES_MS = 10 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function formatIntervalDisplay(milliseconds: number): string {
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) return '< 1m';
  
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  
  const months = (days / 30.44).toFixed(1);
  if (parseFloat(months) < 12) {
    return months.endsWith('.0') ? `${Math.round(parseFloat(months))}mo` : `${months}mo`;
  }
  
  const years = (days / 365.25).toFixed(1);
  return years.endsWith('.0') ? `${Math.round(parseFloat(years))}y` : `${years}y`;
}

export function calculateNextReview(card: Card, rating: ReviewRating, now: number = Date.now()): NextIntervalEstimate {
  const ease = card.easeFactor || DEFAULT_EASE_FACTOR;
  const currentInterval = card.interval || 0;
  const currentState = card.state || 'new';

  if (currentState === 'new' || currentState === 'learning' || currentState === 'relearning') {
    // Learning Phase Steps
    switch (rating) {
      case 'again': {
        const nextDue = now + ONE_MINUTE_MS;
        return {
          label: '< 1m',
          days: 0,
          dueTimestamp: nextDue,
          nextState: 'learning',
          nextEase: Math.max(MIN_EASE_FACTOR, ease - 0.2),
          nextInterval: 0,
          nextReps: 0,
          nextLapses: card.lapses + 1
        };
      }
      case 'hard': {
        const nextDue = now + 6 * ONE_MINUTE_MS;
        return {
          label: '6m',
          days: 0,
          dueTimestamp: nextDue,
          nextState: 'learning',
          nextEase: Math.max(MIN_EASE_FACTOR, ease - 0.15),
          nextInterval: 0,
          nextReps: card.repetitions,
          nextLapses: card.lapses
        };
      }
      case 'good': {
        if (currentState === 'new') {
          // Graduating to 1 day
          const nextDue = now + ONE_DAY_MS;
          return {
            label: '1d',
            days: 1,
            dueTimestamp: nextDue,
            nextState: 'review',
            nextEase: ease,
            nextInterval: 1,
            nextReps: 1,
            nextLapses: card.lapses
          };
        } else {
          // In learning step 2 -> Graduate to 1 day
          const nextDue = now + ONE_DAY_MS;
          return {
            label: '1d',
            days: 1,
            dueTimestamp: nextDue,
            nextState: 'review',
            nextEase: ease,
            nextInterval: 1,
            nextReps: card.repetitions + 1,
            nextLapses: card.lapses
          };
        }
      }
      case 'easy': {
        // Fast-track graduation: 4 days
        const nextDue = now + 4 * ONE_DAY_MS;
        return {
          label: '4d',
          days: 4,
          dueTimestamp: nextDue,
          nextState: 'review',
          nextEase: ease + 0.15,
          nextInterval: 4,
          nextReps: 1,
          nextLapses: card.lapses
        };
      }
    }
  } else {
    // Review Phase (Mature or Young Review Cards)
    switch (rating) {
      case 'again': {
        // Lapsed card -> enters relearning
        const nextDue = now + TEN_MINUTES_MS;
        return {
          label: '10m',
          days: 0,
          dueTimestamp: nextDue,
          nextState: 'relearning',
          nextEase: Math.max(MIN_EASE_FACTOR, ease - 0.2),
          nextInterval: 0,
          nextReps: 0,
          nextLapses: card.lapses + 1
        };
      }
      case 'hard': {
        const nextDays = Math.max(1, Math.round(currentInterval * 1.2));
        const nextDue = now + nextDays * ONE_DAY_MS;
        return {
          label: `${nextDays}d`,
          days: nextDays,
          dueTimestamp: nextDue,
          nextState: 'review',
          nextEase: Math.max(MIN_EASE_FACTOR, ease - 0.15),
          nextInterval: nextDays,
          nextReps: card.repetitions + 1,
          nextLapses: card.lapses
        };
      }
      case 'good': {
        let nextDays = 1;
        if (currentInterval === 0) {
          nextDays = 1;
        } else if (currentInterval === 1) {
          nextDays = 6;
        } else {
          nextDays = Math.max(currentInterval + 1, Math.round(currentInterval * ease));
        }
        const nextDue = now + nextDays * ONE_DAY_MS;
        return {
          label: formatIntervalDisplay(nextDays * ONE_DAY_MS),
          days: nextDays,
          dueTimestamp: nextDue,
          nextState: 'review',
          nextEase: ease,
          nextInterval: nextDays,
          nextReps: card.repetitions + 1,
          nextLapses: card.lapses
        };
      }
      case 'easy': {
        let nextDays = 4;
        if (currentInterval === 0) {
          nextDays = 4;
        } else {
          nextDays = Math.max(currentInterval + 2, Math.round(currentInterval * ease * 1.3));
        }
        const nextDue = now + nextDays * ONE_DAY_MS;
        return {
          label: formatIntervalDisplay(nextDays * ONE_DAY_MS),
          days: nextDays,
          dueTimestamp: nextDue,
          nextState: 'review',
          nextEase: ease + 0.15,
          nextInterval: nextDays,
          nextReps: card.repetitions + 1,
          nextLapses: card.lapses
        };
      }
    }
  }
}

export function isCardDue(card: Card, now: number = Date.now()): boolean {
  if (card.state === 'suspended') return false;
  if (card.state === 'new') return true;
  return card.due <= now;
}

export function getCardBadgeColor(state: CardState): { bg: string; text: string; label: string } {
  switch (state) {
    case 'new':
      return { bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-400', label: 'New' };
    case 'learning':
      return { bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', label: 'Learning' };
    case 'relearning':
      return { bg: 'bg-rose-500/15 border-rose-500/30', text: 'text-rose-400', label: 'Relearning' };
    case 'review':
      return { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400', label: 'Review' };
    case 'suspended':
      return { bg: 'bg-slate-500/15 border-slate-500/30', text: 'text-slate-400', label: 'Suspended' };
  }
}
