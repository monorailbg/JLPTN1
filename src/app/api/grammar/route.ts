import { NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page   = parseInt(searchParams.get('page')   ?? '1');
  const limit  = parseInt(searchParams.get('limit')  ?? '50');
  const sort   = searchParams.get('sort') ?? 'frequency';   // 'frequency' | 'id'
  const offset = (page - 1) * limit;

  const db = getDb();

  const orderBy = sort === 'frequency'
    ? 'COALESCE(fs.frequency_score, 0) DESC, g.id ASC'
    : 'g.id ASC';

  const items = db.prepare(`
    SELECT
      g.*,
      COALESCE(fs.frequency_score, 0)  AS frequency_score,
      COALESCE(fs.exam_count,      0)  AS exam_count,
      COALESCE(fs.question_count,  0)  AS question_count,
      fs.last_seen_year,
      fs.score_basis
    FROM grammar g
    LEFT JOIN frequency_scores fs
      ON fs.item_type = 'grammar' AND fs.item_id = g.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = (db.prepare('SELECT COUNT(*) as c FROM grammar').get() as { c: number }).c;
  return NextResponse.json({ items, total, page, limit, sort });
}
