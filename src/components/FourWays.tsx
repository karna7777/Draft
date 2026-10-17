import Link from "next/link";
import ExteriorScene from "./scenes/ExteriorScene";
import Elevation from "./scenes/Elevation";
import Photo from "./Photo";
import FloorPlan from "./FloorPlan";
import House3D from "./House3D";
import Reveal from "./Reveal";
import { baseModel } from "@/lib/floorplan";
import { PHOTOS } from "@/lib/photos";

type Kind = "photo" | "plan" | "massing" | "elevation";
const WAYS: { title: string; copy: string; href: string; kind: Kind }[] = [
  { title: "Describe your home", copy: "Start with an idea and let Draft compose the concept.", href: "/create?begin=ai", kind: "photo" },
  { title: "Upload your plan", copy: "Reimagine a layout you already have.", href: "/create?begin=upload", kind: "plan" },
  { title: "Explore starting points", copy: "Browse adaptable homes as massing studies.", href: "/create?begin=templates", kind: "massing" },
  { title: "Draw it yourself", copy: "Shape a space, elevation by elevation.", href: "/create?begin=draw", kind: "elevation" },
];

function Media({ kind }: { kind: Kind }) {
  if (kind === "photo")
    return (
      <div className="fw2-media photo">
        <ExteriorScene variant="dusk" />
        <Photo src={PHOTOS.exterior[3]} alt="Contemporary residence" />
        <div className="fw2-scrim" />
        <span className="fw2-lbl mono">PHOTOGRAPH</span>
      </div>
    );
  if (kind === "plan")
    return (
      <div className="fw2-media draw">
        <FloorPlan rooms={baseModel()} />
        <span className="fw2-lbl mono">FLOOR PLAN</span>
      </div>
    );
  if (kind === "massing")
    return (
      <div className="fw2-media massing">
        <House3D rooms={baseModel()} />
        <span className="fw2-lbl mono">MASSING STUDY</span>
      </div>
    );
  return (
    <div className="fw2-media elev">
      <Elevation bg="#efe7d8" ink="#2a251e" />
      <span className="fw2-lbl mono">ELEVATION</span>
    </div>
  );
}

export default function FourWays() {
  return (
    <section className="tone-white fw2" id="begin">
      <div className="wrap section">
        <Reveal>
          <div className="fw2-head">
            <p className="eyebrow accent">Four ways to begin</p>
            <h2 className="fw2-h">Begin where you are.</h2>
            <p className="fw2-lede">Every path leads to the same place — a home you can shape, drawing by drawing.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="fw2-grid">
            {WAYS.map((w) => (
              <Link className="fw2-card" href={w.href} key={w.title}>
                <Media kind={w.kind} />
                <div className="fw2-body">
                  <h3 className="fw2-title">{w.title}</h3>
                  <p className="fw2-copy">{w.copy}</p>
                  <span className="fw2-go">Start <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
