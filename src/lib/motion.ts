// Shared motion language — a small, consistent vocabulary so every section
// animates the same way. Durations/easings mirror the CSS motion tokens.
import type { Variants, Transition } from "motion/react";

export const EASE = {
  out: [0.22, 0.61, 0.36, 1] as [number, number, number, number], // confident settle
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

/** Parent that staggers its children on enter. */
export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const spring: Transition = { type: "spring", stiffness: 120, damping: 20, mass: 0.6 };

export const base: Transition = { duration: 0.7, ease: EASE.out };
