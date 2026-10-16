import { reportError } from "@/lib/errorReport";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    reportError("react", error);
  }

  render() {
    if (this.state.hasError) {
      // A crash page in the site's own look. The stack is for bug reports, so it sits behind "Details".
      return (
        <div role="alert" className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="w-full max-w-xl">
            <AlertTriangle className="mb-6 h-10 w-10 text-destructive" aria-hidden="true" />
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight">Something went wrong</h1>
            <p className="mt-4 text-muted-foreground">
              ScrubIn hit an unexpected error and couldn't show this page. It has been reported. Reloading usually fixes it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reload page
              </button>
              <a href="/" className="inline-flex h-10 items-center rounded-sm border border-border bg-card px-5 text-sm font-semibold hover:border-surface-hover-border">
                Go home
              </a>
            </div>
            {this.state.error?.stack && (
              <details className="mt-8 text-sm text-muted-foreground">
                <summary className="cursor-pointer select-none">Details for a bug report</summary>
                <pre className="mt-3 max-h-64 overflow-auto rounded-sm border border-border bg-muted p-4 text-xs whitespace-pre-wrap">{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
