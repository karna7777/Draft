"use client";

import { useState } from "react";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { PHOTOS } from "@/lib/photos";

const STYLES = [
  { n: "Modern", sw: "#d8d5cd", sf: "#c6b79c", sa: "#2c2c2e", sky: "#dbe3ec", cap: "Cool greys, oak floors, matte black accents.", photo: PHOTOS.interior[1] },
  { n: "Minimal", sw: "#eceae4", sf: "#dcd6c8", sa: "#b8b3a8", sky: "#eef1f4", cap: "Off-white walls, pale wood, near-invisible detailing.", photo: PHOTOS.interior[3] },
  { n: "Warm", sw: "#e4d3bf", sf: "#c08f5e", sa: "#9a5b34", sky: "#f0e2cf", cap: "Terracotta and walnut, soft lamplight, natural linen.", photo: PHOTOS.interior[0] },
  { n: "Contemporary", sw: "#cfd4d6", sf: "#a9adb0", sa: "#3f5a63", sky: "#d5e0e4", cap: "Slate, brushed steel, deep teal upholstery.", photo: PHOTOS.interior[5] },
  { n: "Classic", sw: "#e6e1d3", sf: "#b79a6f", sa: "#5a3b28", sky: "#eae4d4", cap: "Panelled walls, dark timber, brass and deep wood.", photo: PHOTOS.interior[2] },
];

export default function Styles() {
  const [i, setI] = useState(0);
  const s = STYLES[i];
  return (
    <section id="styles" className="wrap section">
      <div className="styles-grid">
        <Reveal>
          <div className="styles-copy">
            <span className="num accent">MAKE IT YOURS</span>
            <h2 className="styles-h">
              Find the style <span className="serif-i">that feels like you.</span>
            </h2>
            <p className="lead" style={{ color: "var(--stone)", marginTop: 18, maxWidth: 420 }}>
              Keep the layout, change the feeling. The same space shifts in materials, palette and mood — while the plan
              stays exactly as you designed it.
            </p>
            <div className="styles-list">
              {STYLES.map((st, idx) => (
                <button key={st.n} className={`styles-item ${i === idx ? "on" : ""}`} onClick={() => setI(idx)}>
                  <span className="si-name">{st.n}</span>
                  <span className="si-cap">{st.cap}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div
            className="scene styles-scene"
            style={{ "--sw": s.sw, "--sf": s.sf, "--sa": s.sa, "--sky": s.sky } as React.CSSProperties}
          >
            <div className="backwall" />
            <div className="floor" />
            <div className="window" />
            <div className="win-mull" />
            <div className="lamp" />
            <div className="sofa" />
            <div className="rug" />
            <Photo key={s.photo} src={s.photo} alt={`${s.n} interior`} />
            <div className="styles-tag mono">{s.n.toUpperCase()}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
