"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NewsPage() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArticles(data);
        } else {
          console.error("API error:", data);
          setArticles([]); // fallback
        }
      });
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: "2rem" }}>
      <h1>News</h1>

      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        articles.map(article => (
          <Link key={article.id} href={`/articles/${article.id}`}>
            <div style={{ borderBottom: "1px solid #ddd", padding: "1rem 0" }}>
              <h2>{article.title}</h2>
              <p>{article.summary}</p>
            </div>
          </Link>
        ))
      )}
    </main>
  );
}