import Link from "next/link";
import LandingNav from "@/components/landing/LandingNav";
import HeroStage from "@/components/landing/HeroStage";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main id="film">
        {/* the hero — a scripted "prompt → architecture" sequence */}
        <HeroStage />

        {/* closing */}
        <section className="closing">
          <p className="closing-eyebrow mono">FROM SPACE TO HOME</p>
          <h2 className="closing-title">
            Don&apos;t just plan your home.<br />
            <em>Step inside your imagination.</em>
          </h2>
          <div className="closing-cta">
            <Link className="btn-ice" href="/create">Begin designing <span aria-hidden="true">→</span></Link>
            <Link className="btn-line" href="/projects">Your projects</Link>
          </div>
          <p className="closing-note mono">Conceptual visualizations for exploration — not construction documents.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
