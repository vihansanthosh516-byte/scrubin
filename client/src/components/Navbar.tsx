/**
 * ScrubIn Navbar: 64px fixed header on the page ground. Wordmark, five section links (active in
 * terracotta, marked aria-current), a theme menu, the account menu, and one primary action,
 * "Enter the OR". Below md the links, theme and account move into a sheet.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, LogOut, Menu, Monitor, Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CtaLink, Wordmark } from "@/components/scrubin";
import { StreakChip } from "@/components/game";
import { useProgress } from "@/hooks/useProgress";
import { setSoundsEnabled, soundsEnabled } from "@/lib/celebrate";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/procedures", label: "Procedures" },
  { href: "/learn", label: "Learn" },
  { href: "/my-simulations", label: "My Simulations" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function Avatar({ src, name, className }: { src?: string; name: string; className?: string }) {
  return src ? (
    <img src={src} alt="" className={cn("rounded-sm border border-border object-cover", className)} />
  ) : (
    <span className={cn("flex items-center justify-center rounded-sm border border-border bg-muted text-[10px] font-bold text-foreground", className)} aria-hidden="true">
      {name[0]?.toUpperCase()}
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const progress = useProgress();
  const [sounds, setSounds] = useState(soundsEnabled);

  // A hairline appears once the page scrolls under the header.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu and start each page at the top.
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");
  const ThemeIcon = THEMES.find((t) => t.value === theme)?.icon ?? Sun;
  const displayName = user ? user.customUsername || user.name?.split(" ")[0] || user.login : "";

  const themeItems = (
    <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
      {THEMES.map(({ value, label, icon: Icon }) => (
        <DropdownMenuRadioItem key={value} value={value} className="cursor-pointer gap-2">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" /> {label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b bg-background transition-colors", scrolled ? "border-border" : "border-transparent")}>
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Wordmark />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-sm px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(link.href) ? "text-primary" : "text-nav-link hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && progress.loaded && (
            <Link href="/profile" aria-label={`${progress.streak}-day streak, ${progress.xp} XP`} className="flex items-center gap-2">
              <StreakChip streak={progress.streak} doneToday={progress.doneToday} />
              <span className="hidden rounded-full bg-xp/15 px-2.5 py-1 text-sm font-bold tabular-nums text-foreground lg:inline">{progress.xp.toLocaleString()} XP</span>
            </Link>
          )}
          <div className="hidden items-center gap-2 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="text-nav-link hover:text-primary" aria-label={`Theme: ${theme}`}>
                  <ThemeIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36 rounded-sm">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
                {themeItems}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={sounds}
                  onCheckedChange={(c) => {
                    setSounds(!!c);
                    setSoundsEnabled(!!c);
                  }}
                >
                  Celebration sounds
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 gap-2 px-3" aria-label={`Account menu for ${displayName}`}>
                    <Avatar src={user.avatar_url} name={displayName} className="h-5 w-5" />
                    <span className="max-w-[110px] truncate text-xs font-semibold">{displayName}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-sm">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm">{user.name}</span>
                    {user.profession && <span className="text-xs font-normal text-muted-foreground">{user.profession}</span>}
                    <span className="font-mono-data text-[11px] font-normal text-muted-foreground">@{user.login}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/profile">
                      <User className="h-4 w-4 text-primary" aria-hidden="true" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <CtaLink href="/signin" variant="outline" size="sm">
                Sign in
              </CtaLink>
            )}
          </div>

          <CtaLink href="/procedures" size="sm" className="hidden font-semibold sm:inline-flex">
            Enter the OR
          </CtaLink>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] gap-0 bg-background p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="text-left">
                  <Wordmark href={null} />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Main" className="flex flex-col px-3 py-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-sm px-3 py-3 text-sm font-medium",
                      isActive(link.href) ? "bg-primary/10 text-primary" : "text-nav-link hover:bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-border px-5 py-4">
                <p className="label-mono mb-2">Theme</p>
                <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
                  {THEMES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={theme === value}
                      onClick={() => setTheme(value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-sm border px-2 py-2 text-xs font-medium",
                        theme === value ? "border-primary bg-primary/10 text-primary" : "border-border text-nav-link",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-auto space-y-3 border-t border-border px-5 py-5">
                <CtaLink href="/procedures" className="w-full font-semibold">
                  Enter the OR
                </CtaLink>
                {user ? (
                  <Button variant="outline" onClick={logout} className="w-full text-destructive">
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                  </Button>
                ) : (
                  <CtaLink href="/signin" variant="outline" className="w-full">
                    Sign in
                  </CtaLink>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
