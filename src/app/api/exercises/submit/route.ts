import { NextResponse } from 'next/server';
import { getDb } from '@/db';

const USER_ID = 'local';

export async function POST(request: Request) {
  const body = await request.json();
  const { exerciseId, selectedIndex } = body as {
    exerciseId: number;
    selectedIndex: number;
  };

  if (typeof exerciseId !== 'number' || typeof selectedIndex !== 'number') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const db = getDb();
  const ex = db.prepare(
    `SELECT id, type, grammar_pattern, correct_index FROM exercises WHERE id = ?`
  ).get(exerciseId) as
    | { id: number; type: string; grammar_pattern: string | null; correct_index: number }
    | undefined;

  if (!ex) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
  }

  const correct = selectedIndex === ex.correct_index ? 1 : 0;

  db.prepare(`
    INSERT INTO exercise_attempts
      (user_id, exercise_id, exercise_type, grammar_pattern, selected_index, correct)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(USER_ID, ex.id, ex.type, ex.grammar_pattern, selectedIndex, correct);

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`INSERT OR IGNORE INTO streaks (user_id, date) VALUES (?, ?)`).run(USER_ID, today);

  return NextResponse.json({ correct: correct === 1, correct_index: ex.correct_index });
}
