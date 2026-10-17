"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { Brief, DEFAULT_BRIEF } from "@/lib/store";
import { createProject } from "@/lib/api";

const STYLES = ["Warm Modern", "Minimal", "Contemporary", "Courtyard", "Coastal", "Classic"];
const EXAMPLES = [
  "A warm 3-bedroom courtyard home on a 30 × 50 ft plot, open kitchen joined to the living room, master with attached bath, parking for one car.",
  "A compact 2-bedroom home on a narrow 20 × 45 ft lot with great cross-ventilation and a studio that can be rented out.",
  "A 4-bedroom family villa on 40 × 60 ft with a double-height living room, a home office, and a two-car garage.",
];

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="cr-field">
      <label>{label}</label>
      <div className="cr-stepper">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Decrease ${label}`}>–</button>
        <span className="mono">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState(EXAMPLES[0]);
  const [brief, setBrief] = useState<Brief>(DEFAULT_BRIEF);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<Brief>) => setBrief((b) => ({ ...b, ...patch }));

  async function generate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { project } = await createProject({ prompt, brief, name: name || undefined });
      router.push(`/editor?id=${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the project");
      setBusy(false);
    }
  }

  return (
    <div className="app tone-charcoal">
      <header className="app-bar">
        <Link href="/projects" className="brand">
          <BrandMark />
          Draft
        </Link>
        <span className="app-step mono">STEP 1 · DESCRIBE</span>
        <Link href="/projects" className="app-exit">Exit</Link>
      </header>

      <main className="cr-main">
        <div className="cr-grid">
          <div className="cr-left">
            <p className="eyebrow accent">New project</p>
            <h1 className="cr-h">Describe your home.</h1>
            <p className="cr-sub">Write it the way you&apos;d explain it to an architect. Draft reads the intent — the details beside it just sharpen the starting point.</p>

            <label className="cr-plabel mono" htmlFor="cr-name">PROJECT NAME <em>optional</em></label>
            <input id="cr-name" className="cr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Dream Home" />

            <label className="cr-plabel mono" htmlFor="cr-prompt">YOUR BRIEF</label>
            <textarea id="cr-prompt" className="cr-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} aria-label="Describe your home" />

            <div className="cr-chips">
              {EXAMPLES.map((ex, i) => (
                <button type="button" key={i} className="chip" onClick={() => setPrompt(ex)}>Example {i + 1}</button>
              ))}
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}
          </div>

          <aside className="cr-right">
            <div className="cr-panel">
              <div className="cr-panel-h mono">REQUIREMENTS</div>
              <div className="cr-steppers">
                <Stepper label="Bedrooms" value={brief.bedrooms} min={1} max={8} onChange={(v) => set({ bedrooms: v })} />
                <Stepper label="Bathrooms" value={brief.bathrooms} min={1} max={6} onChange={(v) => set({ bathrooms: v })} />
                <Stepper label="Floors" value={brief.floors} min={1} max={3} onChange={(v) => set({ floors: v })} />
              </div>

              <div className="cr-field">
                <label>Plot size ({brief.unit})</label>
                <div className="cr-plot">
                  <input className="mono" type="number" value={brief.plotW} min={5} max={500} onChange={(e) => set({ plotW: +e.target.value })} />
                  <span>×</span>
                  <input className="mono" type="number" value={brief.plotH} min={5} max={500} onChange={(e) => set({ plotH: +e.target.value })} />
                  <div className="cr-unit">
                    <button type="button" className={brief.unit === "ft" ? "on" : ""} onClick={() => set({ unit: "ft" })}>ft</button>
                    <button type="button" className={brief.unit === "m" ? "on" : ""} onClick={() => set({ unit: "m" })}>m</button>
                  </div>
                </div>
              </div>

              <div className="cr-field cr-row">
                <label>Covered parking</label>
                <button type="button" className={`cr-toggle ${brief.parking ? "on" : ""}`} onClick={() => set({ parking: !brief.parking })} aria-pressed={brief.parking}>
                  <span />
                </button>
              </div>

              <div className="cr-field">
                <label>Style direction</label>
                <div className="cr-styles">
                  {STYLES.map((s) => (
                    <button type="button" key={s} className={`cr-style ${brief.style === s ? "on" : ""}`} onClick={() => set({ style: s })}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="cr-field">
                <label>Estimated budget <em>optional</em></label>
                <input
                  className="cr-text mono"
                  type="number"
                  min={0}
                  value={brief.budget ?? ""}
                  onChange={(e) => set({ budget: e.target.value === "" ? null : +e.target.value })}
                  placeholder="e.g. 4000000"
                />
              </div>

              <div className="cr-field">
                <label>Location <em>optional</em></label>
                <input
                  className="cr-text"
                  value={brief.location ?? ""}
                  onChange={(e) => set({ location: e.target.value || null })}
                  placeholder="e.g. Pune, India"
                />
              </div>
            </div>

            <button type="button" className="cr-generate" onClick={generate} disabled={busy}>
              {busy ? "Generating your design…" : "Generate design"}
              {!busy && (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              )}
            </button>
            <p className="cr-note mono">Conceptual design for exploration — review by a licensed professional required before construction.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
