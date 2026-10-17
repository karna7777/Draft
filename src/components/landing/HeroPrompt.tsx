"use client";

import { useState } from "react";

const EXAMPLES = [
  "3BHK, open kitchen, east-facing, 30×50 plot",
  "Compact 2BHK, cross-ventilated, rentable studio",
  "4BHK villa, double-height living, home office",
];

export default function HeroPrompt({ onSubmit }: { onSubmit: (brief: string) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  function submit() {
    const v = value.trim();
    if (!v || busy) return;
    setBusy(true);
    onSubmit(v);
  }

  return (
    <div className="hp">
      <div className="hp-box">
        <input
          className="hp-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="3BHK, open kitchen, east-facing, 30×50 plot…"
          aria-label="Describe your home"
          autoComplete="off"
        />
        <button className="hp-go" onClick={submit} disabled={busy} aria-label="Begin designing">
          {busy ? (
            <span className="hp-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          )}
        </button>
      </div>
      <div className="hp-chips">
        {EXAMPLES.map((ex) => (
          <button key={ex} className="hp-chip" onClick={() => setValue(ex)}>{ex}</button>
        ))}
      </div>
    </div>
  );
}
