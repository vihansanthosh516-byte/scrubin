import type { Transition, Variants } from "framer-motion";

// Shared motion tokens. Import these instead of hand-rolling springs per component.
export const spring: Transition = { type: "spring", damping: 25, stiffness: 300 };
export const springSoft: Transition = { type: "spring", damping: 30, stiffness: 180 };
export const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
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
