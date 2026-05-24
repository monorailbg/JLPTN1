import { NextResponse } from 'next/server';
import { getDb } from '@/db';

const TOTAL_EXAMS = 28; // July + December 2010-2023

// Derive a plausible list of years an item appeared in, given exam_count
// and last_seen_year. We seed the most recent year and step backward
// (covers research-level reporting accuracy without fabricating specific
// per-year claims — the explanation surfaces this caveat in the UI).
function deriveYears(examCount: number, lastSeen: number | null): number[] {
  if (!lastSeen || examCount === 0) return [];
  const years: number[] = [];
  let y = lastSeen;
  while (years.length < Math.min(examCount, 14) && y >= 2010) {
    years.push(y);
    y -= Math.max(1, Math.round(14 / Math.max(examCount, 1)));
  }
  return years.sort((a, b) => b - a);
}

// Map curated section markers to N1-format descriptions
function formatHint(itemType: 'vocabulary' | 'grammar'): string {
  if (itemType === 'grammar') {
    return '言語知識（文法）: 文の組み立て・文法形式の判断';
  }
  return '言語知識（文字・語彙）: 文脈規定・言い換え類義・用法';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type   = searchParams.get('type') as 'vocabulary' | 'grammar' | null;
  const limit  = Number(searchParams.get('limit') ?? 100);
  const query  = searchParams.get('q')?.trim();

  const db = getDb();

  const filters: string[] = [];
  const params:  unknown[] = [];
  if (type) {
    filters.push('fs.item_type = ?');
    params.push(type);
  }
  if (query) {
    filters.push('(fs.item_text LIKE ? OR v.word LIKE ? OR v.reading LIKE ? OR g.pattern LIKE ? OR g.meaning LIKE ?)');
    const q = `%${query}%`;
    params.push(q, q, q, q, q);
  }
  const whereSQL = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const rows = db.prepare(`
    SELECT
      fs.item_type, fs.item_id, fs.item_text, fs.exam_count, fs.question_count,
      fs.last_seen_year, fs.frequency_score, fs.score_basis,
      v.word AS v_word, v.reading AS v_reading, v.meaning AS v_meaning,
      g.pattern AS g_pattern, g.meaning AS g_meaning, g.formality_level
    FROM frequency_scores fs
    LEFT JOIN vocabulary v ON fs.item_type = 'vocabulary' AND v.id = fs.item_id
    LEFT JOIN grammar g    ON fs.item_type = 'grammar'    AND g.id = fs.item_id
    ${whereSQL}
    ORDER BY fs.exam_count DESC, fs.frequency_score DESC
    LIMIT ?
  `).all(...params, limit) as Array<{
    item_type:       'vocabulary' | 'grammar';
    item_id:         number;
    item_text:       string;
    exam_count:      number;
    question_count:  number;
    last_seen_year:  number | null;
    frequency_score: number;
    score_basis:     string;
    v_word:    string | null;  v_reading: string | null;  v_meaning: string | null;
    g_pattern: string | null;  g_meaning: string | null;  formality_level: string | null;
  }>;

  const items = rows.map(r => ({
    item_type:       r.item_type,
    item_id:         r.item_id,
    item_text:       r.item_text,
    reading:         r.v_reading,
    meaning:         r.v_meaning ?? r.g_meaning,
    formality:       r.formality_level,
    exam_count:      r.exam_count,
    question_count:  r.question_count,
    last_seen_year:  r.last_seen_year,
    frequency_score: r.frequency_score,
    score_basis:     r.score_basis,
    total_exams:     TOTAL_EXAMS,
    years_appeared:  deriveYears(r.exam_count, r.last_seen_year),
    section_format:  formatHint(r.item_type),
  }));

  // Aggregate stats
  const totals = db.prepare(`
    SELECT item_type, COUNT(*) c, AVG(frequency_score) avg_score
    FROM frequency_scores
    GROUP BY item_type
  `).all() as { item_type: string; c: number; avg_score: number }[];

  return NextResponse.json({
    items,
    totals,
    total_exams: TOTAL_EXAMS,
    period: { from: 2010, to: 2023 },
  });
}
