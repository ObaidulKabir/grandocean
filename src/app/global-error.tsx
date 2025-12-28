"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <section className="section">
          <div className="container">
            <h1 className="title">App Error</h1>
            <div style={{ marginTop: 8 }}>
              {error?.message || "Unexpected application error"}
            </div>
            <button
              className="roundedBtn"
              style={{ marginTop: 12, background: "var(--blue)", color: "#fff", padding: "8px 12px", fontWeight: 600 }}
              onClick={() => reset()}
            >
              Reload
            </button>
          </div>
        </section>
      </body>
    </html>
  );
}
