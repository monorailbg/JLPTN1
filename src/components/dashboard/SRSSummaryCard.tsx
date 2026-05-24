'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Brain, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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

  return (
    <div className="ink-border bg-aged-paper/40 rounded-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={15} className="text-deep-blue" />
          <span className="text-sm font-medium text-ink">間隔反復学習 SRS</span>
          {stats && stats.due_today > 0 && (
            <span className="text-xs text-vermillion border border-vermillion/30 px-2 py-0.5 rounded-full font-medium">
              {stats.due_today}件レビュー待ち
            </span>
          )}
          {stats && stats.due_today === 0 && stats.introduced > 0 && (
            <span className="text-xs text-moss border border-moss/30 px-2 py-0.5 rounded-full">
              今日は完了
            </span>
          )}
        </div>
        <Link
          href="/srs"
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm transition-colors font-medium',
            stats && stats.due_today > 0
              ? 'bg-deep-blue text-white hover:bg-deep-blue/90'
              : 'ink-border bg-aged-paper text-ink/60 hover:text-ink'
          )}
        >
          学習開始 <ArrowRight size={12} />
        </Link>
      </div>

      {stats && (
        <div className="border-t border-ink/10 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <Stat label="レビュー待ち" value={stats.due_today}      color="text-vermillion" />
          <Stat label="新規カード"   value={stats.new_cards}      color="text-amber-600" />
          <Stat label="学習中"       value={stats.introduced}     color="text-deep-blue" />
          <Stat label="習得済み"     value={stats.mature}         color="text-moss" />
        </div>
      )}

      {stats && stats.introduced > 0 && (
        <div className="border-t border-ink/10 px-5 py-3 space-y-2">
          <ProgressRow label="カバレッジ" pct={coveragePct}  color="bg-deep-blue/50" />
          <ProgressRow label="習得率"     pct={masteredPct}  color="bg-moss/50" />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className={cn('text-2xl font-bold font-serif', color)}>{value}</p>
      <p className="text-xs text-ink/40 mt-0.5">{label}</p>
    </div>
  );
}

function ProgressRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-ink/50 mb-1">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-bar">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
