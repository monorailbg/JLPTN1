-- Tracks each full analysis run (scrape + curated apply)
CREATE TABLE IF NOT EXISTS analysis_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  run_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  status      TEXT    NOT NULL DEFAULT 'running',  -- running | complete | failed
  sources_attempted  INTEGER NOT NULL DEFAULT 0,
  sources_succeeded  INTEGER NOT NULL DEFAULT 0,
  items_scored       INTEGER NOT NULL DEFAULT 0,
  notes       TEXT
);

-- One row per source URL attempted per run
CREATE TABLE IF NOT EXISTS exam_sources (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id        INTEGER NOT NULL REFERENCES analysis_runs(id),
  source_type   TEXT    NOT NULL,  -- official_sample | curated | community | github
  source_name   TEXT    NOT NULL,
  source_url    TEXT,
  year_from     INTEGER,
  year_to       INTEGER,
  fetched_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  http_status   INTEGER,           -- 200, 403, 404, etc.
  parse_status  TEXT    NOT NULL DEFAULT 'pending',  -- pending | ok | blocked | error
  items_found   INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

-- Every appearance of a vocabulary word or grammar pattern in an exam context
CREATE TABLE IF NOT EXISTS exam_appearances (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id    INTEGER NOT NULL REFERENCES exam_sources(id),
  item_type    TEXT    NOT NULL,  -- vocabulary | grammar
  item_text    TEXT    NOT NULL,  -- kanji form of word, or pattern string
  item_reading TEXT,
  exam_year    INTEGER,
  section      TEXT,              -- 語彙 | 文法 | 読解
  question_no  INTEGER,
  context      TEXT               -- surrounding sentence or question stem
);

-- Final normalised frequency scores, one row per vocabulary/grammar item
CREATE TABLE IF NOT EXISTS frequency_scores (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type       TEXT    NOT NULL,   -- vocabulary | grammar
  item_id         INTEGER NOT NULL,   -- FK → vocabulary.id or grammar.id
  item_text       TEXT    NOT NULL,   -- denormalised for fast lookup
  exam_count      INTEGER NOT NULL DEFAULT 0,   -- distinct exam years seen
  question_count  INTEGER NOT NULL DEFAULT 0,   -- total question appearances
  last_seen_year  INTEGER,
  raw_score       REAL    NOT NULL DEFAULT 0,   -- un-normalised composite
  frequency_score REAL    NOT NULL DEFAULT 0,   -- 0–100 normalised
  score_basis     TEXT    NOT NULL DEFAULT 'curated',  -- curated | scraped | mixed
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(item_type, item_id)
);
