import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { runAnalysis } from '@/analysis/runner';

export async function POST() {
  try {
    const db = getDb();

    // Guard: don't run if another analysis is already in progress.
    const running = db.prepare(
      `SELECT id FROM analysis_runs WHERE status = 'running' ORDER BY run_at DESC LIMIT 1`
    ).get() as { id: number } | undefined;

    if (running) {
      return NextResponse.json(
        { error: 'An analysis is already in progress.', run_id: running.id },
        { status: 409 }
      );
    }

    const summary = await runAnalysis(db);
    return NextResponse.json(summary, { status: summary.status === 'complete' ? 200 : 500 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
