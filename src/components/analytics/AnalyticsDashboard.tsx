'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Target, BookOpen, TrendingDown, Calendar, Flame, BarChart3 } from 'lucide-react';
import Heatmap from './Heatmap';
import ReadinessGauge from './ReadinessGauge';

interface AnalyticsData {
  vocab_mastery: {
    total: number;
    introduced: number;
    mature: number;
    learning: number;
    new_cards: number;
    due_today: number;
    mastery_pct: number;
    coverage_pct: number;
  };
  pattern_accuracy: { pattern: string; attempts: number; correct: number; accuracy: number }[];
  weak_areas: { pattern: string; attempts: number; correct: number; accuracy: number; error_rate: number }[];
  heatmap: { date: string; count: number }[];
  readiness: {
    score: number;
    coverage_pct: number;
    mature_pct: number;
    exercise_accuracy: number;
    total_attempts: number;
  };
  recent_ratings: { rating: string; c: number }[];
  streak: { current_streak: number; total_active_days: number };
}

const MASTERY_COLORS = {
  mature:    '#4a5e3a',     // moss
  learning:  '#1a3a5c',     // deep-blue
  new_cards: '#c9a84c',     // gold
};

const RATING_COLORS: Record<string, string> = {
  '忘れた': '#c0392b',
  '難しい': '#c9a84c',
  '普通':   '#1a3a5c',
  '簡単':   '#4a5e3a',
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ink/40 text-sm">分析データを読み込み中…</p>
      </div>
    );
  }

  const masteryData = [
    { name: '習得済み (≥21日)', value: data.vocab_mastery.mature,    color: MASTERY_COLORS.mature },
    { name: '学習中',           value: data.vocab_mastery.learning,  color: MASTERY_COLORS.learning },
    { name: '未学習',           value: data.vocab_mastery.new_cards, color: MASTERY_COLORS.new_cards },
  ];

  const topPatterns  = data.pattern_accuracy.slice(0, 12);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-2">
        <h1 className="font-serif text-3xl font-bold text-ink hanko-line">学習分析</h1>
        <p className="text-ink/50 text-sm mt-3">Learning Analytics</p>
      </div>

      {/* ── Top row: readiness + KPI tiles ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 ink-border bg-aged-paper/40 rounded-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={15} className="text-vermillion" />
            <h2 className="text-sm font-medium text-ink uppercase tracking-widest">合格予測スコア</h2>
          </div>
          <ReadinessGauge
            score={data.readiness.score}
            components={{
              coverage_pct:      data.readiness.coverage_pct,
              mature_pct:        data.readiness.mature_pct,
              exercise_accuracy: data.readiness.exercise_accuracy,
            }}
          />
          <p className="text-xs text-ink/40 text-center mt-5 leading-relaxed">
            頻出度重み付きカバレッジ × 0.4 + 習得率 × 0.3 + 演習正答率 × 0.3
          </p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <KPITile
            icon={Flame}
            iconColor="text-vermillion"
            label="現在の連続学習"
            value={`${data.streak.current_streak}日`}
            sublabel={`累計 ${data.streak.total_active_days}日`}
          />
          <KPITile
            icon={Calendar}
            iconColor="text-deep-blue"
            label="今日のレビュー待ち"
            value={String(data.vocab_mastery.due_today)}
            sublabel={`${data.vocab_mastery.introduced} 学習中`}
          />
          <KPITile
            icon={BookOpen}
            iconColor="text-moss"
            label="語彙習得率"
            value={`${data.vocab_mastery.mastery_pct}%`}
            sublabel={`${data.vocab_mastery.mature} / ${data.vocab_mastery.introduced}`}
          />
          <KPITile
            icon={BarChart3}
            iconColor="text-amber-600"
            label="演習回数"
            value={String(data.readiness.total_attempts)}
            sublabel={`正答率 ${data.readiness.exercise_accuracy}%`}
          />
        </div>
      </div>

      {/* ── Vocab mastery breakdown ────────────────────────────────────────── */}
      <div className="ink-border bg-aged-paper/40 rounded-sm p-6">
        <h2 className="text-sm font-medium text-ink uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen size={14} className="text-deep-blue" />
          語彙習熟度の内訳
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={masteryData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="none"
              >
                {masteryData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {masteryData.map(m => {
              const pct = data.vocab_mastery.total > 0
                ? Math.round((m.value / data.vocab_mastery.total) * 100)
                : 0;
              return (
                <div key={m.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ background: m.color }} />
                      <span className="text-ink">{m.name}</span>
                    </span>
                    <span className="text-ink/60 font-mono">{m.value} ({pct}%)</span>
                  </div>
                </div>
              );
            })}
            <div className="border-t border-ink/10 pt-3 mt-2">
              <p className="text-xs text-ink/50">
                総 N1 語彙: <span className="text-ink font-medium font-mono">{data.vocab_mastery.total}</span>
              </p>
              <p className="text-xs text-ink/50 mt-1">
                カバレッジ: <span className="text-ink font-medium font-mono">{data.vocab_mastery.coverage_pct}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Per-pattern accuracy ───────────────────────────────────────────── */}
      <div className="ink-border bg-aged-paper/40 rounded-sm p-6">
        <h2 className="text-sm font-medium text-ink uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart3 size={14} className="text-moss" />
          文法パターン別 正答率
        </h2>
        {topPatterns.length === 0 ? (
          <p className="text-sm text-ink/50 text-center py-8">
            まだ演習データがありません。<a href="/exercises" className="text-vermillion hover:underline">演習を始める</a>
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, topPatterns.length * 28)}>
            <BarChart data={topPatterns} layout="vertical" margin={{ left: 100, right: 30, top: 5, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b5d4a' }} />
              <YAxis dataKey="pattern" type="category" tick={{ fontSize: 10, fill: '#1a1208' }} width={150} />
              <Tooltip
                contentStyle={{ background: '#f5f0e8', border: '1px solid rgba(26,18,8,0.15)', fontSize: 12 }}
              />
              <Bar dataKey="accuracy" fill="#4a5e3a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Weak areas ─────────────────────────────────────────────────────── */}
      <div className="ink-border bg-aged-paper/40 rounded-sm p-6">
        <h2 className="text-sm font-medium text-ink uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingDown size={14} className="text-vermillion" />
          弱点パターン Top 10
        </h2>
        {data.weak_areas.length === 0 ? (
          <p className="text-sm text-ink/50 text-center py-6">
            データ不足です（最低2回の演習で弱点判定）
          </p>
        ) : (
          <div className="space-y-2">
            {data.weak_areas.map((w, i) => (
              <div key={w.pattern} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-ink/40 w-6 text-right">{i + 1}.</span>
                <span className="font-serif text-ink flex-1 truncate">{w.pattern}</span>
                <div className="w-32 bg-ink/5 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-vermillion rounded-full transition-all" style={{ width: `${w.error_rate}%` }} />
                </div>
                <span className="text-vermillion font-mono text-xs w-12 text-right">{w.error_rate}%</span>
                <span className="text-ink/40 font-mono text-xs w-12 text-right">{w.correct}/{w.attempts}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Activity heatmap ───────────────────────────────────────────────── */}
      <div className="ink-border bg-aged-paper/40 rounded-sm p-6">
        <h2 className="text-sm font-medium text-ink uppercase tracking-widest mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-deep-blue" />
          学習活動ヒートマップ — 過去365日
        </h2>
        <Heatmap data={data.heatmap} />
      </div>

      {/* ── Recent rating distribution ─────────────────────────────────────── */}
      {data.recent_ratings.length > 0 && (
        <div className="ink-border bg-aged-paper/40 rounded-sm p-6">
          <h2 className="text-sm font-medium text-ink uppercase tracking-widest mb-4">
            過去7日間の SRS 評価分布
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.recent_ratings}>
              <XAxis dataKey="rating" tick={{ fontSize: 11, fill: '#1a1208' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b5d4a' }} />
              <Tooltip contentStyle={{ background: '#f5f0e8', border: '1px solid rgba(26,18,8,0.15)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="c" name="件数" radius={[4, 4, 0, 0]}>
                {data.recent_ratings.map((r, idx) => (
                  <Cell key={idx} fill={RATING_COLORS[r.rating] ?? '#666'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function KPITile({
  icon: Icon, iconColor, label, value, sublabel,
}: {
  icon: typeof Flame; iconColor: string; label: string; value: string; sublabel: string;
}) {
  return (
    <div className="ink-border bg-aged-paper/60 rounded-sm p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={iconColor} />
        <span className="text-xs text-ink/60 uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-serif text-3xl font-bold text-ink">{value}</p>
      <p className="text-xs text-ink/40 mt-1">{sublabel}</p>
    </div>
  );
}
