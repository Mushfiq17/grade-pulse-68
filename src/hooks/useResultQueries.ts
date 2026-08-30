import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type CheckingListType } from "@/api/api";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  classes: ["classes"] as const,
  students: (filters: { classId?: string; search?: string }) => ["students", filters] as const,
  studentTrace: (id: string) => ["studentTrace", id] as const,
  checkingList: (type: CheckingListType) => ["checkingList", type] as const,
  classSummary: (classId: string) => ["classSummary", classId] as const,
};

export const useDashboard = () =>
  useQuery({ queryKey: queryKeys.dashboard, queryFn: api.getDashboard });

export const useClasses = () => useQuery({ queryKey: queryKeys.classes, queryFn: api.getClasses });

export const useStudents = (filters: { classId?: string; search?: string }) =>
  useQuery({
    queryKey: queryKeys.students(filters),
    queryFn: () => api.getStudents(filters),
  });

export const useStudentTrace = (id: string) =>
  useQuery({
    queryKey: queryKeys.studentTrace(id),
    queryFn: () => api.getStudentTrace(id),
    enabled: Boolean(id),
  });

export const useCheckingList = (type: CheckingListType) =>
  useQuery({ queryKey: queryKeys.checkingList(type), queryFn: () => api.getCheckingList(type) });

export const useClassSummary = (classId: string) =>
  useQuery({
    queryKey: queryKeys.classSummary(classId),
    queryFn: () => api.getClassSummary(classId),
    enabled: Boolean(classId),
  });

/** Invalidate everything that can change after a marks upload. */
export function useInvalidateResultData() {
  const qc = useQueryClient();
  return () => {
    for (const key of ["dashboard", "students", "classes", "classSummary", "checkingList"]) {
      void qc.invalidateQueries({ queryKey: [key] });
    }
  };
}
