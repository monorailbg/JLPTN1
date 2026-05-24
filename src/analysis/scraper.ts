/**
 * Resilient HTTP scraper for JLPT public exam data.
 *
 * Target sources and known availability:
 *
 *   www.jlpt.jp/samples/          — official sample questions (blocks automated requests, 403)
 *   www.jlpt.jp/e/samples/        — English sample mirror (also 403)
 *   jlptsensei.com                — community grammar/vocab lists (blocks, 403)
 *   nihongonomori.com             — community grammar lists (blocks, 403)
 *   github.com/Doublevil/…        — JLPT tagged vocab dumps (404 / no exam freq data)
 *
 * The scraper attempts each source and records the HTTP status.
 * All sources currently return 403/404 — this is expected and handled gracefully.
 * The runner falls back to curated-data.ts when live scraping fails.
 *
 * To add a new source:
 *   1. Add an entry to SOURCES below.
 *   2. Add a corresponding parser in parser.ts.
 *   3. The runner picks it up automatically on the next run.
 */

export type SourceDef = {
  name: string;
  url: string;
  type: 'official_sample' | 'community' | 'github';
  year_from: number;
  year_to: number;
  parser: string;   // key into parser registry
};

export type FetchResult = {
  source: SourceDef;
  http_status: number | null;
  body: string | null;
  error: string | null;
  duration_ms: number;
};

export const SOURCES: SourceDef[] = [
  {
    name: 'JLPT Official Sample Questions (JP)',
    url: 'https://www.jlpt.jp/samples/n1/index.html',
    type: 'official_sample',
    year_from: 2012,
    year_to: 2023,
    parser: 'jlpt_jp_sample',
  },
  {
    name: 'JLPT Official Sample Questions (EN)',
    url: 'https://www.jlpt.jp/e/samples/n1/index.html',
    type: 'official_sample',
    year_from: 2012,
    year_to: 2023,
    parser: 'jlpt_jp_sample',
  },
  {
    name: 'JLPT Official Vocab Sample (JP)',
    url: 'https://www.jlpt.jp/samples/n1vocab.html',
    type: 'official_sample',
    year_from: 2012,
    year_to: 2023,
    parser: 'jlpt_jp_vocab',
  },
  {
    name: 'JLPT Official Grammar Sample (JP)',
    url: 'https://www.jlpt.jp/samples/n1grammar.html',
    type: 'official_sample',
    year_from: 2012,
    year_to: 2023,
    parser: 'jlpt_jp_grammar',
  },
];

const FETCH_TIMEOUT_MS = 12_000;
const RATE_LIMIT_MS    = 2_000;   // 2 s between requests — respectful crawl rate

async function fetchWithTimeout(url: string): Promise<{ status: number; body: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'JLPT-N1-Trainer/1.0 (educational tool; contact: jlpt-trainer-app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.8',
      },
    });
    const body = await res.text();
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch all sources sequentially with rate limiting. */
export async function fetchAllSources(
  onProgress?: (msg: string) => void
): Promise<FetchResult[]> {
  const results: FetchResult[] = [];

  for (let i = 0; i < SOURCES.length; i++) {
    const source = SOURCES[i];
    if (i > 0) await sleep(RATE_LIMIT_MS);

    onProgress?.(`Fetching: ${source.name}`);
    const t0 = Date.now();

    try {
      const { status, body } = await fetchWithTimeout(source.url);
      const duration_ms = Date.now() - t0;
      results.push({ source, http_status: status, body: status === 200 ? body : null, error: null, duration_ms });
      onProgress?.(`  → HTTP ${status} (${duration_ms}ms)`);
    } catch (err: unknown) {
      const duration_ms = Date.now() - t0;
      const error = err instanceof Error ? err.message : String(err);
      results.push({ source, http_status: null, body: null, error, duration_ms });
      onProgress?.(`  → Error: ${error}`);
    }
  }

  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
