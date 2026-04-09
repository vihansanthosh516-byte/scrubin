import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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
import { AuthProvider } from "./contexts/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/procedures" component={ProcedureLibrary} />
      <Route path="/simulation/:id" component={Simulation} />
      <Route path="/simulation" component={Simulation} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/learn" component={LearnHub} />
      <Route path="/anatomy" component={AnatomyExplorer} />
      <Route path="/profile" component={Profile} />
      <Route path="/signin" component={Signin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
