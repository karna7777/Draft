"use client";

// Named sequence builders. The hero sequence: prompt → plot → rooms → walls →
// openings → camera/roof/light → a held, cinematic final frame.
import { anim, CAM_HERO, CAM_TGT_HERO } from "./anim";
import { createSequence, type SeqControls } from "./engine";

export function buildHeroSequence(onStatus: (s: string) => void, onDone?: () => void): SeqControls {
  const count = anim.roomCount || 1;
  return createSequence(
    (tl) => {
      tl.call(() => onStatus("Reading the plot…"));
      tl.to(anim, { grid: 1, duration: 0.7 })
        .to(anim, { plot: 1, duration: 0.9, ease: "power3.out" }, "-=0.35")
        .to(anim, { dims: 1, duration: 0.5 }, "-=0.3");

      tl.call(() => onStatus("Placing rooms…"));
      // staggered growth handled per-room in the scene (easeOutBack on local grow)
      tl.to(anim, { roomsProgress: count, duration: Math.max(1.4, count * 0.32), ease: "power1.inOut" });

      tl.call(() => onStatus("Raising walls…"));
      tl.to(anim, { walls: 1, duration: 1.0, ease: "power2.out" });

      tl.call(() => onStatus("Cutting doors & windows…"));
      tl.to(anim, { openings: 1, duration: 0.6 });

      tl.call(() => onStatus("Optimising light, dropping the roof…"));
      tl.to(anim, {
        cpx: CAM_HERO[0], cpy: CAM_HERO[1], cpz: CAM_HERO[2],
        ctx: CAM_TGT_HERO[0], cty: CAM_TGT_HERO[1], ctz: CAM_TGT_HERO[2],
        duration: 2.0, ease: "power2.inOut",
      });
      tl.to(anim, { roof: 1, duration: 1.1, ease: "back.out(1.4)" }, "<+=0.2");
      tl.to(anim, { lights: 1, duration: 1.2 }, "<");
      tl.to(anim, { dusk: 1, duration: 1.4 }, "<-=0.3");

      // a beat of stillness so the finished house can be seen
      tl.call(() => onStatus(""));
      tl.to({}, { duration: 1.4 });
      if (onDone) tl.call(onDone);
    },
    { paused: true }
  );
}
