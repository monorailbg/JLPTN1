import Database from 'better-sqlite3';
import {
  grammarFrequency, vocabFrequency, computeScore,
  type CuratedEntry,
} from './curated-data';
import type { ParsedItem } from './parser';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScoreRow = {
  item_type: string;
  item_id: number;
  item_text: string;
  exam_count: number;
  question_count: number;
  last_seen_year: number | null;
  raw_score: number;
  frequency_score: number;
  score_basis: string;
};

export type FrequencyStats = {
  total_vocab_scored: number;
  total_grammar_scored: number;
  top_vocab: ScoreRow[];
  top_grammar: ScoreRow[];
  score_distribution: { bucket: string; count: number }[];
};

// ─── Apply curated data ───────────────────────────────────────────────────────

/**
 * Write curated frequency entries into frequency_scores.
 * Matches by word text + reading (vocab) or pattern text (grammar).
 * Returns the number of DB items updated.
 */
export function applyCuratedData(
  db: Database.Database,
  sourceId: number,
): number {
  const upsert = db.prepare(`
    INSERT INTO frequency_scores
      (item_type, item_id, item_text, exam_count, question_count,
       last_seen_year, raw_score, frequency_score, score_basis, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'curated', datetime('now'))
    ON CONFLICT(item_type, item_id) DO UPDATE SET
      exam_count      = MAX(exam_count, excluded.exam_count),
      question_count  = MAX(question_count, excluded.question_count),
      last_seen_year  = MAX(COALESCE(last_seen_year, 0), COALESCE(excluded.last_seen_year, 0)),
      raw_score       = excluded.raw_score,
      frequency_score = excluded.frequency_score,
      score_basis     = CASE
        WHEN score_basis = 'scraped' THEN 'mixed'
        ELSE 'curated'
      END,
      updated_at      = datetime('now')
  `);

  let updated = 0;

  const applyEntries = (entries: CuratedEntry[]) => {
    for (const entry of entries) {
      const dbId = resolveItemId(db, entry);
      if (dbId === null) continue;

      const raw   = computeScore(entry.exam_count, entry.question_count);
      upsert.run(
        entry.type, dbId, entry.text,
        entry.exam_count, entry.question_count,
        entry.last_seen_year, raw, raw,
      );
      updated++;

      // Record appearance for traceability
      db.prepare(`
        INSERT INTO exam_appearances
          (source_id, item_type, item_text, item_reading, exam_year, section)
        VALUES (?, ?, ?, ?, ?, 'curated')
      `).run(sourceId, entry.type, entry.text, entry.reading, entry.last_seen_year);
    }
  };

  db.transaction(() => {
    applyEntries(vocabFrequency);
    applyEntries(grammarFrequency);
  })();

  return updated;
}

// ─── Apply scraped data ───────────────────────────────────────────────────────

/**
 * Ingest parsed items from a live scrape.
 * Groups by item_text to build exam_count / question_count, then upserts scores.
 */
