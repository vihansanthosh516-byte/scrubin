import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { motion, MotionConfig } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SiteFooter from "./components/SiteFooter";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { startCloudSync } from "./engine/cloudCases";
import Navbar from "./components/Navbar";
import { useRouteTitle } from "./hooks/useRouteTitle";

// Every page but Home loads on demand, so the first visit doesn't download the OR (or the sign-in shader).
const Signin = lazy(() => import("./pages/Signin"));
const ProcedureLibrary = lazy(() => import("./pages/ProcedureLibrary"));
const Simulation = lazy(() => import("./pages/Simulation"));
const OperatingRoom = lazy(() => import("./pages/OperatingRoom"));
const OrCases = lazy(() => import("./pages/OrCases"));
const OrReplay = lazy(() => import("./pages/OrReplay"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const LearnHub = lazy(() => import("./pages/LearnHub"));
const Briefing = lazy(() => import("./pages/Briefing"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const MySimulations = lazy(() => import("./pages/MySimulations"));
const ReplayViewer = lazy(() => import("./pages/ReplayViewer"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Terms = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Privacy })));

const PUBLIC_ROUTES = ["/signin", "/onboarding", "/terms", "/privacy"];

function LoadingScreen({ label = "Loading ScrubIn" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Auth redirect handler - handles all redirect logic in one place
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading, hasCompletedOnboarding } = useAuth();
  const [location, setLocation] = useLocation();
  // Mirror real-time OR cases to the signed-in user's account (see engine/cloudCases.ts).
  const userIdRef = useRef<string | undefined>(undefined);
  userIdRef.current = user?.id;
  useEffect(() => startCloudSync(() => userIdRef.current), []);

  // Where this visitor should be instead of `location`, if anywhere.
  const redirectTo = loading
    ? null
    : !user && !PUBLIC_ROUTES.includes(location)
      ? "/signin"
      : user && !hasCompletedOnboarding && location !== "/onboarding"
        ? "/onboarding"
        : user && hasCompletedOnboarding && location === "/signin"
          ? "/profile"
          : null;

  useEffect(() => {
    if (redirectTo) setLocation(redirectTo);
  }, [redirectTo, setLocation]);

  // Hold the loading screen while a redirect is pending so protected pages never flash.
  if (loading || redirectTo) return <LoadingScreen />;

  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  const title = useRouteTitle(location);
  const mainRef = useRef<HTMLElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const firstRender = useRef(true);

  // On client-side navigation, move focus to the new page and announce it, as a full page load would.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
    setAnnouncement(title);
  }, [location, title]);

  // Signin and onboarding are full-screen flows without the site chrome.
  const showChrome = location !== "/signin" && location !== "/onboarding";

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      {showChrome && <Navbar />}
      <main id="main-content" ref={mainRef} tabIndex={-1} className="outline-none">
        {/* A short fade on enter only: no exit wait, no blur, so navigation feels instant. */}
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-full min-h-screen"
        >
          <Suspense fallback={<LoadingScreen label="Loading page" />}>
            <Switch location={location}>
              <Route path="/signin" component={Signin} />
              <Route path="/onboarding" component={Onboarding} />
              <Route path="/" component={Home} />
              <Route path="/procedures" component={ProcedureLibrary} />
              {/* Real-time OR (falls back to the classic simulation for procedures it doesn't model yet) */}
              <Route path="/simulation/classic" component={Simulation} />
              <Route path="/simulation/:id" component={Simulation} />
              <Route path="/simulation" component={OperatingRoom} />
              <Route path="/or/cases" component={OrCases} />
              <Route path="/or/replay/:sessionId" component={OrReplay} />
              <Route path="/my-simulations" component={MySimulations} />
              <Route path="/replay/:sessionId" component={ReplayViewer} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/learn/:procId" component={Briefing} />
              <Route path="/learn" component={LearnHub} />
              <Route path="/profile" component={Profile} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy" component={Privacy} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </motion.div>
      </main>
      <div aria-live="polite" className="sr-only">{announcement}</div>
      {showChrome && <SiteFooter />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" switchable>
          <MotionConfig reducedMotion="user">
            <TooltipProvider>
              <Toaster />
              <AuthRedirect>
                <Router />
              </AuthRedirect>
            </TooltipProvider>
          </MotionConfig>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
