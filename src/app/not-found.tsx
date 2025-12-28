export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Page not found</h1>
        <div style={{ marginTop: 8 }}>
          The page you’re looking for does not exist.
        </div>
        <a href="/" className="roundedBtn" style={{ marginTop: 12, background: "var(--blue)", color: "#fff", padding: "8px 12px", fontWeight: 600 }}>
          Go Home
        </a>
      </div>
    </section>
  );
}
