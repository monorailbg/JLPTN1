import { NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const passageId = searchParams.get('passageId');

  const db = getDb();

  if (passageId) {
    const passage = db.prepare('SELECT * FROM reading_passages WHERE id = ?').get(Number(passageId));
    const questions = db.prepare('SELECT * FROM reading_questions WHERE passage_id = ?').all(Number(passageId));
    return NextResponse.json({ passage, questions });
  }

  const passages = db.prepare('SELECT id, title, difficulty, category FROM reading_passages ORDER BY id').all();
  return NextResponse.json({ passages });
}
