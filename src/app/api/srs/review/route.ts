import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { applyRating, INITIAL_STATE, type Rating } from '@/srs/sm2';

const USER_ID = 'local';
const VALID_RATINGS = new Set<string>(['忘れた', '難しい', '普通', '簡単']);

export async function POST(request: Request) {
  const body = await request.json();
  const { itemId, rating } = body as { itemId: number; rating: string };

  if (typeof itemId !== 'number' || !VALID_RATINGS.has(rating)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const db = getDb();

  // Strict N1-only filter — reject anything not tagged N1
  const vocab = db.prepare(
    `SELECT id FROM vocabulary WHERE id = ? AND jlpt_level = 'N1'`
  ).get(itemId) as { id: number } | undefined;

  if (!vocab) {
    return NextResponse.json(
      { error: 'Item not found or jlpt_level is not N1' },
      { status: 404 }
    );
  }

  // Fetch current SM-2 state (null = first review)
  const existing = db.prepare(`
    SELECT repetitions, interval, ease_factor
    FROM srs_cards
    WHERE user_id = ? AND item_type = 'vocabulary' AND item_id = ?
  `).get(USER_ID, itemId) as
    | { repetitions: number; interval: number; ease_factor: number }
    | undefined;

  const current = existing ?? INITIAL_STATE;
  const result = applyRating(current, rating as Rating);

  db.transaction(() => {
    // Upsert scheduling state
    db.prepare(`
      INSERT INTO srs_cards
        (user_id, item_type, item_id, repetitions, interval, ease_factor, next_review_at, last_reviewed_at)
      VALUES (?, 'vocabulary', ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, item_type, item_id) DO UPDATE SET
        repetitions     = excluded.repetitions,
        interval        = excluded.interval,
        ease_factor     = excluded.ease_factor,
        next_review_at  = excluded.next_review_at,
        last_reviewed_at = datetime('now')
    `).run(USER_ID, itemId, result.repetitions, result.interval, result.ease_factor, result.next_review_at);

    // Append full history row
    db.prepare(`
      INSERT INTO srs_reviews
        (user_id, item_type, item_id, rating, quality,
         ease_factor_before, ease_factor_after,
         interval_before, interval_after)
      VALUES (?, 'vocabulary', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      USER_ID, itemId, rating, result.quality,
      current.ease_factor, result.ease_factor,
      current.interval, result.interval
    );

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`INSERT OR IGNORE INTO streaks (user_id, date) VALUES (?, ?)`).run(USER_ID, today);
  })();

  return NextResponse.json({
    next_review_at: result.next_review_at,
    interval:       result.interval,
    repetitions:    result.repetitions,
    ease_factor:    result.ease_factor,
  });
}
