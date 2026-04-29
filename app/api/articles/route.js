import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

/* Ensure table exists on first request */
let initialised = false;
async function ensureDb() {
  if (!initialised) { await initDb(); initialised = true; }
}

/* ── GET /api/articles ── */
export async function GET() {
  try {
    await ensureDb();
    const { rows } = await pool.query(
      `SELECT * FROM articles ORDER BY date DESC, created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/articles', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── POST /api/articles ── */
export async function POST(req) {
  try {
    await ensureDb();
    const { title, date, category, author, summary, image, paragraphs } = await req.json();

    if (!title || !date || !author || !summary || !paragraphs?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO articles (title, date, category, author, summary, image, paragraphs)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, date, category || 'Science', author, summary, image || null, paragraphs]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('POST /api/articles', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
