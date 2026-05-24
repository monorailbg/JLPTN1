import { NextResponse } from 'next/server';
import { getDb } from '@/db';

const NEW_CARDS_PER_SESSION = 20;
const USER_ID = 'local';

export async function GET() {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  // Due cards: already introduced, review date reached, N1 only
  const due = db.prepare(`
    SELECT
      v.id, v.word, v.reading, v.meaning, v.example_jp, v.example_en,
      v.category, v.jlpt_level,
      COALESCE(fs.frequency_score, 0)  AS frequency_score,
      COALESCE(fs.exam_count, 0)       AS exam_count,
      COALESCE(fs.question_count, 0)   AS question_count,
      fs.last_seen_year,
      sc.repetitions, sc.interval, sc.ease_factor, sc.next_review_at,
      0 AS is_new
    FROM srs_cards sc
    JOIN vocabulary v ON v.id = sc.item_id
    LEFT JOIN frequency_scores fs
      ON fs.item_type = 'vocabulary' AND fs.item_id = v.id
    WHERE sc.user_id    = ?
      AND sc.item_type  = 'vocabulary'
      AND v.jlpt_level  = 'N1'
      AND sc.next_review_at <= ?
    ORDER BY sc.next_review_at ASC
  `).all(USER_ID, today);

  // New cards: never introduced, N1 only, highest frequency first
  const newCards = db.prepare(`
    SELECT
      v.id, v.word, v.reading, v.meaning, v.example_jp, v.example_en,
      v.category, v.jlpt_level,
      COALESCE(fs.frequency_score, 0)  AS frequency_score,
      COALESCE(fs.exam_count, 0)       AS exam_count,
      COALESCE(fs.question_count, 0)   AS question_count,
      fs.last_seen_year,
      0    AS repetitions,
      1    AS interval,
      2.5  AS ease_factor,
      ?    AS next_review_at,
      1    AS is_new
    FROM vocabulary v
    LEFT JOIN frequency_scores fs
      ON fs.item_type = 'vocabulary' AND fs.item_id = v.id
    WHERE v.jlpt_level = 'N1'
      AND v.id NOT IN (
        SELECT item_id FROM srs_cards
        WHERE user_id = ? AND item_type = 'vocabulary'
      )
    ORDER BY COALESCE(fs.frequency_score, 0) DESC,
             COALESCE(v.frequency_rank, 9999) ASC,
             v.id ASC
    LIMIT ?
  `).all(today, USER_ID, NEW_CARDS_PER_SESSION);

  const queue = [...due, ...newCards];

  return NextResponse.json({
    queue,
    due_count: due.length,
    new_count: newCards.length,
    total: queue.length,
  });
}
