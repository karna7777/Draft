"use client";

import { useState } from "react";
import FloorPlan from "./FloorPlan";
import Reveal from "./Reveal";
import { area, baseModel, ft, Room } from "@/lib/floorplan";

const INITIAL = baseModel();

export default function Editor() {
  const [sel, setSel] = useState<Room>(INITIAL.find((r) => r.id === "master")!);

  return (
    <section id="editor" className="wrap section">
      <Reveal>
        <div className="sec-head">
          <span className="num accent">EDITABLE BY DESIGN</span>
          <h2>
            Not a picture. <span className="serif-i">A design you can change.</span>
          </h2>
          <p className="lead">
            Draft hands you a real drawing, not a render. Grab a room and move it, inspect any space, and watch the plan
            respond — the way professional design software should feel.
          </p>
        </div>
      </Reveal>
      <Reveal>
        <div className="editor" style={{ marginTop: 48 }}>
          <div className="editor-stage">
            <div className="toolbar">
              <span className="tool">◻ Select</span>
              <span className="tool">✥ Move room</span>
              <span className="tool">▦ Snap · 1ʹ grid</span>
              <span className="tool" style={{ marginLeft: "auto", color: "var(--accent)" }}>
                ● Ground Floor
              </span>
            </div>
            <FloorPlan rooms={INITIAL} editable selectedId={sel.id} onSelect={setSel} />
            <p className="hint">
              Tip — drag any room to reposition it on the grid. This is a concept editor: spaces can overlap while you
              explore ideas.
            </p>
          </div>
          <div className="inspector">
            <div className="ins-box">
              <h4>{sel.name}</h4>
              <div className="mono" style={{ fontSize: 11, color: "var(--stone)", marginBottom: 6 }}>
                {sel.type === "service" ? "circulation" : sel.type}
              </div>
              <div className="kv">
                <span>Width</span>
                <b>{ft(sel.w)}</b>
              </div>
              <div className="kv">
                <span>Depth</span>
                <b>{ft(sel.h)}</b>
              </div>
              <div className="kv">
                <span>Area</span>
                <b>{area(sel)} sq ft</b>
              </div>
              <div className="kv">
                <span>Position</span>
                <b>
                  {Math.round(sel.x)}, {Math.round(sel.y)}
                </b>
              </div>
            </div>
            <p className="hint">
              Selecting a room shows its live dimensions. In the full editor you can resize, rename, add doors and
              windows, and stack multiple floors.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
