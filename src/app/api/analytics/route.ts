import { NextResponse } from 'next/server';
import { getDb } from '@/db';

const USER_ID = 'local';

export async function GET() {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  // ─── Vocab mastery ────────────────────────────────────────────────────────
  const totalN1   = (db.prepare(`SELECT COUNT(*) c FROM vocabulary WHERE jlpt_level = 'N1'`).get() as { c: number }).c;
  const introduced = (db.prepare(`SELECT COUNT(*) c FROM srs_cards WHERE user_id = ? AND item_type = 'vocabulary'`).get(USER_ID) as { c: number }).c;
  const mature    = (db.prepare(`SELECT COUNT(*) c FROM srs_cards WHERE user_id = ? AND item_type = 'vocabulary' AND interval >= 21`).get(USER_ID) as { c: number }).c;
  const learning  = introduced - mature;
  const dueToday  = (db.prepare(`SELECT COUNT(*) c FROM srs_cards WHERE user_id = ? AND item_type = 'vocabulary' AND next_review_at <= ?`).get(USER_ID, today) as { c: number }).c;

  // ─── Per-pattern grammar accuracy ─────────────────────────────────────────
  const perPattern = db.prepare(`
    SELECT
      grammar_pattern AS pattern,
      COUNT(*) AS attempts,
      SUM(correct) AS correct
    FROM exercise_attempts
    WHERE user_id = ? AND grammar_pattern IS NOT NULL
    GROUP BY grammar_pattern
    ORDER BY attempts DESC
  `).all(USER_ID) as { pattern: string; attempts: number; correct: number }[];

  const patternAccuracy = perPattern.map(p => ({
    pattern:  p.pattern,
    attempts: p.attempts,
    correct:  p.correct,
    accuracy: p.attempts > 0 ? Math.round((p.correct / p.attempts) * 100) : 0,
  }));

  // ─── Weak areas (high attempts, low accuracy) ─────────────────────────────
  const weakAreas = patternAccuracy
    .filter(p => p.attempts >= 2)
    .map(p => ({ ...p, error_rate: 100 - p.accuracy }))
    .sort((a, b) => b.error_rate - a.error_rate || b.attempts - a.attempts)
    .slice(0, 10);

  // ─── Daily activity heatmap (last 365 days) ───────────────────────────────
  // Combine: srs_reviews + exercise_attempts + progress
  const activityRows = db.prepare(`
    SELECT date(reviewed_at) AS day, COUNT(*) AS n
    FROM srs_reviews
    WHERE user_id = ? AND date(reviewed_at) >= date('now', '-365 days')
    GROUP BY day
    UNION ALL
    SELECT date(attempted_at) AS day, COUNT(*) AS n
    FROM exercise_attempts
    WHERE user_id = ? AND date(attempted_at) >= date('now', '-365 days')
    GROUP BY day
    UNION ALL
    SELECT date(reviewed_at) AS day, COUNT(*) AS n
    FROM progress
    WHERE user_id = ? AND date(reviewed_at) >= date('now', '-365 days')
    GROUP BY day
  `).all(USER_ID, USER_ID, USER_ID) as { day: string; n: number }[];

  const dailyMap = new Map<string, number>();
  for (const r of activityRows) {
    dailyMap.set(r.day, (dailyMap.get(r.day) ?? 0) + r.n);
  }
  // Build a dense 365-day grid back from today
  const heatmap: { date: string; count: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    heatmap.push({ date: iso, count: dailyMap.get(iso) ?? 0 });
  }

  // ─── Exam readiness score ─────────────────────────────────────────────────
  // 1. frequency_coverage: of high-frequency N1 items, how many have been introduced?
  const freqCoverage = db.prepare(`
    SELECT
      COALESCE(SUM(fs.frequency_score), 0)                                    AS covered,
      COALESCE((SELECT SUM(frequency_score) FROM frequency_scores WHERE item_type = 'vocabulary'), 0) AS total
    FROM frequency_scores fs
    INNER JOIN srs_cards sc
      ON sc.item_type = 'vocabulary' AND sc.item_id = fs.item_id
    WHERE fs.item_type = 'vocabulary' AND sc.user_id = ?
  `).get(USER_ID) as { covered: number; total: number };

  const coveragePct = freqCoverage.total > 0
    ? Math.round((freqCoverage.covered / freqCoverage.total) * 100)
    : 0;

  // 2. mature_pct: depth of learning
  const maturePct = introduced > 0 ? Math.round((mature / introduced) * 100) : 0;

  // 3. exercise_accuracy
  const allAttempts = db.prepare(`
    SELECT COUNT(*) AS total, SUM(correct) AS correct
    FROM exercise_attempts WHERE user_id = ?
  `).get(USER_ID) as { total: number; correct: number };
  const exerciseAccuracy = allAttempts.total > 0
    ? Math.round((allAttempts.correct / allAttempts.total) * 100)
    : 0;

  // 4. composite (weighted): 40% coverage, 30% mature depth, 30% exercise accuracy
  const readiness = Math.round(
    coveragePct        * 0.40 +
    maturePct          * 0.30 +
    exerciseAccuracy   * 0.30
  );

  // ─── Recent rating distribution (last 7d) ─────────────────────────────────
  const recentRatings = db.prepare(`
    SELECT rating, COUNT(*) c FROM srs_reviews
    WHERE user_id = ? AND date(reviewed_at) >= date('now', '-7 days')
    GROUP BY rating
  `).all(USER_ID) as { rating: string; c: number }[];

  // ─── Streak ───────────────────────────────────────────────────────────────
  const streakDates = db.prepare(`
    SELECT date FROM streaks WHERE user_id = ? ORDER BY date DESC LIMIT 365
  `).all(USER_ID) as { date: string }[];

  let streak = 0;
  const todayD = new Date();
  for (const { date } of streakDates) {
    const expected = new Date(todayD);
    expected.setDate(todayD.getDate() - streak);
    if (date === expected.toISOString().split('T')[0]) streak++;
    else break;
  }
  const totalActiveDays = streakDates.length;

  return NextResponse.json({
    vocab_mastery: {
      total:        totalN1,
      introduced,
      mature,
      learning,
      new_cards:    totalN1 - introduced,
      due_today:    dueToday,
      mastery_pct:  maturePct,
      coverage_pct: introduced > 0 ? Math.round((introduced / totalN1) * 100) : 0,
    },
    pattern_accuracy: patternAccuracy,
    weak_areas:       weakAreas,
    heatmap,
    readiness: {
      score:              readiness,
      coverage_pct:       coveragePct,
      mature_pct:         maturePct,
      exercise_accuracy:  exerciseAccuracy,
      total_attempts:     allAttempts.total,
    },
    recent_ratings: recentRatings,
    streak: {
      current_streak:    streak,
      total_active_days: totalActiveDays,
    },
  });
}
