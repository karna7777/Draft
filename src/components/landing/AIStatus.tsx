"use client";

export default function AIStatus({ status, demo }: { status: string; demo: boolean }) {
  return (
    <div className="ais" aria-live="polite">
      {demo && <span className="ais-demo mono">DEMO MODE</span>}
      <span className={`ais-dot ${status ? "on" : ""}`} />
      <span className="ais-text mono">{status || " "}</span>
    </div>
  );
}
