import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "4rem", textAlign: "center" }}>
      <h1>TheInkPress</h1>
      <p>Independent journalism — depth over speed.</p>

      <div style={{ marginTop: "2rem" }}>
        <Link href="/news">Go to News →</Link>
      </div>
    </main>
  );
}