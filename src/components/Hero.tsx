"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import FloorPlan from "./FloorPlan";
import { baseModel } from "@/lib/floorplan";

export default function Hero() {
  // gentle plan ⇄ home transformation on the floating card
  const [showPlan, setShowPlan] = useState(true);
  const t = useRef<number[]>([]);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll parallax on the cinematic panel (disabled for reduced motion).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    if (reduce) return;
    const loop = () => {
      t.current.push(window.setTimeout(() => setShowPlan(false), 4200));
      t.current.push(window.setTimeout(() => setShowPlan(true), 8400));
      t.current.push(window.setTimeout(loop, 8400));
    };
    loop();
    return () => { t.current.forEach(clearTimeout); t.current = []; };
  }, [reduce]);

  return (
    <section className="sh" id="top" ref={sectionRef}>
      <motion.div
        className="sh-left"
        style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <div className="sh-copy">
          <p className="sh-eyebrow"><span className="sh-eyebrow-rule" />AI Residential Design Studio</p>
          <h1 className="sh-title">
            A home begins<br />with a <em>feeling.</em>
          </h1>
          <p className="sh-sub">
            Turn an idea, a plot, or a rough floor plan into a home you can explore — long before you build it.
          </p>
          <div className="sh-cta">
            <Link className="btn-solid dark" href="/create">Begin your home <span aria-hidden="true">→</span></Link>
            <a className="btn-quiet" href="#concept">Explore a concept</a>
          </div>
        </div>
        <a className="sh-scroll" href="#concept">
          <span>Scroll to explore</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
        </a>
      </motion.div>

      <div className="sh-right">
        <motion.div
          className="sh-visual"
          style={reduce ? undefined : { y: imgY, scale: imgScale }}
        >
          <div className="duo sh-duo">
            <Image
              src="/img/exterior-dusk.jpg"
              alt="Contemporary residential home at dusk"
              fill
              priority
              sizes="(max-width: 860px) 100vw, 55vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </motion.div>
        <div className="sh-scrim" />
        <div className={`sh-card ${showPlan ? "plan" : "render"}`}>
          <div className="sh-card-face plan">
            <div className="sh-card-h mono">CONCEPT · GROUND FLOOR</div>
            <div className="sh-card-plan"><FloorPlan rooms={baseModel()} ambient={showPlan} /></div>
          </div>
          <div className="sh-card-face render">
            <div className="duo sh-card-duo">
              <Image src="/img/interior-warm.jpg" alt="Warm minimal interior" fill sizes="300px" style={{ objectFit: "cover" }} />
            </div>
            <div className="sh-card-tag mono">RENDER · WARM MINIMAL</div>
          </div>
        </div>
        <div className="sh-arrow mono">plan → home</div>
      </div>
    </section>
  );
}
