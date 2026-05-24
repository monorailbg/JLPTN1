-- Generated and curated grammar exercises for N1
CREATE TABLE IF NOT EXISTS exercises (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  type            TEXT NOT NULL,            -- 'fill_blank' | 'sentence_completion' | 'error_identification'
  grammar_pattern TEXT,                     -- references grammar.pattern (FK by string match)
  prompt_jp       TEXT NOT NULL,
  prompt_en       TEXT,
  options_json    TEXT NOT NULL,            -- JSON: string[4]
  correct_index   INTEGER NOT NULL,         -- 0..3
  explanation_jp  TEXT,
  explanation_en  TEXT,
  nuance_note     TEXT,                     -- nuance / contrast with similar patterns
  source          TEXT NOT NULL DEFAULT 'curated',
  UNIQUE(type, prompt_jp)
);

CREATE INDEX IF NOT EXISTS idx_exercises_type    ON exercises(type);
CREATE INDEX IF NOT EXISTS idx_exercises_pattern ON exercises(grammar_pattern);

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT NOT NULL DEFAULT 'local',
  exercise_id     INTEGER NOT NULL,
  exercise_type   TEXT NOT NULL,
  grammar_pattern TEXT,
  selected_index  INTEGER NOT NULL,
  correct         INTEGER NOT NULL,         -- 0 | 1
  attempted_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_pattern ON exercise_attempts(grammar_pattern);
CREATE INDEX IF NOT EXISTS idx_attempts_user    ON exercise_attempts(user_id, attempted_at);
