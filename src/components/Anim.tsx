"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { base, fadeUp, stagger } from "@/lib/motion";

/**
 * Scroll-reveal wrapper. Content animates up into place once, honoring
 * prefers-reduced-motion (then it simply renders, no transform).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variants = fadeUp,
  as = "div",
  amount = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  as?: "div" | "section" | "li" | "span";
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  if (reduce) return <M className={className}>{children}</M>;
  return (
    <M
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ ...base, delay }}
    >
      {children}
    </M>
  );
}

/** Staggered group — direct children should be <Item>. */
export function Stagger({
  children,
  className = "",
  gap = 0.08,
  delay = 0,
  amount = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function Item({ children, className = "", variants = fadeUp }: { children: React.ReactNode; className?: string; variants?: Variants }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={variants} transition={base}>
      {children}
    </motion.div>
  );
}
