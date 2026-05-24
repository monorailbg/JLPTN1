'use client';

import { useEffect, useState, useCallback } from 'react';
import { GrammarItem } from '@/types';
import { RotateCcw, Check, X, ChevronDown, ChevronUp, TrendingUp, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import FrequencyBadge from '@/components/ui/FrequencyBadge';

type SortMode = 'frequency' | 'shuffle';

export default function GrammarDrill() {
  const [items, setItems]         = useState<GrammarItem[]>([]);
  const [index, setIndex]         = useState(0);
  const [revealed, setRevealed]   = useState(false);
  const [results, setResults]     = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [loading, setLoading]     = useState(true);
  const [sessionDone, setSession] = useState(false);
  const [sortMode, setSortMode]   = useState<SortMode>('frequency');

  const load = useCallback((mode: SortMode) => {
    setLoading(true);
    const sort = mode === 'frequency' ? 'frequency' : 'id';
    fetch(`/api/grammar?limit=100&sort=${sort}`)
      .then(r => r.json())
      .then(data => {
        const raw: GrammarItem[] = data.items;
        const ordered = mode === 'shuffle'
          ? [...raw].sort(() => Math.random() - 0.5)
          : raw;
        setItems(ordered);
        setIndex(0);
        setRevealed(false);
        setResults({});
        setSession(false);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(sortMode); }, [load, sortMode]);

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
      setSession(true);
    } else {
      setIndex(i => i + 1);
      setRevealed(false);
    }
  }, [current, index, items.length]);

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-ink/40 text-sm">読み込み中…</p></div>;

  const correct = Object.values(results).filter(r => r === 'correct').length;
  const total   = Object.keys(results).length;

  if (sessionDone) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="max-w-md mx-auto text-center animate-fade-in mt-16">
        <p className="font-serif text-5xl font-bold text-ink mb-2">{pct}%</p>
        <p className="text-ink/50 text-sm mb-1">正解率 Accuracy</p>
        <p className="text-ink/60 mt-2">{correct} / {total} 文法パターン正解</p>
        <button onClick={() => load(sortMode)} className="mt-8 flex items-center gap-2 mx-auto px-6 py-3 bg-vermillion text-white rounded-sm hover:bg-vermillion/90 transition-colors font-medium">
          <RotateCcw size={15} /> もう一度
        </button>
      </div>
    );
  }

  const formalityColor: Record<string, string> = {
    '書き言葉': 'text-deep-blue border-deep-blue/30 bg-deep-blue/5',
    '話し言葉': 'text-moss border-moss/30 bg-moss/5',
    '中立':     'text-ink/50 border-ink/20 bg-ink/5',
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink hanko-line">文法練習</h1>
          <p className="text-ink/50 text-xs mt-2">Grammar Drill</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => setSortMode(m => m === 'frequency' ? 'shuffle' : 'frequency')}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2.5 py-1.5 ink-border rounded-sm transition-colors',
              sortMode === 'frequency'
                ? 'bg-vermillion text-white border-vermillion'
                : 'bg-aged-paper text-ink/60 hover:text-ink'
            )}
          >
            {sortMode === 'frequency'
              ? <><TrendingUp size={12} /> 頻出順</>
              : <><Shuffle size={12} /> ランダム</>}
          </button>
          <span className="text-sm text-ink/40">{index + 1} / {items.length}</span>
        </div>
      </div>

      <div className="progress-bar mb-5">
        <div className="progress-fill" style={{ width: `${(index / items.length) * 100}%` }} />
      </div>

      {/* Frequency badge */}
      {current.frequency_score > 0 && (
        <div className="mb-3">
          <FrequencyBadge
            score={current.frequency_score}
            examCount={current.exam_count}
            lastSeen={current.last_seen_year}
          />
        </div>
      )}

      {/* Pattern card */}
      <div className="ink-border bg-aged-paper rounded-sm p-6 mb-4 relative">
        {current.frequency_score >= 80 && (
          <span className="absolute top-3 right-3 text-xs text-vermillion font-medium border border-vermillion/30 px-1.5 py-0.5 rounded-sm">
            頻出
          </span>
        )}
        <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">文法パターン</p>
        <p className="font-serif text-3xl font-bold text-vermillion mb-3">{current?.pattern}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-ink/50 font-mono bg-ink/5 px-2 py-1 rounded inline-block">{current?.usage}</p>
          {current.formality_level && (
            <span className={cn(
              'text-xs border px-2 py-0.5 rounded-full',
              formalityColor[current.formality_level] ?? 'text-ink/40 border-ink/10'
            )}>
              {current.formality_level}
            </span>
          )}
        </div>
      </div>

      {/* Reveal */}
      <button
        onClick={() => setRevealed(r => !r)}
        className={cn(
          'w-full ink-border rounded-sm p-4 text-left transition-all',
          revealed ? 'bg-deep-blue text-white' : 'bg-aged-paper/60 hover:bg-aged-paper'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{revealed ? '意味・例文' : '答えを見る'}</span>
          {revealed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {revealed && (
          <div className="mt-4 animate-slide-up">
            <p className="text-lg font-medium mb-4 text-white">{current?.meaning}</p>
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
