"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * AnimatedCounter - Counter animation for stats
 */
interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  suffix = "", 
  duration = 2000,
  className = ""
}) => {
  const [count, setCount] = React.useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

/**
 * LoadingSkeleton - Placeholder loading state
 */
interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = "", 
  lines = 1 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className="h-4 bg-muted/50 rounded mb-2 last:mb-0"
          style={{ width: lines > 1 ? `${100 - (i * 10)}%` : '100%' }}
        />
      ))}
    </div>
  );
};

/**
 * StatCard - Enhanced stat display with icon and animation
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendValue,
  delay = 0,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`p-6 rounded-2xl glass-card-pro border border-border/50 hover:border-primary/30 transition-all duration-300 group ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(126,200,227,0.3)] transition-all duration-300">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider font-mono-data ${
            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-foreground mb-1 font-display">
        {value}
      </div>
      <div className="label-mono text-muted-foreground text-[10px] tracking-widest">
        {label}
      </div>
    </motion.div>
  );
};

/**
 * EnhancedButton - Button with glow and hover effects
 */
interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  children: React.ReactNode;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = "primary",
  size = "md",
  glow = true,
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "relative font-semibold transition-all duration-300 rounded-xl font-display";
  
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(126,200,227,0.3)] hover:shadow-[0_0_50px_rgba(126,200,227,0.4)] hover:-translate-y-0.5",
    outline: "border border-primary/30 hover:border-primary hover:bg-primary/10 text-primary hover:-translate-y-0.5",
    ghost: "text-primary hover:bg-primary/10 hover:-translate-y-0.5"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * ProgressBar - Animated progress bar with glow
 */
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "primary" | "teal" | "emerald" | "amber" | "red";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = "primary",
  size = "md",
  showLabel = false,
  label,
  className = ""
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    primary: "bg-primary shadow-[0_0_10px_rgba(126,200,227,0.5)]",
    teal: "bg-teal-400 shadow-[0_0_10px_rgba(93,202,165,0.5)]",
    emerald: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]",
    amber: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]",
    red: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"
  };

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-2">
          {label && <span className="label-mono text-muted-foreground text-[10px] uppercase">{label}</span>}
          <span className="label-mono text-primary text-[10px] uppercase font-bold">{value} / {max}</span>
        </div>
      )}
      <div className={`h-full bg-muted/30 rounded-full overflow-hidden border border-border/50 ${heights[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
};

/**
 * CardGlow - Wrapper with animated glow effect
 */
interface CardGlowProps {
  children: React.ReactNode;
  color?: "blue" | "teal" | "red" | "amber";
  className?: string;
  pulse?: boolean;
}

export const CardGlow: React.FC<CardGlowProps> = ({
  children,
  color = "blue",
  className = "",
  pulse = false
}) => {
  const colors = {
    blue: "rgba(126,200,227,0.15)",
    teal: "rgba(93,202,165,0.15)",
    red: "rgba(248,113,113,0.15)",
    amber: "rgba(251,191,36,0.15)"
  };

  return (
    <div className={`relative group ${className}`}>
      <div 
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${pulse ? 'animate-pulse' : ''}`}
        style={{ 
          boxShadow: `0 0 30px ${colors[color]}`,
          transform: 'scale(1.02)',
          zIndex: 0
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
