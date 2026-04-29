export default async function ArticlePage({ params }) {
  const res = await fetch(`http://localhost:3000/api/articles/${params.id}`, {
    cache: "no-store",
  });

  const article = await res.json();

  if (!article?.id) {
    return <div style={{ padding: "2rem" }}>Article not found</div>;
  }

  return (
    <main style={{ maxWidth: 700, margin: "auto", padding: "2rem" }}>
      <h1>{article.title}</h1>
      <p><i>By {article.author}</i></p>

      {article.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </main>
  );
}