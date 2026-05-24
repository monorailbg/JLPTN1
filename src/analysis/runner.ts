/**
 * Analysis Runner
 *
 * Pipeline:
 *   1. Create an analysis_run record (status = 'running')
 *   2. Attempt to fetch each source in scraper.SOURCES
 *   3. For each successful fetch, parse and ingest scraped items
 *   4. Apply curated frequency data (always runs — fills gaps left by blocked sources)
 *   5. Mark run complete; return summary
 *
 * This design means the system always produces useful frequency scores even when
 * every live source returns 403, which is currently the case for jlpt.jp and all
 * known community databases.
 */

import Database from 'better-sqlite3';
import { fetchAllSources } from './scraper';
import { getParser } from './parser';
import { applyCuratedData, applyScrapedItems } from './frequency-engine';

export type RunSummary = {
  run_id: number;
  status: 'complete' | 'failed';
  sources_attempted: number;
  sources_succeeded: number;
  sources_blocked: number;
  items_from_scrape: number;
  items_from_curated: number;
  total_scored: number;
  duration_ms: number;
  log: string[];
};

export async function runAnalysis(db: Database.Database): Promise<RunSummary> {
  const log: string[] = [];
  const t0 = Date.now();

  // ── 1. Create run record ──────────────────────────────────────────────────
  const runResult = db.prepare(`
    INSERT INTO analysis_runs (status, sources_attempted, sources_succeeded, items_scored)
    VALUES ('running', 0, 0, 0)
  `).run();
  const run_id = runResult.lastInsertRowid as number;
  log.push(`[run #${run_id}] Analysis started`);

  let sources_attempted  = 0;
  let sources_succeeded  = 0;
  let sources_blocked    = 0;
  let items_from_scrape  = 0;
  let items_from_curated = 0;

  try {
    // ── 2. Fetch all sources ────────────────────────────────────────────────
    log.push('Fetching live sources…');
    const fetchResults = await fetchAllSources(msg => log.push(msg));
    sources_attempted = fetchResults.length;

    const insertSource = db.prepare(`
      INSERT INTO exam_sources
        (run_id, source_type, source_name, source_url, year_from, year_to,
         http_status, parse_status, items_found, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    for (const result of fetchResults) {
      const parseStatus = result.http_status === 200
        ? 'ok'
        : result.error
          ? 'error'
          : `blocked_${result.http_status ?? 'unknown'}`;

      const sourceRow = insertSource.run(
        run_id,
        result.source.type,
        result.source.name,
        result.source.url,
        result.source.year_from,
        result.source.year_to,
        result.http_status,
        parseStatus,
        result.error,
      );
      const sourceId = sourceRow.lastInsertRowid as number;

      if (result.http_status === 200 && result.body) {
        // ── 3. Parse and ingest scraped items ────────────────────────────
        sources_succeeded++;
        const parser = getParser(result.source.parser);
        const items  = parser(result.body);
        log.push(`  Parsed ${items.length} items from ${result.source.name}`);

        if (items.length > 0) {
          const scraped = applyScrapedItems(
            db, sourceId, items, result.source.year_to
          );
          items_from_scrape += scraped;
          db.prepare(
            `UPDATE exam_sources SET items_found = ? WHERE id = ?`
          ).run(scraped, sourceId);
        }
      } else {
        const reason = result.error ?? `HTTP ${result.http_status}`;
        log.push(`  Skipped ${result.source.name}: ${reason}`);
        if (result.http_status === 403) sources_blocked++;
      }
    }

    // ── 4. Apply curated data ─────────────────────────────────────────────
    log.push('Applying curated frequency data…');
    const curatedSourceRow = db.prepare(`
      INSERT INTO exam_sources
        (run_id, source_type, source_name, source_url, year_from, year_to,
         http_status, parse_status, items_found)
      VALUES (?, 'curated', 'Curated N1 Research Dataset', NULL, 2010, 2023, NULL, 'ok', 0)
    `).run(run_id);
    const curatedSourceId = curatedSourceRow.lastInsertRowid as number;

    items_from_curated = applyCuratedData(db, curatedSourceId);
    db.prepare(`UPDATE exam_sources SET items_found = ? WHERE id = ?`)
      .run(items_from_curated, curatedSourceId);
    log.push(`  Applied curated data: ${items_from_curated} items scored`);

    // ── 5. Finalise run ───────────────────────────────────────────────────
    const total_scored = items_from_scrape + items_from_curated;
    const duration_ms  = Date.now() - t0;

    const summary = `Completed in ${duration_ms}ms. Sources: ${sources_attempted} attempted, ` +
      `${sources_succeeded} succeeded, ${sources_blocked} blocked (403). ` +
      `Scored: ${items_from_scrape} scraped + ${items_from_curated} curated = ${total_scored}.`;

    db.prepare(`
      UPDATE analysis_runs SET
        status             = 'complete',
        sources_attempted  = ?,
        sources_succeeded  = ?,
        items_scored       = ?,
        notes              = ?
      WHERE id = ?
    `).run(sources_attempted, sources_succeeded, total_scored, summary, run_id);

    log.push(summary);
    return {
      run_id, status: 'complete',
      sources_attempted, sources_succeeded, sources_blocked,
      items_from_scrape, items_from_curated, total_scored,
      duration_ms, log,
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    db.prepare(`UPDATE analysis_runs SET status = 'failed', notes = ? WHERE id = ?`)
      .run(msg, run_id);
    log.push(`FATAL: ${msg}`);
    return {
      run_id, status: 'failed',
      sources_attempted, sources_succeeded, sources_blocked,
      items_from_scrape, items_from_curated, total_scored: 0,
      duration_ms: Date.now() - t0, log,
    };
  }
}
