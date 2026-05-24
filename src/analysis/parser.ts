/**
 * HTML parsers for each source format.
 * Each parser receives the raw HTML body and returns structured exam items.
 * Parsers are registered by the key used in scraper.ts SourceDef.parser.
 *
 * All parsers are defensive: they return [] rather than throwing on malformed HTML,
 * since source page structure can change without notice.
 */

export type ParsedItem = {
  item_type: 'vocabulary' | 'grammar';
  item_text: string;
  item_reading: string;
  section: string;
  context: string;
  question_no: number | null;
};

type Parser = (html: string) => ParsedItem[];

// ─── jlpt.jp sample question pages ──────────────────────────────────────────
// The official sample pages present questions as numbered divs with furigana ruby tags.
// Structure observed in 2022–2023 sample pages:
//   <div class="exam-question"> <p class="question-text">…</p> </div>
// Since jlpt.jp returns 403, this is a best-effort parser for when access is restored.

function parseJltpJpSample(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  try {
    // Extract ruby-annotated vocabulary from question text.
    // Pattern: <ruby>漢字<rt>よみ</rt></ruby>
    const rubyPattern = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/gi;
    const questionPattern = /<p[^>]*class="[^"]*question[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;

    const questions = Array.from(html.matchAll(questionPattern));
    questions.forEach((match, idx) => {
      const qText = match[1].replace(/<[^>]+>/g, '').trim();
      const rubyMatches = Array.from(match[1].matchAll(rubyPattern));
      rubyMatches.forEach(rm => {
        items.push({
          item_type: 'vocabulary',
          item_text: rm[1].trim(),
          item_reading: rm[2].trim(),
          section: '語彙',
          context: qText.slice(0, 120),
          question_no: idx + 1,
        });
      });
    });
  } catch { /* malformed HTML — return empty */ }
  return items;
}

// ─── jlpt.jp vocabulary-specific sample page ─────────────────────────────────
function parseJltpJpVocab(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  try {
    // Vocabulary items appear in <span class="word"> tags with <span class="reading"> siblings.
    const wordBlocks = Array.from(html.matchAll(/<span[^>]*class="[^"]*word[^"]*"[^>]*>([\s\S]*?)<\/span>/gi));
    wordBlocks.forEach((match, idx) => {
      const inner = match[1];
      const readingMatch = inner.match(/<span[^>]*class="[^"]*reading[^"]*"[^>]*>([^<]+)<\/span>/i);
      const text = inner.replace(/<[^>]+>/g, '').trim();
      if (text) {
        items.push({
          item_type: 'vocabulary',
          item_text: text,
          item_reading: readingMatch?.[1].trim() ?? '',
          section: '語彙',
          context: '',
          question_no: idx + 1,
        });
      }
    });
    // Fallback: extract any bolded Japanese text as a candidate vocabulary item.
    if (items.length === 0) {
      const boldPattern = /<(?:b|strong)[^>]*>([　-鿿＀-￯゠-ヿ぀-ゟ]+)<\/(?:b|strong)>/gi;
      Array.from(html.matchAll(boldPattern)).forEach((m, idx) => {
        items.push({
          item_type: 'vocabulary',
          item_text: m[1].trim(),
          item_reading: '',
          section: '語彙',
          context: '',
          question_no: idx + 1,
        });
      });
    }
  } catch { /* ignore */ }
  return items;
}

// ─── jlpt.jp grammar-specific sample page ────────────────────────────────────
function parseJltpJpGrammar(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  try {
    // Grammar patterns in sample pages appear underlined or in answer-option spans.
    // e.g. <span class="answer">〜に際して</span>
    const optionPattern = /<(?:span|td|li)[^>]*>((?:〜|～)[^<]{2,40})<\/(?:span|td|li)>/gi;
    Array.from(html.matchAll(optionPattern)).forEach((m, idx) => {
      const text = m[1].trim();
      if (text.length >= 3) {
        items.push({
          item_type: 'grammar',
          item_text: text,
          item_reading: '',
          section: '文法',
          context: '',
          question_no: idx + 1,
        });
      }
    });
  } catch { /* ignore */ }
  return items;
}

// ─── Registry ────────────────────────────────────────────────────────────────
const PARSERS: Record<string, Parser> = {
  jlpt_jp_sample:  parseJltpJpSample,
  jlpt_jp_vocab:   parseJltpJpVocab,
  jlpt_jp_grammar: parseJltpJpGrammar,
};

export function getParser(key: string): Parser {
  return PARSERS[key] ?? (() => []);
}
