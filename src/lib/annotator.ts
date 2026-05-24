// Server-side passage annotator: scans content for N1 vocabulary matches and
// splits the text into renderable segments. Plain text segments and matched
// vocab segments alternate, allowing the client to render hoverable popovers.

import type Database from 'better-sqlite3';

export interface VocabMatch {
  word: string;
  reading: string;
  meaning: string;
  jlpt_level: string;
}

export type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'vocab'; text: string; vocab: VocabMatch };

// Hiragana/katakana single chars are too generic to highlight as vocab matches.
const MIN_KANJI_RUN_LEN = 1;

function hasKanji(s: string): boolean {
  return /[一-鿿]/.test(s);
}

let cachedIndex: { entries: { word: string; info: VocabMatch }[]; mtime: number } | null = null;

function buildVocabIndex(db: Database.Database): { word: string; info: VocabMatch }[] {
  // Strict N1-only — never highlight non-N1 vocab even if it exists in the DB.
  const rows = db.prepare(`
    SELECT word, reading, meaning, jlpt_level
    FROM vocabulary
    WHERE jlpt_level = 'N1'
  `).all() as VocabMatch[];

  // Sort by length DESC for longest-match-first greedy tokenization.
  return rows
    .filter(r => r.word.length >= MIN_KANJI_RUN_LEN && hasKanji(r.word))
    .map(r => ({ word: r.word, info: r }))
    .sort((a, b) => b.word.length - a.word.length);
}

function getVocabIndex(db: Database.Database) {
  // Simple in-memory cache; rebuilt if invalidated. Vocab table rarely changes.
  if (cachedIndex) return cachedIndex.entries;
  const entries = buildVocabIndex(db);
  cachedIndex = { entries, mtime: Date.now() };
  return entries;
}

export function annotatePassage(db: Database.Database, content: string): Segment[] {
  const vocab    = getVocabIndex(db);
  const segments: Segment[] = [];
  let buffer = '';
  let i = 0;

  outer:
  while (i < content.length) {
    for (const { word, info } of vocab) {
      if (content.startsWith(word, i)) {
        if (buffer) {
          segments.push({ kind: 'text', text: buffer });
          buffer = '';
        }
        segments.push({ kind: 'vocab', text: word, vocab: info });
        i += word.length;
        continue outer;
      }
    }
    buffer += content[i];
    i++;
  }
  if (buffer) segments.push({ kind: 'text', text: buffer });

  return segments;
}

// For tests / debugging
export function invalidateVocabCache() { cachedIndex = null; }
