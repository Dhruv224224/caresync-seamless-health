import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  LucideIcon,
  Moon,
  Pill,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Sun,
  User,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/care-sync/Logo";
import { SectionLabel } from "@/components/care-sync/SectionLabel";
import { useTheme } from "@/components/care-sync/ThemeToggle";
import { useCareSync } from "@/lib/store";
import { DEMO_USERS } from "@/lib/mockData";
import { Role } from "@/types/caresync";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "CareSync — Select Demo Role" },
      { name: "description", content: "Choose a role to test the connected hospital workflow." },
    ],
  }),
  component: DemoRoleSelectionPage,
});

const rolesList: {
  role: Role;
  title: string;
  buttonLabel: string;
  emoji: string;
  icon: LucideIcon;
  user: (typeof DEMO_USERS)[Role];
  path: string;
  description: string;
  keyActions: string[];
}[] = [
  {
    role: "patient",
    title: "Patient",
    buttonLabel: "Open Patient Workspace",
    emoji: "👤",
    icon: Users,
    user: DEMO_USERS.patient,
    path: "/patient/dashboard",
    description:
      "Track your continuous medical timeline, digital prescriptions, lab reports, and bed status.",
    keyActions: ["View Timeline", "Download Prescriptions", "Inspect Lab Results"],
  },
  {
    role: "receptionist",
    title: "Receptionist",
    buttonLabel: "Open Reception Workspace",
    emoji: "🧾",
    icon: ClipboardList,
    user: DEMO_USERS.receptionist,
    path: "/receptionist/dashboard",
    description:
      "Register incoming patients, create hospital UHIDs, schedule consultations, and assign beds.",
    keyActions: ["Patient Registration", "Doctor Queue Check-In", "Bed Assignment"],
  },
  {
    role: "doctor",
    title: "Doctor",
    buttonLabel: "Open Doctor Workspace",
    emoji: "👨‍⚕️",
    icon: Stethoscope,
    user: DEMO_USERS.doctor,
    path: "/doctor/dashboard",
    description:
      "Manage outpatient queues, record digital clinical consultations, prescribe meds, and order labs.",
    keyActions: ["Conduct Consultation", "Create Digital Rx", "Order Diagnostic Tests"],
  },
  {
    role: "nurse",
    title: "Nurse",
    buttonLabel: "Open Nursing Workspace",
    emoji: "👩‍⚕️",
    icon: HeartPulse,
    user: DEMO_USERS.nurse,
    path: "/nurse/dashboard",
    description:
      "Inpatient ward rounds, record vitals (BP, SpO2, Pulse, Temp), and update nursing tasks.",
    keyActions: ["Record Bed Vitals", "Track Inpatient Recovery", "Post-Op Monitoring"],
  },
  {
    role: "lab",
    title: "Laboratory",
    buttonLabel: "Open Laboratory Workspace",
    emoji: "🧪",
    icon: FlaskConical,
    user: DEMO_USERS.lab,
    path: "/lab/dashboard",
    description:
      "Receive real-time requisitions, track sample collection, enter findings, and upload reports.",
    keyActions: ["Accept Test Orders", "Enter Lab Values", "Publish CBC / Blood Sugar"],
  },
  {
    role: "pharmacy",
    title: "Pharmacy",
    buttonLabel: "Open Pharmacy Workspace",
    emoji: "💊",
    icon: Pill,
    user: DEMO_USERS.pharmacy,
    path: "/pharmacy/dashboard",
    description:
      "Fulfill digital prescriptions in real time, dispense medications, and manage stock levels.",
    keyActions: ["Review Pending Rx", "1-Click Dispensing", "Inventory Status"],
  },
];

