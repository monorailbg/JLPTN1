'use client';

import { useEffect, useState } from 'react';
import { Target, Flame, CheckCircle2 } from 'lucide-react';

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

  useEffect(() => {
    fetch('/api/goals').then(r => r.json()).then((d: GoalsData) => {
      setData(d);
      setRGoal(d.goal.daily_reviews);
      setEGoal(d.goal.daily_exercises);
    });
  }, []);

  async function save() {
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_reviews: rGoal, daily_exercises: eGoal }),
    });
    const d: GoalsData = await fetch('/api/goals').then(r => r.json());
    setData(d);
    setEditing(false);
  }

  if (!data) return null;

  const reviewPct  = Math.min(100, Math.round((data.today.reviews_done  / data.goal.daily_reviews)   * 100));
  const exPct      = Math.min(100, Math.round((data.today.exercises_done / data.goal.daily_exercises) * 100));
  const reviewDone = data.today.reviews_done  >= data.goal.daily_reviews;
  const exDone     = data.today.exercises_done >= data.goal.daily_exercises;
  const allDone    = reviewDone && exDone;

  return (
    <div className={`ink-border rounded-sm p-4 ${allDone ? 'bg-moss/10' : 'bg-aged-paper/40'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {allDone
            ? <CheckCircle2 size={15} className="text-moss" />
            : <Target size={15} className="text-vermillion" />}
          <span className="text-sm font-medium text-ink">
            {allDone ? '本日の目標達成！' : '本日の学習目標'}
          </span>
          {data.streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gold font-mono ml-2">
              <Flame size={11} />
              {data.streak}日連続
            </span>
          )}
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          className="text-xs text-ink/40 hover:text-ink transition-colors"
        >
          目標を変更
        </button>
      </div>

      {editing ? (
        <div className="flex flex-wrap items-end gap-3 mt-1">
          <label className="flex flex-col gap-1 text-xs text-ink/60">
            復習目標（枚）
            <input
              type="number" min={1} max={200} value={rGoal}
              onChange={e => setRGoal(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-ink/15 rounded-sm bg-washi text-ink text-sm focus:outline-none focus:border-vermillion/50"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink/60">
            演習目標（問）
            <input
              type="number" min={1} max={100} value={eGoal}
              onChange={e => setEGoal(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-ink/15 rounded-sm bg-washi text-ink text-sm focus:outline-none focus:border-vermillion/50"
            />
          </label>
          <button
            onClick={save}
            className="px-3 py-1.5 bg-vermillion text-white text-xs rounded-sm hover:bg-vermillion/90 transition-colors"
          >
            保存
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 border border-ink/15 text-ink/60 text-xs rounded-sm hover:text-ink transition-colors"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <GoalBar
            label="SRS 復習"
            done={data.today.reviews_done}
            goal={data.goal.daily_reviews}
            pct={reviewPct}
            complete={reviewDone}
          />
          <GoalBar
            label="文法演習"
            done={data.today.exercises_done}
            goal={data.goal.daily_exercises}
            pct={exPct}
            complete={exDone}
          />
        </div>
      )}
    </div>
  );
}

function GoalBar({
  label, done, goal, pct, complete,
}: {
  label: string; done: number; goal: number; pct: number; complete: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-ink/60">{label}</span>
        <span className={`font-mono ${complete ? 'text-moss' : 'text-ink/60'}`}>
          {done} / {goal}
        </span>
      </div>
      <div className="h-2 bg-ink/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${complete ? 'bg-moss' : 'bg-vermillion'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
