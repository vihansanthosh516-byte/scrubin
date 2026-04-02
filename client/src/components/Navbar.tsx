/**
 * ScrubIn Navbar — Clinical Precision Design
 * Transparent over hero, solid dark/light on scroll
 * ECG line running along bottom edge
 * Baby blue accent, Space Grotesk logo
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Menu, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
const NAV_LINKS = [
  { href: "/procedures", label: "Procedures" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/learn", label: "Learn Hub" },
  { href: "/profile", label: "Profile" },
];

// ECG path data for the animated line
const ECG_PATH = "M0,12 L20,12 L25,12 L30,2 L35,22 L40,2 L45,12 L50,12 L55,12 L60,8 L65,16 L70,12 L200,12";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const ecgRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (href: string) => location === href;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Activity className="w-4 h-4 text-baby-blue" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <span
                className="text-xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Scrub<span className="text-baby-blue">In</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/10 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-baby-blue" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </Button>

            {/* CTA */}
            <Link href="/procedures">
              <Button
                size="sm"
                className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg px-4 baby-blue-glow transition-all"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Enter OR
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ECG Line at bottom of navbar */}
      <div className="relative h-px overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <svg
          className="absolute left-0 top-0 h-3 w-full opacity-60"
          viewBox="0 0 800 12"
          preserveAspectRatio="none"
          style={{ marginTop: "-6px" }}
        >
          <path
            ref={ecgRef}
            d="M0,6 L80,6 L90,6 L95,1 L100,11 L105,1 L110,6 L120,6 L130,4 L135,8 L140,6 L800,6"
            fill="none"
            stroke="#7EC8E3"
            strokeWidth="1.5"
            strokeDasharray="800"
            strokeDashoffset="0"
            style={{
              animation: "ecg-scroll 3s linear infinite",
            }}
          />
        </svg>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
            <Link href="/procedures">
              <div className="mt-2 px-3 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-primary text-center">
                Enter OR
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
