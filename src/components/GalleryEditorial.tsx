import ExteriorScene from "./scenes/ExteriorScene";
import Elevation from "./scenes/Elevation";
import FloorPlan from "./FloorPlan";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { baseModel } from "@/lib/floorplan";
import { PHOTOS } from "@/lib/photos";

function InteriorTile({ sw, sf, sa, sky }: { sw: string; sf: string; sa: string; sky: string }) {
  return (
    <div className="scene cs-interior" style={{ "--sw": sw, "--sf": sf, "--sa": sa, "--sky": sky } as React.CSSProperties}>
      <div className="backwall" />
      <div className="floor" />
      <div className="window" />
      <div className="win-mull" />
      <div className="lamp" />
      <div className="sofa" />
      <div className="rug" />
    </div>
  );
}

export default function GalleryEditorial() {
  return (
    <section id="gallery" className="tone-warm">
      <div className="wrap section">
        <Reveal>
          <div className="sec-head mega" style={{ maxWidth: 820 }}>
            <span className="num">MADE WITH DRAFT</span>
            <h2>
              A studio&apos;s worth of homes, <span className="serif-i">from a few sentences.</span>
            </h2>
            <p className="lead" style={{ color: "var(--stone)" }}>
              Exteriors, interiors, elevations and plans — every one generated and still fully editable.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="made-grid gal-editorial">
            <article className="made-tile" style={{ gridColumn: "span 7", gridRow: "span 4" }}>
              <ExteriorScene variant="dusk" />
              <Photo src={PHOTOS.exterior[0]} alt="Maple Court" />
              <div className="mt-ov">
                <span className="mt-tag">Exterior · dusk</span>
                <span className="mt-title">Maple Court</span>
                <span className="mt-meta">Cedar & bronze · 3 bed · 1,540 sq ft — Explore →</span>
              </div>
            </article>
            <article className="made-tile" style={{ gridColumn: "span 5", gridRow: "span 2" }}>
              <InteriorTile sw="#e8dfcd" sf="#c7a878" sa="#9a5f38" sky="#f1e4cd" />
              <Photo src={PHOTOS.interior[0]} alt="Living room" />
              <div className="mt-ov">
                <span className="mt-tag">Interior · living</span>
                <span className="mt-title">Morning light</span>
                <span className="mt-meta">Oak, linen, lime plaster — Explore →</span>
              </div>
            </article>
            <article className="made-tile" style={{ gridColumn: "span 5", gridRow: "span 2" }}>
              <Elevation bg="#f4efe4" ink="#2a251d" />
              <div className="mt-ov">
                <span className="mt-tag">Elevation</span>
                <span className="mt-title">Street facade</span>
                <span className="mt-meta">9.0 m · board-formed concrete — Explore →</span>
              </div>
            </article>
            <article className="made-tile" style={{ gridColumn: "span 4", gridRow: "span 3" }}>
              <ExteriorScene variant="warm" />
              <Photo src={PHOTOS.exterior[2]} alt="Rammed Earth House" />
              <div className="mt-ov">
                <span className="mt-tag">Exterior · courtyard</span>
                <span className="mt-title">Rammed Earth House</span>
                <span className="mt-meta">North light all day — Explore →</span>
              </div>
            </article>
            <article className="made-tile" style={{ gridColumn: "span 4", gridRow: "span 3" }}>
              <div className="mt-plan">
                <FloorPlan rooms={baseModel()} />
              </div>
              <div className="mt-ov">
                <span className="mt-tag">Floor plan</span>
                <span className="mt-title">Ground floor</span>
                <span className="mt-meta">9 spaces · 3 bed · 2.5 bath — Explore →</span>
              </div>
            </article>
            <article className="made-tile" style={{ gridColumn: "span 4", gridRow: "span 3" }}>
              <InteriorTile sw="#d7dbdc" sf="#a9adb0" sa="#3f5a63" sky="#dbe6ea" />
              <Photo src={PHOTOS.interior[4]} alt="Kitchen" />
              <div className="mt-ov">
                <span className="mt-tag">Interior · kitchen</span>
                <span className="mt-title">The island</span>
                <span className="mt-meta">Slate & steel · 12ʹ run — Explore →</span>
              </div>
            </article>
            <article className="made-tile" style={{ gridColumn: "span 12", gridRow: "span 3" }}>
              <ExteriorScene variant="night" />
              <Photo src={PHOTOS.exterior[1]} alt="The Long House" />
              <div className="mt-ov">
                <span className="mt-tag">Exterior · dusk to night</span>
                <span className="mt-title">The Long House</span>
                <span className="mt-meta">Full-width glazing · warm interior glow — Explore this design →</span>
              </div>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
