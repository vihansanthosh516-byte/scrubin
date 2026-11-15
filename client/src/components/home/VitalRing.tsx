import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** A health-app style ring: a faint full track and a lit arc for the fraction (0..1). */
export function VitalRing({
  fraction,
  tone,
  stroke = 7,
  animate = false,
  className,
  style,
}: {
  fraction: number;
  tone: "hr" | "spo2" | "bp";
  size?: number;
  stroke?: number;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const f = Math.max(0, Math.min(1, fraction || 0));
  const colour = `var(--vital-${tone})`;
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <circle cx="50" cy="50" r={50 - stroke} fill="none" stroke={colour} strokeOpacity={0.16} strokeWidth={stroke} />
      <motion.circle
        cx="50"
        cy="50"
        r={50 - stroke}
        fill="none"
        stroke={colour}
        strokeWidth={stroke}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        initial={animate && !reduce ? { pathLength: 0 } : { pathLength: f }}
        whileInView={{ pathLength: f }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", bounce: 0, duration: 1.4 }}
      />
    </svg>
  );
}
