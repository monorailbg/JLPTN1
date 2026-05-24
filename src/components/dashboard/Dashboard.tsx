'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardStats } from '@/types';
import { Flame, Languages, BookOpen, FileText, TrendingUp } from 'lucide-react';
import AnalysisPanel from './AnalysisPanel';
import SRSSummaryCard from './SRSSummaryCard';

function StatCard({
  label,
  reviewed,
  correct,
  icon: Icon,
  href,
  kanji,
}: {
  label: string;
  reviewed: number;
  correct: number;
  icon: React.ElementType;
  href: string;
  kanji: string;
}) {
  const pct = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
  return (
    <Link href={href} className="kanji-bg ink-border bg-aged-paper/60 p-5 rounded-sm hover:shadow-md transition-all group block" data-kanji={kanji}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-ink/50 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-bold text-ink">{reviewed}</p>
          <p className="text-xs text-ink/50 mt-0.5">reviews</p>
        </div>
        <Icon size={20} className="text-vermillion mt-1 group-hover:scale-110 transition-transform" />
      </div>
      {reviewed > 0 && (
        <div>
          <div className="flex justify-between text-xs text-ink/50 mb-1">
            <span>Accuracy</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink hanko-line">JLPT N1 学習</h1>
        <p className="text-ink/60 mt-3 text-sm">Master N1 vocabulary, grammar, and reading comprehension</p>
      </div>

      {/* Streak banner */}
      {stats && stats.streakDays > 0 && (
        <div className="flex items-center gap-3 bg-vermillion/10 border border-vermillion/20 rounded-sm px-4 py-3 mb-6 animate-slide-up">
          <Flame size={20} className="text-vermillion" />
          <span className="text-sm font-medium text-ink">
            {stats.streakDays}日連続学習中 — Keep it up!
          </span>
        </div>
      )}

      {/* Today stat */}
      {stats && (
        <div className="ink-border bg-aged-paper/40 px-4 py-3 mb-6 flex items-center gap-3 rounded-sm">
          <TrendingUp size={16} className="text-moss" />
          <span className="text-sm text-ink/70">
            今日の学習: <strong className="text-ink">{stats.todayCount}</strong> items reviewed
          </span>
        </div>
      )}

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="語彙 Vocabulary"
          reviewed={stats?.vocabReviewed ?? 0}
          correct={stats?.vocabCorrect ?? 0}
          icon={Languages}
          href="/vocabulary"
          kanji="語"
        />
        <StatCard
          label="文法 Grammar"
          reviewed={stats?.grammarReviewed ?? 0}
          correct={stats?.grammarCorrect ?? 0}
          icon={BookOpen}
          href="/grammar"
          kanji="文"
        />
        <StatCard
          label="読解 Reading"
          reviewed={stats?.readingReviewed ?? 0}
          correct={stats?.readingCorrect ?? 0}
          icon={FileText}
          href="/reading"
          kanji="読"
        />
      </div>

      {/* SRS summary */}
      <div className="mb-6">
        <SRSSummaryCard />
      </div>

      {/* Frequency analysis panel */}
      <div className="mb-6">
        <AnalysisPanel />
      </div>

      {/* Quick start */}
      <div className="border-t border-ink/10 pt-6">
        <h2 className="text-sm font-medium text-ink/50 uppercase tracking-widest mb-4">Quick Start</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/vocabulary', label: '語彙フラッシュカード', sub: 'Vocabulary flashcards' },
            { href: '/grammar', label: '文法ドリル', sub: 'Grammar drill' },
            { href: '/reading', label: '読解練習', sub: 'Reading practice' },
          ].map(({ href, label, sub }) => (
            <Link
              key={href}
              href={href}
              className="ink-border bg-aged-paper/60 px-4 py-3 rounded-sm hover:bg-aged-paper transition-colors group"
            >
              <p className="font-serif font-medium text-ink text-sm">{label}</p>
              <p className="text-xs text-ink/40 mt-0.5">{sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
