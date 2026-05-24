export interface VocabItem {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  example_jp: string | null;
  example_en: string | null;
  jlpt_level: string;
  category: string | null;
}

export interface GrammarItem {
  id: number;
  pattern: string;
  meaning: string;
  usage: string;
  example_jp: string | null;
  example_en: string | null;
  notes: string | null;
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
