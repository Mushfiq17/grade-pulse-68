import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Status } from "@/api/api";
import { effectiveStatus, formatGpa, percentValue } from "@/utils/format";

/* ---------------------------------- Page --------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-md border border-border bg-card shadow-xs", className)}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, meta }: { title: string; meta?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
    </div>
  );
}

/* -------------------------------- Feedback -------------------------------- */

export function LoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Unexpected error.";
  return (
    <div role="alert" className="px-4 py-10 text-center">
      <AlertTriangle className="mx-auto size-6 text-destructive" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-foreground">Could not load data</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-4 py-12 text-center">
      <Inbox className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* --------------------------------- Badges --------------------------------- */

export function StatusBadge({ status, hasAbsent }: { status: Status; hasAbsent?: boolean }) {
  const s = effectiveStatus(status, hasAbsent);
  const styles =
    s === "AB"
      ? "bg-yellow-100 text-yellow-800"
      : s === "FAIL"
        ? "bg-red-100 text-red-800"
        : "bg-green-100 text-green-800";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold tracking-wide",
        styles,
      )}
    >
      {s === "AB" ? "AB" : s}
    </span>
  );
}

export function GradeBadge({ grade, large }: { grade: string; large?: boolean }) {
  const failing = grade?.toUpperCase() === "F";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded border font-semibold",
        large ? "min-w-16 px-4 py-2 text-2xl" : "px-2 py-0.5 text-xs",
        failing
          ? "border-red-200 bg-red-100 text-red-800"
          : "border-border bg-secondary text-secondary-foreground",
      )}
    >
      {grade || "—"}
    </span>
  );
}

/* ------------------------------- Metric card ------------------------------ */

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "muted" | "alert";
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-card p-4 shadow-xs",
        tone === "alert" ? "border-red-200" : "border-border",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tabular-nums",
          tone === "muted" ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function GpaCard({
  label,
  gpa,
  hint,
  tone,
}: {
  label: string;
  gpa: number;
  hint?: string;
  tone?: "default" | "muted" | "alert";
}) {
  return <MetricCard label={label} value={formatGpa(gpa)} hint={hint} tone={tone} />;
}

/* ------------------------------- Progress bar ----------------------------- */

export function ProgressBar({
  value,
  label,
  tone = "auto",
}: {
  value: number;
  label?: string;
  tone?: "auto" | "neutral";
}) {
  const pct = percentValue(value);
  const color =
    tone === "neutral" ? "bg-slate-400" : pct >= 60 ? "bg-green-600/80" : "bg-red-600/70";
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------------------------------- Table --------------------------------- */

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-border bg-muted/60 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("border-b border-border px-3 py-2 align-top", className)}>{children}</td>;
}
