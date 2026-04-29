// scripts/seed.js  — run once: node scripts/seed.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

const ARTICLES = [
  {
    title: "The Silent Revolution in Deep Ocean Mapping",
    date: "2025-01-14",
    category: "Science",
    author: "Dr. Priya Nair",
    summary: "A fleet of autonomous submarines is rewriting what we know about the ocean floor, uncovering geological features that challenge decades of theory.",
    image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80",
    paragraphs: [
      "For decades, scientists estimated that less than 25% of the ocean floor had been mapped with meaningful resolution. That number is changing fast. A new generation of autonomous underwater vehicles, capable of operating at depths exceeding 6,000 meters, has begun transmitting data that is reshaping oceanographic models entirely. Researchers at the International Ocean Discovery Program announced last month that three previously unknown mountain chains had been identified in the southern Pacific — each taller than the Alps when measured from their base.",
      "The implications extend beyond geography. These formations appear to influence deep ocean current patterns in ways that existing climate models have not accounted for, prompting urgent revisions to long-term ocean heat distribution projections. Dr. Yuki Tanaka of the Woods Hole Oceanographic Institution described the discoveries as like finding an entire continent hiding under the water.",
      "Perhaps most surprisingly, biological surveys conducted alongside the mapping missions have returned with evidence of microbial ecosystems thriving in hydrothermal vent fields unknown to science until now. Some specimens have shown metabolic pathways with no close analogs in existing taxonomy, raising the possibility of a distinct lineage of life.",
    ],
  },
  {
    title: "Urban Forests Are Growing Faster Than Cities Expected",
    date: "2025-02-03",
    category: "Environment",
    author: "Meena Krishnamurthy",
    summary: "City-led reforestation drives planted with modest ambitions are now generating ecological corridors that wildlife biologists never anticipated.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    paragraphs: [
      "When Mumbai launched its Million Trees Initiative in 2021, municipal planners set a conservative target: modest shade cover along arterial roads and a handful of pocket parks. Four years later, the initiative has not only exceeded its planting goals by 340%, but has generated something planners did not model — a functioning ecological corridor running nearly 18 kilometres through the city's northern suburbs.",
      "Ecologists studying the phenomenon attribute the acceleration to a poorly understood feedback loop. As tree canopy density crosses a threshold, microclimatic conditions shift — humidity rises, soil temperatures moderate, and wind speeds drop at ground level.",
      "The pattern is being observed in cities as climatically different as Oslo, Nairobi, and Chengdu. Researchers at the Global Urban Forest Network are now proposing a revised model of urban reforestation that treats early plantings less as a finished landscape and more as a catalyst.",
    ],
  },
  {
    title: "The Architects Designing Buildings That Breathe",
    date: "2025-03-22",
    category: "Architecture",
    author: "Arjun Mehta",
    summary: "A new wave of structural engineers is embedding living biological systems into the bones of buildings, creating facades that clean air and generate energy simultaneously.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    paragraphs: [
      "The facade of the new civic library in Rotterdam does not look particularly unusual at first glance — its surfaces are a warm amber-green, textured in a way that suggests brushed concrete. On closer inspection, the panels are alive. Each module houses a culture of microalgae suspended in a transparent polymer matrix.",
      "The project, designed by the firm Metabolic Architectures in collaboration with biochemical engineers from Delft University of Technology, is one of seven bioreactive building skins completed or under construction in Europe.",
      "Skeptics raise valid questions about maintenance complexity and long-term durability. Biological systems introduce variability that structural engineers are not traditionally trained to manage, and the failure modes are unlike anything in conventional building codes.",
    ],
  },
  {
    title: "Language Models Are Being Used to Decode Ancient Scripts",
    date: "2025-04-09",
    category: "Technology",
    author: "Siddharth Rao",
    summary: "AI systems trained on dozens of known languages are making surprising progress on scripts that have resisted scholarly decipherment for over a century.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
    paragraphs: [
      "The Linear A script of ancient Crete has defeated classicists for more than a hundred years. Unlike Linear B — its successor, deciphered in 1952 — Linear A has no bilingual key, no Rosetta Stone equivalent, and only a few hundred known inscriptions, most of them administrative tallies on clay tablets.",
      "The model was not trained to translate Linear A directly — researchers are careful to say that full decipherment remains distant. What it has produced are probabilistic phonological mappings: estimates of how individual signs may have been pronounced based on their structural relationships to known cognates in adjacent scripts.",
      "The methodology is being applied to other stubborn cases: Proto-Elamite, the Indus Valley script, and several undeciphered inscriptions from Bronze Age Anatolia. Computational epigraphers are quick to caution against overstatement — the models can surface patterns but cannot supply meaning.",
    ],
  },
];

async function seed() {
  try {
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
    console.log('✓ Table ready');

    for (const a of ARTICLES) {
      await pool.query(
        `INSERT INTO articles (title, date, category, author, summary, image, paragraphs)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [a.title, a.date, a.category, a.author, a.summary, a.image, a.paragraphs]
      );
    }
    console.log(`✓ Seeded ${ARTICLES.length} articles`);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await pool.end();
  }
}

seed();