function DemoRoleSelectionPage() {
  const { setRole, resetToDefault } = useCareSync();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSelectRole = (role: Role, path: string) => {
    setRole(role);
    navigate({ to: path });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand/20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-slate-700 hover:text-ink hover:bg-secondary dark:text-slate-300"
              title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-4 text-warn" />
              ) : (
                <Moon className="size-4 text-navy-800" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToDefault();
                alert("Demo state reset to initial prototype baseline.");
              }}
              className="border-border text-xs text-slate-700 hover:text-ink dark:text-slate-300 h-8"
            >
              <RotateCcw className="size-3.5 mr-1" /> Reset Demo Data
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs h-8 text-slate-700 hover:text-ink dark:text-slate-300">
              <Link to="/login">Sign In View</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <SectionLabel>First Commit Prototype</SectionLabel>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Experience CareSync Across Every Department
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-700 dark:text-[#C5D0DC] leading-relaxed">
            Select any role below to launch their customized dashboard. Actions taken in one role
            automatically synchronize with other departments and update the patient's continuous
            digital timeline.
          </p>
        </div>

        {/* 6 Role Cards Grid (#162A3D surface) */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rolesList.map((item) => {
            const rolePaletteMap: Record<Role, {
              borderHover: string;
              badgeClass: string;
              iconBg: string;
              iconColor: string;
              dotColor: string;
              btnClass: string;
            }> = {
              patient: {
                borderHover: "hover:border-blue-accent/50 dark:hover:border-[#2F8FEA]/50",
                badgeClass: "border-blue-accent/30 bg-blue-soft text-navy-800 dark:bg-[#111923] dark:text-[#70BAFF] dark:border-[#2C3948]",
                iconBg: "bg-blue-soft dark:bg-[#111923]",
                iconColor: "text-navy-800 dark:text-[#70BAFF]",
                dotColor: "bg-teal-primary dark:bg-[#38D3A1]",
                btnClass: "bg-blue-soft hover:bg-navy-900 text-navy-800 hover:text-white dark:bg-[#111923] dark:hover:bg-[#2F8FEA] dark:text-[#F7F9FC]",
              },
              receptionist: {
                borderHover: "hover:border-slate-400 dark:hover:border-[#2C3948]",
                badgeClass: "border-slate-300 bg-secondary text-slate-900 dark:bg-[#111923] dark:text-[#F7F9FC] dark:border-[#2C3948]",
                iconBg: "bg-secondary dark:bg-[#111923]",
                iconColor: "text-slate-800 dark:text-[#F7F9FC]",
                dotColor: "bg-navy-900 dark:bg-[#70BAFF]",
                btnClass: "bg-secondary hover:bg-navy-900 text-slate-900 hover:text-white dark:bg-[#111923] dark:hover:bg-[#2F8FEA] dark:text-[#F7F9FC]",
              },
              doctor: {
                borderHover: "hover:border-indigo-ai/50 dark:hover:border-[#8D83EA]/50",
                badgeClass: "border-indigo-ai/30 bg-indigo-soft text-indigo-ai dark:bg-[#211E39] dark:text-[#A69EF5] dark:border-[#8D83EA]/30",
                iconBg: "bg-indigo-soft dark:bg-[#211E39]",
                iconColor: "text-indigo-ai dark:text-[#8D83EA]",
                dotColor: "bg-indigo-ai dark:bg-[#8D83EA]",
                btnClass: "bg-indigo-soft hover:bg-indigo-ai text-indigo-ai hover:text-white dark:bg-[#211E39] dark:hover:bg-[#8D83EA] dark:text-[#F7F9FC]",
              },
              nurse: {
                borderHover: "hover:border-teal-primary/50 dark:hover:border-[#38D3A1]/50",
                badgeClass: "border-teal-primary/30 bg-teal-light text-teal-dark dark:bg-[#102B24] dark:text-[#38D3A1] dark:border-[#176A55]",
                iconBg: "bg-teal-light dark:bg-[#102B24]",
                iconColor: "text-teal-dark dark:text-[#38D3A1]",
                dotColor: "bg-teal-primary dark:bg-[#38D3A1]",
                btnClass: "bg-teal-light hover:bg-teal-dark text-teal-dark hover:text-white dark:bg-[#102B24] dark:hover:bg-[#176A55] dark:text-[#F7F9FC]",
              },
              lab: {
                borderHover: "hover:border-blue-accent/50 dark:hover:border-[#2F8FEA]/50",
                badgeClass: "border-blue-accent/30 bg-blue-soft text-blue-hover dark:bg-[#111923] dark:text-[#70BAFF] dark:border-[#2C3948]",
                iconBg: "bg-blue-soft dark:bg-[#111923]",
                iconColor: "text-blue-hover dark:text-[#70BAFF]",
                dotColor: "bg-blue-accent dark:bg-[#70BAFF]",
                btnClass: "bg-blue-soft hover:bg-navy-900 text-blue-hover hover:text-white dark:bg-[#111923] dark:hover:bg-[#2F8FEA] dark:text-[#F7F9FC]",
              },
              pharmacy: {
                borderHover: "hover:border-amber-muted/50 dark:hover:border-[#E0B45F]/50",
                badgeClass: "border-amber-muted/30 bg-amber-soft text-amber-muted dark:bg-[#2A2010] dark:text-[#F0C977] dark:border-[#E0B45F]/30",
                iconBg: "bg-amber-soft dark:bg-[#2A2010]",
                iconColor: "text-amber-muted dark:text-[#E0B45F]",
                dotColor: "bg-amber-muted dark:bg-[#E0B45F]",
                btnClass: "bg-amber-soft hover:bg-amber-muted text-amber-muted hover:text-white dark:bg-[#2A2010] dark:hover:bg-[#E0B45F] dark:hover:text-[#05070A] dark:text-[#F7F9FC]",
              },
            };

            const pal = rolePaletteMap[item.role];

            return (
              <div
                key={item.role}
                className={`group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:-translate-y-0.5 ${pal.borderHover} hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`grid size-10 place-items-center rounded-xl ${pal.iconBg} ${pal.iconColor} text-xl shadow-2xs`}>
                        {item.emoji}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-ink group-hover:text-navy-900 dark:group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-xs font-mono text-slate-700 dark:text-[#9EADBC] font-medium">
                          {item.user.name}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold uppercase ${pal.badgeClass}`}
                    >
                      {item.user.role}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-slate-700 dark:text-[#C5D0DC] leading-relaxed min-h-[3rem]">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8898A9] mb-2 font-semibold">
                      Key Workflow Capabilities
                    </div>
                    <div className="space-y-1.5">
                      {item.keyActions.map((action) => (
                        <div key={action} className="text-xs text-slate-700 dark:text-[#C5D0DC] flex items-center gap-2">
                          <span className={`size-1.5 rounded-full ${pal.dotColor}`} />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleSelectRole(item.role, item.path)}
                    className={`w-full text-xs font-semibold ${pal.btnClass} transition-all justify-between shadow-2xs cursor-pointer h-9`}
                  >
                    <span>{item.buttonLabel}</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
