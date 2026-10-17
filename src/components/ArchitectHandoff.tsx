import ExteriorScene from "./scenes/ExteriorScene";
import Photo from "./Photo";
import FloorPlan from "./FloorPlan";
import Reveal from "./Reveal";
import { baseModel, ROOM_LABEL } from "@/lib/floorplan";
import { PHOTOS } from "@/lib/photos";

const MATERIALS = ["#c9a878", "#8a9b84", "#b05a34", "#e6ded0", "#514334"];

export default function ArchitectHandoff() {
  return (
    <section className="tone-warm handoff">
      <div className="wrap section">
        <div className="handoff-grid">
          <Reveal>
            <div className="handoff-copy">
              <p className="eyebrow accent">Explore freely, build confidently</p>
              <h2 className="handoff-h">
                Imagine freely.<br />Build <em>confidently.</em>
              </h2>
              <p className="handoff-sub">
                Draft helps you explore and communicate your ideas. When you&apos;re ready, share your concept with an
                architect to refine it for site conditions, local codes, and construction.
              </p>
              <p className="handoff-note mono">
                Draft produces conceptual designs — not construction-ready drawings, structural work, or permits.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="pkg" aria-hidden="true">
              <div className="pkg-main">
                <div className="pkg-h mono">CONCEPT PACKAGE · THE VERMA RESIDENCE</div>
                <div className="pkg-plan"><FloorPlan rooms={baseModel()} /></div>
              </div>
              <div className="pkg-side">
                <div className="pkg-render">
                  <ExteriorScene variant="dusk" />
                  <Photo src={PHOTOS.exterior[0]} alt="" />
                </div>
                <div className="pkg-mats">
                  <div className="pkg-label mono">MATERIALS</div>
                  <div className="pkg-swatches">
                    {MATERIALS.map((c) => <span key={c} style={{ background: c }} />)}
                  </div>
                </div>
                <div className="pkg-notes">
                  <div className="pkg-label mono">ROOMS</div>
                  {(["living", "kitchen", "bed", "bath"] as const).map((t) => (
                    <div className="pkg-note" key={t}><span className="sw" style={{ background: `var(--r-${t})` }} />{ROOM_LABEL[t]}</div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
