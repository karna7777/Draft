"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScene } from "@/lib/sequence/store";
import { resetAnim, finishAnim } from "@/lib/sequence/anim";
import { buildHeroSequence } from "@/lib/sequence/sequences";
import type { SeqControls } from "@/lib/sequence/engine";
import { prefersReducedMotion } from "@/lib/scroll";
import { generatePlan, createProject, saveProject } from "@/lib/api";
import { DEFAULT_BRIEF, type Brief } from "@/lib/store";
import { parseBrief } from "@/lib/ai/mock";
import type { PlanData } from "@/lib/plan";
import AIStatus from "@/components/landing/AIStatus";

const HeroScene = dynamic(() => import("@/components/landing/scene/HeroScene"), { ssr: false });

function briefToForm(text: string): Brief {
  const b = parseBrief(text);
  return { ...DEFAULT_BRIEF, bedrooms: b.beds, bathrooms: b.baths, floors: 1, plotW: b.plotW, plotH: b.plotH, style: b.style, notes: text };
}

export default function CreatePage() {
  const router = useRouter();
  const plan = useScene((s) => s.plan);
  const status = useScene((s) => s.status);
  const demoMode = useScene((s) => s.demoMode);
  const setStatus = useScene((s) => s.setStatus);
  const setPlan = useScene((s) => s.setPlan);
  const setDemoMode = useScene((s) => s.setDemoMode);

  const [mounted, setMounted] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [brief, setBrief] = useState("");
  const [phase, setPhase] = useState<"brief" | "generating" | "ready">("brief");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef<SeqControls | null>(null);

  const run = useCallback(async (text: string) => {
    setError(null);
    setPhase("generating");
    setStatus("Reading your brief…");
    try {
      const res = await generatePlan(text);
      setDemoMode(res.demoMode);
      setPlan(res.plan, res.source);
      const r = prefersReducedMotion();
      if (r) { finishAnim(res.plan.rooms.length); setStatus(""); }
      else {
        seq.current?.kill();
        resetAnim(res.plan.rooms.length);
        seq.current = buildHeroSequence(setStatus, () => setPhase("ready"));
        seq.current.play();
      }
      if (r) setPhase("ready");
    } catch {
      setError("Couldn't reach the design engine. Try again.");
      setPhase("brief");
    }
  }, [setStatus, setPlan, setDemoMode]);

  useEffect(() => {
    setMounted(true);
    setReduce(prefersReducedMotion());
    let seeded = "";
    try { seeded = sessionStorage.getItem("draft:brief") || ""; sessionStorage.removeItem("draft:brief"); } catch {}
    if (seeded) { setBrief(seeded); run(seeded); }
    return () => { seq.current?.kill(); };
  }, [run]);

  async function openEditor() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const p: PlanData = useScene.getState().plan;
      const form = briefToForm(brief || "home");
      const { project } = await createProject({ prompt: brief, brief: form, name: undefined });
      // replace the seeded floor's rooms with the generated plan
      const floors = project.floors.map((f, i) =>
        i === 0 ? { ...f, rooms: p.rooms.map((r) => ({ id: r.id, name: r.name, type: r.type, x: r.x, y: r.y, w: r.w, h: r.h })) } : f
      );
      const next = { ...project, plot: p.plot, brief: { ...project.brief, plotW: p.plot.w, plotH: p.plot.h }, floors };
      const saved = await saveProject(project.id, next);
      router.push(`/editor?id=${saved.project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the project");
      setSaving(false);
    }
  }

  return (
    <div className="cx">
      <div className="cx-canvas">{mounted && <HeroScene reduce={reduce} />}</div>
      <div className="cx-grad" aria-hidden="true" />

      <header className="cx-bar">
        <Link href="/" className="lnav-brand"><span className="lnav-mark" />Draft</Link>
        <span className="app-step mono">ARCHITECT · STEP 1</span>
        <Link href="/projects" className="app-exit">Exit</Link>
      </header>

      <div className="cx-ui">
        {phase === "brief" && (
          <div className="cx-brief">
            <p className="hs-eyebrow mono"><span className="hs-rule" />DESCRIBE YOUR HOME</p>
            <h1 className="cx-h">What do you want to build?</h1>
            <div className="hp-box cx-box">
              <input
                className="hp-input"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && brief.trim() && run(brief.trim())}
                placeholder="3BHK, open kitchen, east-facing, 30×50 plot…"
                aria-label="Describe your home"
                autoFocus
              />
              <button className="hp-go" onClick={() => brief.trim() && run(brief.trim())} aria-label="Generate">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
            <p className="tp-hint mono">Draft generates a real, editable plan — conceptual, not construction documents.</p>
          </div>
        )}

        {phase !== "brief" && (
          <div className="cx-foot">
            <AIStatus status={status} demo={demoMode} />
            <div className="cx-meta mono">{plan.rooms.length} rooms · {plan.plot.w}×{plan.plot.h} ft</div>
            <button className="btn-ice" onClick={openEditor} disabled={phase !== "ready" || saving}>
              {saving ? "Opening editor…" : phase === "ready" ? "Open in editor →" : "Generating…"}
            </button>
          </div>
        )}

        {error && <div className="auth-error cx-err" role="alert">{error}</div>}
      </div>
    </div>
  );
}
