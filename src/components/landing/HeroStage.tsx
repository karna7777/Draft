"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useScene } from "@/lib/sequence/store";
import { resetAnim, finishAnim } from "@/lib/sequence/anim";
import { buildHeroSequence } from "@/lib/sequence/sequences";
import type { SeqControls } from "@/lib/sequence/engine";
import { prefersReducedMotion } from "@/lib/scroll";
import { generatePlan } from "@/lib/api";
import TypingPrompt from "./TypingPrompt";
import AIStatus from "./AIStatus";

const HeroScene = dynamic(() => import("./scene/HeroScene"), { ssr: false });

const DEFAULT_BRIEF = "3BHK, open kitchen, east-facing, 30×50 plot";

function webglOK(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HeroStage() {
  const router = useRouter();
  const status = useScene((s) => s.status);
  const demoMode = useScene((s) => s.demoMode);
  const setStatus = useScene((s) => s.setStatus);
  const setPlan = useScene((s) => s.setPlan);
  const setDemoMode = useScene((s) => s.setDemoMode);

  const [mounted, setMounted] = useState(false);
  const [cssFallback, setCssFallback] = useState(false); // phone or no-WebGL → lightweight static
  const [reduce, setReduce] = useState(false);
  const [inView, setInView] = useState(true);
  const [typed, setTypedLocal] = useState("");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const seq = useRef<SeqControls | null>(null);
  const timers = useRef<number[]>([]);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const playHero = useCallback(() => {
    seq.current?.kill();
    resetAnim(useScene.getState().plan.rooms.length);
    setPlaying(true);
    seq.current = buildHeroSequence(setStatus, () => setPlaying(false));
    seq.current.play();
  }, [setStatus]);

  const typeThenPlay = useCallback((text: string) => {
    clearTimers();
    setTypedLocal("");
    let i = 0;
    const tick = () => {
      i++;
      setTypedLocal(text.slice(0, i));
      if (i < text.length) timers.current.push(window.setTimeout(tick, 34));
      else timers.current.push(window.setTimeout(playHero, 350));
    };
    timers.current.push(window.setTimeout(tick, 500));
  }, [playHero]);

  useEffect(() => {
    setMounted(true);
    const gl = webglOK();
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const r = prefersReducedMotion();
    const css = !gl || mobile;
    setCssFallback(css);
    setReduce(r);
    if (css) { setTypedLocal(DEFAULT_BRIEF); return; }
    if (r) { finishAnim(useScene.getState().plan.rooms.length); setTypedLocal(DEFAULT_BRIEF); return; }
    typeThenPlay(DEFAULT_BRIEF);
    return () => { clearTimers(); seq.current?.kill(); };
  }, [typeThenPlay]);

  // Keep only one WebGL canvas live at a time — unmount the scene when the hero
  // is scrolled away (frees the GL context; one canvas composites reliably).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  async function onSubmit(brief: string) {
    if (busy) return;
    // phone / no-GL / reduced-motion → the full generate+save flow lives on /create
    if (cssFallback || reduce) {
      try { sessionStorage.setItem("draft:brief", brief); } catch {}
      router.push("/create");
      return;
    }
    setBusy(true);
    setTypedLocal(brief);
    setStatus("Reading your brief…");
    clearTimers();
    try {
      const res = await generatePlan(brief);
      setDemoMode(res.demoMode);
      setPlan(res.plan, res.source);
    } catch {
      setStatus("Network issue — replaying current layout");
    } finally {
      setBusy(false);
      playHero();
    }
  }

  return (
    <section className="hs" id="hero" ref={sectionRef}>
      <div className="hs-sky" aria-hidden="true" />
      <div className="hs-canvas">
        {mounted && !cssFallback && inView && <HeroScene reduce={reduce} />}
        {mounted && cssFallback && (
          <div className="hs-fallback" aria-hidden="true">
            <div className="mfb-plan"><span /><span /><span /><span /><span /></div>
          </div>
        )}
      </div>
      <div className="hs-grad" aria-hidden="true" />

      <div className="hs-ui">
        <div className={`hs-copy ${playing ? "dim" : ""}`}>
          <p className="hs-eyebrow mono"><span className="hs-rule" />DRAFT · AI RESIDENTIAL DESIGN STUDIO</p>
          <h1 className="hs-title">Describe it.<br />Watch it <em>become architecture.</em></h1>
          <p className="hs-sub">
            Type a home in plain words. Draft generates a real, editable plan and builds it in
            3D before your eyes — conceptual, never construction documents.
          </p>
        </div>
        <TypingPrompt value={typed} busy={busy} onSubmit={onSubmit} />
        {!cssFallback && <AIStatus status={status} demo={demoMode} />}
      </div>
    </section>
  );
}