export function applyScrapedItems(
  db: Database.Database,
  sourceId: number,
  items: ParsedItem[],
  examYear: number,
): number {
  if (items.length === 0) return 0;

  const insertAppearance = db.prepare(`
    INSERT INTO exam_appearances
      (source_id, item_type, item_text, item_reading, exam_year, section, context)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const upsert = db.prepare(`
    INSERT INTO frequency_scores
      (item_type, item_id, item_text, exam_count, question_count,
       last_seen_year, raw_score, frequency_score, score_basis, updated_at)
    VALUES (?, ?, ?, 1, 1, ?, ?, ?, 'scraped', datetime('now'))
    ON CONFLICT(item_type, item_id) DO UPDATE SET
      exam_count     = exam_count + 1,
      question_count = question_count + 1,
      last_seen_year = MAX(COALESCE(last_seen_year, 0), excluded.last_seen_year),
      score_basis    = CASE
        WHEN score_basis = 'curated' THEN 'mixed'
        ELSE 'scraped'
      END,
      updated_at     = datetime('now')
  `);

  let processed = 0;

  db.transaction(() => {
    for (const item of items) {
      insertAppearance.run(
        sourceId, item.item_type, item.item_text, item.item_reading,
        examYear, item.section, item.context,
      );
      const dbId = resolveItemId(db, {
        type: item.item_type,
        text: item.item_text,
        reading: item.item_reading,
        exam_count: 1, question_count: 1, last_seen_year: examYear,
      });
      if (dbId === null) continue;
      const score = computeScore(1, 1);
      upsert.run(item.item_type, dbId, item.item_text, examYear, score, score);
      processed++;
    }
  })();

  // Re-normalise all scores after adding new scraped data.
  reNormalise(db, 'vocabulary');
  reNormalise(db, 'grammar');

  return processed;
}

// ─── Normalisation ────────────────────────────────────────────────────────────

/**
 * After accumulating raw scores from multiple sources, re-normalise to 0–100
 * so the max scored item always reads 100 and others scale proportionally.
 */
function reNormalise(db: Database.Database, itemType: 'vocabulary' | 'grammar') {
  const maxRow = db.prepare(`
    SELECT MAX(raw_score) as m FROM frequency_scores WHERE item_type = ?
  `).get(itemType) as { m: number | null };

  const max = maxRow?.m;
  if (!max || max === 0) return;

  db.prepare(`
    UPDATE frequency_scores
    SET frequency_score = ROUND((raw_score / ?) * 100, 1)
    WHERE item_type = ?
  `).run(max, itemType);
}

// ─── Helper: resolve DB id ─────────────────────────────────────────────────────

function resolveItemId(db: Database.Database, entry: CuratedEntry): number | null {
  if (entry.type === 'vocabulary') {
    // Match on word text first; fall back to reading match for multi-reading words.
    const row = db.prepare(
      `SELECT id FROM vocabulary WHERE word = ? LIMIT 1`
    ).get(entry.text) as { id: number } | undefined;
    if (row) return row.id;
    if (entry.reading) {
      const byReading = db.prepare(
        `SELECT id FROM vocabulary WHERE reading = ? AND word LIKE ? LIMIT 1`
      ).get(entry.reading, `%${entry.text.charAt(0)}%`) as { id: number } | undefined;
      return byReading?.id ?? null;
    }
    return null;
  } else {
    // Grammar: match on pattern text (exact or prefix).
    const row = db.prepare(
      `SELECT id FROM grammar WHERE pattern = ? LIMIT 1`
    ).get(entry.text) as { id: number } | undefined;
    if (row) return row.id;
    // Try prefix match — seed patterns may have slightly different suffix.
    const prefix = entry.text.split('／')[0].split('（')[0].trim();
    const byPrefix = db.prepare(
      `SELECT id FROM grammar WHERE pattern LIKE ? LIMIT 1`
    ).get(`${prefix}%`) as { id: number } | undefined;
    return byPrefix?.id ?? null;
  }
}

// ─── Stats query ──────────────────────────────────────────────────────────────

export function getFrequencyStats(db: Database.Database): FrequencyStats {
  const topVocab = db.prepare(`
    SELECT fs.*, v.word as item_text_display, v.reading
    FROM frequency_scores fs
    JOIN vocabulary v ON fs.item_id = v.id
    WHERE fs.item_type = 'vocabulary'
    ORDER BY fs.frequency_score DESC
    LIMIT 20
  `).all() as ScoreRow[];

  const topGrammar = db.prepare(`
    SELECT fs.*, g.pattern as item_text_display
    FROM frequency_scores fs
    JOIN grammar g ON fs.item_id = g.id
    WHERE fs.item_type = 'grammar'
    ORDER BY fs.frequency_score DESC
    LIMIT 20
  `).all() as ScoreRow[];

  const total_vocab_scored = (db.prepare(
    `SELECT COUNT(*) as c FROM frequency_scores WHERE item_type = 'vocabulary'`
  ).get() as { c: number }).c;

  const total_grammar_scored = (db.prepare(
    `SELECT COUNT(*) as c FROM frequency_scores WHERE item_type = 'grammar'`
  ).get() as { c: number }).c;

  // Bucket distribution: 0-19, 20-39, 40-59, 60-79, 80-100
  const buckets = ['0–19','20–39','40–59','60–79','80–100'];
  const ranges  = [[0,19],[20,39],[40,59],[60,79],[80,100]];
  const score_distribution = buckets.map((bucket, i) => {
    const [lo, hi] = ranges[i];
    const count = (db.prepare(`
      SELECT COUNT(*) as c FROM frequency_scores
      WHERE frequency_score >= ? AND frequency_score <= ?
    `).get(lo, hi) as { c: number }).c;
    return { bucket, count };
  });

  return { total_vocab_scored, total_grammar_scored, top_vocab: topVocab, top_grammar: topGrammar, score_distribution };
}
