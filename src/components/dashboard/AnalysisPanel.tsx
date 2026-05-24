'use client';

import { useEffect, useState } from 'react';
import { AnalysisStatus } from '@/types';
import { TrendingUp, RefreshCw, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalysisPanel() {
  const [status, setStatus]   = useState<AnalysisStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [open, setOpen]       = useState(false);

  const loadStatus = () =>
    fetch('/api/analysis/status')
      .then(r => r.json())
      .then(setStatus);

  useEffect(() => { loadStatus(); }, []);

  const runAnalysis = async () => {
    setRunning(true);
    try {
      await fetch('/api/analysis/run', { method: 'POST' });
      await loadStatus();
    } finally {
      setRunning(false);
    }
  };

  const hasRun   = !!status?.last_run;
  const hasScores = (status?.stats?.total_vocab_scored ?? 0) > 0;

  return (
    <div className="ink-border bg-aged-paper/40 rounded-sm overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-aged-paper/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-vermillion" />
          <span className="text-sm font-medium text-ink">頻出分析 Frequency Analysis</span>
          {hasScores && (
            <span className="text-xs text-ink/40">
              ({status!.stats!.total_vocab_scored}語 · {status!.stats!.total_grammar_scored}文法)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!hasRun && (
            <span className="text-xs text-amber-600 border border-amber-300 px-2 py-0.5 rounded-full">未実行</span>
          )}
          {hasRun && status?.last_run?.status === 'complete' && (
            <span className="text-xs text-moss border border-moss/30 px-2 py-0.5 rounded-full">完了</span>
          )}
          <span className="text-ink/30 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-ink/10 px-5 py-4 animate-slide-up space-y-4">

          {/* Last run info */}
          {status?.last_run && (
            <div className="text-xs text-ink/50 space-y-1">
              <div className="flex items-center gap-1.5">
                <Clock size={11} />
                最終実行: {new Date(status.last_run.run_at).toLocaleString('ja-JP')}
              </div>
              <div className="flex items-center gap-1.5">
                <Database size={11} />
                ソース {status.last_run.sources_attempted}件試行 →
                {status.last_run.sources_succeeded}件成功 ·
                {status.last_run.items_scored}件スコア算出
              </div>
            </div>
          )}

          {/* Source log */}
          {status?.source_log && status.source_log.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-ink/40 uppercase tracking-widest">ソース状態</p>
              {status.source_log.map((src, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {src.parse_status === 'ok'
                    ? <CheckCircle size={12} className="text-moss mt-0.5 shrink-0" />
                    : <XCircle    size={12} className="text-vermillion/60 mt-0.5 shrink-0" />}
                  <div>
                    <span className="text-ink/70">{src.source_name}</span>
                    {src.http_status && (
                      <span className={cn(
                        'ml-1 font-mono',
                        src.http_status === 200 ? 'text-moss' : 'text-vermillion/70'
                      )}>
                        HTTP {src.http_status}
                      </span>
                    )}
                    {src.items_found > 0 && (
                      <span className="ml-1 text-ink/40">{src.items_found}件</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Score distribution */}
          {status?.stats?.score_distribution && (
            <div>
              <p className="text-xs text-ink/40 uppercase tracking-widest mb-2">スコア分布</p>
              <div className="flex gap-1 items-end h-10">
                {status.stats.score_distribution.map(({ bucket, count }) => {
                  const maxCount = Math.max(...status.stats!.score_distribution.map(b => b.count), 1);
                  const h = Math.max(4, (count / maxCount) * 40);
                  return (
                    <div key={bucket} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className="w-full bg-vermillion/30 rounded-t-sm"
                        style={{ height: `${h}px` }}
                        title={`${bucket}: ${count}件`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex mt-1">
                {status.stats.score_distribution.map(({ bucket, count }) => (
                  <div key={bucket} className="flex-1 text-center">
                    <p className="text-[9px] text-ink/30 leading-tight">{bucket}</p>
                    <p className="text-[9px] text-ink/40 font-mono">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top items */}
          {status?.stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-ink/40 uppercase tracking-widest mb-1.5">頻出語彙 Top 5</p>
                <ol className="space-y-1">
                  {status.stats.top_vocab.slice(0, 5).map((row, i) => (
                    <li key={row.item_id} className="flex items-center gap-2 text-xs">
                      <span className="text-ink/30 w-3 text-right">{i + 1}.</span>
                      <span className="font-serif font-medium text-ink">{row.item_text}</span>
                      <span className="text-ink/30 ml-auto font-mono">{row.frequency_score.toFixed(0)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-xs text-ink/40 uppercase tracking-widest mb-1.5">頻出文法 Top 5</p>
                <ol className="space-y-1">
                  {status.stats.top_grammar.slice(0, 5).map((row, i) => (
                    <li key={row.item_id} className="flex items-center gap-2 text-xs">
                      <span className="text-ink/30 w-3 text-right">{i + 1}.</span>
                      <span className="text-ink truncate">{row.item_text}</span>
                      <span className="text-ink/30 ml-auto font-mono shrink-0">{row.frequency_score.toFixed(0)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Run button */}
          <button
            onClick={runAnalysis}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-vermillion text-white text-sm rounded-sm hover:bg-vermillion/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={13} className={cn(running && 'animate-spin')} />
            {running ? '分析実行中…' : hasRun ? '再分析する' : '頻出分析を実行する'}
          </button>

          {!hasRun && (
            <p className="text-xs text-ink/40">
              分析を実行すると、jlpt.jp へのアクセスを試みます。
              現在 jlpt.jp はスクレイピングをブロックしているため（HTTP 403）、
              キュレーション済みデータ（研究文献・公式サンプル問題分析に基づく）が適用されます。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
