"use client";

import HeroPrompt from "./HeroPrompt";

/**
 * Static, lightweight hero for phones and reduced-motion — no heavy WebGL or
 * scroll-jacking. A CSS "blueprint" stands in for the 3D film.
 */
export default function MobileFallback({ onBrief }: { onBrief: (brief: string) => void }) {
  return (
    <section className="mfb">
      <div className="mfb-plan" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <div className="mfb-inner">
        <p className="film-eyebrow mono"><span className="film-rule" />DRAFT · AI RESIDENTIAL DESIGN STUDIO</p>
        <h1 className="film-title">Space is only the beginning.</h1>
        <p className="film-sub">
          Describe a home in plain words. Draft builds an editable plan you can refine in 2D or 3D,
          then design every room — conceptual, never construction documents.
        </p>
        <HeroPrompt onSubmit={onBrief} />
      </div>
    </section>
  );
}
