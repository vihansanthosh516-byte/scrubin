"use client";

/**
 * ScrubIn Navbar — Clinical Precision Design
 * - Pill-shaped nav with cursor following hover
 * - Collapses to left side on scroll (desktop), shows ECG icon + ScrubIn text
 * - Expands on scroll up OR clicking the collapsed logo
 * - Light/dark theme toggle dropdown
 * - Mobile: hamburger menu (collapse-to-left is desktop only)
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, useScroll, useMotionValueEvent, AnimatePresence, type Variants } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Menu, X, Activity, User, LogOut, ChevronDown, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/procedures", label: "Procedures" },
  { href: "/anatomy", label: "Anatomy" },
  { href: "/learn", label: "Learn Hub" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

// Scroll thresholds
const EXPAND_SCROLL_THRESHOLD = 80;
const COLLAPSE_SCROLL_THRESHOLD = 150;

// Animation variants - slower, cinematic
const navWrapperVariants: Variants = {
  expanded: {
    left: "50%",
    x: "-50%",
    transition: {
      type: "tween",
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1], // ease-out
    },
  },
  collapsed: {
    left: "1.5rem",
    x: "0%",
    transition: {
      type: "tween",
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1], // ease-out
    },
  },
};

const logoTextVariants: Variants = {
  expanded: {
    fontSize: "1.25rem", // text-xl
    transition: {
      type: "tween",
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  collapsed: {
    fontSize: "1rem", // smaller
    transition: {
      type: "tween",
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const logoBoxVariants: Variants = {
  expanded: {
    width: "2rem",
    height: "2rem",
    transition: {
      type: "tween",
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  collapsed: {
    width: "1.5rem",
    height: "1.5rem",
    transition: {
      type: "tween",
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const navItemsVariants: Variants = {
  expanded: {
    opacity: 1,
    width: "auto",
    transition: {
      type: "tween",
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  collapsed: {
    opacity: 0,
    width: 0,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// Cursor position state type
interface CursorPosition {
  left: number;
  width: number;
  opacity: number;
}

export default function Navbar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // Scroll detection for collapse/expand
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const scrollPositionOnCollapse = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;

    // Collapse when scrolling down past threshold
    if (isExpanded && latest > previous && latest > COLLAPSE_SCROLL_THRESHOLD) {
      setIsExpanded(false);
      scrollPositionOnCollapse.current = latest;
    }
    // Expand when scrolling back up past threshold
    else if (
      !isExpanded &&
      latest < previous &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD
    ) {
      setIsExpanded(true);
    }
    // Reset to expanded when at top of page
    else if (!isExpanded && latest < 50) {
      setIsExpanded(true);
    }

    lastScrollY.current = latest;
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  // Check if link is active
  const isActive = (href: string) => location === href;

  // Check if we're on home page
  const isHomePage = location === "/" || location === "";

  // Handle clicking logo
  const handleLogoClick = (e: React.MouseEvent) => {
    // If collapsed, just expand (don't navigate)
    if (!isExpanded) {
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded(true);
    }
    // If expanded and not on home page, scroll to top
    if (isExpanded && !isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle hover for cursor effect
  const handleMouseLeave = () => {
    setCursorPosition((pv) => ({ ...pv, opacity: 0 }));
  };

  // Determine displayed theme for icon
  const systemPreference = "light";
  const displayTheme = theme === "system" ? systemPreference : theme;

  return (
    <>
      {/* === DESKTOP NAVBAR === */}
      <motion.div
        className="fixed top-6 z-50 hidden md:block"
        initial="expanded"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={navWrapperVariants}
      >
        <motion.nav
          className={cn(
            "relative flex items-center overflow-hidden rounded-full border shadow-lg backdrop-blur-md",
            "bg-[#0A1628]/95 border-primary/20",
            isExpanded ? "px-2 py-1.5 gap-2" : "px-3 py-2 gap-2 cursor-pointer"
          )}
          onMouseLeave={handleMouseLeave}
        >
          {/* === LOGO (ECG icon + ScrubIn text) === */}
          <Link
            href={isExpanded && !isHomePage ? "/" : "#"}
            onClick={handleLogoClick}
            className="flex items-center gap-2 group"
          >
            {/* ECG Icon Box */}
            <motion.div
              variants={logoBoxVariants}
              className="relative rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:bg-primary/30 transition-colors flex-shrink-0"
            >
              <Activity className="w-4 h-4 text-baby-blue" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            </motion.div>

            {/* ScrubIn Text */}
            <motion.span
              variants={logoTextVariants}
              className="font-bold tracking-tight text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Scrub<span className="text-baby-blue">In</span>
            </motion.span>
          </Link>

          {/* === NAVIGATION LINKS with cursor effect === */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={navItemsVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center overflow-hidden"
              >
                <ul
                  className="relative mx-2 flex w-fit rounded-full p-1"
                  onMouseLeave={() => setCursorPosition((pv) => ({ ...pv, opacity: 0 }))}
                >
                  {NAV_LINKS.map((link) => (
                    <Tab
                      key={link.href}
                      href={link.href}
                      isActive={isActive(link.href)}
                      setPosition={setCursorPosition}
                    >
                      {link.label}
                    </Tab>
                  ))}
                  {/* Floating cursor */}
                  <Cursor position={cursorPosition} />
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === RIGHT SIDE: Theme + Auth === */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={navItemsVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center gap-1"
              >
                {/* Theme Toggle Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-9 h-9 rounded-full border border-white/20 hover:border-primary/40 hover:bg-primary/10 transition-all"
                      aria-label="Select theme"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {displayTheme === "light" ? (
                        <Sun className="w-4 h-4 text-baby-blue" />
                      ) : (
                        <Moon className="w-4 h-4 text-baby-blue" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-32 bg-[#0A1628]/95 backdrop-blur-md border-primary/20"
                  >
                    <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer text-white focus:text-white focus:bg-primary/20">
                      <Sun className="w-4 h-4 text-baby-blue" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer text-white focus:text-white focus:bg-primary/20">
                      <Moon className="w-4 h-4 text-baby-blue" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 cursor-pointer text-white focus:text-white focus:bg-primary/20">
                      <Monitor className="w-4 h-4 text-baby-blue" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Auth: Profile Dropdown or Sign In */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2 h-9 border border-white/20 hover:border-primary/40 hover:bg-primary/10 transition-all rounded-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-6 h-6 rounded-full border border-primary/20"
                        />
                        <span className="text-xs font-semibold font-mono-data pr-1 text-white">
                          {user.name.split(" ")[0]}
                        </span>
                        <ChevronDown className="w-3 h-3 text-white/50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-[#0A1628]/95 backdrop-blur-md border-primary/20"
                    >
                      <DropdownMenuLabel className="font-bold flex flex-col text-white">
                        <span className="text-sm">{user.name}</span>
                        <span className="text-[10px] text-white/60 font-mono-data font-normal">
                          @{user.login}
                        </span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer gap-2 text-white focus:text-white focus:bg-primary/20">
                          <User className="w-4 h-4 text-baby-blue" /> Profile
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onClick={logout}
                        className="cursor-pointer gap-2 text-red-400 focus:text-red-400 focus:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/signin" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-4 baby-blue-glow transition-all"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </motion.div>

      {/* === MOBILE NAVBAR (separate, always visible on mobile) === */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <nav className="relative flex items-center overflow-hidden rounded-full border shadow-lg backdrop-blur-md px-2 py-1.5 gap-2 bg-[#0A1628]/95 border-primary/20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Activity className="w-4 h-4 text-baby-blue" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <span
                className="text-xl font-bold tracking-tight text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Scrub<span className="text-baby-blue">In</span>
              </span>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full border border-white/20"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-4 h-4 text-baby-blue" />
            ) : (
              <Menu className="w-4 h-4 text-baby-blue" />
            )}
          </Button>
        </nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 left-0 right-0 bg-[#0A1628]/95 backdrop-blur-md border border-primary/20 rounded-2xl p-4 shadow-xl"
            >
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={cn(
                        "block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "text-primary bg-primary/10"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {link.label}
                    </div>
                  </Link>
                ))}

                {/* Theme Toggle for Mobile */}
                <div className="pt-4 mt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={theme === "light" ? "default" : "outline"}
                      className="flex-1 gap-2 text-white"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="w-4 h-4" /> Light
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === "dark" ? "default" : "outline"}
                      className="flex-1 gap-2 text-white"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="w-4 h-4" /> Dark
                    </Button>
                  </div>
                </div>

                {/* Auth for Mobile */}
                {user ? (
                  <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <img
                        src={user.avatar_url}
                        className="w-8 h-8 rounded-full border border-primary/20"
                        alt=""
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-xs text-white/60">@{user.login}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 rounded-xl"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link href="/signin">
                    <div className="mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-primary text-center baby-blue-glow">
                      Sign In
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// === TAB COMPONENT (with cursor tracking) ===
function Tab({
  children,
  href,
  isActive,
  setPosition,
}: {
  children: React.ReactNode;
  href: string;
  isActive: boolean;
  setPosition: React.Dispatch<React.SetStateAction<CursorPosition>>;
}) {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      className={cn(
        "relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase font-semibold transition-colors md:px-4 md:text-sm",
        isActive ? "text-baby-blue" : "text-white/80 hover:text-white"
      )}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Link href={href}>
        <span>{children}</span>
      </Link>
    </li>
  );
}

// === CURSOR COMPONENT (animated pill following hover) ===
function Cursor({ position }: { position: CursorPosition }) {
  return (
    <motion.li
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute z-0 h-7 rounded-full bg-primary/20 md:h-8"
      style={{ boxShadow: "0 0 15px rgba(126, 200, 227, 0.3)" }}
    />
  );
}
