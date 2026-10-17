"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { getGsap } from "@/lib/scroll";

/**
 * Premium smooth-scroll, scoped to the marketing landing ("/"). App surfaces
 * (editor, dashboard, auth) keep native scrolling so canvases and panels stay
 * snappy. Fully disabled under prefers-reduced-motion.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Keep GSAP ScrollTrigger in lockstep with Lenis so scrubbed 3D/scene
    // timelines read the smoothed scroll position, not the native one.
    const { gsap, ScrollTrigger } = getGsap();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Smooth anchor links within the landing.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      const id = a?.getAttribute("href");
      if (!a || !id || id === "#") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -72 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      gsap.ticker.remove(tick);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
