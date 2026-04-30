import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
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

// Layout wrapper with Navbar
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function Router() {
  const { user, hasCompletedOnboarding } = useAuth();
  const [location] = useLocation();

  // Navbar is rendered inside AuthenticatedLayout, not here
  return (
    <>
      <Switch>
        <Route path="/signin" component={Signin} />

        {/* Protected routes - these will be guarded by AuthRedirect */}
        <Route path="/">
          <AuthenticatedLayout>
            <Home />
          </AuthenticatedLayout>
        </Route>

        <Route path="/procedures">
          <AuthenticatedLayout>
            <ProcedureLibrary />
          </AuthenticatedLayout>
        </Route>

        <Route path="/simulation/:id">
          <AuthenticatedLayout>
            <Simulation />
          </AuthenticatedLayout>
        </Route>

        <Route path="/simulation">
          <AuthenticatedLayout>
            <Simulation />
          </AuthenticatedLayout>
        </Route>

        <Route path="/leaderboard">
          <AuthenticatedLayout>
            <Leaderboard />
          </AuthenticatedLayout>
        </Route>

        <Route path="/learn">
          <AuthenticatedLayout>
            <LearnHub />
          </AuthenticatedLayout>
        </Route>

        <Route path="/anatomy">
          <AuthenticatedLayout>
            <AnatomyExplorer />
          </AuthenticatedLayout>
        </Route>

        <Route path="/profile">
          <AuthenticatedLayout>
            <Profile />
          </AuthenticatedLayout>
        </Route>

        <Route component={Signin} />
      </Switch>
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
