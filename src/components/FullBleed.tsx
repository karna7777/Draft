"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ExteriorScene, { ExtVariant } from "./scenes/ExteriorScene";
import Photo from "./Photo";

function InteriorFill({ sw, sf, sa, sky }: { sw: string; sf: string; sa: string; sky: string }) {
  return (
    <div className="scene fb-scene" style={{ "--sw": sw, "--sf": sf, "--sa": sa, "--sky": sky } as React.CSSProperties}>
      <div className="backwall" /><div className="floor" /><div className="window" /><div className="win-mull" />
      <div className="lamp" /><div className="sofa" /><div className="rug" />
    </div>
  );
}

export default function FullBleed({
  photo,
  variant = "dusk",
  interior,
  eyebrow,
  title,
  sub,
  align = "center",
  cta,
}: {
  photo: string;
  variant?: ExtVariant;
  interior?: { sw: string; sf: string; sa: string; sky: string };
  eyebrow?: string;
  title: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
  cta?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && (setShown(true), io.disconnect()), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={`fb ${shown ? "in" : ""}`} ref={ref}>
      <div className="fb-bg">
        {interior ? <InteriorFill {...interior} /> : <ExteriorScene variant={variant} />}
        <Photo src={photo} alt="" />
      </div>
      <div className="fb-scrim" />
      <div className={`fb-content ${align}`}>
        {eyebrow && <p className="fb-eyebrow">{eyebrow}</p>}
        <h2 className="fb-title">{title}</h2>
        {sub && <p className="fb-sub">{sub}</p>}
        {cta && <Link className="btn-solid" href="/create" style={{ marginTop: 26 }}>Start designing</Link>}
      </div>
    </section>
  );
}
