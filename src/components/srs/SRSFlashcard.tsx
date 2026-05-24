'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RotateCcw, Brain, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import FrequencyBadge from '@/components/ui/FrequencyBadge';
import { estimateNextInterval } from '@/srs/sm2';
import type { SRSCard, SRSRating } from '@/types';

// ─── Rating button config ─────────────────────────────────────────────────────

const RATINGS: {
  rating: SRSRating;
  idle: string;
  feedback: string;
  feedbackMsg: string;
}[] = [
  {
    rating:      '忘れた',
    idle:        'border-vermillion/40 text-vermillion hover:bg-vermillion hover:text-white',
    feedback:    'bg-vermillion/10 border-vermillion/30',
    feedbackMsg: 'もう一度学習します',
  },
  {
    rating:      '難しい',
    idle:        'border-gold/50 text-amber-700 hover:bg-gold hover:text-white',
    feedback:    'bg-gold/10 border-gold/30',
    feedbackMsg: '少し難しかったですね',
  },
  {
    rating:      '普通',
    idle:        'border-deep-blue/40 text-deep-blue hover:bg-deep-blue hover:text-white',
    feedback:    'bg-deep-blue/10 border-deep-blue/20',
    feedbackMsg: 'よくできました',
  },
  {
    rating:      '簡単',
    idle:        'border-moss/40 text-moss hover:bg-moss hover:text-white',
    feedback:    'bg-moss/10 border-moss/20',
    feedbackMsg: '完璧です！',
  },
];

// ─── Session result type ──────────────────────────────────────────────────────

