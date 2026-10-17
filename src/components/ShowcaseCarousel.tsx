"use client";

import { useEffect, useRef, useState } from "react";
import ExteriorScene, { ExtVariant } from "./scenes/ExteriorScene";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { PHOTOS } from "@/lib/photos";

type Float = "prompt" | "generate" | "chat" | "style" | "view";
interface Slide {
  step: string;
  title: string;
  desc: string;
  photo: string;
  variant: ExtVariant;
  floats: Float[];
}

const SLIDES: Slide[] = [
  { step: "01 · Describe", title: "Say it in plain words", desc: "A sentence about how you want to live becomes a brief Draft can build from.", photo: PHOTOS.interior[1], variant: "warm", floats: ["prompt"] },
  { step: "02 · Generate", title: "A plan draws itself", desc: "Rooms, adjacencies and circulation resolve into a layout that holds together.", photo: PHOTOS.exterior[0], variant: "dusk", floats: ["generate"] },
  { step: "03 · Refine", title: "Change it by talking", desc: "Ask for what you want and watch the design respond, room by room.", photo: PHOTOS.interior[0], variant: "warm", floats: ["chat"] },
  { step: "04 · Style", title: "Find the feeling", desc: "Keep the layout, shift the materials, palette and mood across the same space.", photo: PHOTOS.interior[5], variant: "day", floats: ["style"] },
  { step: "05 · Visualize", title: "See it in three dimensions", desc: "Move from plan to massing to interior — the same design, understood at a glance.", photo: PHOTOS.exterior[2], variant: "day", floats: ["view"] },
];

function Floating({ kind }: { kind: Float }) {
  if (kind === "prompt")
    return (
      <div className="fw fw-prompt">
        <div className="fw-label mono">DESCRIBE YOUR HOME</div>
        <div className="fw-text">“A 3-bedroom courtyard home, full of morning light.”</div>
        <div className="fw-pill accentpill">Generate →</div>
      </div>
    );
  if (kind === "generate")
    return (
      <>
        <div className="fw fw-chip">◍ Generating concept…</div>
        <div className="fw fw-stat">
          <b>1,540</b> sq ft <span>· 3 bed · 2.5 bath</span>
        </div>
      </>
    );
  if (kind === "chat")
    return (
      <>
        <div className="fw fw-bubble user">“Make the kitchen larger and open it to the living room.”</div>
        <div className="fw fw-bubble ai">
          <span className="mono">DRAFT</span>Done — updated the layout.
        </div>
      </>
    );
  if (kind === "style")
    return (
      <div className="fw fw-style">
        <div className="fw-label mono">STYLE</div>
        <div className="fw-sw">
          {["#2c2c2e", "#c08f5e", "#8a9b84", "#b8b3a8", "#5a3b28"].map((c, i) => (
            <span key={c} style={{ background: c, outline: i === 1 ? "2px solid #fff" : "none" }} />
          ))}
        </div>
        <div className="fw-mat mono">WARM · walnut, linen, brass</div>
      </div>
    );
  return (
    <div className="fw fw-view">
      {["Exterior", "Floor plan", "Interior"].map((v, i) => (
        <span key={v} className={i === 2 ? "on" : ""}>
          {v}
        </span>
      ))}
    </div>
  );
}

export default function ShowcaseCarousel() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => (inView.current = e[0].isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (reduce) return () => io.disconnect();
    const iv = window.setInterval(() => {
      if (playing && inView.current) setI((p) => (p + 1) % SLIDES.length);
    }, 4200);
    return () => {
      io.disconnect();
      clearInterval(iv);
    };
  }, [playing]);

  return (
    <section className="tone-charcoal showcase" ref={ref}>
      <div className="wrap section" style={{ paddingBottom: 0 }}>
        <Reveal>
          <div className="show-head">
            <div className="sec-head mega" style={{ marginBottom: 0, maxWidth: 720 }}>
              <span className="num">HOW DRAFT WORKS</span>
              <h2>
                Watch an idea <span className="serif-i">become a home.</span>
              </h2>
            </div>
            <div className="uc-arrows">
              <button className="uc-arrow" onClick={() => { setPlaying(false); setI((p) => (p - 1 + SLIDES.length) % SLIDES.length); }} aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <button className="uc-arrow" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
                {playing ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>
                )}
              </button>
              <button className="uc-arrow" onClick={() => { setPlaying(false); setI((p) => (p + 1) % SLIDES.length); }} aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="show-viewport">
        <div
          className="show-track"
          style={{ transform: `translateX(calc(50vw - ${i} * (var(--cardw) + 26px) - var(--cardw) / 2))` }}
        >
          {SLIDES.map((s, idx) => (
            <article
              key={s.step}
              className={`show-card ${idx === i ? "on" : ""}`}
              onClick={() => { setPlaying(false); setI(idx); }}
            >
              <div className="show-media">
                <ExteriorScene variant={s.variant} />
                <Photo src={s.photo} alt={s.title} />
                <div className="show-scrim" />
                <div className="show-copy">
                  <div className="show-step mono">{s.step}</div>
                  <h3 className="show-title">{s.title}</h3>
                  <p className="show-desc">{s.desc}</p>
                </div>
                {idx === i && s.floats.map((f) => <Floating key={f} kind={f} />)}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="wrap show-foot">
        <div className="show-progress">
          {SLIDES.map((_, idx) => (
            <button key={idx} className={idx === i ? "on" : ""} onClick={() => { setPlaying(false); setI(idx); }}>
              <span style={{ animationPlayState: idx === i && playing ? "running" : "paused" }} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
