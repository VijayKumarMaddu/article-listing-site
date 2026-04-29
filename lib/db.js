import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;

/* Run once to create the table */
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id         SERIAL PRIMARY KEY,
      title      TEXT    NOT NULL,
      date       DATE    NOT NULL,
      category   TEXT    NOT NULL DEFAULT 'Science',
      author     TEXT    NOT NULL,
      summary    TEXT    NOT NULL,
      image      TEXT,
      paragraphs TEXT[]  NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
