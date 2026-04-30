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
import Leaderboard from "./pages/Leaderboard";
import LearnHub from "./pages/LearnHub";
import Profile from "./pages/Profile";
import Signin from "./pages/Signin";
import AnatomyExplorer from "./pages/AnatomyExplorer";
import Onboarding from "./pages/Onboarding";
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
          initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full min-h-screen"
        >
          <Switch location={location}>
            <Route path="/signin" component={Signin} />
            <Route path="/" component={Home} />
            <Route path="/procedures" component={ProcedureLibrary} />
            <Route path="/simulation/:id" component={Simulation} />
            <Route path="/simulation" component={Simulation} />
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
