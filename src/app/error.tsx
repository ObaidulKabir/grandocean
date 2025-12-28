"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Something went wrong</h1>
        <div style={{ marginTop: 8 }}>
          {error?.message || "Unexpected error"}
        </div>
        <button
          className="roundedBtn"
          style={{ marginTop: 12, background: "var(--blue)", color: "#fff", padding: "8px 12px", fontWeight: 600 }}
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </section>
  );
}
