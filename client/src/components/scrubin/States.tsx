import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Centred spinner with a spoken label. */
export function LoadingState({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground", className)}>
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

/** What a list shows when it has nothing: a title, one line of help, and the way out. */
export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-20 text-center", className)}>
      {icon && <div className="mb-5 text-label [&_svg]:h-10 [&_svg]:w-10">{icon}</div>}
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Inline error, announced to screen readers. Pass `action` for a Retry button. */
export function ErrorBanner({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div role="alert" className={cn("flex items-center justify-between gap-4 rounded-sm border px-4 py-3 text-sm pill-carmine", className)}>
      <span className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        {children}
      </span>
      {action}
    </div>
  );
}

/** A labelled number tile (mono figure, uppercase label). */
export function StatCard({ value, label, icon, className }: { value: ReactNode; label: string; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("surface flex flex-col justify-between gap-5 p-6", className)}>
      {icon && <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-background text-primary [&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
      <div>
        <p className="font-mono-data text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
        <p className="label-mono mt-1">{label}</p>
      </div>
    </div>
  );
}
