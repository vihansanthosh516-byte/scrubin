"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrubinCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "teal";
  variant?: "interactive" | "static";
  as?: "div" | "article" | "section";
  onClick?: () => void;
}

/**
 * ScrubIn Card Component
 *
 * A premium glassmorphism card with subtle glow effects.
 *
 * @param glowColor - "blue" for procedures/simulation, "teal" for learn hub
 * @param variant - "interactive" for clickable cards (subtle hover), "static" for display panels (no animation)
 */
const ScrubinCard: React.FC<ScrubinCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  variant = "interactive",
  as: Component = "div",
  onClick,
}) => {
  const colorStyles = {
    blue: {
      border: "border-primary/20",
      borderHover: "hover:border-primary/40",
      glow: "hover:shadow-[0_0_30px_rgba(126,200,227,0.15)]",
      bg: "bg-card/90 dark:bg-card/80",
    },
    teal: {
      border: "border-teal-400/20",
      borderHover: "hover:border-teal-400/40",
      glow: "hover:shadow-[0_0_30px_rgba(93,202,165,0.15)]",
      bg: "bg-card/90 dark:bg-card/80",
    },
  };

  const colors = colorStyles[glowColor];

  const baseStyles = `
    relative rounded-2xl overflow-hidden
    backdrop-blur-xl
    border ${colors.border}
    ${colors.bg}
    transition-all duration-300
  `;

  const interactiveStyles = variant === "interactive"
    ? `
      cursor-pointer
      ${colors.borderHover}
      ${colors.glow}
      hover:-translate-y-0.5
      hover:shadow-lg
    `
    : "";

  const innerGlow = `
    absolute inset-0 pointer-events-none
    bg-gradient-to-br from-white/[0.02] via-transparent to-transparent
  `;

  return (
    <Component
    onClick={onClick}
      className={cn(baseStyles, interactiveStyles, className)}
    >
      <div className={innerGlow} />
      <div className="relative z-10">{children}</div>
    </Component>
  );
};

/**
 * ScrubIn Procedure Card - for procedure library
 */
interface ProcedureCardProps {
  icon: string | React.ReactNode;
  name: string;
  tag: string;
  difficulty: string;
  diffColor: string;
  diffBg: string;
  time: string;
  decisions: number;
  description: string;
  unlocked?: boolean;
  bestScore?: number | null;
  requiredXP?: number;
  onClick?: () => void;
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({
  icon,
  name,
  tag,
  difficulty,
  diffColor,
  diffBg,
  time,
  decisions,
  description,
  unlocked = true,
  bestScore,
  requiredXP,
  onClick,
}) => {
  return (
    <ScrubinCard
      glowColor="blue"
      variant={unlocked ? "interactive" : "static"}
      className={unlocked ? "" : "opacity-50 cursor-not-allowed"}
      onClick={unlocked ? onClick : undefined}
    >
      {/* Header with icon */}
      <div className="relative h-32 bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative">
          {typeof icon === 'string' ? (
            <span className="text-4xl">{icon}</span>
          ) : (
            icon
          )}
        </div>

        {/* Difficulty badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border ${diffBg} ${diffColor} font-mono-data`}>
          {difficulty}
        </div>

        {/* Lock overlay */}
        {!unlocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <span className="text-2xl">🔒</span>
            <span className="text-xs text-muted-foreground font-mono-data">
              {requiredXP} XP required
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-lg font-bold text-foreground mb-1"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {name}
        </h3>
        <span className="label-mono text-muted-foreground block mb-3">{tag}</span>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono-data mb-4">
          <span className="flex items-center gap-1.5">
            {time}
          </span>
          <span className="flex items-center gap-1.5">
            {decisions} decisions
          </span>
          {bestScore && (
            <span className="flex items-center gap-1.5 text-primary">
              {bestScore}%
            </span>
          )}
        </div>
      </div>
    </ScrubinCard>
  );
};

/**
 * ScrubIn Static Panel - for OR decision panel (no animations)
 */
const ScrubinStaticPanel: React.FC<ScrubinCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
}) => {
  const colorStyles = {
    blue: {
      border: "border-primary/15",
      bg: "bg-card/95 dark:bg-[#0a1628]/90",
    },
    teal: {
      border: "border-teal-400/15",
      bg: "bg-card/95 dark:bg-[#0a1628]/90",
    },
  };

  const colors = colorStyles[glowColor];

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "backdrop-blur-xl",
        "border",
        colors.border,
        colors.bg,
        className
      )}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * ScrubIn Learn Card - for Learn Hub with teal glow
 */
interface LearnCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
}

const LearnCard: React.FC<LearnCardProps> = ({
  title,
  description,
  icon,
  href,
  onClick,
}) => {
  const content = (
    <ScrubinCard glowColor="teal" variant="interactive" onClick={onClick}>
      <div className="p-6">
        {icon && (
          <div className="mb-4 text-teal-400">
            {icon}
          </div>
        )}
        <h3
          className="text-lg font-bold text-foreground mb-2"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </ScrubinCard>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  return content;
};

export { ScrubinCard, ProcedureCard, ScrubinStaticPanel, LearnCard };
