import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useDashboard } from "@/hooks/useResultQueries";
import { formatPercent } from "@/utils/format";
import {
  ErrorState,
  LoadingSpinner,
  MetricCard,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Result Processing & GPA Engine" },
      {
        name: "description",
        content:
          "Overview of total students, overall pass rate and quick links to checking lists and marks upload.",
      },
      { property: "og:title", content: "Dashboard | Result Processing & GPA Engine" },
      {
        property: "og:description",
        content: "Total students, pass rate and shortcuts to the result processing workflows.",
      },
    ],
  }),
  component: DashboardPage,
});

const QUICK_LINKS = [
  { to: "/students", search: { classId: "9", search: "" }, label: "Class 9 student list" },
  { to: "/students", search: { classId: "10", search: "" }, label: "Class 10 student list" },
  { to: "/checking-lists", search: { tab: "optional" as const }, label: "Optional checking list" },
  {
    to: "/checking-lists",
    search: { tab: "practical-fail" as const },
    label: "Practical Fail checking list",
  },
  { to: "/checking-lists", search: { tab: "absent" as const }, label: "Absent checking list" },
  { to: "/upload", search: undefined, label: "Upload marks sheet" },
] as const;

function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Processing status for the current examination cycle."
      />

      {isLoading ? (
        <Panel>
          <LoadingSpinner label="Loading dashboard…" />
        </Panel>
      ) : isError ? (
        <Panel>
          <ErrorState error={error} onRetry={() => void refetch()} />
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total students" value={data!.totalStudents.toLocaleString("en-US")} />
          <MetricCard
            label="Overall pass rate"
            value={formatPercent(data!.overallPassRate)}
            hint="As computed by the backend rules engine"
          />
          {data!.classCounts.map((c) => (
            <MetricCard
              key={c.className}
              label={`${c.className} enrolment`}
              value={c.studentCount.toLocaleString("en-US")}
              tone="muted"
            />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Quick links" />
          <ul className="grid gap-2 p-4 sm:grid-cols-2">
            {QUICK_LINKS.map((l) => (
              <li key={`${l.to}-${l.label}`}>
                <Link
                  to={l.to}
                  search={l.search as never}
                  className="block rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="How results are produced" />
          <div className="flex gap-3 p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
            <p>
              Official grades are calculated by the backend rules engine. Trace records provide the
              audit trail. This console only displays the stored decisions — it never recomputes
              grading logic.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
