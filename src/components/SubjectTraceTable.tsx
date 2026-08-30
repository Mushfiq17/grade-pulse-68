import { cn } from "@/lib/utils";
import type { TraceSubject } from "@/api/api";
import { describeSubject, marksUsed } from "@/utils/format";
import { StatusBadge, Td, Th, TableShell } from "@/components/ui-kit";

export function SubjectTraceTable({
  subjects,
  highlightCode,
  compact,
}: {
  subjects: TraceSubject[];
  highlightCode?: string;
  compact?: boolean;
}) {
  return (
    <TableShell>
      <caption className="sr-only">Subject-by-subject grading trace from the rules engine</caption>
      <thead>
        <tr>
          <Th>Subject</Th>
          <Th>Marks used</Th>
          <Th className="text-right">Grade point</Th>
          <Th>Status</Th>
          {!compact ? <Th>Decision / rule</Th> : null}
        </tr>
      </thead>
      <tbody>
        {subjects.map((s) => {
          const highlighted = highlightCode && s.code === highlightCode;
          return (
            <tr
              key={s.code}
              id={`subject-${s.code}`}
              className={cn(
                "align-top",
                highlighted ? "bg-amber-50 outline outline-2 -outline-offset-2 outline-amber-300" : "",
              )}
            >
              <Td>
                <div className="font-medium text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.code}
                  {s.isOptional ? " · Optional" : ""}
                  {s.isPractical ? " · Practical" : ""}
                </div>
              </Td>
              <Td className="tabular-nums text-foreground">{marksUsed(s)}</Td>
              <Td className="text-right font-semibold tabular-nums">{s.gradePoint.toFixed(2)}</Td>
              <Td>
                <StatusBadge status={s.status} />
              </Td>
              {!compact ? (
                <Td className="max-w-md text-muted-foreground">
                  <p>{describeSubject(s)}</p>
                  {s.failReason ? (
                    <p className="mt-1 text-red-800">{s.failReason}</p>
                  ) : null}
                </Td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}
