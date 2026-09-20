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
import { AIActionButton } from "@/components/care-sync/AIActionButton";
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
  const isRoleAuthorized =
    !isAuthenticated ||
    !activeRole ||
    currentRole === activeRole ||
    (currentRole === "doctor" && activeRole !== "patient");

  const pendingLabCount = testOrders.filter(
    (t) => t.status === "Pending" || t.status === "In Progress",
  ).length;
  const pendingRxCount = prescriptions.filter((p) => p.status === "Pending").length;
  const waitingPatientsCount = patients.filter((p) => p.status === "Waiting").length;

  interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | undefined;
    params?: Record<string, string>;
    search?: Record<string, string>;
  }

  // Role-Specific Navigation Definitions
  const getNavItemsForRole = (r: Role): NavItem[] => {
    switch (r) {
      case "patient":
        return [
          { label: "My Health Home", path: "/patient/dashboard", search: { tab: "timeline" }, icon: LayoutDashboard },
          { label: "Appointments", path: "/patient/dashboard", search: { tab: "appointments" }, icon: Calendar, badge: "Upcoming" },
          {
            label: "Prescriptions",
            path: "/patient/dashboard",
            search: { tab: "prescriptions" },
            icon: Pill,
            badge: `${prescriptions.filter((p) => p.patientId === "CS-001").length}`,
          },
          {
            label: "Lab Reports",
            path: "/patient/dashboard",
            search: { tab: "reports" },
            icon: FlaskConical,
            badge: `${testOrders.filter((t) => t.patientId === "CS-001").length}`,
          },
          { label: "Billing & Insurance", path: "/patient/dashboard", search: { tab: "bills" }, icon: CreditCard },
          { label: "Care Timeline", path: "/patient/dashboard", search: { tab: "timeline" }, icon: Activity },
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-card p-8 rounded-2xl border border-border shadow-lg max-w-sm text-center">
          <Loader2 className="size-8 text-brand animate-spin" />
          <div className="font-bold text-sm text-foreground">Verifying Hospital Session</div>
          <div className="text-xs text-muted-foreground font-mono">
            Synchronizing profile & permissions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-brand/20">
      <div>
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md dark:bg-card/90">
          <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground lg:hidden h-8 w-8 hover:bg-secondary"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle navigation drawer"
              >
                {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
              <Logo />
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border text-xs text-muted-foreground">
                <Building2 className="size-3.5 text-brand" />
                <span className="font-medium text-foreground/90">CareSync Hospital · Main Facility</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Global Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground border border-border hover:border-brand/40 shadow-2xs transition-colors"
                title="Search patients by name or ID (⌘K)"
              >
                <Search className="size-3.5 text-brand" />
                <span className="hidden sm:inline text-foreground/80">Search Patient / UHID...</span>
                <kbd className="hidden sm:inline-flex rounded bg-card px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground border border-border">
                  ⌘K
                </kbd>
              </button>

              {/* AI Assistant Functional Button */}
              <AIActionButton
                label="Ask CareSync"
                featureName="CareSync Hospital Operations Assistant"
                actionType="ask"
                role={role}
                patientId="CS-001"
                getContextData={() => {
                  const targetPatient = patients[0] || { id: "CS-001", name: "Rajesh Sharma" };
                  return {
                    patient: targetPatient,
                    prescriptions: prescriptions.filter((p) => p.patientId === targetPatient.id),
                    tests: testOrders.filter((t) => t.patientId === targetPatient.id),
                    role,
                  };
                }}
                className="hidden xl:flex text-xs h-8 px-2.5"
              />

              {/* Dark / Light Mode Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-secondary dark:text-[#C7D2DE] dark:hover:text-[#70BAFF] dark:hover:bg-[#111923]"
                title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
                aria-label="Toggle theme mode"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="size-4 text-[#F4C95D] transition-transform hover:rotate-45" />
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
                className="hidden sm:flex border-border text-xs font-medium h-8 px-2.5 bg-card hover:bg-secondary text-foreground"
              >
                <Link to="/demo">
                  <UserCheck className="size-3.5 mr-1.5 text-brand" />
                  <span>Switch Role</span>
                </Link>
              </Button>

              {/* Active Role Persona Indicator & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="size-7 rounded-md bg-brand/10 text-brand grid place-items-center font-bold text-xs border border-brand/20">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-xs font-semibold text-foreground truncate max-w-[120px]">
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
                  className="h-8 w-8 text-muted-foreground hover:text-crit hover:bg-crit/10"
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
              className="fixed inset-0 z-30 bg-black/65 backdrop-blur-xs lg:hidden"
            />
          )}

          {/* Role-Specific Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "fixed inset-y-14 left-0 z-40 w-64 block shadow-2xl" : "hidden"
            } border-r border-border bg-card p-3 backdrop-blur-md lg:relative lg:block lg:w-56 lg:shrink-0 lg:bg-card/90 lg:shadow-none`}
          >
            <div className="flex items-center justify-between px-2 pb-2.5 pt-1 border-b border-border">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                {role.toUpperCase()} WORKSPACE
              </div>
              <span className="size-1.5 rounded-full bg-calm" />
            </div>

            <div className="mt-3">
              <nav className="space-y-1">
                {currentNavItems.map((item) => {
                  const Icon = item.icon;
                  const searchObj = (location.search || {}) as Record<string, string | undefined>;
                  const currentSearchTab = searchObj["tab"];
                  const itemTab = item.search ? item.search["tab"] : undefined;
                  const isActive =
                    item.path === "/doctor/patient/$id"
                      ? location.pathname.startsWith("/doctor/patient")
                      : itemTab
                        ? location.pathname === item.path && (currentSearchTab === itemTab || (!currentSearchTab && itemTab === "timeline" && item.label === "My Health Home"))
                        : location.pathname === item.path;

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      {...(item.params ? { params: item.params } : {})}
                      {...(item.search ? { search: item.search } : {})}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-brand/15 dark:bg-[#142337] text-brand dark:text-[#FFFFFF] font-semibold shadow-2xs border border-brand/30 dark:border-[#2F8FEA]/50"
                          : "text-muted-foreground dark:text-[#AEBBC8] hover:text-foreground dark:hover:text-[#F0F4F8] hover:bg-secondary dark:hover:bg-[#101720] font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`size-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-brand dark:text-[#70BAFF]"
                              : "text-muted-foreground dark:text-[#9BAABA] group-hover:text-foreground dark:group-hover:text-[#B9D8F2]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[9px] shrink-0 font-medium ${
                            isActive
                              ? "bg-brand text-white shadow-2xs"
                              : "bg-brand/10 text-brand dark:bg-brand/20 dark:text-[#70BAFF]"
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
            <div className="mt-8 rounded-xl bg-secondary p-3 border border-border">
              <div className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span>Active Role</span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono capitalize bg-card border-brand/30 text-brand"
                >
                  {role}
                </Badge>
              </div>
              <div className="text-xs text-foreground mt-1 font-semibold truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono truncate">{currentUser.title}</div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2.5 w-full text-[11px] h-7 bg-card hover:bg-card/80 border-border text-foreground"
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
                <div className="text-lg font-bold text-foreground">Role Access Restriction</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your active role is <strong>{currentRole}</strong>. You are viewing the{" "}
                  <strong>{activeRole}</strong> workspace. In CareSync, permissions are enforced by
                  department role.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <Button
                    onClick={() => setRole(activeRole!)}
                    className="bg-brand text-white text-xs h-8"
                  >
                    Switch to {activeRole?.toUpperCase()} Persona
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-border text-xs h-8 bg-card text-foreground"
                  >
                    <Link to={getRoleHomePath(currentRole)}>Return to My Workspace</Link>
                  </Button>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      {/* Global Command/Search Dialog */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
