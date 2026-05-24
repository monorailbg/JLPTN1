import { NextResponse } from 'next/server';
import { getDb } from '@/db';

const VALID_TYPES = new Set(['fill_blank', 'sentence_completion', 'error_identification']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type    = searchParams.get('type');
  const exclude = searchParams.get('exclude')?.split(',').map(Number).filter(Boolean) ?? [];

  if (type && !VALID_TYPES.has(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const db = getDb();

  // Join with frequency_scores to weight by exam relevance.
  // Higher frequency_score → higher pick probability via random * (1 + freq/50).
  const whereClauses: string[] = [];
  const params: unknown[] = [];
  if (type) {
    whereClauses.push('e.type = ?');
    params.push(type);
  }
  if (exclude.length > 0) {
    whereClauses.push(`e.id NOT IN (${exclude.map(() => '?').join(',')})`);
    params.push(...exclude);
  }
  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const rows = db.prepare(`
    SELECT
      e.id, e.type, e.grammar_pattern, e.prompt_jp, e.prompt_en, e.options_json,
      e.correct_index, e.explanation_jp, e.explanation_en, e.nuance_note, e.source,
      COALESCE(fs.frequency_score, 30) AS frequency_score
    FROM exercises e
    LEFT JOIN grammar g ON g.pattern = e.grammar_pattern
    LEFT JOIN frequency_scores fs
      ON fs.item_type = 'grammar' AND fs.item_id = g.id
    ${whereSQL}
  `).all(...params) as Array<{
    id: number;
    type: string;
    grammar_pattern: string | null;
    prompt_jp: string;
    prompt_en: string | null;
    options_json: string;
    correct_index: number;
    explanation_jp: string | null;
    explanation_en: string | null;
    nuance_note: string | null;
    source: string;
    frequency_score: number;
  }>;

  if (rows.length === 0) {
    return NextResponse.json({ exercise: null });
  }

  // Frequency-weighted random selection.
  // weight = max(0.5, 0.3 + frequency_score / 100)  — keeps low-freq items reachable.
  const weighted = rows.map(r => ({
    row:    r,
    weight: Math.max(0.5, 0.3 + (r.frequency_score / 100)),
  }));
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let pick = Math.random() * totalWeight;
  let chosen = weighted[0].row;
  for (const w of weighted) {
    pick -= w.weight;
    if (pick <= 0) { chosen = w.row; break; }
  }

  return NextResponse.json({
    exercise: {
      id:              chosen.id,
      type:            chosen.type,
      grammar_pattern: chosen.grammar_pattern,
      prompt_jp:       chosen.prompt_jp,
      prompt_en:       chosen.prompt_en,
      options:         JSON.parse(chosen.options_json) as string[],
      correct_index:   chosen.correct_index,
      explanation_jp:  chosen.explanation_jp,
      explanation_en:  chosen.explanation_en,
      nuance_note:     chosen.nuance_note,
      source:          chosen.source,
      frequency_score: chosen.frequency_score,
    },
  });
}
