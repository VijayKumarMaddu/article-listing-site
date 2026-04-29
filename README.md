# TheInkPress — Next.js + PostgreSQL

A full-stack news publishing platform built with Next.js App Router and PostgreSQL.

## Project Structure

```
inkpress/
├── app/
│   ├── api/
│   │   └── articles/
│   │       ├── route.js          ← GET all, POST create
│   │       └── [id]/route.js     ← GET one, PUT update, DELETE
│   ├── layout.js
│   └── page.jsx                  ← Full React frontend
├── lib/
│   └── db.js                     ← PostgreSQL pool + table init
├── scripts/
│   └── seed.js                   ← Seed initial articles
├── .env.local.example
└── package.json
```

## API Endpoints

| Method | Path                  | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/articles         | List all articles    |
| POST   | /api/articles         | Create new article   |
| GET    | /api/articles/:id     | Get single article   |
| PUT    | /api/articles/:id     | Update article       |
| DELETE | /api/articles/:id     | Delete article       |

### Article JSON shape
```json
{
  "title": "string",
  "date": "YYYY-MM-DD",
  "category": "Science|Environment|Architecture|Technology|...",
  "author": "string",
  "summary": "string",
  "image": "https://... (optional)",
  "paragraphs": ["paragraph 1", "paragraph 2", "..."]
}
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your POSTGRES_URL

# 3. Seed initial articles (optional)
npm run seed

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/inkpress.git
git push -u origin main
```

### Step 2 — Create a Vercel project
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Leave all build settings as defaults (Vercel auto-detects Next.js)

### Step 3 — Add a PostgreSQL database

**Option A — Vercel Postgres (easiest)**
1. In your Vercel project → **Storage** tab → **Create Database** → choose Postgres
2. Once created, click **Connect to Project** — this auto-adds `POSTGRES_URL` to your env vars

**Option B — Neon (free tier, generous)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project, copy the **Connection string**
3. In Vercel → Project Settings → Environment Variables → add `POSTGRES_URL`

### Step 4 — Deploy
```bash
# Vercel auto-deploys on every push to main
git push origin main
```

### Step 5 — Seed production data (optional)
```bash
# Set POSTGRES_URL in your local .env.local to the production connection string, then:
npm run seed
```

> **Note:** The table is created automatically on first API request — no manual migration needed.

---

## Environment Variables

| Variable       | Description                              |
|----------------|------------------------------------------|
| `POSTGRES_URL` | Full PostgreSQL connection string (with `?sslmode=require` for Neon/Vercel Postgres) |
