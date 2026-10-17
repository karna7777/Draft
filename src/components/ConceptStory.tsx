"use client";

import { useEffect, useRef, useState } from "react";
import FloorPlan from "./FloorPlan";
import House3D from "./House3D";
import Reveal from "./Reveal";
import { baseModel } from "@/lib/floorplan";

const STEPS = [
  { k: "Describe", d: "A sentence about how you want to live." },
  { k: "Draft", d: "Draft lays out a plan that holds together." },
  { k: "Massing", d: "The plan rises into three dimensions." },
  { k: "Live in it", d: "Step inside and feel the space." },
];

export default function ConceptStory() {
  const [step, setStep] = useState(0);
  const rooms = baseModel();
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => (active.current = e[0].isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (reduce) return () => io.disconnect();
    const iv = window.setInterval(() => {
      if (active.current) setStep((s) => (s + 1) % STEPS.length);
    }, 3000);
    return () => {
      io.disconnect();
      clearInterval(iv);
    };
  }, []);

  return (
    <section id="concept" className="tone-warm">
      <div className="wrap section" ref={ref}>
        <div className="concept-grid">
          <div className="concept-copy">
            <Reveal>
              <p className="eyebrow accent">The starting point</p>
              <h2 className="concept-h">
                One idea. <span className="serif-i">A complete starting point.</span>
              </h2>
              <p className="lead" style={{ color: "var(--stone)", marginTop: 18, maxWidth: 460 }}>
                A plain description becomes a real place — plan, structure and light — that you can keep shaping.
              </p>
            </Reveal>
            <ol className="concept-steps">
              {STEPS.map((s, i) => (
                <li key={s.k}>
                  <button className={i === step ? "on" : ""} onClick={() => setStep(i)}>
                    <span className="cs-idx mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="cs-k">{s.k}</span>
                    <span className="cs-d">{s.d}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="concept-stage">
            <div className={`cstep ${step === 0 ? "on" : ""}`}>
              <div className="cs-prompt">
                <div className="mono cs-plabel">PROMPT</div>
                <p>“A warm 3-bedroom home with an open kitchen, a courtyard, and morning light in the bedrooms.”</p>
              </div>
            </div>
            <div className={`cstep ${step === 1 ? "on" : ""}`}>
              <div className="cs-planwrap">
                <FloorPlan rooms={rooms} ambient={step === 1} />
              </div>
            </div>
            <div className={`cstep ${step === 2 ? "on" : ""}`}>
              <House3D rooms={rooms} />
            </div>
            <div className={`cstep ${step === 3 ? "on" : ""}`}>
              <div
                className="scene cs-interior"
                style={
                  { "--sw": "#e6dcc8", "--sf": "#c7a878", "--sa": "#a05f38", "--sky": "#f1e4cd" } as React.CSSProperties
                }
              >
                <div className="backwall" />
                <div className="floor" />
                <div className="window" />
                <div className="win-mull" />
                <div className="lamp" />
                <div className="sofa" />
                <div className="rug" />
              </div>
            </div>
            <div className="concept-progress">
              {STEPS.map((_, i) => (
                <span key={i} className={i === step ? "on" : ""} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
