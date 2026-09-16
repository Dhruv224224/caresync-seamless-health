import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
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
  Calendar,
  FileText,
  CreditCard,
  Bed,
  Sun,
  Moon,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/care-sync/Logo";
import { NotificationCenter } from "@/components/care-sync/NotificationCenter";
import { GlobalSearchDialog } from "@/components/care-sync/GlobalSearchDialog";
import { AIPlaceholderButton } from "@/components/care-sync/AIPlaceholderButton";
import { useTheme } from "@/components/care-sync/ThemeToggle";
import { useCareSync, getRoleHomePath } from "@/lib/store";
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
  const {
    currentRole,
    currentUser,
    isAuthenticated,
    authLoading,
    setRole,
    logout,
    prescriptions,
    testOrders,
    patients,
  } = useCareSync();
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // The active role is the explicit workspace role or currentRole
  const role = activeRole || currentRole;

  // Authorization: if authenticated, verify the user has access to this workspace
  const isRoleAuthorized = !isAuthenticated || !activeRole || currentRole === activeRole || (currentRole === "doctor" && activeRole !== "patient");

  const pendingLabCount = testOrders.filter(
    (t) => t.status === "Pending" || t.status === "In Progress",
  ).length;
  const pendingRxCount = prescriptions.filter((p) => p.status === "Pending").length;
  const waitingPatientsCount = patients.filter((p) => p.status === "Waiting").length;

  // Role-Specific Navigation Definitions
  const getNavItemsForRole = (r: Role) => {
    switch (r) {
      case "patient":
        return [
          { label: "My Health Home", path: "/patient/dashboard", icon: LayoutDashboard },
          { label: "Appointments", path: "/patient/dashboard", icon: Calendar, badge: "Upcoming" },
          {
            label: "Prescriptions",
            path: "/patient/dashboard",
            icon: Pill,
            badge: `${prescriptions.filter((p) => p.patientId === "CS-001").length}`,
          },
          {
            label: "Lab Reports",
            path: "/patient/dashboard",
            icon: FlaskConical,
            badge: `${testOrders.filter((t) => t.patientId === "CS-001").length}`,
          },
          { label: "Billing & Insurance", path: "/patient/dashboard", icon: CreditCard },
          { label: "Care Timeline", path: "/patient/dashboard", icon: Activity },
        ];
      case "doctor":
        return [
          {
            label: "OPD Queue & Hub",
            path: "/doctor/dashboard",
            icon: Stethoscope,
            badge: waitingPatientsCount ? `${waitingPatientsCount} wait` : undefined,
          },
          {
            label: "Active Patient Chart",
            path: "/doctor/patient/$id",
            params: { id: "CS-001" },
            icon: Users,
          },
          { label: "Consultation & Rx", path: "/doctor/consultation", icon: CalendarCheck },
          {
            label: "Diagnostic Orders",
            path: "/lab/dashboard",
            icon: FlaskConical,
            badge: pendingLabCount ? `${pendingLabCount}` : undefined,
          },
          { label: "Surgery & OT Track", path: "/surgery", icon: Activity },
        ];
      case "nurse":
        return [
          {
            label: "Ward & Inpatients",
            path: "/nurse/dashboard",
            icon: HeartPulse,
            badge: "Ward 3B",
          },
          {
            label: "Patient Bed Chart",
            path: "/doctor/patient/$id",
            params: { id: "CS-001" },
            icon: Users,
          },
          { label: "Surgery Recovery", path: "/surgery", icon: Activity },
        ];
      case "lab":
        return [
          {
            label: "Diagnostic Queue",
            path: "/lab/dashboard",
            icon: FlaskConical,
            badge: pendingLabCount ? `${pendingLabCount} tests` : undefined,
          },
          {
            label: "Patient Requisitions",
            path: "/doctor/patient/$id",
            params: { id: "CS-001" },
            icon: Users,
          },
        ];
      case "pharmacy":
        return [
          {
            label: "Prescription Queue",
            path: "/pharmacy/dashboard",
            icon: Pill,
            badge: pendingRxCount ? `${pendingRxCount} pending` : undefined,
          },
          {
            label: "Patient Medication Chart",
            path: "/doctor/patient/$id",
            params: { id: "CS-001" },
            icon: Users,
          },
        ];
      case "receptionist":
        return [
          {
            label: "Registration & Triage",
            path: "/receptionist/dashboard",
            icon: ClipboardList,
            badge: `${patients.length} today`,
          },
          {
            label: "Patient Directory",
            path: "/doctor/patient/$id",
            params: { id: "CS-001" },
            icon: Users,
          },
          { label: "OT & Bed Admissions", path: "/surgery", icon: Bed },
        ];
      default:
        return [{ label: "Doctor Dashboard", path: "/doctor/dashboard", icon: Stethoscope }];
    }
  };

  const currentNavItems = getNavItemsForRole(role);

  // If loading session state, render sleek skeleton
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surf flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-card p-8 rounded-2xl border border-border shadow-lg max-w-sm text-center">
          <Loader2 className="size-8 text-brand animate-spin" />
          <div className="font-bold text-sm text-ink">Verifying Hospital Session</div>
          <div className="text-xs text-ink/60 font-mono">Synchronizing profile & permissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surf text-foreground flex flex-col justify-between selection:bg-brand/20">
      <div>
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-ink lg:hidden h-8 w-8 hover:bg-surf"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle navigation drawer"
              >
                {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
              <Logo />
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border/80 text-xs text-ink/60">
                <Building2 className="size-3.5 text-brand" />
                <span className="font-medium text-ink/80">CareSync Hospital · Main Facility</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Global Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-surf px-2.5 py-1.5 text-xs text-ink/70 border border-border hover:border-brand/40 shadow-2xs transition-colors"
                title="Search patients by name or ID (⌘K)"
              >
                <Search className="size-3.5 text-brand" />
                <span className="hidden sm:inline">Search Patient / UHID...</span>
                <kbd className="hidden sm:inline-flex rounded bg-card px-1.5 py-0.5 font-mono text-[9px] text-ink/50 border border-border">
                  ⌘K
                </kbd>
              </button>

              {/* AI Assistant Placeholder */}
              <AIPlaceholderButton
                label="Ask CareSync"
                featureName="CareSync Hospital Operations Assistant"
                className="hidden xl:flex text-xs h-8 px-2.5"
              />

              {/* Dark / Light Mode Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8 text-ink/70 hover:text-ink hover:bg-surf"
                title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
                aria-label="Toggle theme mode"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="size-4 text-warn transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="size-4 text-brand transition-transform hover:-rotate-12" />
                )}
              </Button>

              {/* Notification Center */}
              <NotificationCenter />

              {/* Switch Role Persona Hub Button */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:flex border-border text-xs font-medium h-8 px-2.5 bg-card hover:bg-surf text-ink"
              >
                <Link to="/demo">
                  <UserCheck className="size-3.5 mr-1.5 text-brand" />
                  <span>Switch Role</span>
                </Link>
              </Button>

              {/* Active Role Persona Indicator & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-border/80">
                <div className="size-7 rounded-md bg-brand/10 text-brand grid place-items-center font-bold text-xs border border-brand/20">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-xs font-semibold text-ink truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-mono text-brand font-medium capitalize">
                    {role}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await logout();
                    navigate({ to: "/login" });
                  }}
                  className="h-8 w-8 text-ink/60 hover:text-crit hover:bg-crit/10"
                  title="Sign out / Switch user"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Shell */}
        <div className="mx-auto flex w-full max-w-[1600px] flex-1">
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
            />
          )}

          {/* Role-Specific Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "fixed inset-y-14 left-0 z-40 w-64 block shadow-2xl" : "hidden"
            } border-r border-border bg-card p-3 backdrop-blur-md lg:relative lg:block lg:w-56 lg:shrink-0 lg:bg-card/85 lg:shadow-none`}
          >
            <div className="flex items-center justify-between px-2 pb-2.5 pt-1 border-b border-border/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink/50 font-semibold">
                {role.toUpperCase()} WORKSPACE
              </div>
              <span className="size-1.5 rounded-full bg-calm" />
            </div>

            <div className="mt-3">
              <nav className="space-y-1">
                {currentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === "/doctor/patient/$id"
                      ? location.pathname.startsWith("/doctor/patient")
                      : location.pathname === item.path;

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      params={item.params}
                      activeProps={{
                        className:
                          "bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold shadow-xs",
                      }}
                      inactiveProps={{
                        className:
                          "text-surf-600 dark:text-surf-400 hover:text-surf-950 dark:hover:text-surf-100 hover:bg-surf-100 dark:hover:bg-surf-800/60",
                      }}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`size-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-brand"}`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[9px] shrink-0 ${
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

            {/* Quick Switch Persona Card */}
            <div className="mt-8 rounded-xl bg-surf p-3 border border-border">
              <div className="text-[11px] font-semibold text-ink flex items-center justify-between">
                <span>Active Role</span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono capitalize bg-card border-brand/30 text-brand"
                >
                  {role}
                </Badge>
              </div>
              <div className="text-xs text-ink/90 mt-1 font-semibold truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-ink/50 font-mono truncate">{currentUser.title}</div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2.5 w-full text-[11px] h-7 bg-card hover:bg-card/80 border-border text-ink"
              >
                <Link to="/demo">
                  <span>Switch Role</span>
                  <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </div>
          </aside>

          {/* Main Dynamic View Area */}
          <main className="min-w-0 flex-1 p-3.5 sm:p-5 lg:p-6">
            {!isRoleAuthorized ? (
              <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xs space-y-3 max-w-lg mx-auto mt-10">
                <ShieldAlert className="size-10 text-warn mx-auto" />
                <div className="text-lg font-bold text-ink">Role Access Restriction</div>
                <p className="text-xs text-ink/60 leading-relaxed">
                  Your authenticated account role (<span className="font-mono font-bold text-brand uppercase">{role}</span>) does not have authorization to view this department workspace.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <Button
                    onClick={() => navigate({ to: getRoleHomePath(role) })}
                    className="bg-brand text-white text-xs"
                  >
                    Go to My Workspace ({role.toUpperCase()})
                  </Button>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      {/* Hospital Footer Disclaimer */}
      <footer className="border-t border-border bg-card py-3 px-4 text-xs text-ink/55">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink/75 text-[11px]">
              CareSync Healthcare Operations
            </span>
            <span className="text-ink/30">•</span>
            <span className="text-[10px] font-mono text-calm">Supabase Auth Connected</span>
          </div>
          <span className="text-[10px] text-ink/45 max-w-xl text-center sm:text-right">
            CareSync Connected Healthcare Digital Thread.
          </span>
        </div>
      </footer>

      {/* Global Patient Search Modal (⌘K) */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
