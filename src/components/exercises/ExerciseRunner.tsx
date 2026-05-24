'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, X, ArrowRight, RotateCcw, BookOpen, FileEdit, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExerciseType = 'fill_blank' | 'sentence_completion' | 'error_identification' | 'all';

interface Exercise {
  id: number;
  type: 'fill_blank' | 'sentence_completion' | 'error_identification';
  grammar_pattern: string | null;
  prompt_jp: string;
  prompt_en: string | null;
  options: string[];
  correct_index: number;
  explanation_jp: string | null;
  explanation_en: string | null;
  nuance_note: string | null;
  frequency_score: number;
}

const TYPE_META: Record<Exercise['type'], { label: string; icon: typeof BookOpen; color: string }> = {
  fill_blank:            { label: '穴埋め',         icon: FileEdit,       color: 'text-deep-blue' },
  sentence_completion:   { label: '文の組み立て',   icon: BookOpen,       color: 'text-moss' },
  error_identification:  { label: '誤文訂正',       icon: AlertTriangle,  color: 'text-vermillion' },
};

interface Props {
  initialType?: ExerciseType;
}

export default function ExerciseRunner({ initialType = 'all' }: Props) {
  const [type, setType]                 = useState<ExerciseType>(initialType);
  const [exercise, setExercise]         = useState<Exercise | null>(null);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<number | null>(null);
  const [submitted, setSubmitted]       = useState(false);
  const [resultCorrect, setResultCorrect] = useState<boolean | null>(null);
  const [seen, setSeen]                 = useState<number[]>([]);
  const [score, setScore]               = useState({ correct: 0, total: 0 });

  const load = useCallback(async (excludeIds: number[]) => {
    setLoading(true);
    setSelected(null);
    setSubmitted(false);
    setResultCorrect(null);

    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (excludeIds.length > 0) params.set('exclude', excludeIds.join(','));

    const r    = await fetch(`/api/exercises/next?${params}`);
    const data = await r.json();
    setExercise(data.exercise);
    setLoading(false);
  }, [type]);

  useEffect(() => { setSeen([]); setScore({ correct: 0, total: 0 }); load([]); }, [load]);

  const submit = async () => {
    if (selected === null || !exercise) return;
    const r = await fetch('/api/exercises/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ exerciseId: exercise.id, selectedIndex: selected }),
    });
    const data = await r.json();
    setResultCorrect(data.correct);
    setSubmitted(true);
    setScore(s => ({ correct: s.correct + (data.correct ? 1 : 0), total: s.total + 1 }));
    setSeen(prev => [...prev, exercise.id]);
  };

  const next = () => load(seen.slice(-20)); // exclude last 20 to avoid immediate repeats

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-ink/40 text-sm">読み込み中…</p></div>;
  }

  if (!exercise) {
    return (
      <div className="max-w-md mx-auto text-center mt-16 animate-fade-in">
        <p className="text-ink/50">演習問題がありません</p>
      </div>
    );
  }

  const meta = TYPE_META[exercise.type];
  const TypeIcon = meta.icon;
  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink hanko-line">文法演習</h1>
          <p className="text-ink/50 text-xs mt-2">Grammar Exercises</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-ink/40">{score.correct} / {score.total} 正解</span>
          {score.total > 0 && (
            <span className="block text-xs text-ink/40 mt-1 font-mono">{accuracy}%</span>
          )}
        </div>
      </div>

      {/* ── Type filter ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', 'fill_blank', 'sentence_completion', 'error_identification'] as ExerciseType[]).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              'text-xs px-3 py-1.5 ink-border rounded-sm transition-colors',
              type === t
                ? 'bg-vermillion text-white border-vermillion'
                : 'bg-aged-paper text-ink/60 hover:text-ink'
            )}
          >
            {t === 'all'                  ? 'すべて' :
             t === 'fill_blank'           ? '穴埋め' :
             t === 'sentence_completion'  ? '文の組み立て' :
                                            '誤文訂正'}
          </button>
        ))}
      </div>

      {/* ── Exercise card ──────────────────────────────────────────────────── */}
      <div className="ink-border bg-aged-paper rounded-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <TypeIcon size={14} className={meta.color} />
          <span className={cn('text-xs font-medium uppercase tracking-widest', meta.color)}>{meta.label}</span>
          {exercise.grammar_pattern && (
            <span className="text-xs text-ink/40 font-mono ml-auto">
              {exercise.grammar_pattern}
            </span>
          )}
        </div>

        {/* Prompt */}
        <div className="mb-2">
          <p className="font-serif text-lg text-ink leading-loose whitespace-pre-wrap">
            {exercise.prompt_jp}
          </p>
          {exercise.prompt_en && (
            <p className="text-xs text-ink/40 mt-2 italic">{exercise.prompt_en}</p>
          )}
        </div>

        {exercise.type === 'sentence_completion' && (
          <p className="text-xs text-ink/40 mt-3">★ の位置に入る語句を選んでください</p>
        )}
        {exercise.type === 'error_identification' && (
          <p className="text-xs text-ink/40 mt-3">下線部のうち、間違っている部分を選んでください</p>
        )}
      </div>

      {/* ── Options ────────────────────────────────────────────────────────── */}
      <div className="space-y-2 mb-5">
        {exercise.options.map((opt, idx) => {
          const isCorrect = idx === exercise.correct_index;
          const isPicked  = idx === selected;
          const showCorrect = submitted && isCorrect;
          const showWrong   = submitted && isPicked && !isCorrect;

          return (
            <button
              key={idx}
              onClick={() => !submitted && setSelected(idx)}
              disabled={submitted}
              className={cn(
                'w-full text-left ink-border rounded-sm px-4 py-3 transition-all flex items-center gap-3',
                !submitted && isPicked && 'bg-deep-blue text-white border-deep-blue',
                !submitted && !isPicked && 'bg-aged-paper hover:bg-aged-paper/60',
                showCorrect && 'bg-moss/15 border-moss text-ink',
                showWrong   && 'bg-vermillion/15 border-vermillion text-ink',
                submitted && !isCorrect && !isPicked && 'opacity-50'
              )}
            >
              <span className={cn(
                'inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-mono shrink-0',
                showCorrect ? 'border-moss text-moss bg-white' :
                showWrong   ? 'border-vermillion text-vermillion bg-white' :
                !submitted && isPicked ? 'border-white text-white' :
                                          'border-ink/30 text-ink/60'
              )}>
                {idx + 1}
              </span>
              <span className="flex-1 text-sm font-medium">{opt}</span>
              {showCorrect && <Check size={16} className="text-moss" />}
              {showWrong && <X size={16} className="text-vermillion" />}
            </button>
          );
        })}
      </div>

      {/* ── Submit / Next ──────────────────────────────────────────────────── */}
      {!submitted ? (
        <button
          onClick={submit}
          disabled={selected === null}
          className="w-full px-6 py-3 bg-vermillion text-white rounded-sm hover:bg-vermillion/90 transition-colors font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          答え合わせ
        </button>
      ) : (
        <div className="space-y-4 animate-slide-up">
          {/* Result banner */}
          <div className={cn(
            'rounded-sm px-4 py-3 border flex items-center gap-2',
            resultCorrect ? 'bg-moss/10 border-moss/30 text-moss' : 'bg-vermillion/10 border-vermillion/30 text-vermillion'
          )}>
            {resultCorrect ? <Check size={16} /> : <X size={16} />}
            <span className="text-sm font-medium">
              {resultCorrect ? '正解です！' : `不正解。正解は ${exercise.correct_index + 1}番 「${exercise.options[exercise.correct_index]}」`}
            </span>
          </div>

          {/* Explanation */}
          {exercise.explanation_jp && (
            <div className="ink-border bg-aged-paper/60 rounded-sm p-4 space-y-3">
              <div>
                <p className="text-xs text-ink/40 uppercase tracking-widest mb-1.5">解説</p>
                <p className="text-sm text-ink leading-relaxed">{exercise.explanation_jp}</p>
                {exercise.explanation_en && (
                  <p className="text-xs text-ink/50 mt-2 italic leading-relaxed">{exercise.explanation_en}</p>
                )}
              </div>
              {exercise.nuance_note && (
                <div className="border-t border-ink/10 pt-3">
                  <p className="text-xs text-vermillion/70 uppercase tracking-widest mb-1.5">類似表現との違い</p>
                  <p className="text-sm text-ink/80 leading-relaxed">{exercise.nuance_note}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-vermillion text-white rounded-sm hover:bg-vermillion/90 transition-colors font-medium text-sm"
            >
              次の問題 <ArrowRight size={14} />
            </button>
            <button
              onClick={() => { setSeen([]); setScore({ correct: 0, total: 0 }); load([]); }}
              className="flex items-center justify-center gap-2 px-4 py-3 ink-border bg-aged-paper text-ink/70 rounded-sm hover:bg-aged-paper/60 transition-colors text-sm"
              title="リセット"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
