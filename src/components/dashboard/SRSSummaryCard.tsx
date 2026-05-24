'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import type { SRSStats } from '@/types';

export default function SRSSummaryCard() {
  const [stats, setStats] = useState<SRSStats | null>(null);

  useEffect(() => {
    fetch('/api/srs/stats').then(r => r.json()).then(setStats);
  }, []);

  const masteredPct = stats && stats.introduced > 0
    ? Math.round((stats.mature / stats.introduced) * 100)
    : 0;

  const coveragePct = stats && stats.total_n1_vocab > 0
    ? Math.round((stats.introduced / stats.total_n1_vocab) * 100)
    : 0;

  if (!stats) {
    return <div className="h-[240px] rounded-2xl bg-paper border border-hairline animate-pulse" />;
  }

  const hasDue = stats.due_today > 0;
  const isNewLearner = stats.introduced === 0;

  return (
    <section className="rounded-2xl bg-paper border border-hairline overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-deep-blue/10 text-deep-blue">
            <Brain size={18} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-ink leading-tight">間隔反復学習</h3>
            <p className="text-[11px] text-ink-3 mt-0.5 tracking-wide">Spaced Repetition System</p>
            {hasDue && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-vermillion/10 text-vermillion text-[11px] font-semibold tabular">
                <span className="w-1.5 h-1.5 rounded-full bg-vermillion animate-pulse" />
                {stats.due_today}件 レビュー待ち
              </span>
            )}
            {!hasDue && stats.introduced > 0 && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-moss/10 text-moss text-[11px] font-semibold">
                今日のレビューは完了 ✓
              </span>
            )}
            {isNewLearner && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[11px] font-semibold">
                <Sparkles size={10} /> 学習を開始しましょう
              </span>
            )}
          </div>
        </div>
        <Link
          href="/srs"
          className={`btn ${hasDue ? 'btn-primary' : 'btn-secondary'} flex-shrink-0`}
        >
          学習開始 <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Stat grid ────────────────────────────────────────────────────── */}
      <div className="border-t border-hairline grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-hairline">
        <Stat label="レビュー待ち" value={stats.due_today}  accent="text-vermillion" />
        <Stat label="新規カード"   value={stats.new_cards}  accent="text-gold" />
        <Stat label="学習中"       value={stats.introduced} accent="text-deep-blue" />
        <Stat label="習得済み"     value={stats.mature}     accent="text-moss" />
      </div>

      {/* ── Progress rows ────────────────────────────────────────────────── */}
      {stats.introduced > 0 && (
        <div className="border-t border-hairline p-5 sm:p-6 space-y-3.5">
          <ProgressRow label="N1 語彙カバレッジ" pct={coveragePct} from="from-deep-blue/60" to="to-deep-blue" />
          <ProgressRow label="習得率"           pct={masteredPct}  from="from-moss/60"      to="to-moss" />
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="px-4 py-4 sm:py-5 text-center">
      <p className={`font-serif text-[26px] font-bold tabular leading-none ${accent}`}>{value}</p>
      <p className="text-[11px] text-ink-3 mt-1.5 font-medium tracking-wide">{label}</p>
    </div>
  );
}

function ProgressRow({ label, pct, from, to }: { label: string; pct: number; from: string; to: string }) {
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="text-ink-2 font-medium">{label}</span>
        <span className="tabular text-ink-2 font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-paper-sunken overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${from} ${to} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
