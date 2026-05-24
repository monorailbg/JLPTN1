import { NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { itemType, itemId, result } = body as {
    itemType: string;
    itemId: number;
    result: 'correct' | 'incorrect';
  };

  if (!itemType || !itemId || !result) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const db = getDb();
  db.prepare(`
    INSERT INTO progress (item_type, item_id, result)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, item_type, item_id)
    DO UPDATE SET result = excluded.result, reviewed_at = datetime('now')
  `).run(itemType, itemId, result);

  const today = new Date().toISOString().split('T')[0];
  db.prepare(`INSERT OR IGNORE INTO streaks (date) VALUES (?)`).run(today);

  return NextResponse.json({ ok: true });
}
