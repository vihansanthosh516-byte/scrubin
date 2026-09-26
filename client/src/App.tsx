import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProcedureLibrary from "./pages/ProcedureLibrary";
import Simulation from "./pages/Simulation";
// import SimulationDashboard from "./pages/SimulationDashboard"; // Deprecated
import Leaderboard from "./pages/Leaderboard";
import LearnHub from "./pages/LearnHub";
import Profile from "./pages/Profile";
import Signin from "./pages/Signin";
import AnatomyExplorer from "./pages/AnatomyExplorer";
import Onboarding from "./pages/Onboarding";
import ResumeSimulation from "./pages/ResumeSimulation";
import MySimulations from "./pages/MySimulations";
import ReplayViewer from "./pages/ReplayViewer";
import AIWorkspace from "./pages/AIWorkspace";
import AISession from "./pages/AISession";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";

import { LoadingSkeleton } from "./components/ui/enhanced-ui";

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background p-8 flex flex-col gap-6 max-w-6xl mx-auto mt-16">
      <div className="flex gap-4 items-center">
        <LoadingSkeleton className="w-16 h-16 rounded-2xl" lines={1} />
        <div className="flex-1 max-w-md">
          <LoadingSkeleton lines={2} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <LoadingSkeleton className="h-48 rounded-2xl" lines={1} />
        <LoadingSkeleton className="h-48 rounded-2xl" lines={1} />
        <LoadingSkeleton className="h-48 rounded-2xl" lines={1} />
      </div>
    </div>
  );
}

// Auth redirect handler - handles all redirect logic in one place
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading, hasCompletedOnboarding } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    // Define public routes that don't require auth
    const publicRoutes = ["/signin", "/onboarding"];
    const isPublicRoute = publicRoutes.includes(location);

    // Not authenticated and not on a public route -> redirect to signin
    if (!user && !isPublicRoute) {
      setLocation("/signin");
      return;
    }

    // Authenticated but on signin page -> redirect to profile
    if (user && location === "/signin") {
      setLocation("/profile");
      return;
    }

  }, [user, loading, hasCompletedOnboarding, location, setLocation]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function Router() {
  const { user, hasCompletedOnboarding } = useAuth();
  const [location] = useLocation();

  // If we are not on signin or onboarding, we show the Navbar
  const showNavbar = location !== "/signin" && location !== "/onboarding";

  return (
    <>
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full min-h-screen"
        >
          <RouteErrorBoundary>
            <Switch location={location}>
              <Route path="/signin" component={Signin} />
              <Route path="/" component={Home} />
              <Route path="/procedures" component={ProcedureLibrary} />
              <Route path="/simulation/:id" component={Simulation} />
              <Route path="/simulation" component={Simulation} />
              <Route path="/resume" component={ResumeSimulation} />
              <Route path="/my-simulations" component={MySimulations} />
              <Route path="/replay/:sessionId" component={ReplayViewer} />

              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/learn" component={LearnHub} />
              <Route path="/anatomy" component={AnatomyExplorer} />
              <Route path="/profile" component={Profile} />
              <Route path="/ai" component={AIWorkspace} />
              <Route path="/ai/session/:sessionId" component={AISession} />
              <Route component={Signin} />
            </Switch>
          </RouteErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <TooltipProvider>
            <Toaster />
            <AuthRedirect>
              <Router />
            </AuthRedirect>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
