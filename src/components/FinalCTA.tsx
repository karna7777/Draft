import Link from "next/link";
import ExteriorScene from "./scenes/ExteriorScene";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { PHOTOS } from "@/lib/photos";

export default function FinalCTA() {
  return (
    <section className="tone-white final2">
      <div className="wrap section">
        <div className="final2-grid">
          <Reveal>
            <div className="final2-copy">
              <p className="eyebrow accent">Start drafting</p>
              <h2 className="final2-title">
                Your home starts <span className="serif-i">with an idea.</span>
              </h2>
              <p className="final2-sub">
                Describe it. Draft it. Make it yours — and see it in three dimensions along the way.
              </p>
              <Link className="cta-btn dark" href="/create">
                Start designing
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="scene-frame final2-visual">
              <ExteriorScene variant="day" />
              <Photo src={PHOTOS.exterior[5]} alt="A finished home" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
