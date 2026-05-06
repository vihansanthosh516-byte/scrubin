/**
 * Premium Effects Pack - $10,000 Website Feel
 * - Magnetic Button with physics
 * - Kinetic Typography
 * - Custom Cursor
 */
import { motion, useMotionValue, useSpring, useTransform, MotionValue, useMotionValueEvent } from "framer-motion";
import { ReactNode, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTON - Super premium with physics
// ═══════════════════════════════════════════════════════════════════════════════
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  range?: number;
  onClick?: () => void;
}

export function MagneticButton({ children, className = "", intensity = 0.6, range = 100, onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.5 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set((distanceX / rect.width) * range * 2 * intensity);
    y.set((distanceY / rect.height) * range * 2 * intensity);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block cursor-pointer", className)}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KINETIC TEXT - Letters follow mouse with delay
// ═══════════════════════════════════════════════════════════════════════════════
interface KineticTextProps {
  text: string;
  className?: string;
  intensity?: number;
}

export function KineticText({ text, className = "", intensity = 0.5 }: KineticTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    x.set(mouseX * intensity);
    y.set(mouseY * intensity);
    rotateX.set(mouseY * 0.02 * intensity);
    rotateY.set(mouseX * -0.02 * intensity);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y, rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
    >
      {text}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM CURSOR - Morphing premium cursor
// ═══════════════════════════════════════════════════════════════════════════════
export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const cursorXSpring = useSpring(cursorX, { damping: 25, stiffness: 400, mass: 0.5 });
  const cursorYSpring = useSpring(cursorY, { damping: 25, stiffness: 400, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', () => setIsHovering(false));

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-primary z-[9999] pointer-events-none mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          scaleX: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          scaleY: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          opacity: 1,
        }}
      />
      
      {/* Outer ring when hovering */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 rounded-full border-2 border-primary/50 z-[9998] pointer-events-none"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          opacity: isHovering ? 1 : 0,
          scale: isHovering ? 1 : 0.8,
          transition: {
            opacity: { duration: 0.2 },
            scale: { duration: 0.3, damping: 20, stiffness: 300 }
          }
        }}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT REVEAL - Letter by letter animation
// ═══════════════════════════════════════════════════════════════════════════════
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className = "", delay = 0 }: TextRevealProps) {
  const letters = text.split('');
  
  return (
    <motion.div className={cn("inline-flex", className)}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.05,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          style={{ 
            display: 'inline-block',
            transformOrigin: 'bottom center'
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADIENT TEXT - Animated gradient flow
// ═══════════════════════════════════════════════════════════════════════════════
export function AnimatedGradientText({ 
  children, 
  className = "",
  colors = ["#7EC8E3", "#5DCAA5", "#7EC8E3"]
}: { 
  children: ReactNode, 
  className?: string,
  colors?: string[]
}) {
  return (
    <motion.span
      className={cn("inline-block bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: "200% 100%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      }}
      transition={{
        duration: 5,
        ease: "linear",
        repeat: Infinity
      }}
    >
      {children}
    </motion.span>
  );
}
