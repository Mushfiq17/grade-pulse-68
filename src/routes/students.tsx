import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useClasses, useStudents } from "@/hooks/useResultQueries";
import { formatGpa } from "@/utils/format";
import {
  EmptyState,
  ErrorState,
  GradeBadge,
  LoadingSpinner,
  PageHeader,
  Panel,
  PanelHeader,
  StatusBadge,
  TableShell,
  Td,
  Th,
} from "@/components/ui-kit";

type StudentSearch = { classId: string; search: string };

export const Route = createFileRoute("/students")({
  validateSearch: (search: Record<string, unknown>): StudentSearch => ({
    classId: typeof search['classId'] === "string" ? search['classId'] : "",
    search: typeof search['search'] === "string" ? search['search'] : "",
  }),
  head: () => ({
    meta: [
      { title: "Students | Result Processing & GPA Engine" },
      {
        name: "description",
        content: "Filter and search processed student results by class, GPA, grade and status.",
      },
      { property: "og:title", content: "Students | Result Processing & GPA Engine" },
      {
        property: "og:description",
        content: "Processed student results with final GPA, letter grade and status.",
      },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const { classId, search } = Route.useSearch();
  const navigate = useNavigate({ from: "/students" });
  const [searchInput, setSearchInput] = useState(search);

  const classesQuery = useClasses();
  const filters = { classId: classId || undefined, search: search || undefined };
  const { data: students, isLoading, isError, error, refetch } = useStudents(filters);

  const setSearch = (next: Partial<StudentSearch>) =>
    void navigate({ search: (prev) => ({ ...prev, ...next }) });

  const openStudent = (id: string) => void navigate({ to: "/student/$id", params: { id } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Official results as stored by the rules engine. Select a row to open the full audit trace."
      />

      <Panel>
        <PanelHeader
          title="Filters"
          meta={students ? `${students.length} record${students.length === 1 ? "" : "s"}` : null}
        />
        <form
          className="flex flex-wrap items-end gap-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch({ search: searchInput.trim() });
          }}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="classId" className="text-xs font-medium text-muted-foreground">
              Class
            </label>
            <select
              id="classId"
              className="field min-w-48"
              value={classId}
              onChange={(e) => setSearch({ classId: e.target.value })}
            >
              <option value="">All classes</option>
              {(classesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="search" className="text-xs font-medium text-muted-foreground">
              Search by name or student ID
            </label>
            <input
              id="search"
              type="search"
              className="field min-w-64"
              placeholder="e.g. Rahim or 100234"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Apply
          </button>
          {classId || search ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearchInput("");
                setSearch({ classId: "", search: "" });
              }}
            >
              Reset
            </button>
          ) : null}
        </form>
      </Panel>

      <Panel>
        <PanelHeader title="Result register" />
        {isLoading ? (
          <LoadingSpinner label="Loading students…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : !students || students.length === 0 ? (
          <EmptyState
            title="No students match these filters"
            hint="Try clearing the class filter or search term."
          />
        ) : (
          <TableShell>
            <caption className="sr-only">Student results</caption>
            <thead>
              <tr>
                <Th>Student ID</Th>
                <Th>Name</Th>
                <Th>Class</Th>
                <Th className="text-right">Final GPA</Th>
                <Th>Letter grade</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open trace for ${s.name}`}
                  onClick={() => openStudent(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openStudent(s.id);
                    }
                  }}
                  className="cursor-pointer transition-colors hover:bg-muted/70 focus-visible:bg-muted"
                >
                  <Td className="font-mono text-xs tabular-nums text-muted-foreground">{s.id}</Td>
                  <Td className="font-medium text-foreground">{s.name}</Td>
                  <Td>{s.className}</Td>
                  <Td className="text-right font-semibold tabular-nums">{formatGpa(s.finalGpa)}</Td>
                  <Td>
                    <GradeBadge grade={s.letterGrade} />
                  </Td>
                  <Td>
                    <StatusBadge status={s.status} hasAbsent={s.hasAbsent} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>
    </div>
  );
}
