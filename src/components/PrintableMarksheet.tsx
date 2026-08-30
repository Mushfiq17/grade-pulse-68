import type { StudentTrace } from "@/api/api";
import { formatGpa } from "@/utils/format";
import { SubjectTraceTable } from "@/components/SubjectTraceTable";

export function PrintableMarksheet({ trace }: { trace: StudentTrace }) {
  const { student, result, subjects } = trace;
  return (
    <article className="mx-auto max-w-4xl bg-white p-8 text-slate-900 print:p-0">
      <header className="border-b-2 border-slate-800 pb-4 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wide">Academic Marksheet</h1>
        <p className="text-sm text-slate-600">
          Generated from the backend rules engine · official record
        </p>
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase text-slate-500">Student</dt>
          <dd className="font-medium">{student.name}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Student ID</dt>
          <dd className="font-medium tabular-nums">{student.id}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Class</dt>
          <dd className="font-medium">{student.className}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Optional subject</dt>
          <dd className="font-medium">
            {student.optionalSubject ? student.optionalSubject.name : "None"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-3 gap-4 border-y border-slate-300 py-4 text-center">
        <div>
          <p className="text-xs uppercase text-slate-500">Final GPA (official)</p>
          <p className="text-2xl font-bold tabular-nums">{formatGpa(result.finalGpa)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Uncancelled GPA</p>
          <p className="text-2xl font-bold tabular-nums">{formatGpa(result.uncancelledGpa)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Letter grade</p>
          <p className="text-2xl font-bold">{result.letterGrade}</p>
        </div>
      </div>

      {result.compulsoryFailed ? (
        <p className="mt-4 border border-red-400 bg-red-50 p-3 text-sm text-red-900">
          <strong>Compulsory failure</strong> in{" "}
          {result.compulsoryFailureSubjects.map((s) => s.name).join(", ") || "a compulsory subject"} →
          official result overridden to Final GPA 0.00 and grade F. Uncancelled GPA is retained for
          audit reference.
        </p>
      ) : null}

      <div className="mt-5">
        <SubjectTraceTable subjects={subjects} />
      </div>

      <footer className="mt-8 flex justify-between pt-10 text-xs text-slate-600">
        <span>____________________<br />Class Teacher</span>
        <span>____________________<br />Head of Institution</span>
      </footer>
    </article>
  );
}
