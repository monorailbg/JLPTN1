import { NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const offset = (page - 1) * limit;

  const db = getDb();
  const items = db.prepare('SELECT * FROM vocabulary ORDER BY id LIMIT ? OFFSET ?').all(limit, offset);
  const total = (db.prepare('SELECT COUNT(*) as c FROM vocabulary').get() as { c: number }).c;

  return NextResponse.json({ items, total, page, limit });
}
