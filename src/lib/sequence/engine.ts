"use client";

// A tiny sequence engine: named, replayable, scrubbable GSAP timelines with
// play / pause / seek / onComplete. The same primitive drives the landing hero
// and (later) sequences inside the editor.
import { getGsap } from "@/lib/scroll";

export interface SeqControls {
  tl: gsap.core.Timeline;
  play: () => void;
  pause: () => void;
  seek: (p01: number) => void;
  restart: () => void;
  kill: () => void;
  progress: () => number;
}

export interface SeqOptions {
  paused?: boolean;
  onComplete?: () => void;
  onUpdate?: (p: number) => void;
}

export function createSequence(build: (tl: gsap.core.Timeline) => void, opts: SeqOptions = {}): SeqControls {
  const { gsap } = getGsap();
  const tl = gsap.timeline({
    paused: opts.paused ?? true,
    onComplete: opts.onComplete,
    onUpdate: opts.onUpdate ? () => opts.onUpdate!(tl.progress()) : undefined,
    defaults: { ease: "power2.out" },
  });
  build(tl);
  return {
    tl,
    play: () => tl.play(),
    pause: () => tl.pause(),
    seek: (p01) => tl.progress(Math.max(0, Math.min(1, p01))),
    restart: () => tl.restart(),
    kill: () => tl.kill(),
    progress: () => tl.progress(),
  };
}
