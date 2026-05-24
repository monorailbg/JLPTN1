import { NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET() {
  const db = getDb();

  const stats = (type: string) =>
    db.prepare(`
      SELECT
        COUNT(*) as reviewed,
        SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct
      FROM progress WHERE item_type = ?
    `).get(type) as { reviewed: number; correct: number };

  const vocabStats = stats('vocabulary');
  const grammarStats = stats('grammar');
  const readingStats = stats('reading');

  const today = new Date().toISOString().split('T')[0];
  const todayCount = (db.prepare(`
    SELECT COUNT(*) as c FROM progress WHERE date(reviewed_at) = ?
  `).get(today) as { c: number }).c;

  // Calculate streak
  const dates = (db.prepare(`
    SELECT date FROM streaks ORDER BY date DESC
  `).all() as { date: string }[]).map(r => r.date);

  let streakDays = 0;
  const now = new Date();
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(now);
    expected.setDate(now.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (dates[i] === expectedStr) streakDays++;
    else break;
  }

  return NextResponse.json({
    vocabReviewed: vocabStats.reviewed,
    vocabCorrect: vocabStats.correct ?? 0,
    grammarReviewed: grammarStats.reviewed,
    grammarCorrect: grammarStats.correct ?? 0,
    readingReviewed: readingStats.reviewed,
    readingCorrect: readingStats.correct ?? 0,
    streakDays,
    todayCount,
  });
}
