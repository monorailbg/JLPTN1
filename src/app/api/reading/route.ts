import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { annotatePassage } from '@/lib/annotator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const passageId = searchParams.get('passageId');

  const db = getDb();

  if (passageId) {
    const passage = db.prepare(
      'SELECT * FROM reading_passages WHERE id = ?'
    ).get(Number(passageId)) as { id: number; content: string } | undefined;

    if (!passage) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const questions = db.prepare(
      'SELECT * FROM reading_questions WHERE passage_id = ?'
    ).all(Number(passageId));

    const segments = annotatePassage(db, passage.content);

    return NextResponse.json({ passage, questions, segments });
  }

  const passages = db.prepare(`
    SELECT id, title, difficulty, category, passage_type
    FROM reading_passages
    ORDER BY passage_type, id
  `).all();
  return NextResponse.json({ passages });
}
