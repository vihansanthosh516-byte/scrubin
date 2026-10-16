import { useEffect } from "react";

// Browser-tab title per route. Pages with a more specific name (a procedure, a case)
// can still set document.title themselves after mounting.
const TITLES: [RegExp, string][] = [
  [/^\/$/, "Home"],
  [/^\/signin/, "Sign in"],
  [/^\/onboarding/, "Welcome"],
  [/^\/procedures/, "Procedures"],
  [/^\/simulation/, "Operating room"],
  [/^\/or\/cases/, "OR cases"],
  [/^\/or\/replay/, "Case replay"],
  [/^\/replay/, "Replay"],
  [/^\/my-simulations/, "My simulations"],
  [/^\/leaderboard/, "Leaderboard"],
  [/^\/learn/, "Learn"],
  [/^\/profile/, "Profile"],
  [/^\/terms/, "Terms"],
  [/^\/privacy/, "Privacy"],
];

export function routeTitle(path: string): string {
  const name = TITLES.find(([re]) => re.test(path))?.[1] ?? "Page not found";
  return `${name} · ScrubIn`;
}

/** Sets document.title for the current route and returns it (for the route announcer). */
export function useRouteTitle(path: string): string {
  const title = routeTitle(path);
  useEffect(() => {
    document.title = title;
  }, [title]);
  return title;
}
