export interface VocabItem {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  example_jp: string | null;
  example_en: string | null;
  jlpt_level: string;
  category: string | null;
  frequency_rank: number | null;
  // Joined from frequency_scores
  frequency_score: number;
  exam_count: number;
  question_count: number;
  last_seen_year: number | null;
  score_basis: string | null;
}

export interface GrammarItem {
  id: number;
  pattern: string;
  meaning: string;
  usage: string;
  example_jp: string | null;
  example_en: string | null;
  notes: string | null;
  formality_level: string;
  // Joined from frequency_scores
  frequency_score: number;
  exam_count: number;
  question_count: number;
  last_seen_year: number | null;
  score_basis: string | null;
}

export interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  difficulty: string;
  category: string | null;
}

export interface ReadingQuestion {
  id: number;
  passage_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
}

export interface ProgressEntry {
  id: number;
  user_id: string;
  item_type: string;
  item_id: number;
  result: string;
  reviewed_at: string;
}

export interface DashboardStats {
  vocabReviewed: number;
  vocabCorrect: number;
  grammarReviewed: number;
  grammarCorrect: number;
  readingReviewed: number;
  readingCorrect: number;
  streakDays: number;
  todayCount: number;
}

export interface AnalysisStatus {
  last_run: {
    id: number;
    run_at: string;
    status: string;
    sources_attempted: number;
    sources_succeeded: number;
    items_scored: number;
    notes: string | null;
  } | null;
  source_log: {
    source_name: string;
    source_url: string | null;
    http_status: number | null;
    parse_status: string;
    items_found: number;
    error_message: string | null;
  }[];
  stats: {
    total_vocab_scored: number;
    total_grammar_scored: number;
    top_vocab: FrequencyScoreRow[];
    top_grammar: FrequencyScoreRow[];
    score_distribution: { bucket: string; count: number }[];
  } | null;
}

export interface FrequencyScoreRow {
  item_type: string;
  item_id: number;
  item_text: string;
  exam_count: number;
  question_count: number;
  last_seen_year: number | null;
  frequency_score: number;
  score_basis: string;
}
