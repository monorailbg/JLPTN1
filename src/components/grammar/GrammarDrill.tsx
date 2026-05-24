'use client';

import { useEffect, useState, useCallback } from 'react';
import { GrammarItem } from '@/types';
import { RotateCcw, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GrammarDrill() {
  const [items, setItems] = useState<GrammarItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    fetch('/api/grammar?limit=50')
      .then(r => r.json())
      .then(data => {
        setItems([...data.items].sort(() => Math.random() - 0.5));
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
      body: JSON.stringify({ itemType: 'grammar', itemId: current.id, result }),
    });
    if (index + 1 >= items.length) {
      setSessionDone(true);
    } else {
      setIndex(i => i + 1);
      setRevealed(false);
    }
  }, [current, index, items.length]);

  const restart = () => {
    setIndex(0);
    setRevealed(false);
    setResults({});
    setSessionDone(false);
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-ink/40 text-sm">読み込み中…</p></div>;

  const correct = Object.values(results).filter(r => r === 'correct').length;
  const total = Object.keys(results).length;

  if (sessionDone) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="max-w-md mx-auto text-center animate-fade-in mt-16">
        <p className="font-serif text-5xl font-bold text-ink mb-2">{pct}%</p>
        <p className="text-ink/50 text-sm mb-1">正解率 Accuracy</p>
        <p className="text-ink/60 mt-2">{correct} / {total} 文法パターン正解</p>
        <button onClick={restart} className="mt-8 flex items-center gap-2 mx-auto px-6 py-3 bg-vermillion text-white rounded-sm hover:bg-vermillion/90 transition-colors font-medium">
          <RotateCcw size={15} /> もう一度
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink hanko-line">文法練習</h1>
          <p className="text-ink/50 text-xs mt-2">Grammar Drill</p>
        </div>
        <span className="text-sm text-ink/50">{index + 1} / {items.length}</span>
      </div>

      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${(index / items.length) * 100}%` }} />
      </div>

      {/* Pattern card */}
      <div className="ink-border bg-aged-paper rounded-sm p-6 mb-4">
        <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">文法パターン</p>
        <p className="font-serif text-3xl font-bold text-vermillion mb-2">{current?.pattern}</p>
        <p className="text-xs text-ink/50 font-mono bg-ink/5 px-2 py-1 rounded inline-block">{current?.usage}</p>
      </div>

      {/* Reveal section */}
      <button
        onClick={() => setRevealed(r => !r)}
        className={cn(
          'w-full ink-border rounded-sm p-4 text-left transition-all',
          revealed ? 'bg-deep-blue text-white' : 'bg-aged-paper/60 hover:bg-aged-paper'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {revealed ? '意味・例文' : '答えを見る'}
          </span>
          {revealed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {revealed && (
          <div className="mt-4 animate-slide-up">
            <p className={cn('text-lg font-medium mb-4', revealed && 'text-white')}>{current?.meaning}</p>
            {current?.example_jp && (
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-white/80">{current.example_jp}</p>
                <p className="text-xs text-white/50 mt-1">{current.example_en}</p>
              </div>
            )}
            {current?.notes && (
              <div className="mt-3 bg-white/5 rounded px-3 py-2">
                <p className="text-xs text-white/50">{current.notes}</p>
              </div>
            )}
          </div>
        )}
      </button>

      {/* Actions */}
      {revealed && (
        <div className="flex gap-3 mt-5 justify-center animate-slide-up">
          <button onClick={() => recordResult('incorrect')} className="flex items-center gap-2 px-6 py-3 bg-vermillion/10 border border-vermillion/30 text-vermillion rounded-sm hover:bg-vermillion hover:text-white transition-all font-medium">
            <X size={16} /> 不正解
          </button>
          <button onClick={() => recordResult('correct')} className="flex items-center gap-2 px-6 py-3 bg-moss/10 border border-moss/30 text-moss rounded-sm hover:bg-moss hover:text-white transition-all font-medium">
            <Check size={16} /> 正解
          </button>
        </div>
      )}
    </div>
  );
}
