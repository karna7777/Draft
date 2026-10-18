"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/scroll";

const CARDS = [
  {
    k: "01", t: "Describe", d: "Say it in plain words — bedrooms, plot, orientation, budget. Draft reads the intent.",
    visual: (
      <div className="cc-prompt">
        <span className="cc-prompt-line">3BHK, open kitchen,</span>
        <span className="cc-prompt-line">east-facing, 30×50 plot</span>
        <span className="cc-caret" />
      </div>
    ),
  },
  {
    k: "02", t: "Architect", d: "A real, editable floor plan — not a picture. Move walls, resize rooms, add floors.",
    visual: (
      <svg className="cc-plan" viewBox="0 0 120 150" fill="none">
        <rect x="2" y="2" width="116" height="146" stroke="currentColor" strokeWidth="1" opacity=".5" />
        <rect x="6" y="6" width="60" height="54" stroke="currentColor" strokeWidth="1" />
        <rect x="66" y="6" width="48" height="54" stroke="currentColor" strokeWidth="1" />
        <rect x="6" y="60" width="44" height="40" stroke="currentColor" strokeWidth="1" />
        <rect x="50" y="60" width="64" height="40" stroke="currentColor" strokeWidth="1" />
        <rect x="6" y="100" width="108" height="44" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    k: "03", t: "Walk in", d: "Watch the plan rise into 3D and travel from the street to standing inside.",
    visual: (
      <div className="cc-massing">
        <div className="cc-box a" /><div className="cc-box b" /><div className="cc-box c" />
      </div>
    ),
  },
  {
    k: "04", t: "Style", d: "Keep the layout, change the feeling — materials, colour, furniture and light, live.",
    visual: (
      <div className="cc-swatches">
        {["#c7a16b", "#6b4a2f", "#e7e1d5", "#2b2f36", "#9EC5FF", "#8b9a7a"].map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>
    ),
  },
  {
    k: "05", t: "Present", d: "Save concepts, compare them, and share a complete home as one living document.",
    visual: (
      <div className="cc-docs"><span /><span /><span /></div>
    ),
  },
];

export default function Chapters() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!section.current || !track.current) return;
    if (prefersReducedMotion() || window.matchMedia("(max-width: 860px)").matches) return;
    const { gsap } = getGsap(); // getGsap() registers ScrollTrigger internally
    const el = track.current;

    // Scroll-linked horizontal slide WITHOUT pinning (pinning corrupts the
    // compositor/capture for everything below it). The track parallaxes left
    // as the section passes through the viewport.
    const tween = gsap.fromTo(
      el,
      { x: () => Math.min(0, window.innerWidth * 0.12) },
      {
        x: () => -(el.scrollWidth - window.innerWidth + 80),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top 80%",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }
    );
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);

  return (
    <section className="ch2" ref={section}>
      <div className="ch2-head">
        <p className="hs-eyebrow mono"><span className="hs-rule" />HOW DRAFT WORKS</p>
        <h2 className="ch2-h">One idea,<br />all the way to a home.</h2>
      </div>
      <div className="ch2-track" ref={track}>
        {CARDS.map((c) => (
          <article className="cc" key={c.k}>
            <div className="cc-visual">{c.visual}</div>
            <div className="cc-body">
              <span className="cc-k mono">{c.k}</span>
              <h3 className="cc-t">{c.t}</h3>
              <p className="cc-d">{c.d}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
