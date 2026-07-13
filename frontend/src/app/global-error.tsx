"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "50vh", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
          <div style={{ border: "1px solid #fecaca", borderRadius: "1rem", backgroundColor: "#fef2f2", padding: "2rem", maxWidth: "28rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#b91c1c" }}>Something went wrong</h2>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#dc2626" }}>
              {error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", backgroundColor: "#5A206D", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600, marginRight: "0.75rem" }}
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600 }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
