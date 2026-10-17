"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getGsap, prefersReducedMotion } from "@/lib/scroll";
import type { HoverInfo } from "./FilmCanvas";
import HeroPrompt from "./HeroPrompt";
import SceneSections from "./SceneSections";
import MobileFallback from "./MobileFallback";

// Lazy-load the 3D so first paint is instant (and it never SSRs).
const FilmCanvas = dynamic(() => import("./FilmCanvas"), { ssr: false });

export default function FilmStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [simple, setSimple] = useState(false); // mobile or reduced-motion → static fallback
  const [beat, setBeat] = useState(0);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    setSimple(mobile || prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!mounted || simple || !sectionRef.current) return;
    const { ScrollTrigger } = getGsap();

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=420%",
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        progress.current = p;
        const b = p < 0.18 ? 0 : p < 0.5 ? 1 : p < 0.74 ? 2 : 3;
        setBeat((prev) => (prev === b ? prev : b));
        // Fade the hero out in sync with the scene before the captions start.
        const hero = heroRef.current;
        if (hero) {
          const f = Math.min(1, p / 0.12);
          hero.style.opacity = String(1 - f);
          hero.style.transform = `translateY(${-28 * f}px)`;
          hero.style.pointerEvents = p > 0.06 ? "none" : "auto";
        }
      },
    });
    return () => { st.kill(); };
  }, [mounted, simple]);

  function onBrief(brief: string) {
    try { sessionStorage.setItem("draft:brief", brief); } catch {}
    router.push("/create");
  }

  if (mounted && simple) {
    return <MobileFallback onBrief={onBrief} />;
  }

  return (
    <section className="film" ref={sectionRef}>
      <div className="film-canvas">
        {mounted && <FilmCanvas progress={progress} onHover={setHover} />}
      </div>
      <div className="film-grad" aria-hidden="true" />

      <div className="film-hero" ref={heroRef}>
        <p className="film-eyebrow mono"><span className="film-rule" />DRAFT · AI RESIDENTIAL DESIGN STUDIO</p>
        <h1 className="film-title">Space is only<br />the beginning.</h1>
        <p className="film-sub">
          Describe a home in plain words. Watch it build itself in 3D, edit it in 2D or 3D,
          then design every room — conceptual, never construction documents.
        </p>
        <HeroPrompt onSubmit={onBrief} />
      </div>

      <SceneSections beat={beat} />

      {hover && (
        <div className="film-tip mono" style={{ left: hover.x + 14, top: hover.y + 14 }}>
          {hover.name} · <span>{hover.area} sq ft</span>
        </div>
      )}

      <div className="film-scrollhint mono" aria-hidden="true">SCROLL</div>
    </section>
  );
}
