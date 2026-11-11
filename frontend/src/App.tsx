import { useEffect, useState } from "react";

type Health = "checking" | "ok" | "unreachable";

const labels: Record<Health, string> = {
  checking: "checking…",
  ok: "ok",
  unreachable: "unreachable",
};

export default function App() {
  const [health, setHealth] = useState<Health>("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((body: { status?: string }) => setHealth(body.status === "ok" ? "ok" : "unreachable"))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Health check failed", err);
          setHealth("unreachable");
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Office Talk</h1>
        <p className="muted">
          Backend: <strong className={`status-${health}`}>{labels[health]}</strong>
        </p>
      </section>
    </main>
  );
}
