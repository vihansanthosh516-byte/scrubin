import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProcedureLibrary from "./pages/ProcedureLibrary";
import Simulation from "./pages/Simulation";
// import SimulationDashboard from "./pages/SimulationDashboard"; // Deprecated
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Signin from "./pages/Signin";
import AnatomyExplorer from "./pages/AnatomyExplorer";
import LearnHub from "./pages/LearnHub";
import Onboarding from "./pages/Onboarding";
import ResumeSimulation from "./pages/ResumeSimulation";
import MySimulations from "./pages/MySimulations";
import ReplayViewer from "./pages/ReplayViewer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-baby-blue border-t-transparent rounded-full" />
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
          // No y-translate here: a translated route wrapper briefly extends the
          // document's scrollable overflow during the enter animation, and the
          // browser caches that height (leaving a phantom scrollbar on
          // fixed-height dashboard pages). The opacity/blur fade is the same
          // visual without any layout overflow.
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full min-h-screen"
        >
          <Switch location={location}>
            <Route path="/signin" component={Signin} />
            <Route path="/onboarding" component={Onboarding} />
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
            <Route component={Signin} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" switchable>
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
