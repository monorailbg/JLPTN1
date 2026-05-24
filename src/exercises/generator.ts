// Auto-generates fill-in-the-blank exercises from existing grammar rows.
// For each grammar pattern, we strip the leading 〜, expand ／-alternatives,
// locate the pattern within example_jp, and replace it with a blank. Three
// distractor options are sampled from other grammar patterns of similar
// formality_level when possible.

import type Database from 'better-sqlite3';

interface GrammarRow {
  pattern: string;
  meaning: string;
  example_jp: string | null;
  example_en: string | null;
  notes: string | null;
  formality_level: string;
}

// Expand 〜に際して／に際し → ['に際して', 'に際し'] (longest first)
function patternVariants(pattern: string): string[] {
  const cleaned = pattern.replace(/^〜/, '').replace(/[（(].*?[）)]/g, '');
  return cleaned
    .split(/[／/]/)
    .map(s => s.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

function findVariantInSentence(sentence: string, variants: string[]): string | null {
  for (const v of variants) if (sentence.includes(v)) return v;
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(
  correct: string,
  pool: GrammarRow[],
  count: number,
): string[] {
  const candidates = pool
    .map(r => patternVariants(r.pattern)[0])
    .filter((v): v is string => !!v && v !== correct);
  const unique = Array.from(new Set(candidates));
  return shuffle(unique).slice(0, count);
}

export interface GeneratedExercise {
  type: 'fill_blank';
  grammar_pattern: string;
  prompt_jp: string;
  prompt_en: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation_jp: string;
  explanation_en: string;
  nuance_note: string;
}

export function generateFillBlankExercises(db: Database.Database): GeneratedExercise[] {
  const grammar = db.prepare(`
    SELECT pattern, meaning, example_jp, example_en, notes, formality_level
    FROM grammar
    WHERE example_jp IS NOT NULL AND example_jp != ''
  `).all() as GrammarRow[];

  const exercises: GeneratedExercise[] = [];

  for (const row of grammar) {
    if (!row.example_jp) continue;
    const variants = patternVariants(row.pattern);
    if (variants.length === 0) continue;

    const matched = findVariantInSentence(row.example_jp, variants);
    if (!matched) continue;

    // Same-formality pool first; fall back to all
    const samePool = grammar.filter(g => g.formality_level === row.formality_level && g.pattern !== row.pattern);
    const pool     = samePool.length >= 3 ? samePool : grammar.filter(g => g.pattern !== row.pattern);

    const distractors = pickDistractors(matched, pool, 3);
    if (distractors.length < 3) continue;

    const allOptions = shuffle([matched, ...distractors]) as [string, string, string, string];
    const correctIdx = allOptions.indexOf(matched);

    const blanked = row.example_jp.replace(matched, '＿＿＿');

    exercises.push({
      type: 'fill_blank',
      grammar_pattern: row.pattern,
      prompt_jp: blanked,
      prompt_en: row.example_en ?? '',
      options: allOptions,
      correct_index: correctIdx,
      explanation_jp: `正解は「${matched}」。${row.meaning}（${row.formality_level}）。${row.notes ?? ''}`.trim(),
      explanation_en: `Correct: ${matched}. ${row.meaning}.`,
      nuance_note: row.notes ?? '',
    });
  }

  return exercises;
}
