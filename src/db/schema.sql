CREATE TABLE IF NOT EXISTS vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  reading TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example_jp TEXT,
  example_en TEXT,
  jlpt_level TEXT NOT NULL DEFAULT 'N1',
  category TEXT,
  frequency_rank INTEGER
);

CREATE TABLE IF NOT EXISTS grammar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern TEXT NOT NULL,
  meaning TEXT NOT NULL,
  usage TEXT NOT NULL,
  example_jp TEXT,
  example_en TEXT,
  notes TEXT,
  formality_level TEXT NOT NULL DEFAULT '中立'
);

CREATE TABLE IF NOT EXISTS reading_passages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT DEFAULT 'N1',
  category TEXT
);

CREATE TABLE IF NOT EXISTS reading_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  passage_id INTEGER NOT NULL REFERENCES reading_passages(id),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local',
  item_type TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  result TEXT NOT NULL,
  reviewed_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local',
  date TEXT NOT NULL,
  UNIQUE(user_id, date)
);
