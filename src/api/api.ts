/**
 * Single place where the backend contract is adapted.
 * Components never touch fetch or reshape API payloads themselves.
 */

const BASE_URL = (import.meta.env['VITE_API_BASE_URL'] ?? "").replace(/\/$/, "");

export type Status = "PASS" | "FAIL" | "AB";
export type Mark = number | "AB" | undefined;

export interface DashboardData {
  totalStudents: number;
  overallPassRate: number;
  classCounts: { className: string; studentCount: number }[];
}

export interface StudentRow {
  id: string;
  name: string;
  className: string;
  finalGpa: number;
  letterGrade: string;
  status: Status;
  hasAbsent?: boolean;
  optionalSubjectCode?: string;
}

export interface ClassItem {
  id: string;
  name: string;
}

export interface TraceSubject {
  code: string;
  name: string;
  isOptional?: boolean;
  isPractical?: boolean;
  rawMark?: Mark;
  theoryMark?: Mark;
  practicalMark?: Mark;
  totalMark?: Mark;
  gradePoint: number;
  status: Status;
  failReason?: string;
  ruleApplied?: string;
  gradeBand?: { min?: number; max?: number; label?: string };
}

export interface StudentTrace {
  student: {
    id: string;
    name: string;
    className: string;
    optionalSubject: { code: string; name: string } | null;
  };
  result: {
    finalGpa: number;
    uncancelledGpa: number;
    letterGrade: string;
    compulsoryFailed: boolean;
    compulsoryFailureSubjects: { code?: string; name: string }[];
    optionalContribution: number;
    optionalGradePoint?: number;
    optionalExplanation?: string;
  };
  subjects: TraceSubject[];
}

export interface CheckingListEntry {
  studentId: string;
  studentName: string;
  subjectCode?: string;
  subjectName?: string;
  reason: string;
}

export interface UploadResult {
  acceptedRows: number;
  rejectedRows: number;
  rejected: { rowNumber: number; reason: string; rawData?: Record<string, string> }[];
}

export interface ClassSummary {
  className: string;
  totalStudents: number;
  passRate: number;
  gradeDistribution: Record<string, number>;
  mostFailedSubject: { code?: string; name: string; failureCount: number } | null;
}

export type CheckingListType = "optional" | "practical-fail" | "absent";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: init?.body instanceof FormData ? undefined : { Accept: "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError("Cannot reach the results API. Check that the backend is running.", 0);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      detail = body.message ?? body.error ?? "";
    } catch {
      /* ignore non-JSON bodies */
    }
    throw new ApiError(detail || `Request failed (${res.status} ${res.statusText})`, res.status);
  }
  return (await res.json()) as T;
}

const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

export const api = {
  async getDashboard(): Promise<DashboardData> {
    const d = await request<Partial<DashboardData>>("/api/dashboard");
    return {
      totalStudents: num(d.totalStudents),
      overallPassRate: num(d.overallPassRate),
      classCounts: Array.isArray(d.classCounts) ? d.classCounts : [],
    };
  },

  async getStudents(filters: { classId?: string; search?: string }): Promise<StudentRow[]> {
    const params = new URLSearchParams();
    if (filters.classId) params.set("classId", filters.classId);
    if (filters.search) params.set("search", filters.search);
    const qs = params.toString();
    const d = await request<{ students?: StudentRow[] }>(`/api/students${qs ? `?${qs}` : ""}`);
    return Array.isArray(d.students) ? d.students : [];
  },

  async getClasses(): Promise<ClassItem[]> {
    const d = await request<{ classes?: ClassItem[] }>("/api/classes");
    return Array.isArray(d.classes) ? d.classes : [];
  },

  async getStudentTrace(id: string): Promise<StudentTrace> {
    const d = await request<StudentTrace>(`/api/students/${encodeURIComponent(id)}/trace`);
    const rawSubjects = Array.isArray(d.result?.compulsoryFailureSubjects)
      ? (d.result.compulsoryFailureSubjects as unknown[])
      : [];
    return {
      student: d.student,
      result: {
        ...d.result,
        compulsoryFailureSubjects: rawSubjects.map((s) =>
          typeof s === "string" ? { name: s } : (s as { code?: string; name: string }),
        ),
      },
      subjects: Array.isArray(d.subjects) ? d.subjects : [],
    };
  },

  async getCheckingList(type: CheckingListType): Promise<CheckingListEntry[]> {
    const d = await request<{ entries?: CheckingListEntry[] }>(`/api/checking-lists/${type}`);
    return Array.isArray(d.entries) ? d.entries : [];
  },

  async uploadMarks(file: File): Promise<UploadResult> {
    const form = new FormData();
    form.append("file", file);
    const d = await request<Partial<UploadResult>>("/api/upload", { method: "POST", body: form });
    return {
      acceptedRows: num(d.acceptedRows),
      rejectedRows: num(d.rejectedRows, Array.isArray(d.rejected) ? d.rejected.length : 0),
      rejected: Array.isArray(d.rejected) ? d.rejected : [],
    };
  },

  async getClassSummary(classId: string): Promise<ClassSummary> {
    const d = await request<Partial<ClassSummary>>(
      `/api/class-summary?classId=${encodeURIComponent(classId)}`,
    );
    return {
      className: d.className ?? "",
      totalStudents: num(d.totalStudents),
      passRate: num(d.passRate),
      gradeDistribution: d.gradeDistribution ?? {},
      mostFailedSubject: d.mostFailedSubject ?? null,
    };
  },
};
