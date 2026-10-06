import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface Props {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}

/** Number that eases to its new value instead of jumping (vitals, scores). */
export function TweenNumber({ value, decimals, duration = 0.6, className }: Props) {
  const reduce = useReducedMotion();
  const dp = decimals ?? (String(value).split(".")[1]?.length ?? 0);
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduce || !Number.isFinite(value)) {
      from.current = value;
      setShown(value);
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span className={className}>{shown.toFixed(dp)}</span>;
}
