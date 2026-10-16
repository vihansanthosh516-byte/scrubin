import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { Link } from "wouter";
import type { VariantProps } from "class-variance-authority";
import { Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/** A link that looks like a button (never a <button> inside an <a>). */
export function CtaLink({
  href,
  children,
  variant,
  size,
  className,
}: { href: string; children: ReactNode; className?: string } & VariantProps<typeof buttonVariants>) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}

const fieldBase =
  "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-label transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive";

/** Labelled text input. The label is always rendered (visually hidden with `hideLabel`) so screen readers get it. */
export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; hideLabel?: boolean; hint?: string }>(
  function TextField({ label, hideLabel, hint, className, id, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className="space-y-1.5 text-left">
        <label htmlFor={inputId} className={cn("block text-sm font-medium text-foreground", hideLabel && "sr-only")}>
          {label}
        </label>
        <input ref={ref} id={inputId} className={cn(fieldBase, className)} aria-describedby={hint ? `${inputId}-hint` : undefined} {...props} />
        {hint && <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  },
);

/** Labelled native select (keeps mobile pickers and keyboard behaviour). */
export function SelectField({
  label,
  hideLabel,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hideLabel?: boolean; options: readonly string[]; placeholder?: string }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={selectId} className={cn("block text-sm font-medium text-foreground", hideLabel && "sr-only")}>
        {label}
      </label>
      <div className="relative">
        <select id={selectId} className={cn(fieldBase, "cursor-pointer appearance-none pr-10", className)} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

/** Full-width search input with a leading icon and a real (visually hidden) label. */
export function SearchField({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-label" aria-hidden="true" />
      <input id={id} type="search" className={cn(fieldBase, "pl-12")} {...props} />
    </div>
  );
}

/**
 * A row of square uppercase filter chips with one selected value (toggle-group, so each chip
 * exposes its pressed state). Selecting the active chip again keeps it selected.
 */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      className={cn("flex flex-wrap justify-start gap-2", className)}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className="h-auto flex-none rounded-sm border border-border bg-card px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-none transition-colors first:rounded-sm last:rounded-sm hover:border-surface-hover-border hover:bg-card hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
