import React, { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  HeartPulse,
  Activity,
  ClipboardList,
  Search,
  Menu,
  X,
  UserCheck,
  Building2,
  CalendarCheck,
  Sparkles,
  Settings,
  Bell,
  Clock,
  Bed,
  Sun,
  Moon,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/care-sync/Logo";
import { NotificationCenter } from "@/components/care-sync/NotificationCenter";
import { GlobalSearchDialog } from "@/components/care-sync/GlobalSearchDialog";
import { AIPlaceholderButton } from "@/components/care-sync/AIPlaceholderButton";
import { useTheme } from "@/components/care-sync/ThemeToggle";
import { useCareSync } from "@/lib/store";
import { Role } from "@/types/caresync";

interface AppShellProps {
  children: React.ReactNode;
  activeRole?: Role;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function AppShell({ children, activeRole, pageTitle, pageSubtitle }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { currentRole, currentUser, setRole, prescriptions, testOrders, patients } = useCareSync();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();

  const pendingLabCount = testOrders.filter(
    (t) => t.status === "Pending" || t.status === "In Progress",
  ).length;
  const pendingRxCount = prescriptions.filter((p) => p.status === "Pending").length;
  const waitingPatientsCount = patients.filter((p) => p.status === "Waiting").length;

  const roleNavItems = [
    {
      label: "Overview / Doctor",
      path: "/doctor/dashboard",
      icon: Stethoscope,
      badge: waitingPatientsCount ? `${waitingPatientsCount} wait` : undefined,
      roleKey: "doctor",
    },
    {
      label: "Patients & Charts",
      path: "/doctor/patient/$id",
      icon: Users,
      params: { id: "CS-001" },
      roleKey: "doctor",
    },
    {
      label: "Consultations",
      path: "/doctor/consultation",
      icon: CalendarCheck,
      roleKey: "doctor",
    },
    {
      label: "Laboratory & Tests",
      path: "/lab/dashboard",
      icon: FlaskConical,
      badge: pendingLabCount ? `${pendingLabCount}` : undefined,
      roleKey: "lab",
    },
    {
      label: "Pharmacy & Dispensing",
      path: "/pharmacy/dashboard",
      icon: Pill,
      badge: pendingRxCount ? `${pendingRxCount}` : undefined,
      roleKey: "pharmacy",
    },
    {
      label: "Nursing & Inpatients",
      path: "/nurse/dashboard",
      icon: HeartPulse,
      roleKey: "nurse",
    },
    {
      label: "Surgery & OT",
      path: "/surgery",
      icon: Activity,
      roleKey: "doctor",
    },
    {
      label: "Reception & Admissions",
      path: "/receptionist/dashboard",
      icon: ClipboardList,
      roleKey: "receptionist",
    },
    {
      label: "Patient Portal",
      path: "/patient/dashboard",
      icon: UserCheck,
      roleKey: "patient",
    },
  ];

  return (
    <div className="min-h-screen bg-surf text-foreground flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1536px] items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-ink lg:hidden h-8 w-8"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle navigation"
              >
                {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
              <Logo />
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border/70 text-xs text-ink/50">
                <Building2 className="size-3.5 text-brand" />
                <span className="font-medium text-ink/80">Main Facility · Indiranagar</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Global Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-md bg-surf px-2.5 py-1 text-xs text-ink/65 border border-border hover:border-brand/40 shadow-2xs transition-colors"
                title="Search patients by name or ID"
              >
                <Search className="size-3.5 text-brand" />
                <span className="hidden sm:inline">Search (CS-001 / Name)...</span>
                <kbd className="hidden sm:inline-flex rounded bg-card px-1.5 py-0.2 font-mono text-[9px] text-ink/50 border border-border">
                  ⌘K
                </kbd>
              </button>

              {/* AI Assistant Placeholder */}
              <AIPlaceholderButton
                label="Ask CareSync"
                featureName="CareSync Hospital Operations Assistant"
                className="hidden lg:flex text-xs h-8 px-2.5"
              />

              {/* Dark / Light Mode Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8 text-ink/70 hover:text-ink"
                title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="size-4 text-warn transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="size-4 text-brand transition-transform hover:-rotate-12" />
                )}
              </Button>

              {/* Notification Center */}
              <NotificationCenter />

              {/* Role Switcher Hub Quick Link */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:flex border-border text-xs font-medium h-8 px-2.5 bg-card hover:bg-surf"
              >
                <Link to="/demo">
                  <UserCheck className="size-3.5 mr-1.5 text-brand" />
                  <span>Switch Role</span>
                </Link>
              </Button>

              {/* Active Role Persona Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-border/70">
                <div className="size-7 rounded-md bg-brand/10 text-brand grid place-items-center font-semibold text-xs border border-brand/20">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left leading-tight">
                  <div className="text-xs font-semibold text-ink">{currentUser.name}</div>
                  <div className="text-[10px] font-mono text-ink/50 capitalize">
                    {currentUser.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Layout */}
        <div className="mx-auto flex w-full max-w-[1536px] flex-1">
          {/* Refined Healthcare Operations Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "fixed inset-y-14 left-0 z-40 w-60 block shadow-2xl" : "hidden"
            } border-r border-border bg-card p-3 backdrop-blur-md lg:relative lg:block lg:w-56 lg:shrink-0 lg:bg-card/85 lg:shadow-none`}
          >
            <div className="flex items-center justify-between px-2 pb-2.5 pt-1 border-b border-border/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink/45">
                Hospital Workflows
              </div>
              <span className="size-1.5 rounded-full bg-calm" />
            </div>

            <div className="mt-2.5">
              <nav className="space-y-0.5">
                {roleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === "/doctor/patient/$id"
                      ? location.pathname.startsWith("/doctor/patient")
                      : location.pathname === item.path;

                  return (
                    <Link
                      key={item.label}
                      to={item.path as any}
                      params={item.params as any}
                      onClick={() => {
                        if (item.roleKey) {
                          setRole(item.roleKey as Role);
                        }
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-brand text-primary-foreground font-semibold shadow-2xs"
                          : "text-ink/70 hover:bg-surf hover:text-ink"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`size-3.5 ${isActive ? "text-white" : "text-ink/50"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded px-1.5 py-0.2 font-mono text-[9px] ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-brand/10 text-brand font-medium"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Persona card at bottom of sidebar */}
            <div className="mt-6 rounded-lg bg-surf p-2.5 border border-border">
              <div className="text-[11px] font-semibold text-ink flex items-center justify-between">
                <span>Active Persona</span>
                <span className="size-1.5 rounded-full bg-calm" />
              </div>
              <div className="text-xs text-ink/85 mt-0.5 font-medium truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-mono text-ink/50 truncate">{currentUser.title}</div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2 w-full text-[10px] h-6 bg-card hover:bg-card/80 border-border"
              >
                <Link to="/demo">Switch Persona</Link>
              </Button>
            </div>
          </aside>

          {/* Dynamic Main Workspace Content */}
          <main className="min-w-0 flex-1 p-3.5 sm:p-5 lg:p-6">{children}</main>
        </div>
      </div>

      {/* Hospital Footer Disclaimer */}
      <footer className="border-t border-border bg-card py-3 px-4 text-center text-xs text-ink/55">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span className="font-semibold text-ink/75 text-[11px]">
            CareSync Operations Platform · First Commit Hackathon
          </span>
          <span className="text-[10px] text-ink/45 max-w-2xl text-center sm:text-right">
            CareSync is a hackathon prototype created for workflow demonstration and educational purposes. It is not intended for clinical diagnosis, treatment decisions, or real patient data.
          </span>
        </div>
      </footer>

      {/* Global Patient Search Modal */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
