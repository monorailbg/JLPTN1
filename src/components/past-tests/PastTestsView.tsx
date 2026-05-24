'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, Languages, Calendar, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PastTestItem {
  item_type:       'vocabulary' | 'grammar';
  item_id:         number;
  item_text:       string;
  reading:         string | null;
  meaning:         string | null;
  formality:       string | null;
  exam_count:      number;
  question_count:  number;
  last_seen_year:  number | null;
  frequency_score: number;
  score_basis:     string;
  total_exams:     number;
  years_appeared:  number[];
  section_format:  string;
}

interface PastTestsData {
  items:       PastTestItem[];
  totals:      { item_type: string; c: number; avg_score: number }[];
  total_exams: number;
  period:      { from: number; to: number };
}

type SortKey = 'exam_count' | 'frequency_score' | 'last_seen_year';

export default function PastTestsView() {
  const [data,       setData]       = useState<PastTestsData | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'vocabulary' | 'grammar'>('all');
  const [query,      setQuery]      = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [sortKey,    setSortKey]    = useState<SortKey>('exam_count');
  const [sortAsc,    setSortAsc]    = useState(false);
  const [expanded,   setExpanded]   = useState<number | null>(null);
  const [loading,    setLoading]    = useState(true);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (debouncedQ) params.set('q', debouncedQ);
    fetch(`/api/past-tests?${params}`)
      .then(r => r.json())
      .then((d: PastTestsData) => { setData(d); setLoading(false); });
  }, [typeFilter, debouncedQ]);

  useEffect(() => { load(); }, [load]);

  const sorted = data ? [...data.items].sort((a, b) => {
    let diff = 0;
    if (sortKey === 'exam_count')      diff = a.exam_count - b.exam_count;
    if (sortKey === 'frequency_score') diff = a.frequency_score - b.frequency_score;
    if (sortKey === 'last_seen_year')  diff = (a.last_seen_year ?? 0) - (b.last_seen_year ?? 0);
    return sortAsc ? diff : -diff;
  }) : [];

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortAsc(a => !a);
    else { setSortKey(k); setSortAsc(false); }
  }

  const vocabTotal   = data?.totals.find(t => t.item_type === 'vocabulary');
  const grammarTotal = data?.totals.find(t => t.item_type === 'grammar');

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-vermillion mb-2">
          Past Test Reference
        </p>
        <h1 className="font-serif text-[32px] sm:text-[40px] font-bold text-ink leading-[1.05] tracking-tight">
          過去問データベース
        </h1>
        <p className="text-ink-2 mt-2 text-[14px]">
          N1 (2010–2023) · {data?.total_exams ?? 28} sessions analyzed
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile
          icon={BarChart3}
          iconColor="text-vermillion"
          label="収録試験数"
          value={`${data?.total_exams ?? 28}回`}
          sub="2010年7月〜2023年12月"
        />
        <StatTile
          icon={Languages}
          iconColor="text-deep-blue"
          label="語彙アイテム"
          value={vocabTotal ? String(vocabTotal.c) : '—'}
          sub={vocabTotal ? `平均スコア ${vocabTotal.avg_score.toFixed(1)}` : ''}
        />
        <StatTile
          icon={BookOpen}
          iconColor="text-moss"
          label="文法アイテム"
          value={grammarTotal ? String(grammarTotal.c) : '—'}
          sub={grammarTotal ? `平均スコア ${grammarTotal.avg_score.toFixed(1)}` : ''}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            placeholder="語彙・文法・読みで検索…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-3 text-[14px] bg-paper border border-hairline rounded-full text-ink placeholder:text-ink-3 focus:outline-none focus:border-vermillion/40"
          />
        </div>
        <div className="segmented self-start sm:self-auto">
          {(['all', 'vocabulary', 'grammar'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={typeFilter === t ? 'active' : ''}
            >
              {t === 'all' ? 'すべて' : t === 'vocabulary' ? '語彙' : '文法'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ink-border bg-aged-paper/40 rounded-sm overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2 border-b border-ink/10 text-xs text-ink/50 uppercase tracking-widest">
          <span>アイテム</span>
          <SortBtn label="出現試験" k="exam_count"      active={sortKey} asc={sortAsc} onSort={toggleSort} />
          <SortBtn label="頻出度"   k="frequency_score" active={sortKey} asc={sortAsc} onSort={toggleSort} />
          <SortBtn label="最終出題" k="last_seen_year"  active={sortKey} asc={sortAsc} onSort={toggleSort} />
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <p className="text-ink/40 text-sm">読み込み中…</p>
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="flex items-center justify-center h-40">
            <p className="text-ink/40 text-sm">該当するアイテムがありません</p>
          </div>
        )}

        {!loading && sorted.map((item, idx) => (
          <div key={`${item.item_type}-${item.item_id}`}>
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-3 text-left hover:bg-ink/3 transition-colors border-b border-ink/5"
            >
              {/* Item cell */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <TypeBadge type={item.item_type} />
                  <span className="font-serif text-base text-ink font-medium">{item.item_text}</span>
                  {item.reading && (
                    <span className="text-xs text-vermillion font-mono">({item.reading})</span>
                  )}
                </div>
                <p className="text-xs text-ink/55 mt-0.5 truncate">{item.meaning}</p>
              </div>

              {/* Exam count */}
              <div className="flex flex-col items-end justify-center gap-1 min-w-[72px]">
                <span className="font-mono text-sm text-ink font-semibold">{item.exam_count}回</span>
                <div className="w-16 h-1.5 bg-ink/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-vermillion rounded-full"
                    style={{ width: `${Math.round((item.exam_count / item.total_exams) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Frequency score */}
              <div className="flex flex-col items-end justify-center min-w-[56px]">
                <span className="font-mono text-sm text-ink">{item.frequency_score.toFixed(1)}</span>
                <span className="text-xs text-ink/35">/ 100</span>
              </div>

              {/* Last seen year */}
              <div className="flex flex-col items-end justify-center min-w-[52px]">
                {item.last_seen_year ? (
                  <>
                    <span className="font-mono text-sm text-ink">{item.last_seen_year}</span>
                    <span className="text-xs text-ink/35">年</span>
                  </>
                ) : (
                  <span className="text-xs text-ink/30">—</span>
                )}
              </div>
            </button>

            {/* Expanded detail */}
            {expanded === idx && (
              <div className="px-6 py-4 bg-aged-paper/70 border-b border-ink/10 space-y-3">
                {/* Section format */}
                <div>
                  <p className="text-xs text-ink/40 uppercase tracking-widest mb-1">出題セクション</p>
                  <p className="text-sm text-deep-blue font-medium">{item.section_format}</p>
                </div>

                {/* Year chips */}
                {item.years_appeared.length > 0 && (
                  <div>
                    <p className="text-xs text-ink/40 uppercase tracking-widest mb-2">
                      出題年度（推定）
                      <span className="ml-2 normal-case text-ink/25 font-normal">
                        ※ 出題数から逆算した目安です
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.years_appeared.map(y => (
                        <YearChip key={y} year={y} isLatest={y === item.last_seen_year} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Formality / score_basis */}
                <div className="flex gap-6 text-xs text-ink/50">
                  {item.formality && (
                    <span>文体: <span className="text-ink font-medium">{item.formality}</span></span>
                  )}
                  <span>スコア根拠: <span className="text-ink font-medium">{item.score_basis}</span></span>
                  <span>設問数: <span className="text-ink font-medium">{item.question_count}</span></span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-ink/30 text-center pb-4">
        データは公開資料・研究データセットに基づく推定値です。実際の試験結果とは異なる場合があります。
      </p>
    </div>
  );
}

function TypeBadge({ type }: { type: 'vocabulary' | 'grammar' }) {
  return (
    <span className={cn(
      'text-[10px] px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wide',
      type === 'vocabulary'
        ? 'bg-deep-blue/10 text-deep-blue'
        : 'bg-moss/10 text-moss'
    )}>
      {type === 'vocabulary' ? '語彙' : '文法'}
    </span>
  );
}

function YearChip({ year, isLatest }: { year: number; isLatest: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm border font-mono',
      isLatest
        ? 'bg-vermillion/10 border-vermillion/30 text-vermillion'
        : 'bg-ink/5 border-ink/10 text-ink/60'
    )}>
      {isLatest && <Calendar size={9} />}
      {year}
    </span>
  );
}

function SortBtn({
  label, k, active, asc, onSort,
}: {
  label: string; k: SortKey; active: SortKey; asc: boolean; onSort: (k: SortKey) => void;
}) {
  const isActive = active === k;
  return (
    <button
      onClick={() => onSort(k)}
      className={cn(
        'flex items-center gap-0.5 text-xs uppercase tracking-widest transition-colors',
        isActive ? 'text-ink' : 'text-ink/40 hover:text-ink/70'
      )}
    >
      {label}
      {isActive
        ? (asc ? <ChevronUp size={10} /> : <ChevronDown size={10} />)
        : <ChevronDown size={10} className="opacity-30" />}
    </button>
  );
}

function StatTile({
  icon: Icon, iconColor, label, value, sub,
}: {
  icon: typeof BarChart3; iconColor: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="rounded-2xl bg-paper border border-hairline p-4 sm:p-5">
      <div className={`grid place-items-center w-9 h-9 rounded-xl bg-paper-sunken mb-3 ${iconColor}`}>
        <Icon size={15} strokeWidth={2} />
      </div>
      <p className="text-[10px] text-ink-3 uppercase tracking-[0.15em] font-medium mb-1">{label}</p>
      <p className="font-serif text-[24px] sm:text-[28px] font-bold text-ink tabular leading-none">{value}</p>
      <p className="text-[11px] text-ink-3 mt-1.5">{sub}</p>
    </div>
  );
}
