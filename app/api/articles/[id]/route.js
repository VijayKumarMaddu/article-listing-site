import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/* ── GET /api/articles/[id] ── */
export async function GET(req, { params }) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM articles WHERE id = $1',
      [params.id]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

/* ── PUT /api/articles/[id] ── */
export async function PUT(req, { params }) {
  try {
    const {
      title,
      date,
      category,
      author,
      summary,
      image,
      paragraphs,
    } = await req.json();

    if (!title || !date || !author || !summary || !paragraphs?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `UPDATE articles
       SET title=$1, date=$2, category=$3, author=$4,
           summary=$5, image=$6, paragraphs=$7
       WHERE id=$8
       RETURNING *`,
      [
        title,
        date,
        category || 'Science',
        author,
        summary,
        image || null,
        paragraphs,
        params.id,
      ]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

/* ── DELETE /api/articles/[id] ── */
export async function DELETE(req, { params }) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM articles WHERE id = $1',
      [params.id]
    );

    if (!rowCount) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}