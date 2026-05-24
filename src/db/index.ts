import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { vocabulary, grammar, passages } from './seed-data';
import { ALL_CURATED } from '@/exercises/curated';
import { generateFillBlankExercises } from '@/exercises/generator';

const DB_PATH = path.join(process.cwd(), 'data', 'jlpt.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(
    path.join(process.cwd(), 'src', 'db', 'schema.sql'),
    'utf-8'
  );
  db.exec(schema);

  // Analysis module schema (analysis_runs, exam_sources, exam_appearances, frequency_scores)
  const analysisSchema = fs.readFileSync(
    path.join(process.cwd(), 'src', 'analysis', 'schema.sql'),
    'utf-8'
  );
  db.exec(analysisSchema);

  // Exercises module schema
  const exercisesSchema = fs.readFileSync(
    path.join(process.cwd(), 'src', 'exercises', 'schema.sql'),
    'utf-8'
  );
  db.exec(exercisesSchema);

  runMigrations(db);
  seedIfEmpty(db);
  seedExercisesIfEmpty(db);

  return db;
}

// Add new columns to existing tables without losing data.
// SQLite does not support IF NOT EXISTS on ALTER TABLE, so we catch the error.
function runMigrations(db: Database.Database) {
  const tryAlter = (sql: string) => {
    try { db.exec(sql); } catch { /* column already exists */ }
  };
  tryAlter('ALTER TABLE vocabulary ADD COLUMN frequency_rank INTEGER');
  tryAlter('ALTER TABLE grammar ADD COLUMN formality_level TEXT NOT NULL DEFAULT "中立"');
}

function seedIfEmpty(db: Database.Database) {
  const vocabCount = (db.prepare('SELECT COUNT(*) as c FROM vocabulary').get() as { c: number }).c;

  // Wipe and re-seed when moving from the old minimal seed to the full dataset.
  // Threshold: the old seed had 12 words; the full set has 200+.
  if (vocabCount > 0 && vocabCount >= 200) return;
  if (vocabCount > 0 && vocabCount < 200) {
    db.exec('DELETE FROM vocabulary; DELETE FROM grammar; DELETE FROM reading_passages; DELETE FROM reading_questions;');
  }

  const insertVocab = db.prepare(`
    INSERT INTO vocabulary (word, reading, meaning, example_jp, example_en, category, frequency_rank, jlpt_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'N1')
  `);
  const insertGrammar = db.prepare(`
    INSERT INTO grammar (pattern, meaning, usage, example_jp, example_en, notes, formality_level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPassage = db.prepare(`
    INSERT INTO reading_passages (title, content, category, difficulty)
    VALUES (?, ?, ?, 'N1')
  `);
  const insertQuestion = db.prepare(`
    INSERT INTO reading_questions
      (passage_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    // Deduplicate: vocabulary list contains one duplicate 恣意/齟齬 entry; track by word+reading.
    const seenVocab = new Set<string>();
    for (const row of vocabulary) {
      const key = `${row[0]}|${row[1]}`;
      if (seenVocab.has(key)) continue;
      seenVocab.add(key);
      insertVocab.run(row[0], row[1], row[2], row[3], row[4], row[5], row[6]);
    }

    for (const row of grammar) {
      insertGrammar.run(row[0], row[1], row[2], row[3], row[4], row[5], row[6]);
    }

    for (const p of passages) {
      const result = insertPassage.run(p.title, p.content, p.category);
      for (const q of p.questions) {
        insertQuestion.run(
          result.lastInsertRowid,
          q.question, q.option_a, q.option_b, q.option_c, q.option_d,
          q.correct_answer, q.explanation
        );
      }
    }
  })();
}

function seedExercisesIfEmpty(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM exercises').get() as { c: number }).c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO exercises
      (type, grammar_pattern, prompt_jp, prompt_en, options_json, correct_index,
       explanation_jp, explanation_en, nuance_note, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const ex of ALL_CURATED) {
      insert.run(
        ex.type, ex.grammar_pattern, ex.prompt_jp, ex.prompt_en,
        JSON.stringify(ex.options), ex.correct_index,
        ex.explanation_jp, ex.explanation_en, ex.nuance_note, 'curated'
      );
    }
    for (const ex of generateFillBlankExercises(db)) {
      insert.run(
        ex.type, ex.grammar_pattern, ex.prompt_jp, ex.prompt_en,
        JSON.stringify(ex.options), ex.correct_index,
        ex.explanation_jp, ex.explanation_en, ex.nuance_note, 'generated'
      );
    }
  })();
}
