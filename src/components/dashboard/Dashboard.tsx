'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardStats } from '@/types';
import { Flame, Languages, BookOpen, FileText, ArrowUpRight, Brain, FileEdit, BarChart3 } from 'lucide-react';
import AnalysisPanel from './AnalysisPanel';
import SRSSummaryCard from './SRSSummaryCard';
import GoalBanner from './GoalBanner';

function StatCard({
  label, sublabel, reviewed, correct, icon: Icon, href, kanji,
}: {
  label: string; sublabel: string; reviewed: number; correct: number;
  icon: React.ElementType; href: string; kanji: string;
}) {
  const pct = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
  return (
    <Link
      href={href}
      className="kanji-bg group block bg-paper hover:bg-paper-elev border border-hairline rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      data-kanji={kanji}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-vermillion/10 text-vermillion">
          <Icon size={18} strokeWidth={2} />
        </div>
        <ArrowUpRight size={16} className="text-ink-3 group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-3 mb-1">{label}</p>
      <p className="font-serif text-3xl font-bold text-ink tabular leading-none">{reviewed}</p>
      <p className="text-xs text-ink-3 mt-1.5">{sublabel}</p>
      {reviewed > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-ink-3 mb-1.5">
            <span>正答率</span>
            <span className="tabular text-ink-2 font-medium">{pct}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      )}
    </Link>
  );
}

function QuickAction({ href, label, sub, icon: Icon }: {
  href: string; label: string; sub: string; icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-paper hover:bg-paper-elev border border-hairline transition-all"
    >
      <div className="grid place-items-center w-9 h-9 rounded-xl bg-paper-sunken text-ink-2 group-hover:bg-vermillion/10 group-hover:text-vermillion transition-colors">
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold text-ink text-[14px] leading-snug">{label}</p>
        <p className="text-[11px] text-ink-3 mt-0.5">{sub}</p>
      </div>
      <ArrowUpRight size={14} className="text-ink-3 group-hover:text-ink transition-colors flex-shrink-0" />
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setStats);
  }, []);

  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-vermillion mb-2">
            日本語能力試験 N1
          </p>
          <h1 className="font-serif text-[34px] sm:text-[42px] font-bold text-ink leading-[1.05] tracking-tight text-balance">
            今日も一歩、合格へ。
          </h1>
          <p className="text-ink-2 mt-2 text-[14px] sm:text-[15px] text-balance">
            Master N1 vocabulary, grammar, and reading comprehension — one session at a time.
          </p>
        </div>

        {/* Streak chip */}
        {stats && stats.streakDays > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-end px-3.5 py-2 rounded-full bg-vermillion/10 border border-vermillion/15 animate-slide-up">
            <Flame size={15} className="text-vermillion" strokeWidth={2.25} />
            <span className="text-[13px] font-semibold text-vermillion tabular">
              {stats.streakDays}日 連続
            </span>
          </div>
        )}
      </header>

      {/* ── Daily goal banner ────────────────────────────────────────────── */}
      <GoalBanner />

      {/* ── Section progress ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-2">学習セクション</h2>
          <span className="text-[11px] text-ink-3">Section progress</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            label="語彙"  sublabel="Vocabulary"
            reviewed={stats?.vocabReviewed ?? 0}
            correct={stats?.vocabCorrect ?? 0}
            icon={Languages} href="/vocabulary" kanji="語"
          />
          <StatCard
            label="文法"  sublabel="Grammar"
            reviewed={stats?.grammarReviewed ?? 0}
            correct={stats?.grammarCorrect ?? 0}
            icon={BookOpen} href="/grammar" kanji="文"
          />
          <StatCard
            label="読解"  sublabel="Reading"
            reviewed={stats?.readingReviewed ?? 0}
            correct={stats?.readingCorrect ?? 0}
            icon={FileText} href="/reading" kanji="読"
          />
        </div>
      </section>

      {/* ── SRS summary ──────────────────────────────────────────────────── */}
      <SRSSummaryCard />

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-2">クイックスタート</h2>
          <span className="text-[11px] text-ink-3">Quick start</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <QuickAction href="/srs"        label="SRS フラッシュカード"   sub="Spaced repetition review" icon={Brain} />
          <QuickAction href="/exercises"  label="文法演習"               sub="Sentence completion · fill-blank · error ID" icon={FileEdit} />
          <QuickAction href="/reading"    label="読解練習"               sub="N1-level passages with vocab popups"        icon={FileText} />
          <QuickAction href="/analytics"  label="学習分析"               sub="Mastery, weak areas, exam readiness"        icon={BarChart3} />
        </div>
      </section>

      {/* ── Frequency analysis ───────────────────────────────────────────── */}
      <AnalysisPanel />
    </div>
  );
}
