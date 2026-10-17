import Nav from "@/components/Nav";
import CinematicHero from "@/components/nest/CinematicHero";
import ConceptStory from "@/components/ConceptStory";
import FourWays from "@/components/FourWays";
import ArchitectHandoff from "@/components/ArchitectHandoff";
import FullBleed from "@/components/FullBleed";
import ShowcaseCarousel from "@/components/ShowcaseCarousel";
import Editor from "@/components/Editor";
import ChatRefine from "@/components/ChatRefine";
import Directions from "@/components/Directions";
import Dimension from "@/components/Dimension";
import Styles from "@/components/Styles";
import GalleryEditorial from "@/components/GalleryEditorial";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { PHOTOS } from "@/lib/photos";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="lander">
        {/* cinematic arrival — 3D house that dissolves into its plan */}
        <CinematicHero />

        {/* warm — one connected "watch it take shape" story */}
        <ConceptStory />

        {/* full-bleed image — describe */}
        <FullBleed
          photo={PHOTOS.exterior[1]}
          variant="day"
          eyebrow="The starting point"
          title={<>Describe the way<br />you want to live.</>}
          sub="A sentence is enough. Draft reads the intent and gives you a real place to begin."
        />

        {/* dark — cinematic product demo */}
        <ShowcaseCarousel />

        {/* white — four ways to begin */}
        <FourWays />

        {/* white — the editable design */}
        <div className="tone-white"><Editor /></div>

        {/* dark — natural-language refinement */}
        <div className="tone-charcoal"><ChatRefine /></div>

        {/* full-bleed interior */}
        <FullBleed
          photo={PHOTOS.interior[0]}
          interior={{ sw: "#e8dfcd", sf: "#c7a878", sa: "#9a5f38", sky: "#f1e4cd" }}
          eyebrow="How it feels"
          title={<>Light, in the<br />rooms you live in.</>}
          align="left"
        />

        {/* dark — multiple directions (AI concept comparison) */}
        <Directions />

        {/* warm — architect handoff (trust) */}
        <ArchitectHandoff />

        {/* navy — interactive 3D */}
        <Dimension />

        {/* white — style exploration */}
        <div className="tone-white"><Styles /></div>

        {/* warm — editorial gallery */}
        <GalleryEditorial />

        {/* full-bleed night exterior + CTA */}
        <FullBleed
          photo={PHOTOS.exterior[4]}
          variant="night"
          eyebrow="Your next home"
          title={<>Beautiful, after dark.</>}
          sub="Explore it at any hour, from any angle, before a single wall goes up."
          cta
        />

        {/* light — final CTA */}
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
