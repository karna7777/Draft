"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Reveal from "./Reveal";
import type { HeroView } from "./HeroScene";

// three.js is heavy — load it only in the browser, and only when this section
// is about to enter view, so it stays out of the initial homepage bundle.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <div className="dim2-ph" />,
});

const MODES: { id: HeroView; label: string }[] = [
  { id: "exterior", label: "Exterior" },
  { id: "plan", label: "Floor plan" },
  { id: "interior", label: "Interior" },
];

export default function Dimension() {
  const [view, setView] = useState<HeroView>("exterior");
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="tone-navy dim2">
      <div className="wrap section">
        <div className="dim2-grid">
          <Reveal>
            <div className="dim2-copy">
              <p className="eyebrow accent">Interactive 3D</p>
              <h2 className="dim2-h">
                See the space<br />before you build it.
              </h2>
              <p className="dim2-sub">
                The same design, in three dimensions. Move from the street, to the plan, to standing inside — the camera
                travels with you.
              </p>
              <div className="dim2-modes" role="group" aria-label="View">
                {MODES.map((m) => (
                  <button key={m.id} className={view === m.id ? "on" : ""} onClick={() => setView(m.id)}>{m.label}</button>
                ))}
              </div>
              <p className="dim2-hint mono">Move your cursor to look around · hover a room</p>
            </div>
          </Reveal>
          <div className="dim2-stage" ref={stageRef}>
            {mounted ? <HeroScene view={view} /> : <div className="dim2-ph" />}
          </div>
        </div>
      </div>
    </section>
  );
}
