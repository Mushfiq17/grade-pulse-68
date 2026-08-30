import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { CheckingListType } from "@/api/api";
import { useCheckingList } from "@/hooks/useResultQueries";
import {
  EmptyState,
  ErrorState,
  LoadingSpinner,
  PageHeader,
  Panel,
  PanelHeader,
  TableShell,
  Td,
  Th,
} from "@/components/ui-kit";

const TABS: { id: CheckingListType; label: string; tone: "amber" | "red" }[] = [
  { id: "optional", label: "Optional", tone: "amber" },
  { id: "practical-fail", label: "Practical Fail", tone: "red" },
  { id: "absent", label: "Absent", tone: "amber" },
];

type Search = { tab: CheckingListType };

export const Route = createFileRoute("/checking-lists")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const tab = search['tab'];
    return {
      tab: TABS.some((t) => t.id === tab) ? (tab as CheckingListType) : "optional",
    };
  },
  head: () => ({
    meta: [
      { title: "Checking Lists | Result Processing & GPA Engine" },
      {
        name: "description",
        content:
          "Manual verification lists for optional subjects, practical failures and absent candidates.",
      },
      { property: "og:title", content: "Checking Lists | Result Processing & GPA Engine" },
      {
        property: "og:description",
        content: "Backend-generated verification lists for optional, practical fail and absent cases.",
      },
    ],
  }),
  component: CheckingListsPage,
});

function CheckingListsPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: "/checking-lists" });
  const { data, isLoading, isError, error, refetch } = useCheckingList(tab);
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checking Lists"
        description="Records flagged by the rules engine for manual verification. Entries are shown exactly as generated and are not deduplicated across lists."
      />

      <div
        role="tablist"
        aria-label="Checking list type"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {TABS.map((t) => {
          const selected = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => void navigate({ search: { tab: t.id } })}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <Panel
        className={cn(
          "border-l-4",
          active.tone === "red" ? "border-l-red-400" : "border-l-yellow-400",
        )}
      >
        <PanelHeader
          title={`${active.label} list`}
          meta={data ? `${data.length} entr${data.length === 1 ? "y" : "ies"}` : null}
        />
        {isLoading ? (
          <LoadingSpinner label="Loading checking list…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No entries in this list" hint="Nothing was flagged by the engine." />
        ) : (
          <TableShell>
            <caption className="sr-only">{active.label} checking list entries</caption>
            <thead>
              <tr>
                <Th>Student name</Th>
                <Th>Student ID</Th>
                <Th>Subject</Th>
                <Th>Reason</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((e, i) => (
                <tr key={`${e.studentId}-${e.subjectCode ?? "none"}-${i}`} className="hover:bg-muted/60">
                  <Td>
                    <Link
                      to="/student/$id"
                      params={{ id: e.studentId }}
                      search={e.subjectCode ? { subject: e.subjectCode } : { subject: "" }}
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {e.studentName}
                    </Link>
                  </Td>
                  <Td className="font-mono text-xs tabular-nums text-muted-foreground">
                    {e.studentId}
                  </Td>
                  <Td>
                    {e.subjectName ?? "—"}
                    {e.subjectCode ? (
                      <span className="ml-1 text-xs text-muted-foreground">({e.subjectCode})</span>
                    ) : null}
                  </Td>
                  <Td className="max-w-lg text-muted-foreground">{e.reason}</Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>
    </div>
  );
}
