import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Upload,
  Users,
  GraduationCap,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/students", label: "Students", icon: Users, exact: false },
  { to: "/checking-lists", label: "Checking Lists", icon: ClipboardList, exact: false },
  { to: "/upload", label: "Upload Marks", icon: Upload, exact: false },
  { to: "/analytics", label: "Class Analytics", icon: BarChart3, exact: false },
] as const;

export function Sidebar() {
  return (
    <nav
      aria-label="Main"
      className="no-print flex shrink-0 gap-1 overflow-x-auto border-b border-sidebar-border bg-sidebar px-3 py-2 md:h-screen md:w-60 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:px-3 md:py-4"
    >
      <div className="mb-0 hidden items-center gap-2 px-2 pb-4 md:flex">
        <GraduationCap className="size-5 text-sidebar-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold leading-tight text-sidebar-foreground">
            Result Processing
          </p>
          <p className="text-xs text-muted-foreground">GPA Engine Console</p>
        </div>
      </div>
      {NAV.map(({ to, label, icon: Icon, exact }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact }}
          className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground",
            "aria-current": "page",
          }}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