interface SessionEntry {
  id: number;
  rating: SRSRating;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SRSFlashcard() {
  const [queue,      setQueue]      = useState<SRSCard[]>([]);
  const [index,      setIndex]      = useState(0);
  const [flipped,    setFlipped]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback,   setFeedback]   = useState<{
    rating: SRSRating;
    interval: number;
  } | null>(null);
  const [results,    setResults]    = useState<SessionEntry[]>([]);
  const [done,       setDone]       = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const r    = await fetch('/api/srs/queue');
    const data = await r.json();
    setQueue(data.queue ?? []);
    setIndex(0);
    setFlipped(false);
    setResults([]);
    setDone(false);
    setLoading(false);
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  // Keyboard shortcuts: Space = flip, 1/2/3/4 = rate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (loading || done || submitting) return;
      if (e.target instanceof HTMLInputElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!flipped) setFlipped(true);
        return;
      }
      if (flipped && !feedback) {
        const map: Record<string, SRSRating> = {
          Digit1: '忘れた', Digit2: '難しい', Digit3: '普通', Digit4: '簡単',
        };
        const r = map[e.code];
        if (r) { e.preventDefault(); rate(r); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const current = queue[index];

  const rate = useCallback(async (rating: SRSRating) => {
    if (!current || submitting) return;
    setSubmitting(true);

    const r    = await fetch('/api/srs/review', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ itemId: current.id, rating }),
    });
    const data = await r.json();

    setResults(prev => [...prev, { id: current.id, rating }]);
    setFeedback({ rating, interval: data.interval });

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= queue.length) {
        setDone(true);
      } else {
        setIndex(i => i + 1);
        setFlipped(false);
      }
      setSubmitting(false);
    }, 850);
  }, [current, submitting, index, queue.length]);

  // ── Empty queue ──────────────────────────────────────────────────────────────
  if (!loading && queue.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center mt-24 animate-fade-in">
        <Brain size={44} className="mx-auto text-moss mb-5 opacity-50" />
        <p className="font-serif text-2xl font-bold text-ink mb-2">今日の学習は完了</p>
        <p className="text-ink/50 text-sm mb-8">
          レビュー待ちのカードはありません。<br />また明日！
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-vermillion text-white rounded-sm hover:bg-vermillion/90 transition-colors text-sm font-medium"
        >
          <Home size={14} /> ダッシュボードへ
        </Link>
      </div>
    );
  }

  // ── Session done ─────────────────────────────────────────────────────────────
  if (done) {
    return <SessionDone results={results} onRestart={loadQueue} />;
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ink/40 text-sm">読み込み中…</p>
      </div>
    );
  }

  // ── Rating tally (mini) ──────────────────────────────────────────────────────
  const tally = {
    '忘れた': results.filter(r => r.rating === '忘れた').length,
    '難しい': results.filter(r => r.rating === '難しい').length,
    '普通':   results.filter(r => r.rating === '普通').length,
    '簡単':   results.filter(r => r.rating === '簡単').length,
  };

  const srsState = {
    repetitions: current.repetitions,
    interval:    current.interval,
    ease_factor: current.ease_factor,
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink hanko-line">間隔反復学習</h1>
          <p className="text-ink/50 text-xs mt-2">Spaced Repetition · <span className="font-mono">SM-2</span></p>
        </div>
        <div className="flex flex-col items-end gap-1 mt-1">
          <span className="text-sm text-ink/40">{index + 1} / {queue.length}</span>
          {current.is_new === 1
            ? <span className="text-xs text-moss border border-moss/30 px-1.5 py-0.5 rounded-full">新規</span>
            : <span className="text-xs text-deep-blue/70 border border-deep-blue/20 px-1.5 py-0.5 rounded-full">
                復習 · {current.repetitions}回目
              </span>
          }
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div className="progress-bar mb-3">
        <div className="progress-fill" style={{ width: `${(index / queue.length) * 100}%` }} />
      </div>

      {/* ── Mini tally ─────────────────────────────────────────────────────── */}
      <div className="flex gap-4 mb-5 text-xs text-ink/40">
        <span className="text-vermillion font-mono">{tally['忘れた']} 忘</span>
        <span className="text-amber-600   font-mono">{tally['難しい']} 難</span>
        <span className="text-deep-blue   font-mono">{tally['普通']} 普</span>
        <span className="text-moss        font-mono">{tally['簡単']} 簡</span>
      </div>

      {/* ── Frequency badge ────────────────────────────────────────────────── */}
      {current.frequency_score > 0 && (
        <div className="mb-3">
          <FrequencyBadge
            score={current.frequency_score}
            examCount={current.exam_count}
            lastSeen={current.last_seen_year}
          />
        </div>
      )}

      {/* ── Card ───────────────────────────────────────────────────────────── */}
      {!flipped ? (
        /* Front: word only */
        <div
          className="ink-border bg-aged-paper rounded-sm flex flex-col items-center justify-center p-10 relative cursor-pointer select-none min-h-[240px] hover:shadow-md transition-shadow"
          onClick={() => setFlipped(true)}
        >
          {current.frequency_score >= 80 && (
            <span className="absolute top-3 right-3 text-xs text-vermillion font-medium border border-vermillion/30 px-1.5 py-0.5 rounded-sm">
              頻出
            </span>
          )}
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-5">単語</p>
          <p className="font-serif text-6xl font-bold text-ink mb-4 text-center leading-tight">
            {current.word}
          </p>
          {current.category && (
            <span className="text-xs text-ink/40 border border-ink/10 px-2 py-0.5 rounded-full">
              {current.category}
            </span>
          )}
          <p className="text-xs text-ink/25 mt-8">
            スペースキーまたはタップして答えを見る
          </p>
        </div>
      ) : (
        /* Back: reading + meaning + example */
        <div className="ink-border bg-deep-blue rounded-sm p-7 text-white animate-slide-up">
          <div className="text-center mb-5">
            <p className="font-serif text-4xl font-bold text-white mb-1">{current.word}</p>
            <p className="font-serif text-2xl text-gold">{current.reading}</p>
          </div>
          <div className="border-t border-white/10 pt-5 mb-4">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">意味</p>
            <p className="text-lg font-medium text-white leading-snug">{current.meaning}</p>
          </div>
          {current.example_jp && (
            <div className="bg-white/5 rounded px-4 py-3">
              <p className="text-sm text-white/80 leading-relaxed">{current.example_jp}</p>
              {current.example_en && (
                <p className="text-xs text-white/40 mt-1 leading-relaxed">{current.example_en}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Rating buttons ─────────────────────────────────────────────────── */}
      {flipped && !feedback && (
        <div className="mt-5 animate-slide-up">
          <p className="text-xs text-ink/40 text-center mb-3 uppercase tracking-widest">
            評価 — 1 忘れた · 2 難しい · 3 普通 · 4 簡単
          </p>
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map(({ rating, idle }) => {
              const nextDays = estimateNextInterval(srsState, rating);
              return (
                <button
                  key={rating}
                  onClick={() => rate(rating)}
                  disabled={submitting}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 px-2 border rounded-sm',
                    'text-sm font-medium transition-all disabled:opacity-40',
                    idle
                  )}
                >
                  <span>{rating}</span>
                  <span className="text-[10px] opacity-60 font-mono">{nextDays}日後</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Feedback flash ─────────────────────────────────────────────────── */}
      {feedback && (
        <div className={cn(
          'mt-5 px-5 py-4 rounded-sm text-center border animate-slide-up',
          RATINGS.find(r => r.rating === feedback.rating)?.feedback
        )}>
          <p className="text-sm font-medium text-ink">
            {RATINGS.find(r => r.rating === feedback.rating)?.feedbackMsg}
          </p>
          <p className="text-xs text-ink/50 mt-1 font-mono">次回: {feedback.interval}日後</p>
        </div>
      )}
    </div>
  );
}

// ─── Session done screen ──────────────────────────────────────────────────────

function SessionDone({
  results,
  onRestart,
}: {
  results: SessionEntry[];
  onRestart: () => void;
}) {
  const total   = results.length;
  const correct = results.filter(r => r.rating === '普通' || r.rating === '簡単').length;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

  const counts: Record<SRSRating, number> = {
    '忘れた': 0, '難しい': 0, '普通': 0, '簡単': 0,
  };
  for (const { rating } of results) counts[rating]++;

  const breakdown: { rating: SRSRating; color: string; bg: string }[] = [
    { rating: '忘れた', color: 'text-vermillion', bg: 'bg-vermillion/5 border-vermillion/20' },
    { rating: '難しい', color: 'text-amber-600',  bg: 'bg-gold/5 border-gold/20' },
    { rating: '普通',   color: 'text-deep-blue',  bg: 'bg-deep-blue/5 border-deep-blue/20' },
    { rating: '簡単',   color: 'text-moss',        bg: 'bg-moss/5 border-moss/20' },
  ];

  return (
    <div className="max-w-md mx-auto text-center animate-fade-in mt-12">
      <Brain size={36} className="mx-auto text-moss mb-4 opacity-70" />
      <p className="font-serif text-5xl font-bold text-ink mb-1">{pct}%</p>
      <p className="text-ink/50 text-sm mb-1">正解率 Accuracy</p>
      <p className="text-ink/60 text-sm mb-8">{correct} / {total} 正解（普通 + 簡単）</p>

      <div className="grid grid-cols-4 gap-2 mb-8">
        {breakdown.map(({ rating, color, bg }) => (
          <div key={rating} className={cn('border rounded-sm py-3', bg)}>
            <p className={cn('text-xl font-bold font-serif', color)}>{counts[rating]}</p>
            <p className={cn('text-xs mt-0.5', color)}>{rating}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink/40 mb-6">
        次回セッション — 今日中に新規カードが追加される場合があります
      </p>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 bg-vermillion text-white rounded-sm hover:bg-vermillion/90 transition-colors text-sm font-medium"
        >
          <RotateCcw size={14} /> もう一度
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 ink-border bg-aged-paper text-ink rounded-sm hover:bg-aged-paper/80 transition-colors text-sm font-medium"
        >
          <Home size={14} /> ホームへ
        </Link>
      </div>
    </div>
  );
}
