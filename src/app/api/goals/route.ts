import { NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET() {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const goal = db.prepare(
    `SELECT daily_reviews, daily_exercises FROM study_goals WHERE user_id = 'local'`
  ).get() as { daily_reviews: number; daily_exercises: number } | undefined;

  const reviewsDone = (db.prepare(
    `SELECT COUNT(*) c FROM srs_reviews WHERE user_id = 'local' AND date(reviewed_at) = ?`
  ).get(today) as { c: number }).c;

  const exercisesDone = (db.prepare(
    `SELECT COUNT(*) c FROM exercise_attempts WHERE user_id = 'local' AND date(attempted_at) = ?`
  ).get(today) as { c: number }).c;

  const streak = (db.prepare(`
    WITH RECURSIVE dates(d, n) AS (
      SELECT date('now', 'localtime'), 0
      UNION ALL
      SELECT date(d, '-1 day'), n + 1 FROM dates WHERE n < 365
    )
    SELECT COUNT(*) c FROM dates
    WHERE EXISTS (
      SELECT 1 FROM srs_reviews
      WHERE user_id = 'local' AND date(reviewed_at) = dates.d
    )
    AND n <= (
      SELECT COALESCE(MAX(n), 0) FROM dates d2
      WHERE NOT EXISTS (
        SELECT 1 FROM srs_reviews
        WHERE user_id = 'local' AND date(reviewed_at) = d2.d
      ) AND d2.n > 0
    )
  `).get() as { c: number }).c;

  return NextResponse.json({
    goal: goal ?? { daily_reviews: 20, daily_exercises: 10 },
    today: { reviews_done: reviewsDone, exercises_done: exercisesDone },
    streak,
  });
}

export async function POST(request: Request) {
  const db = getDb();
  const { daily_reviews, daily_exercises } = await request.json() as {
    daily_reviews: number;
    daily_exercises: number;
  };

  if (!Number.isInteger(daily_reviews) || daily_reviews < 1 || daily_reviews > 200) {
    return NextResponse.json({ error: 'daily_reviews must be 1–200' }, { status: 400 });
  }
  if (!Number.isInteger(daily_exercises) || daily_exercises < 1 || daily_exercises > 100) {
    return NextResponse.json({ error: 'daily_exercises must be 1–100' }, { status: 400 });
  }

  db.prepare(`
    INSERT INTO study_goals (user_id, daily_reviews, daily_exercises)
    VALUES ('local', ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      daily_reviews = excluded.daily_reviews,
      daily_exercises = excluded.daily_exercises,
      updated_at = datetime('now')
  `).run(daily_reviews, daily_exercises);

  return NextResponse.json({ ok: true });
}
