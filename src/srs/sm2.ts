export type Rating = '忘れた' | '難しい' | '普通' | '簡単';

// SM-2 quality mapping
// 忘れた = blackout (0), 難しい = incorrect/hard (2), 普通 = correct with effort (3), 簡単 = perfect (5)
const QUALITY: Record<Rating, number> = {
  '忘れた': 0,
  '難しい': 2,
  '普通':   3,
  '簡単':   5,
};

export interface CardState {
  repetitions: number;
  interval: number;    // days until next review
  ease_factor: number; // EF, minimum 1.3, starts at 2.5
}

export interface ReviewResult extends CardState {
  quality: number;
  next_review_at: string; // ISO date YYYY-MM-DD
}

export const INITIAL_STATE: CardState = {
  repetitions: 0,
  interval: 1,
  ease_factor: 2.5,
};

export function applyRating(state: CardState, rating: Rating): ReviewResult {
  const q = QUALITY[rating];

  // SM-2 EF update formula
  const newEF = Math.max(
    1.3,
    state.ease_factor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  let reps: number;
  let interval: number;

  if (q < 3) {
    // Failed: restart learning phase
    reps = 0;
    interval = 1;
  } else {
    reps = state.repetitions + 1;
    if (reps === 1)      interval = 1;
    else if (reps === 2) interval = 6;
    else                 interval = Math.round(state.interval * newEF);
  }

  const next = new Date();
  next.setDate(next.getDate() + interval);
  const next_review_at = next.toISOString().split('T')[0];

  return { repetitions: reps, interval, ease_factor: newEF, quality: q, next_review_at };
}

// Estimate next interval without mutating state (for button labels)
export function estimateNextInterval(state: CardState, rating: Rating): number {
  return applyRating(state, rating).interval;
}
