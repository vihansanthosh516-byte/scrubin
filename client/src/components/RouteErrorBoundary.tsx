import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Component, ReactNode } from "react";
import { Link } from "wouter";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-[#0D1628]/40 border border-destructive/20 rounded-2xl backdrop-blur-xl m-8">
          <div className="p-4 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Failed to load component
          </h2>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            We encountered an unexpected error while rendering this part of the page.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(126,200,227,0.3)]"
              )}
            >
              <RotateCcw size={18} />
              Try Again
            </button>
            <Link href="/">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                  "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                )}
              >
                <ArrowLeft size={18} />
                Return Home
              </button>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
