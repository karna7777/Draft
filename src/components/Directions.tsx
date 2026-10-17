"use client";

import { useState } from "react";
import ExteriorScene, { ExtVariant } from "./scenes/ExteriorScene";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { PHOTOS } from "@/lib/photos";

const CONCEPTS: {
  name: string;
  tag: string;
  material: string;
  base: ExtVariant;
  hover: ExtVariant;
  photo: string;
}[] = [
  { name: "Warm Modern", tag: "Concept 01", material: "Cedar · limewash · bronze", base: "dusk", hover: "warm", photo: PHOTOS.exterior[0] },
  { name: "Courtyard House", tag: "Concept 02", material: "Rammed earth · oak · glass", base: "day", hover: "dusk", photo: PHOTOS.exterior[2] },
  { name: "Minimal Coastal", tag: "Concept 03", material: "White render · ash · stone", base: "day", hover: "night", photo: PHOTOS.exterior[3] },
];

export default function Directions() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section className="tone-charcoal">
      <div className="wrap section">
        <Reveal>
          <div className="sec-head mega" style={{ maxWidth: 760 }}>
            <span className="num">SAME BRIEF, MANY LIVES</span>
            <h2>
              One brief. <span className="serif-i">Different ways to live.</span>
            </h2>
            <p className="lead" style={{ color: "var(--stone)" }}>
              Draft explores genuinely different directions from the same requirements — so you choose the life, not just
              the layout.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="dir-grid">
            {CONCEPTS.map((c, i) => (
              <article
                key={c.name}
                className="dir-card"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div className="scene-frame dir-frame">
                  <ExteriorScene variant={hover === i ? c.hover : c.base} />
                  <Photo src={c.photo} alt={c.name} />
                  <div className="scene-cap">
                    <div>
                      <div className="sc-tag">{c.tag}</div>
                      <div className="sc-title">{c.name}</div>
                    </div>
                    <div className="sc-idx">{c.material}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
