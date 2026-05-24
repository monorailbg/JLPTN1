'use client';

import { useEffect, useState, useCallback } from 'react';
import { VocabItem } from '@/types';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VocabularyDeck() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    fetch('/api/vocabulary?limit=50')
      .then(r => r.json())
      .then(data => {
        const shuffled = [...data.items].sort(() => Math.random() - 0.5);
        setItems(shuffled);
        setLoading(false);
      });
  }, []);

  const current = items[index];

  const recordResult = useCallback(async (result: 'correct' | 'incorrect') => {
    if (!current) return;
    setResults(prev => ({ ...prev, [current.id]: result }));
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType: 'vocabulary', itemId: current.id, result }),
    });
    if (index + 1 >= items.length) {
      setSessionDone(true);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  }, [current, index, items.length]);

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setResults({});
    setSessionDone(false);
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  if (loading) return <LoadingState />;
  if (items.length === 0) return <EmptyState />;

  const correct = Object.values(results).filter(r => r === 'correct').length;
  const total = Object.keys(results).length;

  if (sessionDone) {
    return (
      <SessionResult
        correct={correct}
        total={total}
        onRestart={restart}
        label="語彙"
      />
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink hanko-line">語彙練習</h1>
          <p className="text-ink/50 text-xs mt-2">Vocabulary Flashcards</p>
        </div>
        <span className="text-sm text-ink/50">{index + 1} / {items.length}</span>
      </div>

      {/* Progress */}
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${((index) / items.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div
        className={cn('flashcard cursor-pointer select-none', flipped && 'flipped')}
        style={{ height: '300px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div className="flashcard-inner">
          {/* Front */}
          <div className="flashcard-front ink-border bg-aged-paper rounded-sm flex flex-col items-center justify-center p-8">
            <p className="text-xs text-ink/40 uppercase tracking-widest mb-4">単語</p>
            <p className="font-serif text-6xl font-bold text-ink mb-3">{current?.word}</p>
            {current?.category && (
              <span className="text-xs text-ink/40 border border-ink/10 px-2 py-0.5 rounded-full">{current.category}</span>
            )}
            <p className="text-xs text-ink/30 mt-6">タップして答えを見る</p>
          </div>

          {/* Back */}
          <div className="flashcard-back ink-border bg-deep-blue rounded-sm flex flex-col items-center justify-center p-8 text-white">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">読み</p>
            <p className="font-serif text-3xl mb-3 text-gold">{current?.reading}</p>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">意味</p>
            <p className="text-lg font-medium mb-4 text-center">{current?.meaning}</p>
            {current?.example_jp && (
              <div className="border-t border-white/10 pt-4 text-center">
                <p className="text-sm text-white/80">{current.example_jp}</p>
                <p className="text-xs text-white/40 mt-1">{current.example_en}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {flipped && (
        <div className="flex gap-3 mt-6 justify-center animate-slide-up">
          <button
            onClick={() => recordResult('incorrect')}
            className="flex items-center gap-2 px-6 py-3 bg-vermillion/10 border border-vermillion/30 text-vermillion rounded-sm hover:bg-vermillion hover:text-white transition-all font-medium"
          >
            <X size={16} /> 不正解
          </button>
          <button
            onClick={() => recordResult('correct')}
            className="flex items-center gap-2 px-6 py-3 bg-moss/10 border border-moss/30 text-moss rounded-sm hover:bg-moss hover:text-white transition-all font-medium"
          >
            <Check size={16} /> 正解
          </button>
        </div>
      )}

      {/* Skip nav */}
      {!flipped && (
        <div className="flex gap-3 mt-6 justify-center">
          <button
            disabled={index === 0}
            onClick={() => { setIndex(i => i - 1); setFlipped(false); }}
            className="p-2 ink-border rounded-sm hover:bg-ink/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => { setIndex(i => Math.min(i + 1, items.length - 1)); setFlipped(false); }}
            className="p-2 ink-border rounded-sm hover:bg-ink/5"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-ink/40 text-sm">読み込み中…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-ink/40 text-sm">語彙データがありません</p>
    </div>
  );
}

function SessionResult({
  correct, total, onRestart, label,
}: {
  correct: number; total: number; onRestart: () => void; label: string;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="max-w-md mx-auto text-center animate-fade-in mt-16">
      <p className="font-serif text-5xl font-bold text-ink mb-2">{pct}%</p>
      <p className="text-ink/50 text-sm mb-1">正解率 Accuracy</p>
      <p className="text-ink/60 mt-2">{correct} / {total} {label}カード正解</p>
      <button
        onClick={onRestart}
        className="mt-8 flex items-center gap-2 mx-auto px-6 py-3 bg-vermillion text-white rounded-sm hover:bg-vermillion/90 transition-colors font-medium"
      >
        <RotateCcw size={15} /> もう一度
      </button>
    </div>
  );
}
