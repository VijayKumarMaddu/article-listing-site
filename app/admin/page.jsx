"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();

        if (Array.isArray(data)) {
          setArticles(data);
        } else {
          console.error("API ERROR:", data);
          setError(data.error || "Failed to load articles");
          setArticles([]);
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
        setArticles([]);
      }
    };

    load();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: "2rem" }}>
      <h1>News</h1>

      {error && (
        <p style={{ color: "red", marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      {articles.length === 0 ? (
        <p>No articles available.</p>
      ) : (
        articles.map(article => (
          <Link key={article.id} href={`/articles/${article.id}`}>
            <div
              style={{
                borderBottom: "1px solid #ddd",
                padding: "1rem 0",
                cursor: "pointer",
              }}
            >
              <h2>{article.title}</h2>
              <p>{article.summary}</p>
              <small>By {article.author}</small>
            </div>
          </Link>
        ))
      )}
    </main>
  );
}