import type { Transition, Variants } from "framer-motion";

// Shared motion tokens. Import these instead of hand-rolling springs per component.
// Apple's fluid-interface defaults: critically damped (no overshoot) for UI, ~0.4s response;
// bounce only after a gesture that carried momentum (a flick or drag release).
export const spring: Transition = { type: "spring", bounce: 0, duration: 0.4 };
export const springSoft: Transition = { type: "spring", bounce: 0, duration: 0.6 };
export const springMomentum: Transition = { type: "spring", bounce: 0.2, duration: 0.4 };
export const ease = [0.22, 1, 0.36, 1] as const;
// The editorial ease used for page entrances and hovers (same curve as --ease-fluid in index.css).
export const EASE = ease;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: springSoft },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: spring },
};

export const stagger = (gap = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren: delay } },
});

// Spread onto a motion element for the standard press/hover feel.
export const pressable = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97 },
  transition: spring,
} as const;
