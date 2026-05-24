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
      <div className="max-w-md mx-auto text-center mt-20 animate-fade-in">
        <div className="grid place-items-center w-16 h-16 mx-auto rounded-3xl bg-moss/12 text-moss mb-6">
          <Brain size={28} strokeWidth={1.75} />
        </div>
        <p className="font-serif text-[28px] font-bold text-ink mb-2 leading-tight">今日の学習は完了</p>
        <p className="text-ink-2 text-[14px] mb-8 text-balance">
          レビュー待ちのカードはありません。<br />また明日。
        </p>
        <Link href="/" className="btn btn-primary">
          <Home size={15} /> ダッシュボードへ
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
      <header className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-deep-blue mb-1.5">
            Spaced Repetition · SM-2
          </p>
          <h1 className="font-serif text-[28px] font-bold text-ink leading-tight">間隔反復学習</h1>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[13px] text-ink-2 tabular font-medium">{index + 1} / {queue.length}</span>
          {current.is_new === 1
            ? <span className="text-[11px] font-semibold text-moss bg-moss/12 px-2 py-0.5 rounded-full">新規</span>
            : <span className="text-[11px] font-semibold text-deep-blue bg-deep-blue/10 px-2 py-0.5 rounded-full">
                復習 · {current.repetitions}回目
              </span>
          }
        </div>
      </header>

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
          className="card-hero flex flex-col items-center justify-center p-10 relative cursor-pointer select-none min-h-[280px] transition-transform active:scale-[0.995]"
          onClick={() => setFlipped(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') setFlipped(true); }}
        >
          {current.frequency_score >= 80 && (
            <span className="absolute top-4 right-4 text-[11px] font-semibold text-vermillion bg-vermillion/12 px-2 py-1 rounded-full">
              頻出
            </span>
          )}
          <p className="text-[10px] text-ink-3 uppercase tracking-[0.2em] mb-6 font-medium">単語</p>
          <p className="font-serif text-[64px] sm:text-[76px] font-bold text-ink mb-4 text-center leading-[1]">
            {current.word}
          </p>
          {current.category && (
            <span className="text-[11px] text-ink-2 bg-paper-sunken px-3 py-1 rounded-full">
              {current.category}
            </span>
          )}
          <p className="text-[11px] text-ink-3 mt-8 tracking-wide">
            <kbd className="px-1.5 py-0.5 mx-1 text-[10px] rounded bg-paper-sunken border border-hairline">Space</kbd>
            または タップして答えを見る
          </p>
        </div>
      ) : (
        /* Back: reading + meaning + example */
        <div className="rounded-3xl bg-deep-blue p-7 sm:p-8 text-white animate-slide-up shadow-lg">
          <div className="text-center mb-6">
            <p className="font-serif text-[44px] font-bold text-white leading-tight mb-1">{current.word}</p>
            <p className="font-serif text-[22px] text-gold tabular">{current.reading}</p>
          </div>
          <div className="border-t border-white/10 pt-5 mb-4">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-2 font-medium">意味</p>
            <p className="text-[17px] font-medium text-white leading-snug">{current.meaning}</p>
          </div>
          {current.example_jp && (
            <div className="bg-white/[0.06] rounded-2xl px-4 py-3.5">
              <p className="text-[14px] text-white/85 leading-relaxed">{current.example_jp}</p>
              {current.example_en && (
                <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed italic">{current.example_en}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Rating buttons ─────────────────────────────────────────────────── */}
      {flipped && !feedback && (
        <div className="mt-6 animate-slide-up">
          <p className="text-[11px] text-ink-3 text-center mb-3.5 tracking-wide font-medium">
            <kbd className="px-1 text-[10px] rounded bg-paper-sunken border border-hairline mx-0.5">1</kbd>忘
            <kbd className="px-1 text-[10px] rounded bg-paper-sunken border border-hairline mx-0.5 ml-2">2</kbd>難
            <kbd className="px-1 text-[10px] rounded bg-paper-sunken border border-hairline mx-0.5 ml-2">3</kbd>普
            <kbd className="px-1 text-[10px] rounded bg-paper-sunken border border-hairline mx-0.5 ml-2">4</kbd>簡
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
                    'flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl border bg-paper',
                    'text-[14px] font-semibold transition-all disabled:opacity-40 active:scale-[0.97]',
                    idle
                  )}
                >
                  <span>{rating}</span>
                  <span className="text-[10px] opacity-60 tabular font-medium">+{nextDays}日</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Feedback flash ─────────────────────────────────────────────────── */}
      {feedback && (
        <div className={cn(
          'mt-5 px-5 py-4 rounded-2xl text-center border animate-slide-up',
          RATINGS.find(r => r.rating === feedback.rating)?.feedback
        )}>
          <p className="text-[14px] font-semibold text-ink">
            {RATINGS.find(r => r.rating === feedback.rating)?.feedbackMsg}
          </p>
          <p className="text-[11px] text-ink-2 mt-1 tabular">次回レビュー: <span className="font-semibold">{feedback.interval}日後</span></p>
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
    <div className="max-w-md mx-auto text-center animate-fade-in mt-10">
      <div className="grid place-items-center w-14 h-14 mx-auto rounded-2xl bg-moss/12 text-moss mb-5">
        <Brain size={24} strokeWidth={1.75} />
      </div>
      <p className="font-serif text-[56px] font-bold text-ink leading-none tabular">{pct}%</p>
      <p className="text-ink-3 text-[11px] uppercase tracking-[0.18em] mt-2 font-medium">正解率 Accuracy</p>
      <p className="text-ink-2 text-[14px] mt-2 mb-8 tabular">{correct} / {total} 正解（普通 + 簡単）</p>

      <div className="grid grid-cols-4 gap-2 mb-8">
        {breakdown.map(({ rating, color, bg }) => (
          <div key={rating} className={cn('border rounded-2xl py-3.5', bg)}>
            <p className={cn('text-[22px] font-bold font-serif tabular', color)}>{counts[rating]}</p>
            <p className={cn('text-[11px] mt-1 font-medium', color)}>{rating}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-ink-3 mb-6 text-balance">
        次回セッション — 今日中に新規カードが追加される場合があります
      </p>

      <div className="flex gap-3 justify-center">
        <button onClick={onRestart} className="btn btn-primary">
          <RotateCcw size={14} /> もう一度
        </button>
        <Link href="/" className="btn btn-secondary">
          <Home size={14} /> ホームへ
        </Link>
      </div>
    </div>
  );
}
