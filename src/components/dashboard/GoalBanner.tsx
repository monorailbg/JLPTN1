'use client';

import { useEffect, useState } from 'react';
import { Target, Flame, CheckCircle2, Pencil, X } from 'lucide-react';

interface GoalsData {
  goal:   { daily_reviews: number; daily_exercises: number };
  today:  { reviews_done: number; exercises_done: number };
  streak: number;
}

export default function GoalBanner() {
  const [data,    setData]    = useState<GoalsData | null>(null);
  const [editing, setEditing] = useState(false);
  const [rGoal,   setRGoal]   = useState(20);
  const [eGoal,   setEGoal]   = useState(10);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch('/api/goals').then(r => r.json()).then((d: GoalsData) => {
      setData(d);
      setRGoal(d.goal.daily_reviews);
      setEGoal(d.goal.daily_exercises);
    });
  }, []);

  async function save() {
    setSaving(true);
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_reviews: rGoal, daily_exercises: eGoal }),
    });
    const d: GoalsData = await fetch('/api/goals').then(r => r.json());
    setData(d);
    setEditing(false);
    setSaving(false);
  }

  if (!data) {
    return <div className="h-[136px] rounded-2xl bg-paper border border-hairline animate-pulse" />;
  }

  const reviewPct  = Math.min(100, Math.round((data.today.reviews_done   / data.goal.daily_reviews)   * 100));
  const exPct      = Math.min(100, Math.round((data.today.exercises_done / data.goal.daily_exercises) * 100));
  const reviewDone = data.today.reviews_done   >= data.goal.daily_reviews;
  const exDone     = data.today.exercises_done >= data.goal.daily_exercises;
  const allDone    = reviewDone && exDone;

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-colors ${
      allDone
        ? 'bg-moss/8 border-moss/20'
        : 'bg-paper border-hairline'
    }`}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`grid place-items-center w-9 h-9 rounded-xl ${
              allDone ? 'bg-moss/15 text-moss' : 'bg-vermillion/10 text-vermillion'
            }`}>
              {allDone ? <CheckCircle2 size={17} strokeWidth={2.25} /> : <Target size={17} strokeWidth={2.25} />}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-ink leading-tight">
                {allDone ? '本日の目標を達成しました' : '本日の学習目標'}
              </h3>
              <p className="text-[11px] text-ink-3 mt-0.5 tracking-wide">
                {allDone ? "今日はもう休んでもOK 🌱" : `Today's daily goal`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {data.streak > 0 && !editing && (
              <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/15 text-gold text-[12px] font-semibold tabular">
                <Flame size={11} strokeWidth={2.5} />
                {data.streak}日
              </span>
            )}
            <button
              onClick={() => setEditing(e => !e)}
              aria-label={editing ? '閉じる' : '目標を編集'}
              className="grid place-items-center w-8 h-8 rounded-full text-ink-3 hover:text-ink hover:bg-ink/[0.05] transition-colors"
            >
              {editing ? <X size={14} /> : <Pencil size={13} />}
            </button>
          </div>
        </div>

        {editing ? (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-ink-3 font-medium">復習目標</span>
              <input
                type="number" min={1} max={200} value={rGoal}
                onChange={e => setRGoal(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-xl bg-paper-sunken border border-hairline text-ink tabular text-[15px] font-semibold focus:outline-none focus:border-vermillion/40"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-ink-3 font-medium">演習目標</span>
              <input
                type="number" min={1} max={100} value={eGoal}
                onChange={e => setEGoal(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-xl bg-paper-sunken border border-hairline text-ink tabular text-[15px] font-semibold focus:outline-none focus:border-vermillion/40"
              />
            </label>
            <button onClick={save} disabled={saving} className="btn btn-primary">
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GoalRow label="SRS 復習"   done={data.today.reviews_done}   goal={data.goal.daily_reviews}   pct={reviewPct} complete={reviewDone} />
            <GoalRow label="文法演習"  done={data.today.exercises_done} goal={data.goal.daily_exercises} pct={exPct}     complete={exDone} />
          </div>
        )}
      </div>
    </div>
  );
}

function GoalRow({ label, done, goal, pct, complete }: {
  label: string; done: number; goal: number; pct: number; complete: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[13px] text-ink-2 font-medium">{label}</span>
        <span className={`tabular text-[13px] font-semibold ${complete ? 'text-moss' : 'text-ink'}`}>
          {done}<span className="text-ink-3 font-normal">/{goal}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-paper-sunken overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            complete ? 'bg-moss' : 'bg-gradient-to-r from-vermillion to-gold'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
