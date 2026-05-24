import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { getFrequencyStats } from '@/analysis/frequency-engine';

export async function GET() {
  const db = getDb();

  const lastRun = db.prepare(`
    SELECT * FROM analysis_runs ORDER BY run_at DESC LIMIT 1
  `).get() as Record<string, unknown> | undefined;

  const sourceLog = lastRun
    ? db.prepare(`
        SELECT source_name, source_url, http_status, parse_status, items_found, error_message
        FROM exam_sources WHERE run_id = ?
        ORDER BY id
      `).all((lastRun as { id: number }).id)
    : [];

  const hasScores = (db.prepare(
    `SELECT COUNT(*) as c FROM frequency_scores`
  ).get() as { c: number }).c > 0;

  const stats = hasScores ? getFrequencyStats(db) : null;

  return NextResponse.json({ last_run: lastRun ?? null, source_log: sourceLog, stats });
}
