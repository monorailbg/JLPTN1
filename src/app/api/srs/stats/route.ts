import { NextResponse } from 'next/server';
import { getDb } from '@/db';

const USER_ID = 'local';

export async function GET() {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const totalN1 = (db.prepare(
    `SELECT COUNT(*) AS c FROM vocabulary WHERE jlpt_level = 'N1'`
  ).get() as { c: number }).c;

  const introduced = (db.prepare(
    `SELECT COUNT(*) AS c FROM srs_cards WHERE user_id = ? AND item_type = 'vocabulary'`
  ).get(USER_ID) as { c: number }).c;

  const dueToday = (db.prepare(`
    SELECT COUNT(*) AS c
    FROM srs_cards sc
    JOIN vocabulary v ON v.id = sc.item_id
    WHERE sc.user_id = ? AND sc.item_type = 'vocabulary'
      AND v.jlpt_level = 'N1'
      AND sc.next_review_at <= ?
  `).get(USER_ID, today) as { c: number }).c;

  const mature = (db.prepare(
    `SELECT COUNT(*) AS c FROM srs_cards WHERE user_id = ? AND item_type = 'vocabulary' AND interval >= 21`
  ).get(USER_ID) as { c: number }).c;

  const reviewsToday = (db.prepare(
    `SELECT COUNT(*) AS c FROM srs_reviews WHERE user_id = ? AND date(reviewed_at) = ?`
  ).get(USER_ID, today) as { c: number }).c;

  const avgEaseRow = db.prepare(
    `SELECT AVG(ease_factor) AS avg FROM srs_cards WHERE user_id = ? AND item_type = 'vocabulary'`
  ).get(USER_ID) as { avg: number | null };

  const todayRatings = db.prepare(`
    SELECT rating, COUNT(*) AS count
    FROM srs_reviews
    WHERE user_id = ? AND date(reviewed_at) = ?
    GROUP BY rating
  `).all(USER_ID, today) as { rating: string; count: number }[];

  return NextResponse.json({
    total_n1_vocab: totalN1,
    introduced,
    new_cards: totalN1 - introduced,
    due_today: dueToday,
    mature,
    avg_ease: avgEaseRow.avg ? Math.round(avgEaseRow.avg * 100) / 100 : 2.5,
    reviews_today: reviewsToday,
    today_ratings: todayRatings,
  });
}
