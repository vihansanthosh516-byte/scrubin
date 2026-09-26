"use client";
/**
 * ScrubIn Navbar — Anthropic Editorial
 * Edge-to-edge sticky header on warm cream; blurs and gains a crisp border on
 * scroll. Charcoal links with terracotta hover, solid terracotta "Enter OR"
 * action, and light/dark/system theme switcher.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Menu, X, User, LogOut, ChevronDown, Monitor } from "lucide-react";
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
  { href: "/learn", label: "Learn" },
  { href: "/my-simulations", label: "My Simulations" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Blur + border on scroll (editorial sticky header behavior)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu + scroll to top on route change
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemPrefersDark(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const displayTheme = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;
  const isActive = (href: string) => location === href;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-[#E2DDD1] bg-[#FBF9F5]/85 backdrop-blur-md shadow-[0_1px_12px_rgba(25,25,25,0.04)] dark:border-[#3A342C] dark:bg-[#161310]/85 dark:shadow-[0_1px_12px_rgba(0,0,0,0.4)]"
          : "border-transparent bg-[#FBF9F5] dark:bg-[#161310]"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute h-3.5 w-3.5 rounded-full bg-[#CC553D]/20" />
            <span className="h-2 w-2 rounded-full bg-[#CC553D] animate-pulse" />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#191919] dark:text-[#EDEAE4]">
            Scrub<span className="text-[#CC553D]">In</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={cn(
                  "px-3.5 py-2 text-sm font-medium transition-colors rounded-sm",
                  isActive(link.href)
                    ? "text-[#CC553D] dark:text-[#D95338]"
                    : "text-[#666059] hover:text-[#CC553D] dark:text-[#C2BBB0] dark:hover:text-[#D95338]"
                )}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-sm border border-[#E2DDD1] text-[#666059] hover:border-[#CC553D]/40 hover:text-[#CC553D] dark:border-[#3A342C] dark:text-[#C2BBB0]"
                aria-label="Select theme"
              >
                {displayTheme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36 rounded-sm border-[#E2DDD1] bg-white dark:bg-[#1E1A16]">
              <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer">
                <Sun className="h-4 w-4 text-[#CC553D]" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer">
                <Moon className="h-4 w-4 text-[#CC553D]" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 cursor-pointer">
                <Monitor className="h-4 w-4 text-[#CC553D]" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-9 items-center gap-2 rounded-sm border border-[#E2DDD1] px-3 hover:border-[#CC553D]/40 dark:border-[#3A342C]"
                >
                  <img src={user.avatar_url} alt={user.name} className="h-5 w-5 rounded-sm border border-[#E2DDD1] dark:border-[#3A342C]" />
                  <span className="max-w-[110px] truncate text-xs font-semibold text-[#191919] dark:text-[#EDEAE4]">
                    {user.customUsername || user.name?.split(" ")[0] || user.login}
                  </span>
                  {user.profession && (
                    <span className="hidden sm:inline max-w-[84px] truncate rounded-sm bg-[#CC553D]/10 px-1.5 py-0.5 font-mono-data text-[10px] font-semibold uppercase tracking-widest text-[#CC553D] dark:bg-[#D95338]/15 dark:text-[#D95338]">
                      {user.profession}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 text-[#666059] dark:text-[#C2BBB0]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-sm border-[#E2DDD1] bg-white dark:bg-[#1E1A16]">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm">
                    {user.name}
                    {user.profession && (
                      <span className="rounded-full bg-[#CC553D] px-2 py-0.5 font-mono-data text-[10px] font-semibold uppercase tracking-widest text-white dark:bg-[#D95338]">
                        {user.profession}
                      </span>
                    )}
                  </span>
                  <span className="font-mono-data text-[10px] font-normal text-[#666059] dark:text-[#C2BBB0]">@{user.login}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#E2DDD1]" />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <User className="h-4 w-4 text-[#CC553D]" /> Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-[#E2DDD1]" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 text-[#A32A2A] focus:text-[#A32A2A]">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/signin">
              <Button
                size="sm"
                className="rounded-sm bg-[#CC553D] px-4 font-medium text-white hover:bg-[#B94A35]"
              >
                Sign In
              </Button>
            </Link>
          )}

          {/* Enter OR CTA */}
          <Link href="/procedures">
            <motion.span
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:inline-flex h-9 items-center rounded-sm bg-[#CC553D] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B94A35]"
            >
              Enter OR
            </motion.span>
          </Link>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-sm border border-[#E2DDD1] text-[#191919] md:hidden dark:border-[#3A342C] dark:text-[#EDEAE4]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-[#E2DDD1] bg-[#FBF9F5] px-4 pb-6 pt-2 md:hidden dark:bg-[#161310]"
        >
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={cn(
                    "block rounded-sm px-3 py-3 text-sm font-medium",
                    isActive(link.href)
                      ? "bg-[#CC553D]/8 text-[#CC553D]"
                      : "text-[#666059] hover:bg-[#F4F0E8] dark:text-[#C2BBB0] dark:hover:bg-[#26211B]"
                  )}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <Link href="/procedures">
              <span className="mt-3 block rounded-sm bg-[#CC553D] px-4 py-3 text-center text-sm font-semibold text-white">
                Enter OR
              </span>
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
