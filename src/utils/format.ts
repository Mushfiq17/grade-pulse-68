import type { Mark, Status, TraceSubject } from "@/api/api";

const gpaFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatGpa = (value: number | undefined | null): string =>
  typeof value === "number" && Number.isFinite(value) ? gpaFormatter.format(value) : "—";

export const formatPercent = (value: number | undefined | null): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  // Backend may send either 0–1 or 0–100; both normalise to a percentage.
  const pct = value <= 1 ? value * 100 : value;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(pct)}%`;
};

export const percentValue = (value: number | undefined | null): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  const pct = value <= 1 ? value * 100 : value;
  return Math.min(100, Math.max(0, pct));
};

export const isAbsent = (mark: Mark): boolean => mark === "AB";

/** "AB" stays "AB" — never rendered as 0. */
export const formatMark = (mark: Mark): string => {
  if (mark === "AB") return "AB";
  if (typeof mark === "number") return String(mark);
  return "—";
};

export const effectiveStatus = (status: Status, hasAbsent?: boolean): Status =>
  status === "AB" || hasAbsent ? "AB" : status;

/**
 * Fallback only. Backend `ruleApplied` / `failReason` always win.
 */
export function describeSubject(s: TraceSubject): string {
  if (s.ruleApplied) return s.ruleApplied;
  if (s.status === "AB") return "Absent (AB) → GP 0";
  if (s.isPractical) {
    const theory = formatMark(s.theoryMark);
    const practical = formatMark(s.practicalMark);
    const total = formatMark(s.totalMark);
    return `Theory: ${theory}/75, Practical: ${practical}/25, Total: ${total}/100`;
  }
  const mark = s.rawMark ?? s.totalMark;
  const band = s.gradeBand;
  const bandText =
    band && (band.label || band.min !== undefined)
      ? ` (rule: ${band.label ?? `${band.min}–${band.max}`} → GP ${s.gradePoint.toFixed(1)})`
      : "";
  if (typeof mark === "number") return `${mark} → GP ${s.gradePoint.toFixed(1)}${bandText}`;
  return `GP ${s.gradePoint.toFixed(1)}`;
}

export function marksUsed(s: TraceSubject): string {
  if (s.isPractical) {
    return `Theory ${formatMark(s.theoryMark)}/75 · Practical ${formatMark(s.practicalMark)}/25 · Total ${formatMark(s.totalMark)}/100`;
  }
  const mark = s.rawMark ?? s.totalMark;
  return formatMark(mark);
}
